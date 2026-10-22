"""Build the KaiForge base-mesh athlete review source in Blender 5.0.1.

This migration keeps the R4 engineering contract (rig names, forehand timing,
staging, contact and validation cameras) while replacing the visible
procedural body with Blender's Human Base Meshes v1.4.1 realistic male mesh.
The downloaded bundle is read-only. The generated working source is saved to
the repository's documented authoring path and is never integrated at runtime.
"""

import argparse
import hashlib
import heapq
import importlib.util
import json
import math
import struct
import sys
from pathlib import Path

import bpy
from mathutils import Matrix, Vector


SCRIPT_DIR = Path(__file__).resolve().parent
R4_SCRIPT = SCRIPT_DIR / "build_kf_athlete_blockout.py"
DEFAULT_BASE_FILE = (
    Path.home()
    / "Downloads/human-base-meshes/human-base-meshes-bundle-v1.4.1"
    / "human_base_meshes_bundle.blend"
)
DEFAULT_OUTPUT = (
    SCRIPT_DIR.parent.parent
    / "assets-source/kaiforge/KF_Athlete.blend"
)
BASE_BODY_NAME = "GEO-body_male_realistic"
BASE_EYE_NAMES = (
    "GEO-body_male_realistic.eye.L",
    "GEO-body_male_realistic.eye.R",
)
SOURCE_HEIGHT_M = 1.80


def load_r4_module():
    spec = importlib.util.spec_from_file_location("kf_r4_reference", R4_SCRIPT)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


r4 = load_r4_module()


def file_sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def source_mesh_data(base_file):
    requested = [BASE_BODY_NAME, *BASE_EYE_NAMES]
    with bpy.data.libraries.load(str(base_file), link=False) as (available, loaded):
        missing = [name for name in requested if name not in available.objects]
        if missing:
            raise RuntimeError("Base bundle is missing: " + ", ".join(missing))
        loaded.objects = requested
    objects = {obj.name: obj for obj in loaded.objects if obj is not None}
    body = objects[BASE_BODY_NAME]
    world_vertices = [body.matrix_world @ vertex.co for vertex in body.data.vertices]
    minimum_z = min(vertex.z for vertex in world_vertices)
    maximum_z = max(vertex.z for vertex in world_vertices)
    height = maximum_z - minimum_z
    center_x = (min(vertex.x for vertex in world_vertices) +
                max(vertex.x for vertex in world_vertices)) / 2
    center_y = (min(vertex.y for vertex in world_vertices) +
                max(vertex.y for vertex in world_vertices)) / 2
    scale = SOURCE_HEIGHT_M / height
    rotation = Matrix.Rotation(math.pi / 2, 4, "Z")

    def convert(point):
        centered = point - Vector((center_x, center_y, minimum_z))
        return rotation @ centered * scale

    result = {}
    for name, source in objects.items():
        vertices = [tuple(convert(source.matrix_world @ vertex.co))
                    for vertex in source.data.vertices]
        faces = [tuple(polygon.vertices) for polygon in source.data.polygons]
        result[name] = (vertices, faces)
    source_triangles = sum(len(face) - 2 for face in result[BASE_BODY_NAME][1])
    source_vertices = len(result[BASE_BODY_NAME][0])
    for source in objects.values():
        mesh = source.data
        bpy.data.objects.remove(source, do_unlink=True)
        if mesh.users == 0:
            bpy.data.meshes.remove(mesh)
    return result, {
        "object": BASE_BODY_NAME,
        "native_height_m": height,
        "normalization_scale": scale,
        "source_vertices": source_vertices,
        "source_triangles": source_triangles,
    }


def make_mesh(name, vertices, faces, material, collection):
    mesh = r4.mark(bpy.data.meshes.new(name + "_Mesh_L0"))
    mesh.from_pydata(vertices, [], faces)
    mesh.materials.append(material)
    mesh.update()
    for polygon in mesh.polygons:
        polygon.use_smooth = True
    return r4.link_object(name, mesh, collection)


def add_armature_weights(body, rig):
    bpy.ops.object.select_all(action="DESELECT")
    body.select_set(True)
    rig.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.parent_set(type="ARMATURE_AUTO")
    modifier = next((item for item in body.modifiers if item.type == "ARMATURE"), None)
    if modifier is None:
        raise RuntimeError("Automatic weights did not create an armature modifier")
    modifier.name = "KF_ArmatureDeform"
    prune_weights(body)


def prune_weights(obj):
    deform_groups = {group.index for group in obj.vertex_groups
                     if group.name.startswith("KF_")}
    for vertex in obj.data.vertices:
        assigned = [(assignment.group, assignment.weight)
                    for assignment in vertex.groups
                    if assignment.group in deform_groups and assignment.weight > 1e-7]
        assigned.sort(key=lambda item: item[1], reverse=True)
        keep = assigned[:4]
        total = sum(weight for _, weight in keep)
        keep_map = {index: weight / total for index, weight in keep} if total else {}
        for group_index, _ in assigned:
            group = obj.vertex_groups[group_index]
            if group_index in keep_map:
                group.add([vertex.index], keep_map[group_index], "REPLACE")
            else:
                group.remove([vertex.index])


