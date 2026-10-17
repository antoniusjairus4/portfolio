"""Build the KF_Athlete R4 surgical visual-refinement study in Blender 5.0.1.

Run from Blender's Scripting workspace. This script never saves or exports.
It owns only the KF_Athlete collection tree. If that tree contains an object
without the generator tag, rerunning stops rather than deleting manual work.

Source axes: +Z up, +X forward toward the table, +Y athlete's right.
The glTF exporter converts this to Y-up. Feet define the source origin.
The locked future website staging is scale 1.0, root
(-1.950, 0.025, 0.380) and yaw +0.040 rad in Three coordinates. Those
values remain metadata only and are never baked into this source asset.

The camera in this file is a neutral inspection camera, not a KaiForge
runtime camera. Optional command-line review renders and a temporary GLB
export are validation helpers; no .blend or production asset is saved.
"""

import argparse
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Quaternion, Vector


OWNER_TAG = "kf_athlete_r3_generator"
SOURCE_HEIGHT_M = 1.80
FPS = 30
FRAME_END = 36
POSE_FRAMES = {
    "READY": 1,
    "LOAD": 7,
    "ACCELERATION": 13,
    "IMPACT": 18,
    "FOLLOW_THROUGH": 25,
    "RECOVERY": 36,
}
# Authoritative metadata from docs/KF_PRODUCTION_STAGING.md. It is used only
# for validation and reporting; source geometry remains at metre scale.
STAGING_SCALE = 1.0
STAGING_ROOT_THREE = Vector((-1.950, .025, .380))
STAGING_YAW_RAD = .04
STAGING_CONTACT_THREE = Vector((-1.2764, 1.3125, .0638))
PRODUCTION_BLADE_CENTER_SOURCE = Vector((.68570, .28902, 1.28750))


def mark(block):
    block[OWNER_TAG] = True
    return block


def owned_collections(root):
    result = []

    def visit(collection):
        for child in collection.children:
            visit(child)
        result.append(collection)

    visit(root)
    return result


def remove_previous_build():
    root = bpy.data.collections.get("KF_Athlete")
    if root is None:
        return
    collections = owned_collections(root)
    if any(not item.get(OWNER_TAG) for item in collections):
        raise RuntimeError("KF_Athlete contains an unowned collection; manual work was preserved.")
    objects = {obj for collection in collections for obj in collection.objects}
    if any(not obj.get(OWNER_TAG) for obj in objects):
        raise RuntimeError("KF_Athlete contains an unowned object; manual work was preserved.")
    if any(obj not in objects and obj.parent in objects for obj in bpy.data.objects):
        raise RuntimeError("An external object is parented to KF_Athlete; manual work was preserved.")
    for obj in objects:
        bpy.data.objects.remove(obj, do_unlink=True)
    for collection in collections:
        bpy.data.collections.remove(collection, do_unlink=True)
    for marker in tuple(bpy.context.scene.timeline_markers):
        if marker.name.startswith("KF_") and any(
            marker.name == "KF_" + name and marker.frame == frame
            for name, frame in POSE_FRAMES.items()
        ):
            bpy.context.scene.timeline_markers.remove(marker)
    for registry in (bpy.data.meshes, bpy.data.armatures, bpy.data.cameras,
                     bpy.data.lights, bpy.data.materials, bpy.data.actions):
        for block in tuple(registry):
            if block.get(OWNER_TAG) and block.users == 0:
                registry.remove(block)


def new_collection(name, parent):
    collection = mark(bpy.data.collections.new(name))
    parent.children.link(collection)
    return collection


def link_object(name, data, collection):
    obj = mark(bpy.data.objects.new(name, data))
    collection.objects.link(obj)
    return obj


def material(name, color, roughness=0.82):
    mat = mark(bpy.data.materials.new(name))
    mat.diffuse_color = (*color, 1)
    if mat.node_tree is None:
        mat.use_nodes = True  # Compatibility fallback for older 5.x defaults.
    node = mat.node_tree.nodes.get("Principled BSDF")
    node.inputs["Base Color"].default_value = (*color, 1)
    node.inputs["Roughness"].default_value = roughness
    node.inputs["Metallic"].default_value = 0.0
    return mat


def make_mesh(name, vertices, faces, material_ids, materials, collection):
    mesh = mark(bpy.data.meshes.new(name + "_Mesh_L0"))
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    for mat in materials:
        mesh.materials.append(mat)
    for poly, mat_id in zip(mesh.polygons, material_ids):
        poly.material_index = mat_id
        poly.use_smooth = True
    return link_object(name, mesh, collection)


