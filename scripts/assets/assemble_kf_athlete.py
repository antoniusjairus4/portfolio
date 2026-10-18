"""Localized KF athlete assembly pass on the saved Human Base Mesh source.

Keeps the anatomical body, rig, action, staging, and cameras from
KF_Athlete.blend. The original source remains untouched; outputs are review
sources, neutral renders, validation JSON, and a temporary GLB only.
"""

import argparse
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_kf_athlete_production as prior

r4 = prior.r4
ROOT = Path(__file__).resolve().parents[2]
INPUT = ROOT / "assets-source/kaiforge/KF_Athlete.blend"
OUTPUT = ROOT / "assets-source/kaiforge/KF_Athlete_Assembly.blend"
PADDLE_SOURCE = ROOT / "assets-source/kaiforge/KF_Paddle.blend"
REVIEW = ROOT / "docs/review/kf-athlete-assembly"


def mesh_object(name, vertices, faces, material_ids, materials, collection):
    mesh = bpy.data.meshes.new(name + "_Mesh_L0")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    for material in materials:
        mesh.materials.append(material)
    for polygon, material_id in zip(mesh.polygons, material_ids):
        polygon.material_index = material_id
        polygon.use_smooth = True
    obj = bpy.data.objects.new(name, mesh)
    collection.objects.link(obj)
    return obj


def paddle_geometry():
    """Grip-origin geometry; the blade center stays at local (0, .160, 0)."""
    sides = 64
    vertices = []
    faces = []
    material_ids = []
    levels = [(-.0065, .955), (-.0055, .982), (-.0043, 1.0),
              (.0043, 1.0), (.0055, .982), (.0065, .955)]
    for depth, radius in levels:
        for index in range(sides):
            angle = 2 * math.pi * index / sides
            vertical = math.sin(angle)
            throat = 1.0 - .13 * max(0.0, -vertical)
            vertices.append((.076 * radius * math.cos(angle) * throat,
                             .160 + .080 * radius * vertical, depth))
    faces.append(tuple(reversed(range(sides))))
    material_ids.append(0)
    for level in range(len(levels) - 1):
        for index in range(sides):
            next_index = (index + 1) % sides
            faces.append((level*sides+index, level*sides+next_index,
                          (level+1)*sides+next_index, (level+1)*sides+index))
            material_ids.append(1 if level == 2 else 0)
    last = (len(levels)-1)*sides
    faces.append(tuple(range(last, last+sides)))
    material_ids.append(0)
    blade = (vertices, faces, material_ids)

    vertices, faces, material_ids = [], [], []
    radial = 24
    profiles = [
        (-.020, .0235, .0170), (-.016, .0250, .0180),
        (-.009, .0255, .0180), (.002, .0240, .0175),
        (.016, .0220, .0165), (.032, .0205, .0155),
        (.048, .0200, .0150), (.065, .0200, .0150),
        (.082, .0195, .0145), (.099, .0180, .0135),
        (.111, .0160, .0120),
    ]
    for height, width, depth in profiles:
        for index in range(radial):
            angle = 2 * math.pi * index / radial
            vertices.append((width * math.cos(angle), height,
                             depth * math.sin(angle)))
    faces.append(tuple(reversed(range(radial))))
    material_ids.append(0)
    for row in range(len(profiles)-1):
        for index in range(radial):
            next_index = (index+1) % radial
            faces.append((row*radial+index, row*radial+next_index,
                          (row+1)*radial+next_index, (row+1)*radial+index))
            material_ids.append(0)
    last = (len(profiles)-1)*radial
    faces.append(tuple(range(last, last+radial)))
    material_ids.append(0)
    handle = (vertices, faces, material_ids)
    return blade, handle


def review_material(name, rgb, roughness):
    material = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    material.diffuse_color = (*rgb, 1)
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*rgb, 1)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = 0
    return material