def copy_weighted_shell(name, body, collection, material, predicate,
                        thickness):
    source_mesh = body.data
    accepted = []
    for polygon in source_mesh.polygons:
        points = [source_mesh.vertices[index].co for index in polygon.vertices]
        if predicate(points):
            accepted.append(tuple(polygon.vertices))
    used = sorted({index for face in accepted for index in face})
    remap = {old: new for new, old in enumerate(used)}
    edge_counts = {}
    for face in accepted:
        for first, second in zip(face, (*face[1:], face[0])):
            edge = tuple(sorted((first, second)))
            edge_counts[edge] = edge_counts.get(edge, 0) + 1
    boundary_edges = [edge for edge, count in edge_counts.items() if count == 1]
    boundary_vertices = {index for edge in boundary_edges for index in edge}
    boundary_neighbors = {index: [] for index in boundary_vertices}
    for first, second in boundary_edges:
        boundary_neighbors[first].append(second)
        boundary_neighbors[second].append(first)
    outer = {
        index: source_mesh.vertices[index].co.copy() +
        source_mesh.vertices[index].normal * thickness
        for index in used
    }
    for _ in range(5):
        smoothed = {index: point.copy() for index, point in outer.items()}
        for index, neighbors in boundary_neighbors.items():
            if len(neighbors) != 2:
                continue
            average = (outer[neighbors[0]] + outer[neighbors[1]]) * .5
            smoothed[index] = outer[index].lerp(average, .42)
        outer = smoothed
    vertices = []
    for index in used:
        vertices.append(tuple(outer[index]))
    faces = [tuple(remap[index] for index in face) for face in accepted]
    inner = {}
    for index in sorted(boundary_vertices):
        source = source_mesh.vertices[index]
        point = outer[index] - source.normal * (thickness - .001)
        inner[index] = len(vertices)
        vertices.append(tuple(point))
    for first, second in boundary_edges:
        faces.append((remap[first], remap[second], inner[second], inner[first]))
    shell = make_mesh(name, vertices, faces, material, collection)
    group_map = {}
    for source_group in body.vertex_groups:
        group_map[source_group.index] = shell.vertex_groups.new(name=source_group.name)
    for new_index, old_index in enumerate(used):
        for assignment in source_mesh.vertices[old_index].groups:
            group_map[assignment.group].add([new_index], assignment.weight, "REPLACE")
    for old_index, new_index in inner.items():
        for assignment in source_mesh.vertices[old_index].groups:
            group_map[assignment.group].add([new_index], assignment.weight, "REPLACE")
    shell.parent = rig_for(body)
    armature = shell.modifiers.new("KF_ArmatureDeform", "ARMATURE")
    armature.object = rig_for(body)
    return shell


def rig_for(obj):
    modifier = next((item for item in obj.modifiers if item.type == "ARMATURE"), None)
    if modifier is None or modifier.object is None:
        raise RuntimeError(obj.name + " has no armature")
    return modifier.object


def add_eyes(meshes, geo, material, rig):
    eyes = []
    for suffix, source_name in (("L", BASE_EYE_NAMES[0]), ("R", BASE_EYE_NAMES[1])):
        vertices, faces = meshes[source_name]
        eye = make_mesh("KF_Eye_" + suffix, vertices, faces, material, geo)
        group = eye.vertex_groups.new(name="KF_head")
        group.add(list(range(len(eye.data.vertices))), 1.0, "REPLACE")
        eye.parent = rig
        modifier = eye.modifiers.new("KF_ArmatureDeform", "ARMATURE")
        modifier.object = rig
        eyes.append(eye)
    return eyes


def align_playing_hand_to_socket(body, rig, socket, handle=None):
    """Move the anatomical palm onto the locked socket without moving contact."""
    scene = bpy.context.scene
    scene.frame_set(r4.POSE_FRAMES["IMPACT"])
    group_index = body.vertex_groups["KF_hand_R"].index
    candidates = [
        vertex.index for vertex in body.data.vertices
        if any(assignment.group == group_index and assignment.weight > .25
               for assignment in vertex.groups)
    ]
    if not candidates:
        raise RuntimeError("No anatomical playing-hand vertices were weighted")
    desired = (handle.matrix_world @ Vector((0, .028, 0))
               if handle else socket.matrix_world.translation)
    pose_bone = rig.pose.bones["KF_hand_R"]
    deform = pose_bone.matrix @ pose_bone.bone.matrix_local.inverted()
    for _ in range(4):
        evaluated = body.evaluated_get(bpy.context.evaluated_depsgraph_get())
        mesh = evaluated.to_mesh()
        points = [evaluated.matrix_world @ mesh.vertices[index].co
                  for index in candidates]
        evaluated.to_mesh_clear()
        palm_center = sum(points, Vector()) / len(points)
        rest_delta = deform.to_3x3().inverted() @ (desired - palm_center)
        for vertex in body.data.vertices:
            weight = next((assignment.weight for assignment in vertex.groups
                           if assignment.group == group_index), 0.0)
            if weight:
                vertex.co += rest_delta * weight
        body.data.update()
        bpy.context.view_layer.update()
    scene.frame_set(r4.POSE_FRAMES["IMPACT"])


def hand_candidates(body, group_name):
    group_index = body.vertex_groups[group_name].index
    return {
        vertex.index
        for vertex in body.data.vertices
        if any(assignment.group == group_index and assignment.weight > .25
               for assignment in vertex.groups)
    }


def hand_graph(body, candidates):
    graph = {index: [] for index in candidates}
    for edge in body.data.edges:
        first, second = edge.vertices
        if first in candidates and second in candidates:
            length = (body.data.vertices[first].co -
                      body.data.vertices[second].co).length
            graph[first].append((second, length))
            graph[second].append((first, length))
    return graph