class Surface:
    def __init__(self):
        self.vertices = []
        self.faces = []
        self.material_ids = []
        self.weights = []

    def vertex(self, point, weights):
        self.vertices.append(tuple(point))
        self.weights.append(weights)
        return len(self.vertices) - 1

    def face(self, indices, material_id):
        self.faces.append(tuple(indices))
        self.material_ids.append(material_id)

    def loft(self, rings, material_id, weight_fn, sides=12,
             cap_start=True, cap_end=True):
        """Horizontal elliptical rings: (x, y, z, x_radius, y_radius)."""
        indices = []
        for ring_index, (cx, cy, z, rx, ry) in enumerate(rings):
            row = []
            for side in range(sides):
                angle = side * 2 * math.pi / sides
                row.append(self.vertex((cx + rx * math.cos(angle), cy + ry * math.sin(angle), z), weight_fn(ring_index)))
            indices.append(row)
        if cap_start:
            self.face(tuple(reversed(indices[0])), material_id)
        for lower, upper in zip(indices, indices[1:]):
            for side in range(sides):
                next_side = (side + 1) % sides
                self.face((lower[side], lower[next_side], upper[next_side], upper[side]), material_id)
        if cap_end:
            self.face(indices[-1], material_id)

    def segment(self, start, end, radii, material_id, bone, sides=10,
                cap_start=True, cap_end=True):
        """Tapered anatomical form aligned to an actual rest bone."""
        start, end = Vector(start), Vector(end)
        axis = (end - start).normalized()
        side = axis.cross(Vector((0, 0, 1)))
        if side.length < 0.05:
            side = axis.cross(Vector((0, 1, 0)))
        side.normalize()
        depth = axis.cross(side).normalized()
        rows = []
        for t, width, thickness in radii:
            center = start.lerp(end, t)
            row = []
            for index in range(sides):
                a = index * 2 * math.pi / sides
                point = center + side * (width * math.cos(a)) + depth * (thickness * math.sin(a))
                weights = bone(t) if callable(bone) else {bone: 1.0}
                row.append(self.vertex(point, weights))
            rows.append(row)
        if cap_start:
            self.face(tuple(reversed(rows[0])), material_id)
        for first, second in zip(rows, rows[1:]):
            for index in range(sides):
                next_index = (index + 1) % sides
                self.face((first[index], first[next_index], second[next_index], second[index]), material_id)
        if cap_end:
            self.face(rows[-1], material_id)

    def limb_chain(self, start, joint, end, profiles, material_id,
                   proximal_bone, distal_bone, sides=12,
                   cap_start=True, cap_end=True):
        """One continuous elbow/knee surface with a narrow two-bone bend zone.

        profiles contain (segment 0/1, position 0..1, width, depth,
        proximal weight). This remains a deliberately low-detail study mesh.
        """
        start, joint, end = Vector(start), Vector(joint), Vector(end)
        rows = []
        first_axis = (joint - start).normalized()
        second_axis = (end - joint).normalized()
        joint_axis = (first_axis + second_axis).normalized()
        for segment_index, t, width, thickness, proximal_weight in profiles:
            first, last = (start, joint) if segment_index == 0 else (joint, end)
            blend = max(0.0, min(1.0, (t - .69) / .31)) if segment_index == 0 else max(0.0, min(1.0, (.31 - t) / .31))
            base_axis = first_axis if segment_index == 0 else second_axis
            axis = base_axis.lerp(joint_axis, blend).normalized()
            side = axis.cross(Vector((0, 0, 1)))
            if side.length < .05:
                side = axis.cross(Vector((0, 1, 0)))
            side.normalize()
            depth = axis.cross(side).normalized()
            center = first.lerp(last, t)
            weights = {
                proximal_bone: proximal_weight,
                distal_bone: 1 - proximal_weight,
            }
            weights = {key: value for key, value in weights.items() if value > 1e-6}
            row = []
            for index in range(sides):
                angle = index * 2 * math.pi / sides
                point = center + side * (width * math.cos(angle)) + depth * (thickness * math.sin(angle))
                row.append(self.vertex(point, weights))
            rows.append(row)
        if cap_start:
            self.face(tuple(reversed(rows[0])), material_id)
        for first, second in zip(rows, rows[1:]):
            for index in range(sides):
                next_index = (index + 1) % sides
                self.face((first[index], first[next_index], second[next_index], second[index]), material_id)
        if cap_end:
            self.face(rows[-1], material_id)

    def court_shoe(self, ankle, toe, material_id, sole_material_id, bone):
        """Low-profile indoor court shoe with a shaped upper and layered sole."""
        ankle, toe = Vector(ankle), Vector(toe)
        middle_y = (ankle.y + toe.y) / 2
        rings = []
        for x, half_width, lower, upper, crown_shift in (
            (ankle.x - .035, .045, .020, .074, -.008),
            (ankle.x, .055, .017, .095, -.004),
            (ankle.x + .045, .063, .014, .104, .004),
            (toe.x - .085, .068, .012, .087, .008),
            (toe.x - .040, .067, .011, .064, .008),
            (toe.x + .003, .058, .012, .044, .004),
            (toe.x + .028, .031, .016, .028, 0),
        ):
            # Nine-point sections keep the sole planar while giving the upper
            # a readable heel counter, instep, vamp and asymmetric crown.
            points = (
                (x, middle_y - half_width, lower),
                (x, middle_y - half_width * .42, lower - .003),
                (x, middle_y + half_width * .42, lower - .003),
                (x, middle_y + half_width, lower),
                (x, middle_y + half_width * .94, upper * .72),
                (x, middle_y + half_width * .48, upper + crown_shift),
                (x, middle_y - half_width * .12, upper + .010),
                (x, middle_y - half_width * .60, upper),
                (x, middle_y - half_width * .94, upper * .72),
            )
            rings.append([self.vertex(point, {bone: 1.0}) for point in points])
        self.face(tuple(reversed(rings[0])), material_id)
        for first, second in zip(rings, rings[1:]):
            for index in range(9):
                nxt = (index + 1) % 9
                self.face((first[index], second[index], second[nxt], first[nxt]), material_id)
        self.face(rings[-1], material_id)
        # The sole follows the upper instead of reading as a rectangular slab.
        sole_rows = []
        for x, width in (
            (ankle.x - .040, .048), (ankle.x + .035, .064),
            (toe.x - .075, .071), (toe.x - .020, .067),
            (toe.x + .030, .033),
        ):
            sole_rows.append([
                self.vertex((x, middle_y - width, z), {bone: 1.0})
                for z in (.002, .020)
            ] + [
                self.vertex((x, middle_y + width, z), {bone: 1.0})
                for z in (.020, .002)
            ])
        self.face(tuple(reversed(sole_rows[0])), sole_material_id)
        for first, second in zip(sole_rows, sole_rows[1:]):
            for index in range(4):
                nxt = (index + 1) % 4
                self.face((first[index], second[index], second[nxt], first[nxt]), sole_material_id)
        self.face(sole_rows[-1], sole_material_id)

    def ellipsoid(self, center, scale, material_id, weights, steps=10, sides=16,
                  z_min=-1, z_max=1):
        center = Vector(center)
        rows = []
        for step in range(steps + 1):
            h = z_min + (z_max - z_min) * step / steps
            circle = math.sqrt(max(0.0001, 1 - h * h))
            row = []
            for side in range(sides):
                a = side * 2 * math.pi / sides
                row.append(self.vertex((
                    center.x + scale[0] * circle * math.cos(a),
                    center.y + scale[1] * circle * math.sin(a),
                    center.z + scale[2] * h,
                ), weights(step / steps) if callable(weights) else dict(weights)))
            rows.append(row)
        self.face(tuple(reversed(rows[0])), material_id)
        for first, second in zip(rows, rows[1:]):
            for side in range(sides):
                n = (side + 1) % sides
                self.face((first[side], first[n], second[n], second[side]), material_id)
        self.face(rows[-1], material_id)


def build_rig(collection, root):
    armature = mark(bpy.data.armatures.new("KF_Athlete_Armature_L0"))
    rig = link_object("KF_Athlete_Rig_L0", armature, collection)
    rig.parent = root
    definitions = [
        ("root", (0, 0, 0), (0, 0, 0.10), None, False),
        ("pelvis", (0, 0, 0.88), (0, 0, 1.03), "root", True),
        ("spine", (0, 0, 1.03), (0, 0, 1.21), "pelvis", True),
        ("chest", (0, 0, 1.21), (0, 0, 1.43), "spine", True),
        ("neck", (0, 0, 1.43), (0, 0, 1.57), "chest", True),
        ("head", (0, 0, 1.57), (0, 0, 1.77), "neck", True),
    ]
    for side, sign in (("R", 1), ("L", -1)):
        definitions.extend([
            (f"clavicle_{side}", (0, sign * 0.11, 1.40), (0, sign * 0.24, 1.37), "chest", True),
            (f"upperArm_{side}", (0, sign * 0.24, 1.37), (0.03, sign * 0.38, 1.12), f"clavicle_{side}", True),
            (f"forearm_{side}", (0.03, sign * 0.38, 1.12), (0.12, sign * 0.50, 0.92), f"upperArm_{side}", True),
            (f"hand_{side}", (0.12, sign * 0.50, 0.92), (0.22, sign * 0.54, 0.86), f"forearm_{side}", True),
            (f"thigh_{side}", (0, sign * 0.12, 0.89),
             (0.11, sign * 0.24, 0.49), "pelvis", True),
            (f"shin_{side}", (0.11, sign * 0.24, 0.49),
             (0.04 if sign > 0 else 0.12, sign * 0.32, 0.10), f"thigh_{side}", True),
            (f"foot_{side}", (0.04 if sign > 0 else 0.12, sign * 0.32, 0.10),
             (0.26 if sign > 0 else 0.34, sign * 0.32, 0.08), f"shin_{side}", True),
        ])
    if bpy.context.object and bpy.context.object.mode != "OBJECT":
        bpy.ops.object.mode_set(mode="OBJECT")
    bpy.context.view_layer.objects.active = rig
    rig.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    for short, head, tail, parent, deform in definitions:
        bone = armature.edit_bones.new("KF_" + short)
        bone.head = head
        bone.tail = tail
        bone.use_deform = deform
        if parent:
            bone.parent = armature.edit_bones["KF_" + parent]
            bone.use_connect = False
    bpy.ops.object.mode_set(mode="OBJECT")
    rig.select_set(False)
    return rig, definitions


