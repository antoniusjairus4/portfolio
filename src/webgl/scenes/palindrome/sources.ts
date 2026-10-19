// Shared object anchors: geometry and information use the same room coordinates.
export const DOMESTIC_SOURCES = {
  bag: [-2.34, 1.14, -0.69],
  milk: [-1.7, 1.14, -0.75],
  coffee: [-0.32, 1.14, -0.39],
  receipt: [-1.21, 1.151, 0.07],
  previousReceipt: [-2.15, 1.151, 0.18],
  notebook: [0.36, 1.14, 0.16],
  household: [2.3, 0.22, -2.3],
} as const;

export type DomesticSource = keyof typeof DOMESTIC_SOURCES;