def geodesic_distances(graph, source):
    distances = {index: float("inf") for index in graph}
    distances[source] = 0.0
    queue = [(0.0, source)]
    while queue:
        distance, index = heapq.heappop(queue)
        if distance != distances[index]:
            continue
        for neighbor, length in graph[index]:
            candidate = distance + length
            if candidate < distances[neighbor]:
                distances[neighbor] = candidate
                heapq.heappush(queue, (candidate, neighbor))
    return distances


PLAYING_FINGERS = {
    # Stable vertex tips in Blender Human Base Meshes v1.4.1 realistic male.
    # The source topology remains untouched; only these anatomical branches
    # receive a controlled grip corrective.
    "index": (9871, .115, (-.010, .118, .012)),
    "middle": (9888, .115, (-.010, .064, .013)),
    "ring": (9682, .100, (0, .034, .014)),
    "little": (9901, .090, (.008, .008, .013)),
    "thumb": (9909, .095, (.012, .076, -.010)),
}


def sculpt_playing_hand_grip(body, rig, handle):
    """Pose the existing anatomical fingers into a restrained shakehand grip."""
    scene = bpy.context.scene
    scene.frame_set(r4.POSE_FRAMES["IMPACT"])
    candidates = hand_candidates(body, "KF_hand_R")
    graph = hand_graph(body, candidates)
    if any(tip not in candidates for tip, _, _ in PLAYING_FINGERS.values()):
        raise RuntimeError("Playing-hand topology no longer matches the locked base mesh")
    distances = {
        name: geodesic_distances(graph, tip)
        for name, (tip, _, _) in PLAYING_FINGERS.items()
    }
    assignments = {}
    for index in candidates:
        name = min(PLAYING_FINGERS, key=lambda item: distances[item][index])
        tip, reach, target = PLAYING_FINGERS[name]
        distance = distances[name][index]
        if distance >= reach:
            continue
        influence = 1.0 - distance / reach
        influence = influence * influence * (3.0 - 2.0 * influence)
        assignments[index] = (name, influence)

    group_index = body.vertex_groups["KF_hand_R"].index
    hand_group = body.vertex_groups["KF_hand_R"]
    for index, (_, influence) in assignments.items():
        weights = {
            assignment.group: assignment.weight
            for assignment in body.data.vertices[index].groups
        }
        old_hand = weights.get(group_index, 0.0)
        new_hand = old_hand + (1.0 - old_hand) * influence
        remaining_old = max(1e-8, 1.0 - old_hand)
        remaining_new = 1.0 - new_hand
        for candidate_group, old_weight in weights.items():
            group = body.vertex_groups[candidate_group]
            if candidate_group == group_index:
                group.add([index], new_hand, "REPLACE")
            else:
                group.add(
                    [index], old_weight / remaining_old * remaining_new,
                    "REPLACE",
                )
    body.data.update()
    bpy.context.view_layer.update()

    evaluated = body.evaluated_get(bpy.context.evaluated_depsgraph_get())
    mesh = evaluated.to_mesh()
    inverse_handle = handle.matrix_world.inverted()
    current_local = {
        index: inverse_handle @ (evaluated.matrix_world @ mesh.vertices[index].co)
        for index in assignments
    }
    evaluated.to_mesh_clear()
    corrections = {}
    labels = {}
    for index, (name, influence) in assignments.items():
        tip, _, target = PLAYING_FINGERS[name]
        delta = Vector(target) - current_local[tip]
        desired = current_local[index] + delta * influence
        # A small mid-arc keeps the curled digits rounded around the handle
        # instead of translating them as straight, rigid branches.
        if name in {"middle", "ring", "little"}:
            desired.x -= math.sin(math.pi * influence) * .006
            desired.z += math.sin(math.pi * influence) * .005
        current_world = handle.matrix_world @ current_local[index]
        target_world = handle.matrix_world @ desired
        corrections[index] = target_world - current_world
        labels[index] = name

    pose_bone = rig.pose.bones["KF_hand_R"]
    deform = pose_bone.matrix @ pose_bone.bone.matrix_local.inverted()
    inverse_deform = deform.to_3x3().inverted()
    for index, world_delta in corrections.items():
        correction = inverse_deform @ world_delta
        if correction.length > .125:
            correction.normalize()
            correction *= .125
        body.data.vertices[index].co += correction
    body.data.update()
    bpy.context.view_layer.update()
    body["kf_playing_hand_corrective"] = "shakehand_existing_anatomy"
    body["kf_playing_hand_digit_vertices"] = len(corrections)
    scene.frame_set(r4.POSE_FRAMES["IMPACT"])
    return labels


def relax_non_playing_hand(body, rig):
    """Reduce the base mesh finger splay without adding a second hand rig."""
    right = hand_candidates(body, "KF_hand_R")
    left = hand_candidates(body, "KF_hand_L")
    right_tips = [value[0] for value in PLAYING_FINGERS.values()]
    left_tips = []
    for tip in right_tips:
        mirrored = body.data.vertices[tip].co.copy()
        mirrored.y *= -1
        left_tips.append(min(left, key=lambda index: (
            body.data.vertices[index].co - mirrored
        ).length))
    graph = hand_graph(body, left)
    distances = [geodesic_distances(graph, tip) for tip in left_tips]
    palm = rig.data.bones["KF_hand_L"].tail_local.copy()
    relatives = [body.data.vertices[tip].co - palm for tip in left_tips]
    center_direction = sum(
        (relative.normalized() for relative in relatives[:4]), Vector()
    ).normalized()
    tip_targets = []
    for branch, relative in enumerate(relatives):
        if branch == 4:
            direction = relative.normalized().lerp(center_direction, .10).normalized()
            tip_targets.append(palm + direction * relative.length)
        else:
            direction = relative.normalized().lerp(center_direction, .30).normalized()
            tip_targets.append(palm + direction * relative.length * 1.08)
    for index in left:
        branch = min(range(len(left_tips)), key=lambda item: distances[item][index])
        distance = distances[branch][index]
        if distance >= .095:
            continue
        influence = 1.0 - distance / .095
        influence = influence * influence * (3.0 - 2.0 * influence)
        tip = body.data.vertices[left_tips[branch]].co
        body.data.vertices[index].co += (
            tip_targets[branch] - tip
        ) * influence * .60
    body.data.update()
    body["kf_non_playing_hand_corrective"] = "relaxed_existing_anatomy"