def build_body(collection, root, rig, definitions, materials):
    surface = Surface()
    skin, cloth, hair_shoes = 0, 1, 2
    # Tapered clothing follows an athletic pelvis, waist, ribcage and
    # trapezius. Extra sections preserve chest/back and oblique transitions
    # after one controlled subdivision level.
    surface.loft([
        (-.015, 0, .805, .124, .155),
        (-.012, 0, .835, .139, .168),
        (-.009, 0, .875, .151, .177),
        (-.006, 0, .925, .155, .181),
        (-.004, 0, .965, .153, .179),
    ], cloth, lambda _: {"KF_pelvis": 1}, sides=20,
                 cap_start=False, cap_end=False)
    surface.loft([
        (-.006, 0, .961, .151, .176),
        (-.010, 0, .995, .146, .169),
        (-.014, 0, 1.045, .124, .150),
        (-.019, 0, 1.105, .122, .154),
        (-.023, 0, 1.175, .133, .177),
        (-.029, 0, 1.245, .148, .202),
        (-.030, 0, 1.310, .157, .221),
        (-.026, 0, 1.365, .151, .232),
        (-.016, 0, 1.410, .133, .202),
        (-.006, 0, 1.445, .105, .145),
        (0, 0, 1.469, .078, .091),
        (0, 0, 1.481, .061, .065),
    ], cloth, lambda i: (
        {"KF_pelvis": 1} if i < 2 else
        {"KF_pelvis": .55, "KF_spine": .45} if i == 2 else
        {"KF_spine": 1} if i < 5 else
        {"KF_spine": .55, "KF_chest": .45} if i == 5 else
        {"KF_spine": .25, "KF_chest": .75} if i == 6 else
        {"KF_chest": 1}
    ), sides=20)
    # Low-profile collar and waistband establish garment thickness without a
    # vacuum-sealed surface or simulated cloth.
    surface.loft([
        (0, 0, 1.458, .080, .092),
        (0, 0, 1.474, .070, .078),
        (0, 0, 1.485, .061, .066),
    ], cloth, lambda _: {"KF_chest": 1}, sides=20)
    surface.loft([
        (-.006, 0, .938, .156, .183),
        (-.005, 0, .955, .158, .185),
        (-.004, 0, .974, .154, .180),
    ], cloth, lambda _: {"KF_pelvis": 1}, sides=20,
                 cap_start=False, cap_end=False)

    # The neck widens into the trapezius and narrows at the throat instead of
    # remaining a straight cylinder.
    surface.loft([
        (-.020, 0, 1.420, .096, .108),
        (-.010, 0, 1.446, .080, .087),
        (.001, 0, 1.480, .062, .065),
        (.008, 0, 1.518, .052, .055),
        (.012, 0, 1.553, .053, .057),
        (.015, 0, 1.580, .059, .063),
    ], skin, lambda i: (
        {"KF_chest": .55, "KF_neck": .45} if i == 0 else
        {"KF_chest": .20, "KF_neck": .80} if i == 1 else
        {"KF_neck": 1} if i < 4 else
        {"KF_neck": .45, "KF_head": .55}
    ), sides=18)

    # Side-profile shaping supplies the jaw, cheek, brow and cranial vault.
    # +X is the face; there is no protruding facial block or eye/mouth mesh.
    surface.loft([
        (.035, 0, 1.568, .034, .034),
        (.052, 0, 1.584, .041, .052),
        (.052, 0, 1.604, .060, .070),
        (.044, 0, 1.628, .079, .084),
        (.032, 0, 1.655, .094, .092),
        (.021, 0, 1.685, .102, .098),
        (.010, 0, 1.718, .105, .102),
        (-.001, 0, 1.750, .099, .101),
        (-.009, 0, 1.778, .082, .088),
        (-.012, 0, 1.798, .047, .054),
    ], skin, lambda _: {"KF_head": 1}, sides=20)
    # A single shallow nose plane remains legible at medium inspection scale.
    nose = [
        (.111, -.021, 1.698), (.111, .021, 1.698),
        (.128, -.018, 1.676), (.128, .018, 1.676),
        (.145, -.011, 1.652), (.145, .011, 1.652),
        (.122, -.017, 1.630), (.122, .017, 1.630),
    ]
    nose_ids = [surface.vertex(point, {"KF_head": 1}) for point in nose]
    for face in ((0, 2, 3, 1), (2, 4, 5, 3), (4, 6, 7, 5),
                 (0, 6, 4, 2), (1, 3, 5, 7)):
        surface.face(tuple(nose_ids[i] for i in face), skin)
    # Small ear forms and a shallow brow wedge make the anonymous head feel
    # intentionally human from front, side and three-quarter views.
    for sign in (-1, 1):
        surface.ellipsoid((.006, sign * .096, 1.678),
                          (.020, .012, .032), skin,
                          {"KF_head": 1}, steps=6, sides=10)
    brow = [
        (.108, -.057, 1.705), (.108, .057, 1.705),
        (.122, -.050, 1.691), (.122, .050, 1.691),
        (.108, -.053, 1.681), (.108, .053, 1.681),
    ]
    brow_ids = [surface.vertex(point, {"KF_head": 1}) for point in brow]
    for face in ((0, 1, 3, 2), (2, 3, 5, 4), (0, 2, 4), (1, 5, 3)):
        surface.face(tuple(brow_ids[i] for i in face), skin)

    # Irregular solid hair silhouette with a receding nape, side breaks and
    # offset fringe. It overlaps the cranial vault instead of sitting as a cap.
    hair_rows = []
    hair_sides = 20
    for row in range(5):
        ids = []
        for index in range(hair_sides):
            angle = 2 * math.pi * index / hair_sides
            front = max(0, math.cos(angle))
            back = max(0, -math.cos(angle))
            clump = .004 * math.sin(angle * 5 + .6) + .003 * math.sin(angle * 3 - .4)
            if row == 0:
                z = 1.714 + .034 * front - .010 * back + .008 * math.sin(angle * 3 + .3)
                rx = .094 + .012 * back + .005 * math.sin(angle * 4)
                ry = .099 + .006 * back + clump
            elif row == 1:
                z = 1.756 + .007 * math.sin(angle * 4 + .5)
                rx, ry = .096 + .008 * back + clump, .101 + .006 * back
            elif row == 2:
                z = 1.784 + .008 * math.sin(angle * 5)
                rx, ry = .087 + .005 * math.sin(angle * 3), .091 + clump
            elif row == 3:
                z = 1.809 + .006 * math.sin(angle * 4 + .8)
                rx, ry = .062 + clump, .067
            else:
                z = 1.827 + .004 * math.sin(angle * 3)
                rx, ry = .025, .031
            ids.append(surface.vertex((-.013 + rx * math.cos(angle) + .008 * front,
                                       ry * math.sin(angle), z), {"KF_head": 1}))
        hair_rows.append(ids)
    surface.face(tuple(reversed(hair_rows[0])), hair_shoes)
    for first, second in zip(hair_rows, hair_rows[1:]):
        for index in range(hair_sides):
            next_index = (index + 1) % hair_sides
            surface.face((first[index], first[next_index], second[next_index], second[index]), hair_shoes)
    surface.face(hair_rows[-1], hair_shoes)

    lookup = {short: (Vector(head), Vector(tail)) for short, head, tail, _, _ in definitions}
    for side in ("R", "L"):
        def bone(key):
            return "KF_" + key + "_" + side

        shoulder = lookup["upperArm_" + side][0]
        clavicle_start = lookup["clavicle_" + side][0]
        elbow = lookup["upperArm_" + side][1]
        wrist = lookup["forearm_" + side][1]
        hand_end = lookup["hand_" + side][1]
        hip = lookup["thigh_" + side][0]
        knee = lookup["thigh_" + side][1]
        ankle = lookup["shin_" + side][1]
        toe = lookup["foot_" + side][1]
        # Sleeve root is buried in the ribcage; the external contour flows
        # out of the trapezius rather than forming a spherical toy shoulder.
        sleeve_start = clavicle_start.lerp(shoulder, .12)
        sleeve_end = shoulder.lerp(elbow, .30)
        surface.segment(sleeve_start, sleeve_end, [
            (0, .048, .055), (.14, .057, .064),
            (.32, .066, .071), (.52, .071, .073),
            (.72, .068, .068), (.88, .062, .061),
            (1, .057, .055),
        ], cloth, lambda t: ({
            "KF_chest": (1 - t) * .55,
            bone("clavicle"): (1 - t) * .45,
            bone("upperArm"): t,
        }), sides=16)
        surface.limb_chain(shoulder, elbow, wrist, [
            (0, 0, .057, .059, 1), (0, .12, .065, .066, 1),
            (0, .28, .073, .070, 1), (0, .48, .075, .070, 1),
            (0, .63, .069, .065, 1),
            (0, .76, .061, .058, 1), (0, .89, .054, .052, .84),
            (0, 1, .049, .048, .52), (1, .10, .051, .049, .25),
            (1, .24, .058, .055, .04), (1, .40, .062, .057, 0),
            (1, .62, .054, .050, 0), (1, .80, .044, .041, 0),
            (1, 1, .033, .031, 0),
        ], skin, bone("upperArm"), bone("forearm"), sides=16,
                           cap_start=False, cap_end=False)
        hand_direction = (hand_end - wrist).normalized()
        palm_end = hand_end + hand_direction * .030
        surface.segment(wrist - hand_direction * .022, palm_end, [
            (0, .032, .029), (.18, .036, .030),
            (.42, .044, .032), (.66, .046, .031),
            (.84, .041, .027), (1, .032, .022),
        ], skin, bone("hand"), sides=14,
                        cap_start=False)
        palm_mid = wrist.lerp(hand_end, .50)
        if side == "R":
            across = hand_direction.cross(Vector((0, 0, 1)))
            if across.length < .05:
                across = hand_direction.cross(Vector((0, 1, 0)))
            across.normalize()
            depth = hand_direction.cross(across).normalized()
            # Three short grouped digits cross the handle axis at successive
            # positions. Their overlap reads as a wrap, not parallel tubes.
            for along, depth_offset in ((-.006, -.004), (.016, 0), (.037, .004)):
                center = hand_end + hand_direction * along + depth * depth_offset
                surface.segment(center + across * .036 + depth * .008,
                                center - across * .040 - depth * .007, [
                                    (0, .011, .010), (.48, .013, .011),
                                    (1, .009, .008),
                                ], skin, bone("hand"), sides=8)
            # The thumb crosses diagonally from the palm toward the first
            # finger band and remains visibly separate at Impact.
            surface.segment(palm_mid + across * .020 + depth * .012,
                            hand_end + hand_direction * .010 - across * .018 + depth * .006, [
                                (0, .018, .015), (.55, .016, .014),
                                (1, .010, .009),
                            ], skin, bone("hand"), sides=8)
        else:
            # A single tapered grouped-finger continuation closes the simpler
            # non-playing hand without reintroducing the R3 mitten lobe.
            surface.segment(palm_end - hand_direction * .010,
                            palm_end + hand_direction * .055, [
                                (0, .026, .019), (.48, .025, .018),
                                (1, .013, .010),
                            ], skin, bone("hand"), sides=10,
                            cap_start=False)
            surface.segment(palm_mid + Vector((0, .012, .008)),
                            palm_mid + Vector((.041, .019, .017)), [
                                (0, .015, .013), (.55, .014, .012),
                                (1, .009, .008),
                            ], skin, bone("hand"), sides=8)
        surface.limb_chain(hip, knee, ankle, [
            (0, 0, .096, .101, 1), (0, .14, .105, .108, 1),
            (0, .32, .113, .110, 1), (0, .52, .108, .104, 1),
            (0, .72, .089, .088, 1), (0, .88, .075, .075, .82),
            (0, 1, .067, .069, .52), (1, .10, .070, .071, .24),
            (1, .26, .077, .075, .05), (1, .42, .079, .076, 0),
            (1, .62, .067, .064, 0), (1, .78, .054, .052, 0),
            (1, 1, .035, .037, 0),
        ], skin, bone("thigh"), bone("shin"), sides=14)
        # Start inside the pelvis shell so no circular tube cap is visible at
        # the crotch/waist junction.
        short_start = hip + Vector((0, 0, .026))
        short_end = hip.lerp(knee, .53)
        surface.segment(short_start, short_end, [
            (0, .125, .130), (.15, .135, .139),
            (.34, .142, .141), (.58, .140, .136),
            (.78, .134, .127), (.92, .128, .120),
            (1, .121, .114),
        ], cloth, lambda t: ({"KF_pelvis": 1} if t < .15 else
                            {"KF_pelvis": (1 - t) / .85,
                             bone("thigh"): 1 - (1 - t) / .85} if t < 1 else
                            {bone("thigh"): 1}), sides=14,
                        cap_start=False, cap_end=False)
        surface.court_shoe(ankle, toe, hair_shoes, cloth, bone("foot"))
    body = make_mesh("KF_AthleteBody_L0", surface.vertices, surface.faces,
                     surface.material_ids, materials, collection)
    for polygon in body.data.polygons:
        if polygon.material_index == hair_shoes and all(
            body.data.vertices[index].co.z > 1.59 for index in polygon.vertices
        ):
            polygon.use_smooth = False  # solid hair has authored low-poly planes
    # Blender's glTF exporter requires the armature to be the direct parent of
    # its skinned mesh. Both transforms are identity in the source scene.
    body.parent = rig
    groups = {bone.name: body.vertex_groups.new(name=bone.name)
              for bone in rig.data.bones if bone.use_deform}
    for index, weights in enumerate(surface.weights):
        for bone_name, weight in weights.items():
            groups[bone_name].add([index], weight, "REPLACE")
    modifier = body.modifiers.new("KF_ArmatureDeform", "ARMATURE")
    modifier.object = rig
    subdivision = body.modifiers.new("KF_FormSubdivision", "SUBSURF")
    subdivision.subdivision_type = "CATMULL_CLARK"
    subdivision.levels = 1
    subdivision.render_levels = 1
    subdivision.show_only_control_edges = True
    body["kf_source_height_m"] = SOURCE_HEIGHT_M
    body["kf_revision"] = 4
    return body


