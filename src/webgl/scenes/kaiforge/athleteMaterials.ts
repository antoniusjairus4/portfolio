import { type Mesh, MeshLambertMaterial } from 'three';

/** Scene-independent palette owned and disposed by the athlete's existing asset lease. */
export function createSculpturalAthleteMaterials() {
  const matte = (name: string, color: string) => new MeshLambertMaterial({ name, color });
  const materials = {
    body: matte('KF_Sculpture_Mineral', '#969183'),
    kit: matte('KF_Sculpture_InkKit', '#30362f'),
    hair: matte('KF_Sculpture_InkHair', '#242822'),
    shoes: matte('KF_Sculpture_CharcoalShoes', '#62615a'),
    rubber: matte('KF_Sculpture_Rubber', '#252b25'),
    wood: matte('KF_Sculpture_Handle', '#747060'),
  };

  return {
    apply(mesh: Mesh, importedSlot: string) {
      // Hair and shoes share an imported slot, but already have independent named meshes.
      const material =
        importedSlot === 'KF_Skin'
          ? materials.body
          : importedSlot === 'KF_Cloth'
            ? materials.kit
            : importedSlot === 'KF_Rubber'
              ? materials.rubber
              : importedSlot === 'KF_Wood'
                ? materials.wood
                : importedSlot === 'KF_HairShoes' && mesh.name === 'KF_CourtShoes_L0'
                  ? materials.shoes
                  : importedSlot === 'KF_HairShoes' && mesh.name === 'KF_SculpturalHair_L0'
                    ? materials.hair
                    : null;
      if (!material)
        throw new Error(`Unmapped sculptural athlete mesh: ${mesh.name}/${importedSlot}`);
      mesh.material = material;
      mesh.castShadow = true;
      // Broad diffuse form remains lit. Fine self-shadow creases must not suggest facial detail
      // or fabric stitching; the whole assembly still casts its grounding shadow into the stage.
      mesh.receiveShadow = false;
    },
    dispose() {
      for (const material of Object.values(materials)) material.dispose();
    },
  };
}