def replace_mesh_geometry(obj, vertices, faces):
    previous = obj.data
    mesh = r4.mark(bpy.data.meshes.new(obj.name + "_Mesh_L0_Refined"))
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    for polygon in mesh.polygons:
        polygon.use_smooth = True
    for material in previous.materials:
        mesh.materials.append(material)
    obj.data = mesh
    if previous.users == 0:
        bpy.data.meshes.remove(previous)


def refine_temporary_paddle():
    """Give the inspection paddle credible proportions without moving contact."""
    blade = bpy.data.objects["KF_TEMP_PaddleBlade"]
    handle = bpy.data.objects["KF_TEMP_PaddleHandle"]
    vertices = []
    faces = []
    sides = 32
    for depth in (-.004, .004):
        for index in range(sides):
            angle = index * 2 * math.pi / sides
            vertical = math.sin(angle)
            lower_taper = 1.0 - .10 * max(0.0, -vertical)
            vertices.append((.076 * math.cos(angle) * lower_taper,
                             .160 + .080 * vertical, depth))
    faces.append(tuple(reversed(range(sides))))
    faces.append(tuple(range(sides, sides * 2)))
    for index in range(sides):
        nxt = (index + 1) % sides
        faces.append((index, nxt, sides + nxt, sides + index))
    replace_mesh_geometry(blade, vertices, faces)

    surface = r4.Surface()
    surface.segment((0, -.018, 0), (0, .108, 0), [
        (0, .017, .012), (.16, .0215, .0145), (.48, .0205, .014),
        (.78, .0185, .0125), (1, .0155, .0105),
    ], 0, "placeholder", sides=20)
    replace_mesh_geometry(handle, surface.vertices,surface.faces)
    blade["kf_review_paddle"] = "temporary_refined_not_final"
    handle["kf_review_paddle"] = "temporary_refined_not_final"
    return handle


def add_court_shoes(collection, rig, material):
    surface = r4.Surface()
    for side, sign in (("R", 1), ("L", -1)):
        bone = "KF_foot_" + side
        center_y = sign * .220
        surface.segment((-.135, center_y, .052), (.145, center_y, .044), [
            (0, .044, .052), (.12, .048, .059), (.35, .052, .061),
            (.62, .058, .056), (.82, .061, .046), (1, .046, .025),
        ], 0, bone, sides=18)
        surface.segment((-.140, center_y, .014), (.150, center_y, .013), [
            (0, .048, .009), (.16, .052, .010), (.50, .060, .010),
            (.82, .064, .009), (1, .049, .008),
        ], 0, bone, sides=18)
    shoes = r4.make_mesh(
        "KF_CourtShoes_L0", surface.vertices, surface.faces,
        surface.material_ids, [material], collection,
    )
    groups = {}
    for weights in surface.weights:
        for name in weights:
            if name not in groups:
                groups[name] = shoes.vertex_groups.new(name=name)
    for index, weights in enumerate(surface.weights):
        for name, weight in weights.items():
            groups[name].add([index], weight, "REPLACE")
    shoes.parent = rig
    modifier = shoes.modifiers.new("KF_ArmatureDeform", "ARMATURE")
    modifier.object = rig
    return shoes


def add_sculptural_hair(collection, rig, material):
    surface = r4.Surface()
    surface.loft([
        (-.030, 0, 1.665, .092, .087),
        (-.025, 0, 1.705, .104, .098),
        (-.020, .002, 1.750, .101, .097),
        (-.015, .004, 1.790, .080, .077),
        (-.010, .005, 1.818, .042, .043),
    ], 0, lambda _: {"KF_head": 1.0}, sides=28)
    for center, scale in (
        ((.028, -.052, 1.758), (.061, .044, .057)),
        ((.040, .000, 1.770), (.064, .049, .060)),
        ((.025, .052, 1.758), (.060, .044, .056)),
        ((-.025, -.040, 1.796), (.067, .045, .042)),
        ((-.028, .038, 1.798), (.068, .045, .043)),
        ((-.074, 0, 1.750), (.054, .070, .067)),
    ):
        surface.ellipsoid(center, scale, 0, {"KF_head": 1.0},
                          steps=6, sides=12)
    hair = r4.make_mesh(
        "KF_SculpturalHair_L0", surface.vertices, surface.faces,
        surface.material_ids, [material], collection,
    )
    group = hair.vertex_groups.new(name="KF_head")
    group.add(list(range(len(hair.data.vertices))), 1.0, "REPLACE")
    hair.parent = rig
    modifier = hair.modifiers.new("KF_ArmatureDeform", "ARMATURE")
    modifier.object = rig
    return hair