def socket_and_paddle(socket_collection, reference_collection, rig):
    socket = link_object("KF_PaddleGrip_Socket", None, socket_collection)
    socket.empty_display_type = "ARROWS"
    socket.empty_display_size = .11
    socket.parent = rig
    socket.parent_type = "BONE"
    socket.parent_bone = "KF_hand_R"
    socket.location = (0, 0, 0)
    socket["kf_role"] = "future_paddle_grip_socket"

    holder = link_object("KF_TEMP_PaddleBlockout_Only", None, reference_collection)
    holder.empty_display_type = "PLAIN_AXES"
    holder.empty_display_size = .05
    holder.parent = socket
    holder["kf_role"] = "inspection_placeholder_not_production"
    holder.rotation_euler = (0, 1.10, .08)

    # Production-sized review placeholder only: 165 mm blade length, 155 mm
    # width, 18 mm thickness, 100 mm handle. Final KF_Paddle remains separate.
    verts = []
    faces = []
    ids = []
    blade_sides = 24
    for depth in (-.009, .009):
        for i in range(blade_sides):
            a = i * 2 * math.pi / blade_sides
            height = math.sin(a)
            lower_taper = .87 + .13 * ((height + 1) * .5)
            verts.append((.0775 * lower_taper * math.cos(a),
                          .160 + .0825 * height, depth))
    faces.append(tuple(reversed(range(blade_sides))))
    ids.append(0)
    faces.append(tuple(range(blade_sides, blade_sides * 2)))
    ids.append(0)
    for i in range(blade_sides):
        n = (i + 1) % blade_sides
        faces.append((i, n, blade_sides + n, blade_sides + i))
        ids.append(0)
    blade_mat = material("KF_TEMP_Paddle", (.25, .23, .21), .75)
    blade = make_mesh("KF_TEMP_PaddleBlade", verts, faces, ids, [blade_mat], reference_collection)
    blade.parent = holder
    handle_surface = Surface()
    handle_surface.segment((0, -.008, 0), (0, .102, 0), [
        (0, .020, .015), (.18, .021, .016), (.55, .019, .015),
        (.84, .017, .013), (1, .015, .012),
    ], 0, "placeholder", sides=12)
    handle = make_mesh("KF_TEMP_PaddleHandle", handle_surface.vertices,
                       handle_surface.faces, handle_surface.material_ids,
                       [blade_mat], reference_collection)
    handle.parent = holder
    return socket


