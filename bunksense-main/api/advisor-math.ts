// Standalone attendance math functions for the backend AI advisor.

export type SubjectStats = {
  attended: number;
  total: number;
  required: number;
};

export const percent = (attended: number, total: number) =>
  total === 0 ? 0 : (attended / total) * 100;

export const safeBunks = ({ attended, total, required }: SubjectStats) => {
  if (required <= 0) return Infinity;
  if (total === 0) return 0;
  const max = Math.floor((attended * 100) / required - total);
  return Math.max(0, max);
};

export const recoveryNeeded = ({ attended, total, required }: SubjectStats) => {
  if (percent(attended, total) >= required) return 0;
  if (required >= 100) return Infinity;
  const k = (required * total - 100 * attended) / (100 - required);
  return Math.max(0, Math.ceil(k));
};

export const status = (s: SubjectStats) => {
  const p = percent(s.attended, s.total);
  if (p >= s.required) {
    return safeBunks(s) <= 1 ? "warning" : "safe";
  }
  return "shortage";
};
