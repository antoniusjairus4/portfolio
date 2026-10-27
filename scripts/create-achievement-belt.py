"""Build the web-optimised martial arts black-belt hero for the Achievements scene."""

import math
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public/models/achievements/karate-black-belt.glb"


def create_fabric_material(name: str, color: tuple[float, float, float, float], roughness: float = 0.88):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = color
    mat.use_nodes = True
    principled = mat.node_tree.nodes.get("Principled BSDF")
    principled.inputs["Base Color"].default_value = color
    principled.inputs["Roughness"].default_value = roughness
    principled.inputs["Metallic"].default_value = 0.0
    if "Specular IOR Level" in principled.inputs:
        principled.inputs["Specular IOR Level"].default_value = 0.12
    elif "Specular" in principled.inputs:
        principled.inputs["Specular"].default_value = 0.12

    if "Sheen Weight" in principled.inputs:
        principled.inputs["Sheen Weight"].default_value = 0.35
    elif "Sheen" in principled.inputs:
        principled.inputs["Sheen"].default_value = 0.35

    return mat


def create_belt_ribbon(
    name: str,
    curve_func,
    width: float = 0.44,
    thickness: float = 0.048,
    segments: int = 80,
    across: int = 10,
    twist_func=None,
    width_func=None,
):
    """Generates a structured, thick martial arts belt segment with stitched edge ridges."""
    vertices = []
    faces = []

    for i in range(segments + 1):
        t = i / segments
        pt = Vector(curve_func(t))
        # Compute forward tangent
        dt = 0.003
        t_before = max(0.0, t - dt)
        t_after = min(1.0, t + dt)
        p_before = Vector(curve_func(t_before))
        p_after = Vector(curve_func(t_after))
        tangent = (p_after - p_before).normalized()

        # Compute stable normal and binormal
        up = Vector((0.0, 0.0, 1.0))
        if abs(tangent.dot(up)) > 0.92:
            up = Vector((0.0, 1.0, 0.0))
        binormal = tangent.cross(up).normalized()
        normal = binormal.cross(tangent).normalized()

        if twist_func:
            angle = twist_func(t)
            cos_a = math.cos(angle)
            sin_a = math.sin(angle)
            b = binormal * cos_a + normal * sin_a
            n = -binormal * sin_a + normal * cos_a
            binormal = b.normalized()
            normal = n.normalized()

        current_width = width * (width_func(t) if width_func else 1.0)

        for c in range(across + 1):
            u = (c / across) - 0.5  # -0.5 to 0.5
            abs_u = abs(u) * 2.0  # 0 to 1
            # Structured martial arts belt profile:
            crown = (1.0 - abs_u * abs_u) * 0.007
            stitching_ribs = math.cos(u * math.pi * 12.0) * 0.0018
            edge_bead = 0.003 * (abs_u**3)

            displacement = normal * (crown + stitching_ribs + edge_bead)
            vert_pos = pt + binormal * (u * current_width) + displacement
            vertices.append(tuple(vert_pos))

    stride = across + 1
    for i in range(segments):
        for c in range(across):
            v0 = i * stride + c
            v1 = v0 + 1
            v2 = v0 + stride + 1
            v3 = v0 + stride
            faces.append((v0, v1, v2, v3))

    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)

    solidify = obj.modifiers.new("FabricThickness", "SOLIDIFY")
    solidify.thickness = thickness
    solidify.offset = 0.0
    solidify.use_rim = True
    solidify.use_rim_only = False

    bevel = obj.modifiers.new("EdgeStitchBevel", "BEVEL")
    bevel.width = thickness * 0.28
    bevel.segments = 2

    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.shade_smooth()
    return obj


# Clear scene
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

# Materials: deep matte black with fine fiber sheen
belt_material = create_fabric_material("MartialArtsBlackCanvas", (0.013, 0.013, 0.014, 1.0), roughness=0.88)
knot_material = create_fabric_material("MartialArtsKnotCanvas", (0.016, 0.016, 0.017, 1.0), roughness=0.85)

# 1. Left Waist Arch:
# Sweeps in from left hip across towards the central knot.
# Arches upward cleanly above the word "BLACK", creating majestic framing.
def sweep_left(t):
    # t: 0.0 (far left) to 1.0 (entering the knot at center)
    x = -2.55 * (1.0 - t) - 0.14 * t
    y = 0.12 + math.sin(t * math.pi * 0.95) * 0.22 + math.sin(t * math.pi * 1.9) * 0.03
    z = 0.22 + math.sin(t * math.pi * 0.88) * 0.50 + math.sin(t * math.pi * 1.4) * 0.06
    return x, y, z

def twist_left(t):
    return -0.18 + t * 0.32 + math.sin(t * math.pi) * 0.10