def add_reference_markers(collection):
    for name, position in (
        ("KF_ForwardReference_PositiveX", (1, 0, .05)),
        ("KF_UnitMeterReference", (0, -.7, 1.0)),
        ("KF_HeightReference_1p8m", (0, -.7, SOURCE_HEIGHT_M)),
    ):
        marker = link_object(name, None, collection)
        marker.empty_display_type = "SPHERE"
        marker.empty_display_size = .045
        marker.location = position


def aim_bone(rig, bone_name, target):
    pose_bone = rig.pose.bones[bone_name]
    parent = pose_bone.parent
    rest = pose_bone.bone.matrix_local
    if parent:
        basis = parent.matrix @ parent.bone.matrix_local.inverted() @ rest
    else:
        basis = rest
    direction = (Vector(target) - pose_bone.head).normalized()
    local_direction = basis.to_3x3().inverted() @ direction
    pose_bone.rotation_quaternion = Vector((0, 1, 0)).rotation_difference(local_direction)
    bpy.context.view_layer.update()


def make_action(rig):
    # Each named key is an absolute pose; no constraints, simulation or physics.
    poses = [
        # name, pelvic yaw, thoracic yaw, forehand elbow, forehand wrist,
        # counterbalance elbow, counterbalance wrist, root-of-torso lowering
        ("READY", -.04, -.04, (.16, .38, 1.12), (.34, .43, 1.15),
         (.20, -.46, 1.17), (.39, -.50, 1.22), -.095),
        ("LOAD", -.22, -.18, (-.035, .44, 1.12), (-.13, .51, 1.15),
         (.18, -.47, 1.19), (.39, -.47, 1.20), -.105),
        ("ACCELERATION", -.06, .06, (.17, .41, 1.10), (.37, .42, 1.18),
         (-.03, -.43, 1.15), (.16, -.51, 1.22), -.110),
        ("IMPACT", .13, .23, (.21, .39, 1.10), (.43, .32, 1.23),
         (-.06, -.43, 1.13), (.18, -.50, 1.20), -.100),
        ("FOLLOW_THROUGH", .19, .27, (.24, .32, 1.19), (.39, -.02, 1.38),
         (-.08, -.44, 1.14), (.16, -.52, 1.20), -.085),
        ("RECOVERY", -.02, -.02, (.16, .38, 1.12), (.34, .43, 1.15),
         (.20, -.46, 1.17), (.39, -.50, 1.22), -.095),
    ]
    rig.animation_data_create()
    for name, pelvis_yaw, chest_yaw, elbow, wrist, off_elbow, off_wrist, lowering in poses:
        frame = POSE_FRAMES[name]
        bpy.context.scene.frame_set(frame)
        for pose_bone in rig.pose.bones:
            pose_bone.rotation_mode = "QUATERNION"
            pose_bone.rotation_quaternion = Quaternion((1, 0, 0, 0))
            pose_bone.location = (0, 0, 0)
            pose_bone.scale = (1, 1, 1)
        rig.pose.bones["KF_pelvis"].location = (0, lowering, 0)
        rig.pose.bones["KF_pelvis"].rotation_quaternion = Quaternion((0, 1, 0), pelvis_yaw)
        rig.pose.bones["KF_spine"].rotation_quaternion = Quaternion((0, 0, 1), -.20)
        rig.pose.bones["KF_chest"].rotation_quaternion = (
            Quaternion((0, 1, 0), chest_yaw) @ Quaternion((0, 0, 1), -.10)
        )
        bpy.context.view_layer.update()
        aim_bone(rig, "KF_upperArm_R", elbow)
        aim_bone(rig, "KF_forearm_R", wrist)
        aim_bone(rig, "KF_hand_R",
                 rig.pose.bones["KF_hand_R"].head + Vector((.115, -.020, .030)))
        aim_bone(rig, "KF_upperArm_L", off_elbow)
        aim_bone(rig, "KF_forearm_L", off_wrist)
        aim_bone(rig, "KF_hand_L",
                 rig.pose.bones["KF_hand_L"].head + Vector((.115, -.025, .005)))

        # Small weight shift; planted feet stay near their source locations.
        shift = {"READY": 0, "LOAD": -.024, "ACCELERATION": -.008,
                 "IMPACT": .018, "FOLLOW_THROUGH": .015, "RECOVERY": 0}[name]
        for side, sign in (("R", 1), ("L", -1)):
            aim_bone(rig, "KF_thigh_" + side, (.23 + shift, sign * .31, .44))
            aim_bone(rig, "KF_shin_" + side,
                     ((.05 if sign > 0 else .12) + shift, sign * .39, .105))
            aim_bone(rig, "KF_foot_" + side,
                     ((.29 if sign > 0 else .36) + shift, sign * .39, .06))
        for pose_bone in rig.pose.bones:
            pose_bone.keyframe_insert(data_path="rotation_quaternion", frame=frame, group=pose_bone.name)
        rig.pose.bones["KF_pelvis"].keyframe_insert(
            data_path="location", frame=frame, group="KF_pelvis"
        )
        bpy.context.scene.timeline_markers.new("KF_" + name, frame=frame)

    action = rig.animation_data.action
    if action is None:
        raise RuntimeError("Blender did not create the forehand action.")
    action.name = "KF_Athlete_Forehand"
    mark(action)
    for layer in action.layers:
        for strip in layer.strips:
            for channelbag in strip.channelbags:
                for curve in channelbag.fcurves:
                    for key in curve.keyframe_points:
                        key.interpolation = "BEZIER"
                        key.handle_left_type = "AUTO_CLAMPED"
                        key.handle_right_type = "AUTO_CLAMPED"
    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = FRAME_END
    bpy.context.scene.render.fps = FPS
    bpy.context.scene.frame_set(POSE_FRAMES["IMPACT"])
    return action