def prepare_visible_meshes(body, geo, materials, rig, source_meshes):
    skin, cloth, hair_shoes, eye_material = materials

    def shirt(points):
        def inside(point):
            neck_radius = math.hypot(point.x + .018, point.y)
            torso = (.945 <= point.z <= 1.505 and abs(point.y) <= .265
                     and (point.z <= 1.385 or neck_radius >= .105))
            sleeves = 1.185 <= point.z <= 1.475 and abs(point.y) <= .380
            return torso or sleeves
        return all(inside(point) for point in points)

    def shorts(points):
        return all(.705 <= point.z <= 1.005 and abs(point.y) <= .215
                   for point in points)

    shirt_obj = copy_weighted_shell(
        "KF_CompetitionShirt_L0", body, geo, cloth, shirt, .0085,
    )
    shorts_obj = copy_weighted_shell(
        "KF_AthleticShorts_L0", body, geo, cloth, shorts, .010,
    )
    hair_obj = add_sculptural_hair(geo, rig, hair_shoes)
    shoes = add_court_shoes(geo, rig, hair_shoes)
    eyes = add_eyes(source_meshes, geo, eye_material, rig)
    return [body, shirt_obj, shorts_obj, hair_obj, shoes, *eyes]


def triangle_count(obj):
    evaluated = obj.evaluated_get(bpy.context.evaluated_depsgraph_get())
    mesh = evaluated.to_mesh()
    mesh.calc_loop_triangles()
    count = len(mesh.loop_triangles)
    evaluated.to_mesh_clear()
    return count


def visible_vertices(objects):
    depsgraph = bpy.context.evaluated_depsgraph_get()
    points = []
    for obj in objects:
        evaluated = obj.evaluated_get(depsgraph)
        mesh = evaluated.to_mesh()
        points.extend(evaluated.matrix_world @ vertex.co for vertex in mesh.vertices)
        evaluated.to_mesh_clear()
    return points


def staging_framing(objects, blade):
    desktop_positions = [Vector(value) for value in (
        (0, 2.50, 5.80), (-1.50, 2.10, 4.60), (-1.65, 1.90, 4.60),
        (1.70, 2.70, 4.70), (0, 3.35, 5.60),
    )]
    desktop_targets = [Vector(value) for value in (
        (0, .95, 0), (-.60, 1.00, 0), (-1.22, 1.08, .05),
        (-.30, 1.05, -.05), (0, 1.10, -.10),
    )]
    portrait_positions = [Vector(value) for value in (
        (0, 3.90, 12.50), (-1.35, 2.90, 8.20), (-1.55, 2.40, 6.80),
        (1.10, 3.50, 9.30), (0, 4.30, 12.80),
    )]
    portrait_targets = [Vector(value) for value in (
        (0, .90, 0), (-.90, 1.00, 0), (-1.05, 1.12, .05),
        (-.55, 1.05, -.05), (0, 1.15, -.10),
    )]
    samples = (
        ("RECOGNITION", r4.POSE_FRAMES["READY"], .08),
        ("IMPACT", r4.POSE_FRAMES["IMPACT"], .47),
        ("RELEASE", r4.POSE_FRAMES["RECOVERY"], .92),
    )
    result = {"desktop": {}, "portrait": {}}
    for label, frame, progress in samples:
        bpy.context.scene.frame_set(frame)
        staged = [r4.staging_point(point) for point in visible_vertices(objects)]
        expanded = []
        for point in staged:
            expanded.extend(point + Vector(offset) for offset in (
                (.06, 0, 0), (-.06, 0, 0), (0, .06, 0),
                (0, -.06, 0), (0, 0, .06), (0, 0, -.06),
            ))
        center = r4.staging_point(blade.matrix_world @ Vector((0, .160, 0)))
        expanded.extend(center + Vector((x, y, z))
                        for x in (-.10, .10)
                        for y in (-.10, .10)
                        for z in (-.085, .085))
        for mode, positions, targets, fov, aspect in (
            ("desktop", desktop_positions, desktop_targets, 39, 1440 / 900),
            ("portrait", portrait_positions, portrait_targets, 46, 390 / 844),
        ):
            camera = r4.lerp_five(positions, progress)
            target = r4.lerp_five(targets, progress)
            projected = [r4.project_three(point, camera, target, fov, aspect)
                         for point in expanded]
            bounds = (
                min(point.x for point in projected),
                max(point.x for point in projected),
                min(point.y for point in projected),
                max(point.y for point in projected),
            )
            result[mode][label] = {
                "margin_ndc": round(min(bounds[0] + 1, 1 - bounds[1],
                                        bounds[2] + 1, 1 - bounds[3]), 5),
                "bounds_ndc": [round(value, 5) for value in bounds],
            }
    return result


