"""Build the web-optimised black-belt hero used by the Achievements scene."""

import math
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public/models/achievements/karate-black-belt.glb"


def fabric_material(name: str, color: tuple[float, float, float, float], roughness: float):
    material = bpy.data.materials.new(name)
    material.diffuse_color = color
    material.use_nodes = True
    principled = material.node_tree.nodes.get("Principled BSDF")
    principled.inputs["Base Color"].default_value = color
    principled.inputs["Roughness"].default_value = roughness
    principled.inputs["Metallic"].default_value = 0.0
    if principled.inputs.get("Sheen Weight"):
        principled.inputs["Sheen Weight"].default_value = 0.22
    return material


def ribbon_mesh(name, center, width=0.38, segments=72, across=6, thickness=0.055):
    vertices = []
    faces = []
    for index in range(segments + 1):
        t = index / segments
        point = Vector(center(t))
        before = Vector(center(max(0.0, t - 0.002)))
        after = Vector(center(min(1.0, t + 0.002)))
        tangent = (after - before).normalized()
        side = Vector((0.0, 0.0, 1.0))
        side = (side - tangent * side.dot(tangent)).normalized()
        for cross in range(across + 1):
            u = cross / across - 0.5
            fold = math.sin(t * math.pi * 8.0 + u * 5.0) * 0.026
            crown = (1.0 - (u * 2.0) ** 2) * 0.018
            vertices.append(tuple(point + side * (u * width) + Vector((0.0, fold + crown, 0.0))))

    stride = across + 1
    for index in range(segments):
        for cross in range(across):
            a = index * stride + cross
            b = a + 1
            c = a + stride + 1
            d = a + stride
            faces.append((a, b, c, d))

    mesh = bpy.data.meshes.new(f"{name}Mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)

    solidify = obj.modifiers.new("Fabric thickness", "SOLIDIFY")
    solidify.thickness = thickness
    solidify.offset = 0.0
    bevel = obj.modifiers.new("Soft fabric edges", "BEVEL")
    bevel.width = 0.022
    bevel.segments = 3
    weighted = obj.modifiers.new("Weighted fabric normals", "WEIGHTED_NORMAL")
    weighted.keep_sharp = True
    return obj


bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

black = fabric_material("Deep black cotton", (0.012, 0.013, 0.014, 1.0), 0.7)
edge = fabric_material("Woven edge highlight", (0.045, 0.046, 0.048, 1.0), 0.62)


def sweep(t):
    x = -2.4 + t * 2.45
    y = math.sin(t * math.pi * 2.0) * 0.16 + math.sin(t * math.pi * 5.0) * 0.045
    z = 0.32 + math.sin(t * math.pi) * 0.62 - t * 0.06
    return x, y, z


main = ribbon_mesh("Black belt sweep", sweep, width=0.5, segments=96, across=8, thickness=0.065)
main.data.materials.append(black)

knot = bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=4, radius=0.42, location=(0.0, 0.0, 0.36))
knot = bpy.context.object
knot.name = "Layered belt knot"
knot.scale = (1.0, 0.62, 0.68)
knot.rotation_euler = (0.12, -0.22, 0.18)
knot.data.materials.append(edge)
bpy.ops.object.shade_smooth()


def tail_one(t):
    return (
        -0.05 + math.sin(t * math.pi) * 0.34,
        -0.03 + math.sin(t * math.pi * 2.6) * 0.12,
        0.25 - t * 2.25 + math.sin(t * math.pi) * 0.22,
    )


def tail_two(t):
    return (
        0.11 + t * 0.45 + math.sin(t * math.pi) * 0.2,
        0.05 - math.sin(t * math.pi * 2.2) * 0.1,
        0.24 - t * 1.88 - math.sin(t * math.pi) * 0.18,
    )


tail_a = ribbon_mesh("Long belt tail", tail_one, width=0.46, segments=58, across=7, thickness=0.06)
tail_b = ribbon_mesh("Short belt tail", tail_two, width=0.46, segments=52, across=7, thickness=0.06)
tail_a.data.materials.append(black)
tail_b.data.materials.append(black)

for obj in (main, knot, tail_a, tail_b):
    obj.select_set(True)

bpy.context.view_layer.objects.active = main
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=str(OUTPUT),
    export_format="GLB",
    export_apply=True,
    export_yup=True,
    export_materials="EXPORT",
    export_normals=True,
    export_tangents=False,
    export_attributes=False,
    export_cameras=False,
    export_lights=False,
)

print(f"Exported {OUTPUT}")