def point_camera(camera, target):
    direction = Vector(target) - camera.location
    camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def add_inspection(collection):
    floor_surface = Surface()
    floor_surface.loft([(-.001, 0, -.025, 1.6, 1.6),
                        (-.001, 0, -.024, 1.6, 1.6)], 0,
                       lambda _: {"placeholder": 1.0}, sides=4)
    floor_mat = material("KF_InspectionFloor", (.28, .27, .25), 1.0)
    floor = make_mesh("KF_InspectionFloor", floor_surface.vertices,
                      floor_surface.faces, floor_surface.material_ids,
                      [floor_mat], collection)
    floor.hide_render = False

    camera_data = mark(bpy.data.cameras.new("KF_InspectionCameraData"))
    camera = link_object("KF_InspectionCamera", camera_data, collection)
    camera.location = (2.8, -3.6, 2.15)
    point_camera(camera, (.18, 0, 1.0))
    camera_data.type = "ORTHO"
    camera_data.ortho_scale = 3.05
    bpy.context.scene.camera = camera

    for name, location, energy, size in [
        ("Key", (2.3, 2.4, 3.4), 500, 3.2),
        ("Fill", (-2.1, -2.2, 2.5), 320, 2.8),
        ("Rim", (-1.7, 2.0, 2.8), 410, 2.1),
    ]:
        light_data = mark(bpy.data.lights.new("KF_Inspection" + name + "Data", "AREA"))
        light = link_object("KF_Inspection" + name, light_data, collection)
        light.location = location
        light_data.energy = energy
        light_data.shape = "DISK"
        light_data.size = size
        point_camera(light, (0, 0, 1.0))

    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 920
    scene.render.resolution_y = 1080
    scene.render.resolution_percentage = 100
    if scene.world is None:
        scene.world = mark(bpy.data.worlds.new("KF_InspectionWorld"))
    scene.world.color = (.10, .10, .10)


def staging_point(blender_point):
    """Map a source-space point into the locked future Three staging."""
    gltf = Vector((blender_point.x, blender_point.z, -blender_point.y))
    rotated = Vector((
        math.cos(STAGING_YAW_RAD) * gltf.x + math.sin(STAGING_YAW_RAD) * gltf.z,
        gltf.y,
        -math.sin(STAGING_YAW_RAD) * gltf.x + math.cos(STAGING_YAW_RAD) * gltf.z,
    ))
    return STAGING_ROOT_THREE + STAGING_SCALE * rotated


def smoothstep(value):
    value = max(0.0, min(1.0, value))
    return value * value * (3 - 2 * value)


def lerp_five(points, progress):
    scaled = max(0.0, min(4.0, progress * 4))
    index = min(3, math.floor(scaled))
    return points[index].lerp(points[index + 1], smoothstep(scaled - index))


def project_three(point, camera, target, fov_degrees, aspect):
    forward = (target - camera).normalized()
    right = forward.cross(Vector((0, 1, 0))).normalized()
    up = right.cross(forward)
    relative = point - camera
    depth = relative.dot(forward)
    tangent = math.tan(math.radians(fov_degrees) / 2)
    return Vector((
        relative.dot(right) / (depth * tangent * aspect),
        relative.dot(up) / (depth * tangent),
        depth,
    ))


def staging_framing(body, blade):
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
        ("RECOGNITION", POSE_FRAMES["READY"], .08),
        ("IMPACT", POSE_FRAMES["IMPACT"], .47),
        ("RELEASE", POSE_FRAMES["RECOVERY"], .92),
    )
    result = {"desktop": {}, "portrait": {}}
    scene = bpy.context.scene
    depsgraph = bpy.context.evaluated_depsgraph_get()
    for label, frame, progress in samples:
        scene.frame_set(frame)
        evaluated = body.evaluated_get(depsgraph)
        mesh = evaluated.to_mesh()
        staged = [staging_point(evaluated.matrix_world @ vertex.co) for vertex in mesh.vertices]
        evaluated.to_mesh_clear()
        # Six centimetres of authored-volume reserve around every vertex.
        expanded = []
        for point in staged:
            expanded.extend(point + Vector(offset) for offset in (
                (.06, 0, 0), (-.06, 0, 0), (0, .06, 0),
                (0, -.06, 0), (0, 0, .06), (0, 0, -.06),
            ))
        center = staging_point(blade.matrix_world @ Vector((0, .160, 0)))
        expanded.extend(center + Vector((x, y, z))
                        for x in (-.10, .10)
                        for y in (-.10, .10)
                        for z in (-.085, .085))
        for mode, positions, targets, fov, aspect in (
            ("desktop", desktop_positions, desktop_targets, 39, 1440 / 900),
            ("portrait", portrait_positions, portrait_targets, 46, 390 / 844),
        ):
            camera = lerp_five(positions, progress)
            target = lerp_five(targets, progress)
            projected = [project_three(point, camera, target, fov, aspect)
                         for point in expanded]
            bounds = (
                min(point.x for point in projected),
                max(point.x for point in projected),
                min(point.y for point in projected),
                max(point.y for point in projected),
            )
            margin = min(bounds[0] + 1, 1 - bounds[1],
                         bounds[2] + 1, 1 - bounds[3])
            result[mode][label] = {
                "margin_ndc": round(margin, 5),
                "bounds_ndc": [round(value, 5) for value in bounds],
            }
    return result


def render_review_set(output_directory, rig, socket, only=None):
    output_directory.mkdir(parents=True, exist_ok=True)
    scene = bpy.context.scene
    camera = bpy.data.objects["KF_InspectionCamera"]
    camera.data.type = "ORTHO"
    scene.render.image_settings.file_format = "PNG"
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = False

    shots = [
        ("ready-three-quarter-neutral", "READY", (2.8, -3.6, 2.15), (.18, 0, 1.00), 2.20, False),
        ("impact-three-quarter-neutral", "IMPACT", (2.8, -3.6, 2.15), (.18, 0, 1.00), 2.20, False),
        ("impact-near-front-neutral", "IMPACT", (3.8, -1.25, 1.72), (.18, 0, 1.00), 2.20, False),
        ("impact-side-neutral", "IMPACT", (0, -4.2, 1.48), (.15, 0, .96), 2.12, False),
        ("head-neck-close-neutral", "READY", (1.8, -1.35, 1.75), (.01, 0, 1.62), .70, False),
        ("playing-hand-grip-close-neutral", "IMPACT", None, None, .40, False),
        ("shoulder-arm-impact-close-neutral", "IMPACT", None, None, 1.02, False),
        ("hip-shorts-close-neutral", "IMPACT", None, None, .82, False),
        ("shoe-close-neutral", "READY", (1.7, -2.4, .56), (.18, .05, .095), .64, False),
        ("impact-three-quarter-silhouette", "IMPACT", (2.8, -3.6, 2.15), (.18, 0, 1.00), 2.20, True),
    ]
    body = bpy.data.objects["KF_AthleteBody_L0"]
    paddle_parts = [bpy.data.objects[name] for name in
                    ("KF_TEMP_PaddleBlade", "KF_TEMP_PaddleHandle")]
    originals = [[slot.material for slot in obj.material_slots]
                 for obj in [body, *paddle_parts]]
    silhouette = material("KF_SilhouetteReview", (.008, .008, .008), 1.0)
    for filename, pose, location, target, scale, use_silhouette in shots:
        if only and filename not in only:
            continue
        scene.frame_set(POSE_FRAMES[pose])
        if filename == "playing-hand-grip-close-neutral":
            target_vector = socket.matrix_world.translation + Vector((.065, 0, .015))
            location_vector = target_vector + Vector((1.10, -1.35, .42))
        elif filename == "shoulder-arm-impact-close-neutral":
            upper_arm = rig.pose.bones["KF_upperArm_R"]
            target_vector = rig.matrix_world @ upper_arm.head.lerp(upper_arm.tail, .34)
            location_vector = target_vector + Vector((1.35, 1.50, .50))
        elif filename == "hip-shorts-close-neutral":
            pelvis = rig.pose.bones["KF_pelvis"]
            target_vector = rig.matrix_world @ pelvis.head.lerp(pelvis.tail, .36)
            location_vector = target_vector + Vector((1.70, -2.00, .55))
        else:
            target_vector = Vector(target)
            location_vector = Vector(location)
        camera.location = location_vector
        point_camera(camera, target_vector)
        camera.data.ortho_scale = scale
        close = "close" in filename
        scene.render.resolution_x = 1400 if close else 1200
        scene.render.resolution_y = 1200 if close else 1400
        if use_silhouette:
            for obj in [body, *paddle_parts]:
                for slot in obj.material_slots:
                    slot.material = silhouette
        else:
            for obj, materials in zip([body, *paddle_parts], originals):
                for slot, original in zip(obj.material_slots, materials):
                    slot.material = original
        scene.render.filepath = str(output_directory / f"{filename}.png")
        bpy.ops.render.render(write_still=True)
    for obj, materials in zip([body, *paddle_parts], originals):
        for slot, original in zip(obj.material_slots, materials):
            slot.material = original
    scene.frame_set(POSE_FRAMES["IMPACT"])


