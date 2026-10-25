import type { Box } from '../kaiforge/geometry';

// The four pieces tile the back wall while leaving the window aperture clear.
// The fifth piece is used only by the bridge and closes that aperture at its start.
export const BACK_WALL_BOXES: Box[] = [
  [
    [-3.93, 2.65, -2.8],
    [1.14, 5.3, 0.18],
  ],
  [
    [1.18, 2.65, -2.8],
    [6.64, 5.3, 0.18],
  ],
  [
    [-2.75, 0.9, -2.8],
    [1.22, 1.8, 0.18],
  ],
  [
    [-2.75, 4.4, -2.8],
    [1.22, 1.8, 0.18],
  ],
];

export const WINDOW_FILL_BOX: Box = [
  [-2.75, 2.65, -2.8],
  [1.22, 1.7, 0.18],
];

// These overlap the floor and back wall slightly and close the side view.
export const SIDE_WALL_BOXES: Box[] = [
  [
    [-4.42, 2.65, 2.2],
    [0.16, 5.4, 10],
  ],
  [
    [4.42, 2.65, 2.2],
    [0.16, 5.4, 10],
  ],
];

export const RIGHT_NICHE_CENTERS = [-1.65, -0.1, 1.45] as const;

// The right wall is tiled around three 0.88-wide openings. Thin solid backs
// close each opening at the outer wall plane, leaving a 0.11-deep recess.
export const RIGHT_WALL_FRONT_BOXES: Box[] = [
  [
    [4.42, 0.8, 2.2],
    [0.16, 1.7, 10],
  ],
  [
    [4.42, 4.6, 2.2],
    [0.16, 1.5, 10],
  ],
  [
    [4.42, 2.75, -2.445],
    [0.16, 2.2, 0.71],
  ],
  [
    [4.42, 2.75, -0.875],
    [0.16, 2.2, 0.67],
  ],
  [
    [4.42, 2.75, 0.675],
    [0.16, 2.2, 0.67],
  ],
  [
    [4.42, 2.75, 4.545],
    [0.16, 2.2, 5.31],
  ],
];

export const RIGHT_WALL_BACK_BOXES: Box[] = RIGHT_NICHE_CENTERS.map((z) => [
  [4.475, 2.75, z],
  [0.05, 2.2, 0.88],
]);

export const RIGHT_WALL_BOXES: Box[] = [...RIGHT_WALL_FRONT_BOXES, ...RIGHT_WALL_BACK_BOXES];

// A separate, shallow lintel replaces the former full-depth ceiling slab.
// Its front face sits just ahead of the back wall and meets both side walls.
export const HEADER_BOX: Box = [
  [0, 5.21, -2.65],
  [9, 0.28, 0.12],
];

// Closes the narrow sightline above the lintel without extending into the room.
export const HEADER_SEAL_BOX: Box = [
  [0, 5.43, -2.8],
  [9, 0.28, 0.18],
];
