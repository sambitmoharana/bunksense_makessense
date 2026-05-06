// Pure attendance math — no DB, fully testable.
export type SubjectStats = {
  attended: number;
  total: number;
  required: number; // percent, e.g. 75
};

export type Status = "safe" | "warning" | "shortage";

export const percent = (attended: number, total: number) =>
  total === 0 ? 0 : (attended / total) * 100;

/**
 * Max consecutive future classes you can MISS while keeping current% >= required%.
 * attended / (total + k) >= required/100  →  k <= attended*100/required - total
 */
export const safeBunks = ({ attended, total, required }: SubjectStats) => {
  if (required <= 0) return Infinity;
  if (total === 0) return 0;
  const max = Math.floor((attended * 100) / required - total);
  return Math.max(0, max);
};

/**
 * Min consecutive future classes you must ATTEND to reach required%.
 * (attended + k) / (total + k) >= required/100
 * k >= (required*total - 100*attended) / (100 - required)
 */
export const recoveryNeeded = ({ attended, total, required }: SubjectStats) => {
  if (percent(attended, total) >= required) return 0;
  if (required >= 100) return Infinity;
  const k = (required * total - 100 * attended) / (100 - required);
  return Math.max(0, Math.ceil(k));
};

export const status = (s: SubjectStats): Status => {
  const p = percent(s.attended, s.total);
  if (p >= s.required) {
    // safe but small buffer → warning
    return safeBunks(s) <= 1 ? "warning" : "safe";
  }
  return "shortage";
};

export const simulate = (
  s: SubjectStats,
  miss: number,
  attend: number,
): SubjectStats => ({
  required: s.required,
  total: s.total + miss + attend,
  attended: s.attended + attend,
});