def export_validation_glb(filepath, root, body, rig, socket):
    bpy.ops.object.select_all(action="DESELECT")
    for obj in (root, body, rig, socket):
        obj.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.export_scene.gltf(
        filepath=str(filepath),
        export_format="GLB",
        use_selection=True,
        use_active_scene=True,
        export_animations=True,
        export_force_sampling=True,
        export_frame_range=True,
        export_skins=True,
        export_def_bones=True,
        export_apply=True,
        export_draco_mesh_compression_enable=False,
    )


def validate(root, body, rig, socket):
    objects = [obj for coll in owned_collections(root) for obj in coll.objects]
    meshes = [obj for obj in objects if obj.type == "MESH"]
    armatures = [obj for obj in objects if obj.type == "ARMATURE"]
    materials = {mat.name for obj in meshes for mat in obj.data.materials if mat}
    evaluated = bpy.context.evaluated_depsgraph_get()
    triangle_count = 0
    body_triangle_count = 0
    for obj in meshes:
        if obj.name.startswith("KF_Inspection"):
            continue
        mesh = obj.evaluated_get(evaluated).to_mesh()
        mesh.calc_loop_triangles()
        count = len(mesh.loop_triangles)
        triangle_count += count
        if obj == body:
            body_triangle_count = count
        obj.evaluated_get(evaluated).to_mesh_clear()
    warnings = []
    for obj in objects:
        if obj.type not in {"MESH", "ARMATURE", "EMPTY"}:
            continue
        if any(abs(value - 1) > 1e-5 for value in obj.scale):
            warnings.append(obj.name + ": non-unit scale")
        if obj.name != "KF_TEMP_PaddleBlockout_Only" and any(
            abs(value) > 1e-5 for value in obj.rotation_euler
        ):
            warnings.append(obj.name + ": unapplied object rotation")
    for obj in meshes:
        for mat in obj.data.materials:
            if mat and mat.node_tree:
                for node in mat.node_tree.nodes:
                    if node.type == "TEX_IMAGE" and (not node.image or not node.image.has_data):
                        warnings.append(obj.name + ": missing image dependency")
    if len(armatures) != 1:
        warnings.append("Expected exactly one armature")
    if any(".001" in obj.name or (obj.data and ".001" in obj.data.name)
           for obj in objects):
        warnings.append("Generated object/data names are not stable after rerun")
    if not body.modifiers.get("KF_ArmatureDeform"):
        warnings.append("Body has no armature modifier")
    if socket.parent != rig or socket.parent_bone != "KF_hand_R":
        warnings.append("Paddle socket is not parented to right hand")
    action = rig.animation_data.action if rig.animation_data else None
    if not action or action.name != "KF_Athlete_Forehand":
        warnings.append("Named forehand action missing")
    if any("face" in bone.name.lower() or "jaw" in bone.name.lower()
           for bone in rig.data.bones):
        warnings.append("Unexpected facial rig bone")
    if action:
        for layer in action.layers:
            for strip in layer.strips:
                for channelbag in strip.channelbags:
                    for curve in channelbag.fcurves:
                        for key in curve.keyframe_points:
                            if not all(math.isfinite(value) for value in key.co):
                                warnings.append("Nonfinite animation key")

    scene = bpy.context.scene

    def pose_sample(frame, subframe=0):
        scene.frame_set(frame, subframe=subframe)
        values = [value for bone in rig.pose.bones
                  for row in bone.matrix for value in row]
        values.extend(value for row in socket.matrix_world for value in row)
        return values

    direct = pose_sample(17, .5)
    pose_sample(36)
    reverse = pose_sample(17, .5)
    maximum_sample_difference = max(abs(a - b) for a, b in zip(direct, reverse))
    if maximum_sample_difference > 1e-5:
        warnings.append("Arbitrary-frame pose differs after reverse sampling")
    scene.frame_set(POSE_FRAMES["IMPACT"])
    grip_distance = (socket.matrix_world.translation -
                     (rig.matrix_world @ rig.pose.bones["KF_hand_R"].tail)).length
    if grip_distance > .005:
        warnings.append("Temporary paddle grip does not follow the playing hand")
    bounds = [body.matrix_world @ Vector(corner) for corner in body.bound_box]
    minimum = [min(point[axis] for point in bounds) for axis in range(3)]
    maximum = [max(point[axis] for point in bounds) for axis in range(3)]
    groups = {group.name for group in body.vertex_groups}
    missing_groups = [bone.name for bone in rig.data.bones if bone.use_deform and bone.name not in groups]
    if missing_groups:
        warnings.append("Missing deform groups: " + ", ".join(missing_groups))
    bad_weight_vertices = 0
    for vertex in body.data.vertices:
        weights = [assignment.weight for assignment in vertex.groups]
        if not weights or len(weights) > 4 or abs(sum(weights) - 1) > 1e-4:
            bad_weight_vertices += 1
    if bad_weight_vertices:
        warnings.append(f"{bad_weight_vertices} vertices lack normalized <=4 skin weights")
    deformation_bounds = {}
    for pose_name in ("READY", "LOAD", "IMPACT", "FOLLOW_THROUGH"):
        scene.frame_set(POSE_FRAMES[pose_name])
        evaluated_body = body.evaluated_get(bpy.context.evaluated_depsgraph_get())
        posed_mesh = evaluated_body.to_mesh()
        if any(not all(math.isfinite(axis) for axis in vertex.co)
               for vertex in posed_mesh.vertices):
            warnings.append(pose_name + ": nonfinite deformed vertex")
        deformation_bounds[pose_name] = (
            min(vertex.co.z for vertex in posed_mesh.vertices),
            max(vertex.co.z for vertex in posed_mesh.vertices),
        )
        evaluated_body.to_mesh_clear()
    scene.frame_set(POSE_FRAMES["IMPACT"])
    blade = bpy.data.objects["KF_TEMP_PaddleBlade"]
    source_contact = blade.matrix_world @ Vector((0, .160, 0))
    staged_contact = staging_point(source_contact)
    contact_delta = (staged_contact - STAGING_CONTACT_THREE).length
    if contact_delta > .03:
        warnings.append(f"Staged paddle center is {contact_delta:.4f} m from locked contact")
    framing = staging_framing(body, blade)
    if any(sample["margin_ndc"] <= 0
           for mode in framing.values() for sample in mode.values()):
        warnings.append("Refined athlete exceeds a locked staging viewport")

    collision_samples = {}
    for pose_name in ("READY", "IMPACT", "RECOVERY"):
        scene.frame_set(POSE_FRAMES[pose_name])
        evaluated_body = body.evaluated_get(bpy.context.evaluated_depsgraph_get())
        posed_mesh = evaluated_body.to_mesh()
        staged_vertices = [staging_point(evaluated_body.matrix_world @ vertex.co)
                           for vertex in posed_mesh.vertices]
        collisions = sum(1 for point in staged_vertices
                         if -1.37 <= point.x <= 1.37
                         and abs(point.z) <= .7625 and point.y <= .76)
        collision_samples[pose_name] = collisions
        evaluated_body.to_mesh_clear()
    if any(collision_samples.values()):
        warnings.append("Refined athlete enters the locked table prism")

    print("\n=== KF_ATHLETE R4 VALIDATION ===")
    print("Blender:", bpy.app.version_string)
    print("Objects:", ", ".join(sorted(obj.name for obj in objects)))
    print("Meshes:", len(meshes), "Armatures:", len(armatures),
          "Bones:", len(rig.data.bones), "Materials:", len(materials))
    print("Evaluated body triangles:", body_triangle_count,
          "Total triangles excluding inspection floor:", triangle_count)
    print("Action:", action.name if action else "NONE", "Frames: 1-36 @", FPS, "fps")
    print("Pose markers:", ", ".join(f"{name}={frame}" for name, frame in POSE_FRAMES.items()))
    print("Reverse sample max delta:", round(maximum_sample_difference, 8),
          "Paddle grip offset (m):", round(grip_distance, 5))
    print("Source body bounds (m):", tuple(round(v, 3) for v in minimum),
          "to", tuple(round(v, 3) for v in maximum))
    print("Declared source height (m):", SOURCE_HEIGHT_M)
    print("Deformed Z extents READY/LOAD/IMPACT/FOLLOW_THROUGH (m):",
          {name: tuple(round(value, 3) for value in extent)
           for name, extent in deformation_bounds.items()})
    print("Source IMPACT blade center (Blender XYZ, m):",
          tuple(round(value, 4) for value in source_contact))
    print("Staged IMPACT blade center (Three XYZ, m):",
          tuple(round(value, 4) for value in staged_contact),
          "delta from lock:", round(contact_delta, 5))
    print("Locked staging: scale", STAGING_SCALE, "yaw", STAGING_YAW_RAD,
          "root", tuple(STAGING_ROOT_THREE))
    print("Framing with 6 cm reserve:", framing)
    print("Locked table-prism collisions:", collision_samples)
    print("Object transforms, skin weights, dependencies:", "PASS" if not warnings else "REVIEW")
    for warning in warnings:
        print("WARNING:", warning)
    print("No .blend or production asset was saved.\n")
    if warnings:
        raise RuntimeError("KF_Athlete R4 validation found issues; see console.")
    return {
        "blender": bpy.app.version_string,
        "objects": len(objects),
        "meshes": len(meshes),
        "armatures": len(armatures),
        "bones": len(rig.data.bones),
        "materials": sorted(materials),
        "body_triangles_evaluated": body_triangle_count,
        "triangles_excluding_floor": triangle_count,
        "action": action.name if action else None,
        "frame_range": [1, FRAME_END],
        "fps": FPS,
        "reverse_sample_max_delta": maximum_sample_difference,
        "paddle_grip_offset_m": grip_distance,
        "source_bounds_m": {
            "minimum": [round(value, 6) for value in minimum],
            "maximum": [round(value, 6) for value in maximum],
        },
        "deformation_z_extents_m": deformation_bounds,
        "impact_blade_center_source_m": [round(value, 6) for value in source_contact],
        "impact_blade_center_three_m": [round(value, 6) for value in staged_contact],
        "impact_contact_delta_m": contact_delta,
        "framing_with_6cm_reserve": framing,
        "table_prism_collisions": collision_samples,
        "bad_weight_vertices": bad_weight_vertices,
        "warnings": warnings,
    }