def build_paddle_source():
    """An independent editable source, with neutral placeholder materials."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1
    collection = bpy.data.collections.new("KF_PADDLE_EXPORT")
    scene.collection.children.link(collection)
    root = bpy.data.objects.new("KF_PaddleRoot", None)
    collection.objects.link(root)
    root["kf_grip_origin"] = True
    rubber = review_material("KF_Rubber", (.045, .047, .048), .88)
    wood = review_material("KF_Wood", (.085, .055, .032), .80)
    blade_geometry, handle_geometry = paddle_geometry()
    blade = mesh_object("KF_PaddleBlade_L0", *blade_geometry,
                        [rubber, wood], collection)
    handle = mesh_object("KF_PaddleHandle_L0", *handle_geometry,
                         [wood], collection)
    blade.parent = root
    handle.parent = root
    paddle_tris = prior.triangle_count(blade) + prior.triangle_count(handle)
    if not 1000 <= paddle_tris <= 2000:
        raise RuntimeError(f"Paddle triangle target exceeded: {paddle_tris}")
    PADDLE_SOURCE.parent.mkdir(parents=True, exist_ok=True)
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(PADDLE_SOURCE), check_existing=False)
    return paddle_tris


def attach_paddle():
    export = bpy.data.collections["KF_EXPORT"]
    paddle_collection = bpy.data.collections.new("KF_PADDLE")
    export.children.link(paddle_collection)
    rubber = review_material("KF_Rubber", (.045, .047, .048), .88)
    wood = review_material("KF_Wood", (.085, .055, .032), .80)
    blade_geometry, handle_geometry = paddle_geometry()
    blade = mesh_object("KF_PaddleBlade_L0", *blade_geometry,
                        [rubber, wood], paddle_collection)
    handle = mesh_object("KF_PaddleHandle_L0", *handle_geometry,
                         [wood], paddle_collection)
    socket = bpy.data.objects["KF_PaddleGrip_Socket"]
    placeholder = bpy.data.objects["KF_TEMP_PaddleBlockout_Only"]
    root = bpy.data.objects.new("KF_PaddleRoot", None)
    paddle_collection.objects.link(root)
    root.parent = socket
    root.location = placeholder.location.copy()
    root.rotation_euler = placeholder.rotation_euler.copy()
    blade.parent = root
    handle.parent = root
    for name in ("KF_TEMP_PaddleBlade", "KF_TEMP_PaddleHandle"):
        bpy.data.objects[name].hide_render = True
    bpy.context.view_layer.update()
    return blade, handle, root


def correct_hand(body, rig, handle):
    scene = bpy.context.scene
    scene.frame_set(18)
    candidates = prior.hand_candidates(body, "KF_hand_R")
    graph = prior.hand_graph(body, candidates)
    digit_targets = {
        "index": (-.010, .105, .010),
        "middle": (-.017, .057, -.0145),
        "ring": (-.017, .035, -.014),
        "little": (-.016, .010, -.012),
        "thumb": (.018, .082, -.014),
    }
    distances = {
        name: prior.geodesic_distances(graph, prior.PLAYING_FINGERS[name][0])
        for name in digit_targets
    }
    evaluated = body.evaluated_get(bpy.context.evaluated_depsgraph_get())
    mesh = evaluated.to_mesh()
    inverse_handle = handle.matrix_world.inverted()
    local = {
        index: inverse_handle @ (evaluated.matrix_world @ mesh.vertices[index].co)
        for index in candidates
    }
    evaluated.to_mesh_clear()
    deltas = {
        name: Vector(target) - local[prior.PLAYING_FINGERS[name][0]]
        for name, target in digit_targets.items()
    }
    bone = rig.pose.bones["KF_hand_R"]
    inverse_deform = (bone.matrix @ bone.bone.matrix_local.inverted()).to_3x3().inverted()
    for index in candidates:
        name = min(digit_targets, key=lambda item: distances[item][index])
        reach = .106 if name != "thumb" else .080
        distance = distances[name][index]
        if distance >= reach:
            continue
        t = 1 - distance/reach
        influence = t*t*(3-2*t)
        adjustment = deltas[name] * influence
        if name in {"middle", "ring", "little"}:
            # Pull the mid digit arcs toward the handle as the tips curl under.
            arc = math.sin(math.pi*min(1,distance/reach))
            adjustment += Vector((.0045, 0, -.015)) * arc
        world_delta = handle.matrix_world.to_3x3() @ adjustment
        body.data.vertices[index].co += inverse_deform @ world_delta
    body.data.update()
    bpy.context.view_layer.update()


def relieve_handle_intersections(body, rig, handle):
    """Move covered palm/digit surface out of the rigid handle volume."""
    bpy.context.scene.frame_set(18)
    candidates=prior.hand_candidates(body,"KF_hand_R")
    group_index=body.vertex_groups["KF_hand_R"].index
    bone=rig.pose.bones["KF_hand_R"]
    inverse_deform=(bone.matrix @ bone.bone.matrix_local.inverted()).to_3x3().inverted()
    profiles=[(-.020,.0235,.0170),(-.016,.0250,.0180),
              (-.009,.0255,.0180),(.002,.0240,.0175),
              (.016,.0220,.0165),(.032,.0205,.0155),
              (.048,.0200,.0150),(.065,.0200,.0150),
              (.082,.0195,.0145),(.099,.0180,.0135),
              (.111,.0160,.0120)]
    corrected=0
    for _ in range(2):
        ev=body.evaluated_get(bpy.context.evaluated_depsgraph_get())
        mesh=ev.to_mesh()
        inverse_handle=handle.matrix_world.inverted()
        deltas={}
        for index in candidates:
            weight=next((a.weight for a in body.data.vertices[index].groups
                         if a.group==group_index),0)
            if weight<.70:
                continue
            point=inverse_handle @ (ev.matrix_world @ mesh.vertices[index].co)
            if not -.021<=point.y<=.112:
                continue
            for first,second in zip(profiles,profiles[1:]):
                if first[0]<=point.y<=second[0]:
                    t=(point.y-first[0])/(second[0]-first[0])
                    rx=first[1]*(1-t)+second[1]*t
                    rz=first[2]*(1-t)+second[2]*t
                    break
            else:
                continue
            norm=math.sqrt((point.x/rx)**2+(point.z/rz)**2)
            if norm>=1.08:
                continue
            if norm<.05:
                direction=Vector((-rx,0,0))
            else:
                direction=Vector((point.x/norm-point.x,0,
                                  point.z/norm-point.z))
            desired=point+direction
            desired.x*=1.08
            desired.z*=1.08
            delta=handle.matrix_world.to_3x3() @ (desired-point)
            deltas[index]=inverse_deform @ delta
        ev.to_mesh_clear()
        for index,delta in deltas.items():
            body.data.vertices[index].co+=delta
        corrected+=len(deltas)
        body.data.update()
        bpy.context.view_layer.update()
    return corrected


def smooth_local_grip(body):
    """Relax stretched triangles in the corrected palm without moving the wrist."""
    candidates=prior.hand_candidates(body,"KF_hand_R")
    graph=prior.hand_graph(body,candidates)
    protected=set()
    for tip,_,_ in prior.PLAYING_FINGERS.values():
        distances=prior.geodesic_distances(graph,tip)
        protected.update(index for index,distance in distances.items()
                         if distance<.009)
    group_index=body.vertex_groups["KF_hand_R"].index
    editable=set()
    for index in candidates-protected:
        point=body.data.vertices[index]
        weight=next((a.weight for a in point.groups if a.group==group_index),0)
        if weight>.80:
            editable.add(index)
    neighbors={index:[other for other,_ in graph[index]] for index in editable}
    for _ in range(3):
        positions={vertex.index:vertex.co.copy() for vertex in body.data.vertices}
        for index in editable:
            connected=neighbors[index]
            if len(connected)<3:
                continue
            average=sum((positions[other] for other in connected),Vector())/len(connected)
            body.data.vertices[index].co=positions[index].lerp(average,.24)
    body.data.update()
    return len(editable)


def rebuild_grip_deformation(body, rig, handle):
    """Seat the existing curled hand using smooth digit-section translations.

    The saved source already has fingertips near the temporary handle. Moving
    those tips again lengthens triangles. These small section offsets instead
    lower the raised index/middle arches and bring the thumb/little finger to
    opposite handle flanks, while blending smoothly into the palm and wrist.
    """
    bpy.context.scene.frame_set(18)
    candidates = prior.hand_candidates(body, "KF_hand_R")
    graph = prior.hand_graph(body, candidates)
    distances = {
        name: prior.geodesic_distances(graph, tip)
        for name, (tip, _, _) in prior.PLAYING_FINGERS.items()
    }
    # (geodesic distance from tip, handle-local section displacement)
    curves = {
        "index": [(0, (0, 0, -.003)), (.025, (0, 0, -.010)),
                  (.060, (0, 0, -.019)), (.100, (0, 0, -.018)),
                  (.145, (0, 0, -.006)), (.175, (0, 0, 0))],
        "middle": [(0, (0, 0, 0)), (.030, (.003, 0, -.005)),
                   (.060, (.007, 0, -.012)), (.100, (.005, 0, -.009)),
                   (.145, (0, 0, -.004)), (.175, (0, 0, 0))],
        "ring": [(0, (-.004, 0, 0)), (.045, (-.006, 0, -.002)),
                 (.090, (-.003, 0, -.003)), (.145, (0, 0, -.002)),
                 (.175, (0, 0, 0))],
        "little": [(0, (.012, 0, -.011)), (.045, (.015, 0, -.012)),
                   (.090, (.010, 0, -.009)), (.145, (.003, 0, -.003)),
                   (.175, (0, 0, 0))],
        "thumb": [(0, (.007, 0, -.004)), (.045, (.010, 0, -.010)),
                  (.090, (.008, 0, -.008)), (.145, (.003, 0, -.003)),
                  (.175, (0, 0, 0))],
    }

    def curve_at(curve, distance):
        if distance >= curve[-1][0]:
            return Vector()
        for (start, a), (end, b) in zip(curve, curve[1:]):
            if start <= distance <= end:
                t = (distance-start)/(end-start)
                t = t*t*(3-2*t)
                return Vector(a).lerp(Vector(b), t)
        return Vector(curve[0][1])

    hand_bone = rig.pose.bones["KF_hand_R"]
    inverse_deform = (
        hand_bone.matrix @ hand_bone.bone.matrix_local.inverted()
    ).to_3x3().inverted()
    transform = handle.matrix_world.to_3x3()
    moved = 0
    max_shift = 0.0
    for index in candidates:
        weighted = []
        for name in curves:
            distance = distances[name][index]
            if distance >= .175:
                continue
            weight = math.exp(-((distance/.042)**2))
            weighted.append((weight, curve_at(curves[name], distance)))
        if not weighted:
            continue
        total = sum(weight for weight, _ in weighted)
        offset = sum((point*weight for weight, point in weighted), Vector())/total
        if offset.length < 1e-5:
            continue
        body.data.vertices[index].co += inverse_deform @ (transform @ offset)
        moved += 1
        max_shift = max(max_shift, offset.length)
    body.data.update()
    body["kf_playing_hand_grip"] = "smooth_section_deformation"
    return {"vertices": moved, "max_shift_m": max_shift}


def replace_hair(rig):
    old = bpy.data.objects["KF_SculpturalHair_L0"]
    collection = old.users_collection[0]
    material = old.data.materials[0]
    bpy.data.objects.remove(old, do_unlink=True)
    sides = 24
    rings = [
        (-.034, -.002, 1.665, .090, .086),
        (-.028, -.001, 1.702, .101, .097),
        (-.021, .002, 1.744, .108, .106),
        (-.019, .005, 1.780, .099, .097),
        (-.015, .007, 1.813, .078, .080),
        (-.011, .009, 1.837, .045, .050),
        (-.008, .009, 1.846, .014, .016),
    ]
    vertices, faces = [], []
    for row, (cx,cy,z,rx,ry) in enumerate(rings):
        for side in range(sides):
            angle = 2*math.pi*side/sides
            front = max(0.0, math.cos(angle))
            # Shallow continuous crown ridges; all rings share one surface.
            ridge = .008*math.sin(3*angle+row*.28)+.004*math.cos(5*angle-.4)
            weight = .25 if row == 0 else 1 if row in (2,3,4) else .45
            vertices.append((cx + rx*math.cos(angle) + .004*front*weight,
                             cy + ry*math.sin(angle), z + ridge*weight))
    faces.append(tuple(reversed(range(sides))))
    for row in range(len(rings)-1):
        for side in range(sides):
            next_side=(side+1)%sides
            faces.append((row*sides+side, row*sides+next_side,
                          (row+1)*sides+next_side,(row+1)*sides+side))
    last=(len(rings)-1)*sides
    faces.append(tuple(range(last,last+sides)))
    hair=mesh_object("KF_SculpturalHair_L0",vertices,faces,[0]*len(faces),
                     [material],collection)
    for polygon in hair.data.polygons:
        polygon.use_smooth = True
    group=hair.vertex_groups.new(name="KF_head")
    group.add(list(range(len(vertices))),1.0,"REPLACE")
    hair.parent=rig
    modifier=hair.modifiers.new("KF_ArmatureDeform","ARMATURE")
    modifier.object=rig
    return hair


def replace_shoes(rig):
    old=bpy.data.objects["KF_CourtShoes_L0"]
    collection=old.users_collection[0]
    material=old.data.materials[0]
    bpy.data.objects.remove(old,do_unlink=True)
    surface=r4.Surface()
    for side,sign in (("R",1),("L",-1)):
        y=sign*.207
        bone="KF_foot_"+side
        # Wider enclosed upper, raised heel and connected low court sole.
        surface.segment((-.185,y,.082),(.178,y,.071),[
            (0,.025,.025),(.10,.066,.052),(.24,.086,.065),
            (.42,.091,.065),(.61,.091,.059),(.79,.084,.052),
            (.93,.053,.038),(1,.016,.014),
        ],0,bone,sides=24)
        surface.segment((-.186,y,.019),(.180,y,.018),[
            (0,.028,.013),(.10,.068,.017),(.25,.086,.019),
            (.42,.094,.019),(.65,.094,.018),(.82,.085,.017),
            (.94,.056,.014),(1,.019,.010),
        ],0,bone,sides=24)
    shoes=mesh_object("KF_CourtShoes_L0",surface.vertices,surface.faces,
                      surface.material_ids,[material],collection)
    groups={}
    for name in ("KF_foot_R","KF_foot_L"):
        groups[name]=shoes.vertex_groups.new(name=name)
    for index,weight_map in enumerate(surface.weights):
        for name,weight in weight_map.items():
            groups[name].add([index],weight,"REPLACE")
    shoes.parent=rig
    modifier=shoes.modifiers.new("KF_ArmatureDeform","ARMATURE")
    modifier.object=rig
    return shoes


def visible_meshes():
    return [bpy.data.objects[name] for name in (
        "KF_AthleteBody_L0","KF_CompetitionShirt_L0","KF_AthleticShorts_L0",
        "KF_SculpturalHair_L0","KF_CourtShoes_L0")]


def tuck_covered_feet(body):
    """Keep only shoe-covered toe/heel skin inside the enclosed upper."""
    changed=0
    for vertex in body.data.vertices:
        point=vertex.co
        if point.z >= .105 or abs(point.y)<.145:
            continue
        side=1 if point.y>0 else -1
        center=side*.207
        t=max(0,min(1,(.105-point.z)/.105))
        t=t*t*(3-2*t)
        point.y=center+(point.y-center)*(1-.27*t)
        changed+=1
    body.data.update()
    body["kf_covered_foot_vertices_tucked"]=changed
    return changed


def floor_sweep(visible):
    worst={"clearance_m":float("inf")}
    table_hits=0
    hit_frames=[]
    for frame_twice in range(2,73):
        frame=frame_twice/2
        bpy.context.scene.frame_set(frame_twice//2,subframe=(frame_twice%2)*.5)
        depsgraph=bpy.context.evaluated_depsgraph_get()
        frame_hits=0
        for obj in visible:
            evaluated=obj.evaluated_get(depsgraph)
            mesh=evaluated.to_mesh()
            for vertex in mesh.vertices:
                position=evaluated.matrix_world @ vertex.co
                staged=r4.staging_point(position)
                clearance=staged.y
                if clearance<worst["clearance_m"]:
                    worst={"clearance_m":float(clearance),"frame":frame,
                           "object":obj.name,"vertex":vertex.index}
                if -1.37<=staged.x<=1.37 and abs(staged.z)<=.7625 and staged.y<=.76:
                    frame_hits+=1
            evaluated.to_mesh_clear()
        if frame_hits:
            table_hits+=frame_hits
            hit_frames.append(frame)
    worst["table_prism_collision_samples"]=table_hits
    worst["table_collision_frames"]=hit_frames
    return worst


def source_camera_point(three):
    dx=three.x-r4.STAGING_ROOT_THREE.x
    dz=three.z-r4.STAGING_ROOT_THREE.z
    c=math.cos(r4.STAGING_YAW_RAD)
    s=math.sin(r4.STAGING_YAW_RAD)
    return Vector((c*dx-s*dz,-(s*dx+c*dz),three.y-r4.STAGING_ROOT_THREE.y))


def frame_sweep(visible,blade):
    positions={
        "desktop":[(0,2.50,5.80),(-1.50,2.10,4.60),(-1.65,1.90,4.60),
                   (1.70,2.70,4.70),(0,3.35,5.60)],
        "portrait":[(0,3.90,12.50),(-1.35,2.90,8.20),(-1.55,2.40,6.80),
                    (1.10,3.50,9.30),(0,4.30,12.80)],
    }
    targets={
        "desktop":[(0,.95,0),(-.60,1,0),(-1.22,1.08,.05),
                   (-.30,1.05,-.05),(0,1.10,-.10)],
        "portrait":[(0,.90,0),(-.90,1,0),(-1.05,1.12,.05),
                    (-.55,1.05,-.05),(0,1.15,-.10)],
    }
    result={mode:{"min_margin_ndc":float("inf")} for mode in positions}
    for step in range(101):
        progress=step/100
        frame=1+35*progress
        bpy.context.scene.frame_set(int(frame),subframe=frame%1)
        positions_to_project=prior.visible_vertices(visible)[::8]
        expanded=[]
        for point in positions_to_project:
            staged_point=r4.staging_point(point)
            expanded.extend(staged_point+Vector(offset) for offset in (
                (.06,0,0),(-.06,0,0),(0,.06,0),
                (0,-.06,0),(0,0,.06),(0,0,-.06)))
        staged=expanded
        center=r4.staging_point(blade.matrix_world @ Vector((0,.160,0)))
        staged.extend(center+Vector((x,y,z)) for x in (-.10,.10)
                      for y in (-.10,.10) for z in (-.085,.085))
        for mode in positions:
            camera=r4.lerp_five([Vector(p) for p in positions[mode]],progress)
            target=r4.lerp_five([Vector(p) for p in targets[mode]],progress)
            fov=39 if mode=="desktop" else 46
            aspect=1440/900 if mode=="desktop" else 390/844
            projected=[r4.project_three(point,camera,target,fov,aspect)
                       for point in staged]
            left=min(point.x for point in projected)
            right=max(point.x for point in projected)
            bottom=min(point.y for point in projected)
            top=max(point.y for point in projected)
            margin=min(left+1,1-right,bottom+1,1-top)
            if margin<result[mode]["min_margin_ndc"]:
                result[mode]={"min_margin_ndc":round(margin,5),
                              "progress":progress,"frame":round(frame,3),
                              "bounds_ndc":[round(left,5),round(right,5),
                                            round(bottom,5),round(top,5)]}
    return result


def technical_validation(body,rig,blade,handle):
    scene=bpy.context.scene
    action=rig.animation_data.action if rig.animation_data else None
    marker_frames={marker.name:marker.frame for marker in scene.timeline_markers}
    expected={"KF_"+name:frame for name,frame in r4.POSE_FRAMES.items()}
    height=max(v.co.z for v in body.data.vertices)-min(v.co.z for v in body.data.vertices)
    def matrices_at(frame):
        scene.frame_set(int(frame),subframe=frame%1)
        return [value for bone in rig.pose.bones for row in bone.matrix for value in row]
    samples=[1,7,13,17.5,18,25,36]
    forward={frame:matrices_at(frame) for frame in samples}
    reverse={frame:matrices_at(frame) for frame in reversed(samples)}
    delta=max(abs(a-b) for frame in samples
              for a,b in zip(forward[frame],reverse[frame]))
    scene.frame_set(18)
    contact=r4.staging_point(blade.matrix_world @ Vector((0,.160,0)))
    contact_error=(contact-r4.STAGING_CONTACT_THREE).length
    tip_distances={}
    ev=body.evaluated_get(bpy.context.evaluated_depsgraph_get())
    mesh=ev.to_mesh()
    handle_ev=handle.evaluated_get(bpy.context.evaluated_depsgraph_get())
    handle_mesh=handle_ev.to_mesh()
    handle_points=[handle_ev.matrix_world@v.co for v in handle_mesh.vertices]
    for name,(index,_,_) in prior.PLAYING_FINGERS.items():
        tip=ev.matrix_world@mesh.vertices[index].co
        tip_distances[name]=min((tip-point).length for point in handle_points)
    ev.to_mesh_clear();handle_ev.to_mesh_clear()
    outcome={
        "source_body_height_m":height,
        "body_scale":list(body.scale),
        "rig_bones":len(rig.data.bones),
        "action":action.name if action else None,
        "frame_range":[scene.frame_start,scene.frame_end],
        "fps":scene.render.fps,
        "pose_markers":{key:marker_frames.get(key) for key in expected},
        "reverse_max_bone_matrix_delta":delta,
        "impact_blade_center_three_m":list(contact),
        "impact_contact_error_m":contact_error,
        "playing_fingertip_to_handle_vertex_m":tip_distances,
        "staging_root_three_m":list(r4.STAGING_ROOT_THREE),
        "staging_yaw_rad":r4.STAGING_YAW_RAD,
        "staging_scale":r4.STAGING_SCALE,
    }
    failures=[]
    if abs(height-1.8)>.02:failures.append("athlete source height")
    if max(abs(value-1) for value in body.scale)>1e-6:failures.append("body scale")
    if len(rig.data.bones)!=20:failures.append("rig bones")
    if not action or action.name!="KF_Athlete_Forehand":failures.append("action")
    if scene.frame_start!=1 or scene.frame_end!=36 or scene.render.fps!=30:
        failures.append("frame timing")
    if any(marker_frames.get(key)!=value for key,value in expected.items()):
        failures.append("pose markers")
    if delta>1e-5:failures.append("reverse reconstruction")
    if contact_error>.0001:failures.append("impact contact")
    outcome["failures"]=failures
    return outcome


def grip_validation(body, rig, blade, handle, root):
    """Measure actual hand contact/intersection through all 36 stroke frames."""
    scene = bpy.context.scene
    candidates = prior.hand_candidates(body, "KF_hand_R")
    graph = prior.hand_graph(body, candidates)
    distances = {
        name: prior.geodesic_distances(graph, tip)
        for name, (tip, _, _) in prior.PLAYING_FINGERS.items()
    }
    branches = {
        name: [index for index in candidates
               if distances[name][index] < .065 and
               name == min(distances, key=lambda item: distances[item][index])]
        for name in distances
    }
    palm = [index for index in candidates
            if .080 <= min(distances[name][index] for name in distances) <= .150]
    hand_faces = [tuple(polygon.vertices) for polygon in body.data.polygons
                  if all(index in candidates for index in polygon.vertices)]
    handle_tree = BVHTree.FromPolygons(
        [vertex.co.copy() for vertex in handle.data.vertices],
        [tuple(polygon.vertices) for polygon in handle.data.polygons])
    results = {name: {"closest_m": float("inf"), "worst_nearest_m": 0.0,
                      "worst_median_m": 0.0}
               for name in [*distances, "palm"]}
    highest_handle_pairs = 0
    highest_blade_pairs = 0
    max_deep_handle_vertices = 0
    max_deep_by_region = {name: 0 for name in [*distances, "palm"]}
    max_relative_matrix_delta = 0.0
    baseline = None
    per_pose = {}
    for frame in range(1, 37):
        scene.frame_set(frame)
        depsgraph = bpy.context.evaluated_depsgraph_get()
        evaluated = body.evaluated_get(depsgraph)
        mesh = evaluated.to_mesh()
        inverse_handle = handle.matrix_world.inverted()
        local = [inverse_handle @ (evaluated.matrix_world @ vertex.co)
                 for vertex in mesh.vertices]
        for name, ids in [*branches.items(), ("palm", palm)]:
            nearest = [handle_tree.find_nearest(local[index])[3]
                       for index in ids if -.030 <= local[index].y <= .115]
            if nearest:
                closest = min(nearest)
                ordered = sorted(nearest)
                median = ordered[len(ordered)//2]
                results[name]["closest_m"] = min(results[name]["closest_m"], closest)
                results[name]["worst_nearest_m"] = max(
                    results[name]["worst_nearest_m"], closest)
                results[name]["worst_median_m"] = max(
                    results[name]["worst_median_m"], median)
                if frame in (1, 7, 13, 18, 25, 36):
                    per_pose.setdefault(str(frame), {})[name] = {
                        "closest_m": round(closest, 6),
                        "median_m": round(median, 6)}
        deep = 0
        deep_regions = {name: 0 for name in max_deep_by_region}
        for index in candidates:
            point = local[index]
            if not -.018 <= point.y <= .105:
                continue
            width = .024 - .006*max(0.0, point.y)/.105
            depth = .017 - .004*max(0.0, point.y)/.105
            radial = math.hypot(point.x/width, point.z/depth)
            if (radial-1)*min(width, depth) < -.003:
                deep += 1
                region = min(distances, key=lambda item: distances[item][index])
                if distances[region][index] > .080:
                    region = "palm"
                deep_regions[region] += 1
        max_deep_handle_vertices = max(max_deep_handle_vertices, deep)
        for region in max_deep_by_region:
            max_deep_by_region[region] = max(max_deep_by_region[region],
                                             deep_regions[region])
        hand_tree = BVHTree.FromPolygons(local, hand_faces)
        handle_pairs = len(hand_tree.overlap(handle_tree))
        blade_local = [inverse_handle @ (blade.matrix_world @ vertex.co)
                       for vertex in blade.data.vertices]
        blade_tree = BVHTree.FromPolygons(
            blade_local, [tuple(polygon.vertices)
                          for polygon in blade.data.polygons])
        blade_pairs = len(hand_tree.overlap(blade_tree))
        highest_handle_pairs = max(highest_handle_pairs, handle_pairs)
        highest_blade_pairs = max(highest_blade_pairs, blade_pairs)
        bone_world = rig.matrix_world @ rig.pose.bones["KF_hand_R"].matrix
        relative = bone_world.inverted() @ root.matrix_world
        values = [value for row in relative for value in row]
        if baseline is None:
            baseline = values
        max_relative_matrix_delta = max(max_relative_matrix_delta,
                                        max(abs(a-b) for a,b in zip(values,baseline)))
        evaluated.to_mesh_clear()
    return {"frames_checked": 36, "nearest_surface_m": results,
            "six_pose_nearest_m": per_pose,
            "max_body_handle_triangle_pairs": highest_handle_pairs,
            "max_body_blade_triangle_pairs": highest_blade_pairs,
            "max_handle_vertices_deeper_than_3mm": max_deep_handle_vertices,
            "max_deep_handle_vertices_by_region": max_deep_by_region,
            "max_paddle_to_hand_matrix_delta": max_relative_matrix_delta,
            "surface_pair_counts_include_intended_contact": True}


def render_review(visible,blade,handle,root,worst_frame,only=None):
    REVIEW.mkdir(parents=True,exist_ok=True)
    scene=bpy.context.scene
    camera=bpy.data.objects["KF_InspectionCamera"]
    scene.render.image_settings.file_format="PNG"
    scene.render.resolution_percentage=100
    original_materials={obj.name:[slot.material for slot in obj.material_slots]
                        for obj in [*visible,blade,handle]}
    silhouette=review_material("KF_AssemblySilhouette",(.005,.005,.005),1)
    shots=[
        ("impact-three-quarter",18,(2.8,-3.6,2.15),(.18,0,1),2.22,False),
        ("impact-side",18,(0,-4.2,1.48),(.15,0,.96),2.14,False),
        ("grip-palm-side",18,None,None,.31,False),
        ("grip-blade-index-side",18,None,None,.34,False),
        ("grip-underside",18,None,None,.34,False),
        ("ready-three-quarter",1,(2.8,-3.6,2.15),(.18,0,1),2.22,False),
        ("follow-through-three-quarter",25,(2.8,-3.6,2.15),(.18,0,1),2.22,False),
        ("shoe-worst-floor",worst_frame,(1.7,-2.4,.56),(.18,.05,.095),.64,False),
        ("hair-head-three-quarter",1,(1.8,-1.35,1.75),(.01,0,1.63),.68,False),
        ("impact-silhouette",18,(2.8,-3.6,2.15),(.18,0,1),2.22,True),
    ]
    for name,frame,position,target,scale,black in shots:
        if only is not None and name not in only:
            continue
        scene.frame_set(int(frame),subframe=frame%1)
        camera.data.type="ORTHO"
        if name=="grip-palm-side":
            target=handle.matrix_world.translation+Vector((.06,0,.015))
            position=target+Vector((.92,-1.12,.30))
        elif name=="grip-blade-index-side":
            target=handle.matrix_world.translation+Vector((.07,0,.035))
            position=target+Vector((-.82,.98,.22))
        elif name=="grip-underside":
            target=handle.matrix_world.translation+Vector((.06,0,.025))
            position=target+handle.matrix_world.to_3x3() @ Vector((.10,-.2,-.85))
        else:
            target=Vector(target);position=Vector(position)
        camera.location=position
        r4.point_camera(camera,target)
        camera.data.ortho_scale=scale
        close="grip" in name or "shoe" in name or "hair" in name
        scene.render.resolution_x=1400 if close else 1200
        scene.render.resolution_y=1200 if close else 1400
        if black:
            for obj in [*visible,blade,handle]:
                for slot in obj.material_slots:
                    slot.material=silhouette
        else:
            for obj in [*visible,blade,handle]:
                for slot,material in zip(obj.material_slots,original_materials[obj.name]):
                    slot.material=material
        scene.render.filepath=str(REVIEW/(name+".png"))
        bpy.ops.render.render(write_still=True)
    for obj in [*visible,blade,handle]:
        for slot,material in zip(obj.material_slots,original_materials[obj.name]):
            slot.material=material
    if only is not None:
        return
    scene.frame_set(18)
    camera.data.type="PERSP"
    camera.data.lens=50
    camera.data.sensor_fit="AUTO"
    camera.data.angle=math.radians(46)
    camera.location=source_camera_point(Vector((-1.55,2.40,6.80)))
    r4.point_camera(camera,source_camera_point(Vector((-1.05,1.12,.05))))
    scene.render.resolution_x=390
    scene.render.resolution_y=844
    scene.render.filepath=str(REVIEW/"portrait-impact-390x844.png")
    bpy.ops.render.render(write_still=True)


def export_glb(path,visible,blade,handle,root):
    bpy.ops.object.select_all(action="DESELECT")
    rig=bpy.data.objects["KF_Athlete_Rig_L0"]
    socket=bpy.data.objects["KF_PaddleGrip_Socket"]
    objects=[rig,socket,root,blade,handle,*visible]
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active=rig
    bpy.ops.export_scene.gltf(filepath=str(path),export_format="GLB",
        use_selection=True,use_active_scene=True,export_animations=True,
        export_force_sampling=True,export_frame_range=True,export_skins=True,
        export_def_bones=True,export_apply=True,
        export_draco_mesh_compression_enable=False)
    return prior.inspect_glb(path)


def reimport_glb(path):
    before={obj.as_pointer() for obj in bpy.data.objects}
    bpy.ops.import_scene.gltf(filepath=str(path))
    imported=[obj for obj in bpy.data.objects if obj.as_pointer() not in before]
    outcome={"objects":len(imported),
             "meshes":sum(obj.type=="MESH" for obj in imported),
             "armatures":sum(obj.type=="ARMATURE" for obj in imported)}
    if outcome["meshes"]<7 or outcome["armatures"]!=1:
        raise RuntimeError("Temporary GLB did not re-import as the full assembly")
    return outcome


def run():
    parser=argparse.ArgumentParser()
    parser.add_argument("--diagnostic-only",action="store_true")
    parser.add_argument("--preview-only",action="store_true")
    parser.add_argument("--preview-grip-only",action="store_true")
    parser.add_argument("--save-only",action="store_true")
    args=parser.parse_args(sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else [])
    paddle_tris=build_paddle_source()
    bpy.ops.wm.open_mainfile(filepath=str(INPUT))
    body=bpy.data.objects["KF_AthleteBody_L0"]
    rig=bpy.data.objects["KF_Athlete_Rig_L0"]
    # The imported eye objects are displaced near the floor in every pose.
    # Face planes already live on the anatomical base; omit these stray meshes.
    for name in ("KF_Eye_L","KF_Eye_R"):
        bpy.data.objects.remove(bpy.data.objects[name],do_unlink=True)
    blade,handle,root=attach_paddle()
    grip=rebuild_grip_deformation(body,rig,handle)
    covered_feet=tuck_covered_feet(body)
    replace_hair(rig)
    replace_shoes(rig)
    visible=visible_meshes()
    floor=floor_sweep(visible)
    framing=frame_sweep(visible,blade)
    technical=technical_validation(body,rig,blade,handle)
    grip_checks=grip_validation(body,rig,blade,handle,root)
    report={"paddle_triangles":paddle_tris,
            "athlete_triangles":sum(prior.triangle_count(obj) for obj in visible),
            "complete_assembly_triangles":paddle_tris+sum(prior.triangle_count(obj) for obj in visible),
            "floor":floor,"full_path_framing":framing,
            "technical":technical,"grip_validation":grip_checks,
            "covered_foot_vertices_tucked":covered_feet,
            "playing_hand_grip_deformation":grip,
            "source_blend":str(INPUT),"assembled_blend":str(OUTPUT),
            "paddle_blend":str(PADDLE_SOURCE)}
    print("KF_ASSEMBLY_DIAGNOSTIC",json.dumps(report))
    if args.diagnostic_only:
        return
    if args.preview_only:
        render_review(visible,blade,handle,root,floor["frame"],
                      {"impact-three-quarter","grip-blade-index-side",
                       "shoe-worst-floor","hair-head-three-quarter"})
        return
    if args.preview_grip_only:
        render_review(visible,blade,handle,root,floor["frame"],
                      {"grip-palm-side","grip-blade-index-side","grip-underside"})
        return
    if floor["clearance_m"] < -.0005:
        raise RuntimeError("Assembled athlete intersects production floor")
    if floor["table_prism_collision_samples"]:
        raise RuntimeError("Assembled athlete intersects locked table")
    if technical["failures"]:
        raise RuntimeError("Technical assembly validation failed: "+", ".join(technical["failures"]))
    if any(value["min_margin_ndc"]<0 for value in framing.values()):
        raise RuntimeError("Assembled athlete clips the locked camera")
    bpy.context.scene.frame_set(18)
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(OUTPUT),check_existing=False)
    if args.save_only:
        return
    render_review(visible,blade,handle,root,floor["frame"])
    glb=Path("/tmp/KF_Athlete_Assembly_validation.glb")
    report["validation_glb"]=str(glb)
    report["glb"]=export_glb(glb,visible,blade,handle,root)
    if not any(clip["name"]=="KF_Athlete_Forehand"
               for clip in report["glb"]["animations"]):
        raise RuntimeError("Forehand clip missing from temporary GLB")
    if report["glb"]["skins"]!=1 or report["glb"]["skin_joints"]!=[19]:
        raise RuntimeError("Rig hierarchy missing from temporary GLB")
    report["glb_reimport"]=reimport_glb(glb)
    REVIEW.mkdir(parents=True,exist_ok=True)
    (REVIEW/"validation.json").write_text(json.dumps(report,indent=2)+"\n")


if __name__=="__main__":
    run()