def validate(source_info, visible, body, rig, socket):
    scene = bpy.context.scene
    blade = bpy.data.objects["KF_TEMP_PaddleBlade"]
    counts = {obj.name: triangle_count(obj) for obj in visible}
    total_triangles = sum(counts.values())
    warnings = []
    if len(rig.data.bones) != 20:
        warnings.append(f"Expected 20 bones, found {len(rig.data.bones)}")
    if any(abs(value - 1) > 1e-6 for value in body.scale):
        warnings.append("Production body scale is not 1.0")
    raw_height = (max(vertex.co.z for vertex in body.data.vertices) -
                  min(vertex.co.z for vertex in body.data.vertices))
    if abs(raw_height - SOURCE_HEIGHT_M) > 1e-4:
        warnings.append("Normalized source body is not 1.80 m")
    for obj in visible:
        if obj.type != "MESH":
            continue
        for vertex in obj.data.vertices:
            weights = [assignment.weight for assignment in vertex.groups]
            if not weights or len(weights) > 4 or abs(sum(weights) - 1) > 1e-4:
                warnings.append(obj.name + ": invalid skin weights")
                break
    action = rig.animation_data.action if rig.animation_data else None
    if not action or action.name != "KF_Athlete_Forehand":
        warnings.append("Forehand action missing")
    marker_map = {marker.name: marker.frame for marker in scene.timeline_markers}
    for name, frame in r4.POSE_FRAMES.items():
        if marker_map.get("KF_" + name) != frame:
            warnings.append("Pose marker mismatch: " + name)

    def sample(frame, subframe=0):
        scene.frame_set(frame, subframe=subframe)
        values = [value for bone in rig.pose.bones
                  for row in bone.matrix for value in row]
        values.extend(value for row in socket.matrix_world for value in row)
        return values

    direct = sample(17, .5)
    sample(36)
    reverse = sample(17, .5)
    reverse_delta = max(abs(a - b) for a, b in zip(direct, reverse))
    if reverse_delta > 1e-5:
        warnings.append("Reverse animation reconstruction differs")

    scene.frame_set(r4.POSE_FRAMES["IMPACT"])
    source_contact = blade.matrix_world @ Vector((0, .160, 0))
    staged_contact = r4.staging_point(source_contact)
    contact_delta = (staged_contact - r4.STAGING_CONTACT_THREE).length
    if contact_delta > .03:
        warnings.append("Impact contact missed locked target")

    hand_group = body.vertex_groups["KF_hand_R"].index
    evaluated_body = body.evaluated_get(bpy.context.evaluated_depsgraph_get())
    body_mesh = evaluated_body.to_mesh()
    hand_points = [
        evaluated_body.matrix_world @ body_mesh.vertices[vertex.index].co
        for vertex in body.data.vertices
        if any(assignment.group == hand_group and assignment.weight > .15
               for assignment in vertex.groups)
    ]
    handle = bpy.data.objects["KF_TEMP_PaddleHandle"]
    evaluated_handle = handle.evaluated_get(bpy.context.evaluated_depsgraph_get())
    handle_mesh = evaluated_handle.to_mesh()
    handle_points = [evaluated_handle.matrix_world @ vertex.co
                     for vertex in handle_mesh.vertices]
    grip_surface_distance = min((hand - point).length
                                for hand in hand_points
                                for point in handle_points)
    fingertip_handle_distances = {
        name: min(
            (evaluated_body.matrix_world @ body_mesh.vertices[tip].co - point).length
            for point in handle_points
        )
        for name, (tip, _, _) in PLAYING_FINGERS.items()
    }
    handle_proximity_vertices = sum(
        1 for hand in hand_points
        if min((hand - point).length for point in handle_points) <= .012
    )
    evaluated_body.to_mesh_clear()
    evaluated_handle.to_mesh_clear()
    if grip_surface_distance > .02:
        warnings.append(
            "Playing hand does not enclose the temporary handle "
            f"({grip_surface_distance:.6f} m)"
        )

    deformation = {}
    for pose_name in r4.POSE_FRAMES:
        scene.frame_set(r4.POSE_FRAMES[pose_name])
        points = visible_vertices(visible)
        finite = all(all(math.isfinite(axis) for axis in point) for point in points)
        deformation[pose_name] = {
            "finite": finite,
            "minimum_m": [min(point[axis] for point in points)
                          for axis in range(3)],
            "maximum_m": [max(point[axis] for point in points)
                          for axis in range(3)],
        }
        if not finite:
            warnings.append(pose_name + ": nonfinite deformation")

    collisions = {}
    for pose_name in r4.POSE_FRAMES:
        scene.frame_set(r4.POSE_FRAMES[pose_name])
        staged = [r4.staging_point(point) for point in visible_vertices(visible)]
        collisions[pose_name] = sum(
            1 for point in staged
            if -1.37 <= point.x <= 1.37 and abs(point.z) <= .7625 and point.y <= .76
        )
    if any(collisions.values()):
        warnings.append("Visible athlete intersects the locked table prism")

    framing = staging_framing(visible, blade)
    if any(value["margin_ndc"] <= 0
           for mode in framing.values() for value in mode.values()):
        warnings.append("Visible athlete exceeds a locked camera frame")

    scene.frame_set(r4.POSE_FRAMES["READY"])
    rest_points = [point for point in visible_vertices([body])]
    source_bounds = {
        "minimum": [min(point[axis] for point in rest_points) for axis in range(3)],
        "maximum": [max(point[axis] for point in rest_points) for axis in range(3)],
    }
    scene.frame_set(r4.POSE_FRAMES["IMPACT"])
    report = {
        "blender": bpy.app.version_string,
        "base_mesh": source_info,
        "declared_source_height_m": SOURCE_HEIGHT_M,
        "measured_raw_body_height_m": raw_height,
        "production_scale": 1.0,
        "locked_staging": {
            "scale": r4.STAGING_SCALE,
            "root_three_m": list(r4.STAGING_ROOT_THREE),
            "yaw_rad": r4.STAGING_YAW_RAD,
        },
        "source_bounds_ready_m": source_bounds,
        "visible_triangle_counts": counts,
        "visible_triangles_total": total_triangles,
        "bones": len(rig.data.bones),
        "action": action.name if action else None,
        "frame_range": [1, r4.FRAME_END],
        "fps": r4.FPS,
        "pose_markers": r4.POSE_FRAMES,
        "reverse_sample_max_delta": reverse_delta,
        "impact_blade_center_source_m": list(source_contact),
        "impact_blade_center_three_m": list(staged_contact),
        "impact_contact_delta_m": contact_delta,
        "grip_surface_distance_m": grip_surface_distance,
        "playing_fingertip_to_handle_vertex_distance_m":
            fingertip_handle_distances,
        "playing_hand_handle_proximity_vertices": handle_proximity_vertices,
        "temporary_paddle_local_bounds_m": {
            "blade": {
                "minimum": [min(vertex.co[axis] for vertex in blade.data.vertices)
                            for axis in range(3)],
                "maximum": [max(vertex.co[axis] for vertex in blade.data.vertices)
                            for axis in range(3)],
            },
            "handle": {
                "minimum": [min(vertex.co[axis] for vertex in handle.data.vertices)
                            for axis in range(3)],
                "maximum": [max(vertex.co[axis] for vertex in handle.data.vertices)
                            for axis in range(3)],
            },
        },
        "deformation_validation": deformation,
        "table_prism_collisions": collisions,
        "framing_with_6cm_reserve": framing,
        "warnings": warnings,
    }
    if warnings:
        raise RuntimeError("Base-mesh athlete validation failed: " + "; ".join(warnings))
    return report