def parse_arguments():
    parser = argparse.ArgumentParser(description="Build and validate KF_Athlete R4")
    parser.add_argument("--render-dir", type=Path)
    parser.add_argument("--render-only", type=str,
                        help="Comma-separated review-render names")
    parser.add_argument("--validation-glb", type=Path)
    parser.add_argument("--report", type=Path)
    arguments = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    return parser.parse_args(arguments)


def main():
    args = parse_arguments()
    if bpy.context.window is None:
        # A clean background process uses its default scene as the active
        # inspection scene. Its default objects are hidden, never deleted.
        scene = bpy.context.scene
        for existing in scene.objects:
            existing.hide_render = True
        scene.name = "KF_Athlete_InspectionScene"
        mark(scene)
    else:
        scene = bpy.data.scenes.get("KF_Athlete_InspectionScene")
        if scene is None:
            scene = mark(bpy.data.scenes.new("KF_Athlete_InspectionScene"))
        elif not scene.get(OWNER_TAG):
            raise RuntimeError("An unrelated scene uses KF_Athlete_InspectionScene; no scene was changed.")
        bpy.context.window.scene = scene
    remove_previous_build()
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0
    scene.unit_settings.length_unit = "METERS"
    root_collection = new_collection("KF_Athlete", scene.collection)
    export = new_collection("KF_EXPORT", root_collection)
    geo = new_collection("KF_GEO_HIGH", export)
    rig_collection = new_collection("KF_RIG", export)
    sockets = new_collection("KF_SOCKETS", export)
    reference = new_collection("KF_REFERENCE", root_collection)
    inspection = new_collection("KF_INSPECTION", root_collection)

    root = link_object("KF_AthleteRoot", None, export)
    root.empty_display_type = "PLAIN_AXES"
    root.empty_display_size = .13
    skin = material("KF_Skin", (.50, .34, .25), .78)
    cloth = material("KF_Cloth", (.055, .058, .062), .86)
    hair_shoes = material("KF_HairShoes", (.022, .024, .026), .72)
    rig, definitions = build_rig(rig_collection, root)
    body = build_body(geo, root, rig, definitions, [skin, cloth, hair_shoes])
    socket = socket_and_paddle(sockets, reference, rig)
    add_reference_markers(reference)
    make_action(rig)
    add_inspection(inspection)
    report = validate(root_collection, body, rig, socket)
    if args.render_dir:
        render_only = ({name.strip() for name in args.render_only.split(",")}
                       if args.render_only else None)
        render_review_set(args.render_dir.resolve(), rig, socket, render_only)
        report["review_render_directory"] = str(args.render_dir.resolve())
    if args.validation_glb:
        args.validation_glb.parent.mkdir(parents=True, exist_ok=True)
        export_validation_glb(args.validation_glb.resolve(), root, body, rig, socket)
        report["temporary_validation_glb"] = str(args.validation_glb.resolve())
        report["temporary_validation_glb_bytes"] = args.validation_glb.stat().st_size
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n")


if __name__ == "__main__":
    main()
