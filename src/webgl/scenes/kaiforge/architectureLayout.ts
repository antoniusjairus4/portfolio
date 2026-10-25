import type { Box } from './geometry';

// Shared by the KaiForge room and the first frame of its scroll bridge.
export const GROUND_BOXES: Box[] = [
  [
    [0, -0.18, 5.1],
    [15.2, 0.36, 23.8],
  ],
];

export const WALL_BOXES: Box[] = [
  // The room shell overlaps the floor below its top face at each junction.
  [
    [0, 6, -6.3],
    [15.2, 12.36, 0.8],
  ],
  [
    [-7, 6, 5.1],
    [0.8, 12.36, 23.8],
  ],
  [
    [7, 6, 5.1],
    [0.8, 12.36, 23.8],
  ],
  // Offset slabs retain the existing architectural detailing.
  [
    [-4.4, 3.5, -4.3],
    [2.1, 7, 0.48],
  ],
  [
    [2.9, 3, -5.8],
    [3.4, 6, 0.65],
  ],
  [
    [-0.9, 5.8, -7.8],
    [8, 0.48, 0.8],
  ],
  [
    [-6.5, 2.6, -8],
    [0.5, 5.2, 6],
  ],
];

export const OUTER_PORTRAIT_BOXES: Box[] = [
  [
    [2.8, 2.4, -3.2],
    [0.28, 4.8, 0.8],
  ],
  [
    [1.2, 4.8, -3.2],
    [3.5, 0.28, 0.8],
  ],
];

export const OUTER_DESKTOP_BOXES: Box[] = [
  [
    [4.4, 2.6, -1.4],
    [0.38, 5.2, 1.1],
  ],
  [
    [2.6, 5.2, -1.4],
    [4, 0.38, 1.1],
  ],
  [
    [-5, 1.5, -0.6],
    [0.35, 3, 0.8],
  ],
];