def render_review_set(output_directory, visible, rig, socket, only=None):
    output_directory.mkdir(parents=True, exist_ok=True)
    scene = bpy.context.scene
    camera = bpy.data.objects["KF_InspectionCamera"]
    camera.data.type = "ORTHO"
    scene.render.image_settings.file_format = "PNG"
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = False
    shots = [
        ("grip-extreme-palm-side", "IMPACT", None, None, .31, False),
        ("grip-close-blade-index-side", "IMPACT", None, None, .34, False),
        ("impact-three-quarter-neutral", "IMPACT", (2.8, -3.6, 2.15), (.18, 0, 1.00), 2.22, False),
        ("impact-near-front-neutral", "IMPACT", (3.8, -1.25, 1.72), (.18, 0, 1.00), 2.22, False),
        ("impact-side-neutral", "IMPACT", (0, -4.2, 1.48), (.15, 0, .96), 2.14, False),
        ("non-playing-hand-close-neutral", "IMPACT", None, None, .43, False),
        ("shirt-neckline-shoulder-close-neutral", "IMPACT", None, None, .82, False),
        ("shoe-close-neutral", "READY", (1.7, -2.4, .56), (.18, .05, .095), .64, False),
        ("head-hair-close-neutral", "READY", (1.8, -1.35, 1.75), (.01, 0, 1.63), .68, False),
        ("impact-silhouette", "IMPACT", (2.8, -3.6, 2.15), (.18, 0, 1.00), 2.22, True),
    ]
    paddle = [bpy.data.objects[name] for name in
              ("KF_TEMP_PaddleBlade", "KF_TEMP_PaddleHandle")]
    rendered = [*visible, *paddle]
    originals = [[slot.material for slot in obj.material_slots] for obj in rendered]
    silhouette = r4.material("KF_SilhouetteReview", (.006, .006, .006), 1.0)
    for filename, pose, location, target, scale, use_silhouette in shots:
        if only and filename not in only:
            continue
        scene.frame_set(r4.POSE_FRAMES[pose])
        if filename == "grip-extreme-palm-side":
            target_vector = socket.matrix_world.translation + Vector((.06, 0, .015))
            location_vector = target_vector + Vector((.92, -1.12, .30))
        elif filename == "grip-close-blade-index-side":
            target_vector = socket.matrix_world.translation + Vector((.07, 0, .035))
            location_vector = target_vector + Vector((-.82, .98, .22))
        elif filename == "non-playing-hand-close-neutral":
            hand = rig.pose.bones["KF_hand_L"]
            target_vector = rig.matrix_world @ hand.head.lerp(hand.tail, .60)
            location_vector = target_vector + Vector((1.02, -1.20, .28))
        elif filename == "shirt-neckline-shoulder-close-neutral":
            neck = rig.pose.bones["KF_neck"]
            shoulder = rig.pose.bones["KF_clavicle_R"]
            target_vector = (rig.matrix_world @ neck.head).lerp(
                rig.matrix_world @ shoulder.tail, .48
            )
            location_vector = target_vector + Vector((1.55, -1.55, .54))
        else:
            target_vector = Vector(target)
            location_vector = Vector(location)
        camera.location = location_vector
        r4.point_camera(camera, target_vector)
        camera.data.ortho_scale = scale
        close = "close" in filename or "grip-extreme" in filename
        scene.render.resolution_x = 1400 if close else 1200
        scene.render.resolution_y = 1200 if close else 1400
        if use_silhouette:
            for obj in rendered:
                for slot in obj.material_slots:
                    slot.material = silhouette
        else:
            for obj, materials in zip(rendered, originals):
                for slot, original in zip(obj.material_slots, materials):
                    slot.material = original
        scene.render.filepath = str(output_directory / (filename + ".png"))
        bpy.ops.render.render(write_still=True)
    for obj, materials in zip(rendered, originals):
        for slot, original in zip(obj.material_slots, materials):
            slot.material = original
    scene.frame_set(r4.POSE_FRAMES["IMPACT"])


