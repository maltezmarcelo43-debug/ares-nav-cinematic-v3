export const cinematicState = {
  progress: 0,
  velocity: 0,
};

export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function segment(progress: number, start: number, end: number) {
  return clamp((progress - start) / (end - start));
}

export function lerp(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}
