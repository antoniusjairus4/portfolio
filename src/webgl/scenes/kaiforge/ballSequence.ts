import { Vector3 } from 'three';
import { clamp01, rangeProgress } from '@/components/kaiforge/kaiforgeChoreography';
import { CONTACT } from './staging';

export const BALL_TIMING = {
  loadStart: 0.18,
  loadEnd: 0.3,
  incomingBounce: 0.32,
  contact: 0.455,
  outgoing: 0.49,
  farBounce: 0.82,
  firstFloorContact: 0.918,
  secondFloorContact: 0.954,
  rollStart: 0.974,
  finish: 0.992,
} as const;

const START = new Vector3(1.15, 1.12, -0.18);
// Table surface .76 m + ball radius .02 m: both bounces touch, never penetrate.
const NEAR_BOUNCE = new Vector3(-0.25, 0.78, 0.015);
const FAR_BOUNCE = new Vector3(1.02, 0.78, -0.22);
const FIRST_FLOOR = new Vector3(1.9, 0.02, -0.28);
const SECOND_FLOOR = new Vector3(2.08, 0.02, -0.31);
const ROLL_START = new Vector3(2.17, 0.02, -0.325);
const FINISH = new Vector3(2.21, 0.02, -0.33);

function arc(a: Vector3, b: Vector3, t: number, lift: number, out: Vector3) {
  out.copy(a).lerp(b, t);
  out.y += 4 * lift * t * (1 - t);
  return out;
}

/** Outgoing path parameter, independent of render history. */
export function sampleOutgoingPosition(parameter: number, out: Vector3) {
  const u = clamp01(parameter);
  return u <= 0.82
    ? arc(CONTACT, FAR_BOUNCE, u / 0.82, 0.12, out)
    : sampleReleasePosition(
        BALL_TIMING.farBounce + ((u - 0.82) / 0.18) * (BALL_TIMING.finish - BALL_TIMING.farBounce),
        out,
      );
}

/** Release alone: clear the edge, fall, two diminishing rebounds, then frictional settling. */
function sampleReleasePosition(progress: number, out: Vector3) {
  if (progress < BALL_TIMING.firstFloorContact) {
    const t = rangeProgress(progress, BALL_TIMING.farBounce, BALL_TIMING.firstFloorContact);
    out.copy(FAR_BOUNCE).lerp(FIRST_FLOOR, t);
    // Small rebound from the far tabletop, followed by a gravity-shaped fall.
    // The whole ball clears x = 1.39 before its centre descends below table height + radius.
    out.y = Math.max(0.02, 0.78 + 0.65 * t - 1.41 * t * t);
    return out;
  }
  if (progress < BALL_TIMING.secondFloorContact) {
    return arc(FIRST_FLOOR, SECOND_FLOOR,
      rangeProgress(progress, BALL_TIMING.firstFloorContact, BALL_TIMING.secondFloorContact),
      0.16, out);
  }
  if (progress < BALL_TIMING.rollStart) {
    return arc(SECOND_FLOOR, ROLL_START,
      rangeProgress(progress, BALL_TIMING.secondFloorContact, BALL_TIMING.rollStart),
      0.035, out);
  }
  if (progress < BALL_TIMING.finish) {
    const t = rangeProgress(progress, BALL_TIMING.rollStart, BALL_TIMING.finish);
    return out.copy(ROLL_START).lerp(FINISH, 1 - (1 - t) ** 2);
  }
  // Centre rests exactly one ball radius above the existing y = 0 floor.
  return out.copy(FINISH);
}

export function getOutgoingProgress(progress: number) {
  if (progress <= BALL_TIMING.farBounce) {
    return 0.82 * rangeProgress(progress, BALL_TIMING.outgoing, BALL_TIMING.farBounce);
  }
  const t = rangeProgress(progress, BALL_TIMING.farBounce, BALL_TIMING.finish);
  return 0.82 + 0.18 * t;
}

/** Authored flights, table bounces and the locked contact hold; no simulation. */
export function sampleBallPosition(progress: number, out: Vector3) {
  const p = clamp01(progress);
  if (p < BALL_TIMING.incomingBounce) {
    let flight: number;
    if (p <= BALL_TIMING.loadStart) {
      flight = 0.1 * (p / BALL_TIMING.loadStart) ** 2;
    } else {
      const span = BALL_TIMING.incomingBounce - BALL_TIMING.loadStart;
      const t = (p - BALL_TIMING.loadStart) / span;
      // Hermite timing joins Recognition smoothly and matches horizontal speed
      // at the bounce. Only vertical velocity reverses at the table surface.
      const startSlope = (span * 0.2) / BALL_TIMING.loadStart;
      const endSlope =
        (span * (NEAR_BOUNCE.x - CONTACT.x)) /
        ((BALL_TIMING.contact - BALL_TIMING.incomingBounce) * (START.x - NEAR_BOUNCE.x));
      flight =
        (2 * t ** 3 - 3 * t ** 2 + 1) * 0.1 +
        (t ** 3 - 2 * t ** 2 + t) * startSlope +
        (-2 * t ** 3 + 3 * t ** 2) +
        (t ** 3 - t ** 2) * endSlope;
    }
    return arc(START, NEAR_BOUNCE, flight, 0.24, out);
  }
  if (p < BALL_TIMING.contact) {
    return arc(
      NEAR_BOUNCE,
      CONTACT,
      rangeProgress(p, BALL_TIMING.incomingBounce, BALL_TIMING.contact),
      0.13,
      out,
    );
  }
  if (p <= BALL_TIMING.outgoing) return out.copy(CONTACT);
  if (p > BALL_TIMING.farBounce) return sampleReleasePosition(p, out);
  return sampleOutgoingPosition(getOutgoingProgress(p), out);
}