def export_validation_glb(path, root_collection):
    bpy.ops.object.select_all(action="DESELECT")
    export_collection = bpy.data.collections["KF_EXPORT"]
    objects = [obj for collection in r4.owned_collections(export_collection)
               for obj in collection.objects
               if obj.type in {"MESH", "ARMATURE", "EMPTY"}]
    objects.extend(
        bpy.data.objects[name] for name in (
            "KF_TEMP_PaddleBlockout_Only",
            "KF_TEMP_PaddleBlade",
            "KF_TEMP_PaddleHandle",
        )
    )
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = next(
        obj for obj in objects if obj.type == "ARMATURE"
    )
    bpy.ops.export_scene.gltf(
        filepath=str(path), export_format="GLB", use_selection=True,
        use_active_scene=True, export_animations=True,
        export_force_sampling=True, export_frame_range=True,
        export_skins=True, export_def_bones=True, export_apply=True,
        export_draco_mesh_compression_enable=False,
    )


def inspect_glb(path):
    payload = path.read_bytes()
    magic, version, total_bytes = struct.unpack_from("<4sII", payload, 0)
    json_length, _ = struct.unpack_from("<II", payload, 12)
    document = json.loads(payload[20:20 + json_length].decode().rstrip(" \x00"))
    return {
        "magic": magic.decode(),
        "version": version,
        "bytes": total_bytes,
        "scenes": len(document.get("scenes", [])),
        "nodes": len(document.get("nodes", [])),
        "meshes": len(document.get("meshes", [])),
        "skins": len(document.get("skins", [])),
        "skin_joints": [len(skin.get("joints", []))
                        for skin in document.get("skins", [])],
        "animations": [
            {
                "name": animation.get("name"),
                "channels": len(animation.get("channels", [])),
                "samplers": len(animation.get("samplers", [])),
            }
            for animation in document.get("animations", [])
        ],
        "materials": [material.get("name")
                      for material in document.get("materials", [])],
        "images": len(document.get("images", [])),
        "textures": len(document.get("textures", [])),
        "external_buffer_uris": [buffer.get("uri")
                                 for buffer in document.get("buffers", [])
                                 if buffer.get("uri")],
        "extensions_required": document.get("extensionsRequired", []),
    }


def build(args):
    if not args.base_file.exists():
        raise FileNotFoundError(args.base_file)
    source_hash_before = file_sha256(args.base_file)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.name = "KF_Athlete_ProductionScene"
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0
    scene.unit_settings.length_unit = "METERS"

    root_collection = r4.new_collection("KF_Athlete", scene.collection)
    export = r4.new_collection("KF_EXPORT", root_collection)
    geo = r4.new_collection("KF_GEO_HIGH", export)
    rig_collection = r4.new_collection("KF_RIG", export)
    sockets = r4.new_collection("KF_SOCKETS", export)
    reference = r4.new_collection("KF_REFERENCE", root_collection)
    inspection = r4.new_collection("KF_INSPECTION", root_collection)

    root = r4.link_object("KF_AthleteRoot", None, export)
    root.empty_display_type = "PLAIN_AXES"
    root.empty_display_size = .13
    root["kf_source_height_m"] = SOURCE_HEIGHT_M
    root["kf_production_scale"] = 1.0
    root["kf_base_bundle"] = str(args.base_file)
    root["kf_base_sha256"] = source_hash_before

    skin = r4.material("KF_Skin", (.50, .34, .25), .78)
    cloth = r4.material("KF_Cloth", (.035, .040, .046), .88)
    hair_shoes = r4.material("KF_HairShoes", (.016, .019, .022), .76)
    eye_material = r4.material("KF_EyeNeutral", (.055, .052, .046), .72)
    rig, definitions = r4.build_rig(rig_collection, root)
    source_meshes, source_info = source_mesh_data(args.base_file)
    body_vertices, body_faces = source_meshes[BASE_BODY_NAME]
    body = make_mesh("KF_AthleteBody_L0", body_vertices, body_faces, skin, geo)
    add_armature_weights(body, rig)
    socket = r4.socket_and_paddle(sockets, reference, rig)
    handle = refine_temporary_paddle()
    r4.make_action(rig)
    relax_non_playing_hand(body, rig)
    align_playing_hand_to_socket(body, rig, socket, handle)
    sculpt_playing_hand_grip(body, rig, handle)
    visible = prepare_visible_meshes(
        body, geo, [skin, cloth, hair_shoes, eye_material],
        rig, source_meshes,
    )
    r4.add_reference_markers(reference)
    r4.add_inspection(inspection)
    report = validate(source_info, visible, body, rig, socket)
    report["base_file"] = str(args.base_file)
    report["base_sha256"] = source_hash_before
    report["working_blend"] = str(args.output)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(args.output), check_existing=False)
    if file_sha256(args.base_file) != source_hash_before:
        raise RuntimeError("Downloaded source changed during migration")

    if args.render_dir:
        render_only = ({name.strip() for name in args.render_only.split(",")}
                       if args.render_only else None)
        render_review_set(args.render_dir, visible, rig, socket, render_only)
        report["review_render_directory"] = str(args.render_dir)
    if args.validation_glb:
        args.validation_glb.parent.mkdir(parents=True, exist_ok=True)
        export_validation_glb(args.validation_glb, root_collection)
        report["temporary_validation_glb"] = str(args.validation_glb)
        report["temporary_validation_glb_bytes"] = args.validation_glb.stat().st_size
        report["temporary_validation_glb_inspection"] = inspect_glb(args.validation_glb)
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n")
    return report


def parse_arguments():
    parser = argparse.ArgumentParser(description="Build the KF base-mesh athlete")
    parser.add_argument("--base-file", type=Path, default=DEFAULT_BASE_FILE)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--render-dir", type=Path)
    parser.add_argument("--render-only", type=str)
    parser.add_argument("--validation-glb", type=Path)
    parser.add_argument("--report", type=Path)
    values = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    return parser.parse_args(values)


if __name__ == "__main__":
    build(parse_arguments())
