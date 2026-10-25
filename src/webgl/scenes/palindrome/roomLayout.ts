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

// These overlap the floor and the back wall slightly, then continue past the
// camera's edge rays so neither side nor the roof can reveal the world beyond.
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

export const CEILING_BOX: Box = [
  [0, 5.315, 0.65],
  [9, 0.07, 9.7],
];