belt_left = create_belt_ribbon(
    "BeltLeftArch",
    sweep_left,
    width=0.45,
    thickness=0.046,
    segments=84,
    across=10,
    twist_func=twist_left,
)
belt_left.data.materials.append(belt_material)


# 2. Right Waist Arch:
# Emerges from behind knot and curves around right hip, receding in perspective.
# Balances the composition on the right above "BELT".
def sweep_right(t):
    # t: 0.0 (at knot) to 1.0 (far right)
    x = 0.12 * (1.0 - t) + 2.15 * t
    y = 0.20 - math.sin(t * math.pi * 0.9) * 0.32 - t * 0.15
    z = 0.44 + math.sin(t * math.pi * 0.82) * 0.34 - t * 0.18
    return x, y, z

def twist_right(t):
    return 0.15 - t * 0.35

belt_right = create_belt_ribbon(
    "BeltRightArch",
    sweep_right,
    width=0.45,
    thickness=0.046,
    segments=72,
    across=10,
    twist_func=twist_right,
)
belt_right.data.materials.append(belt_material)


# 3. Authentic Martial Arts Obi Square Knot (Koma-Musubi):
# Prominent central wrap looping horizontally/diagonally over the crossing point
def knot_wrap(t):
    # Oval loop wrapping around the intersection
    angle = (t * 2.0 - 0.15) * math.pi
    rx = 0.25 + math.sin(t * math.pi) * 0.03
    rz = 0.26
    x = math.cos(angle) * rx - 0.01
    y = 0.24 + math.sin(angle) * 0.16 + math.sin(t * math.pi) * 0.04
    z = 0.45 + math.sin(angle) * rz
    return x, y, z

def knot_wrap_twist(t):
    return 0.14 + math.sin(t * math.pi * 2.0) * 0.10

knot_outer = create_belt_ribbon(
    "KnotOuterWrap",
    knot_wrap,
    width=0.48,
    thickness=0.050,
    segments=54,
    across=10,
    twist_func=knot_wrap_twist,
)
knot_outer.data.materials.append(knot_material)


# B) Knot Cross Fold (the internal fold crossing through the core wrap)
def knot_crossing(t):
    x = -0.20 + t * 0.40
    y = 0.20 + math.sin(t * math.pi) * 0.15
    z = 0.54 - t * 0.20 + math.sin(t * math.pi) * 0.05
    return x, y, z

def knot_crossing_twist(t):
    return 0.28 - t * 0.42

knot_inner = create_belt_ribbon(
    "KnotInnerCross",
    knot_crossing,
    width=0.46,
    thickness=0.048,
    segments=36,
    across=8,
    twist_func=knot_crossing_twist,
)
knot_inner.data.materials.append(knot_material)


# 4. Two Hanging Tails:
# Anatomically correct martial arts drape:
# Front tail folds over the knot core and drapes down with gentle physical curve
def tail_front(t):
    # t: 0 to 1.0 (hangs down in center gap)
    x = -0.05 - math.sin(t * math.pi * 0.75) * 0.12 - t * 0.10
    y = 0.34 - t * 0.12 + math.sin(t * math.pi) * 0.05
    z = 0.44 - t * 1.95 + math.sin(t * math.pi * 0.65) * 0.06
    return x, y, z

def tail_front_twist(t):
    return 0.08 - t * 0.18 + math.sin(t * math.pi) * 0.06

tail_a = create_belt_ribbon(
    "TailFront",
    tail_front,
    width=0.45,
    thickness=0.046,
    segments=64,
    across=10,
    twist_func=tail_front_twist,
)
tail_a.data.materials.append(belt_material)


# Back tail emerges from beneath knot wrap, angles slightly right, and hangs naturally
def tail_back(t):
    x = 0.07 + t * 0.28 + math.sin(t * math.pi * 0.7) * 0.08
    y = 0.19 - t * 0.08 - math.sin(t * math.pi) * 0.03
    z = 0.35 - t * 1.78 - math.sin(t * math.pi * 0.55) * 0.05
    return x, y, z

def tail_back_twist(t):
    return -0.16 + t * 0.22 - math.sin(t * math.pi) * 0.05

tail_b = create_belt_ribbon(
    "TailBack",
    tail_back,
    width=0.45,
    thickness=0.046,
    segments=60,
    across=10,
    twist_func=tail_back_twist,
)
tail_b.data.materials.append(belt_material)


# Select all belt components and apply transforms
all_parts = [belt_left, belt_right, knot_outer, knot_inner, tail_a, tail_b]
for obj in all_parts:
    obj.select_set(True)

bpy.context.view_layer.objects.active = belt_left
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

print(f"Successfully generated balanced martial arts black belt GLB: {OUTPUT}")
