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

// A separate, shallow lintel replaces the former full-depth ceiling slab.
// Its front face sits just ahead of the back wall and meets both side walls.
export const HEADER_BOX: Box = [
  [0, 5.21, -2.65],
  [9, 0.28, 0.12],
];
