/**
 * Age in whole years at a reference date. Uses only the ISO date components
 * (no timezone / time-of-day) so the seed and UI compute the exact same value.
 */
export function computeAgeAt(birthDate: string, referenceDate: string): number {
  const [by, bm, bd] = birthDate.split("-").map(Number);
  const [ry, rm, rd] = referenceDate.split("-").map(Number);
  let age = ry - by;
  if (rm < bm || (rm === bm && rd < bd)) age -= 1;
  return age;
}

export function todayIso(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
