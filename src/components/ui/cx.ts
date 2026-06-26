// CMP-U-CX — tiny className combiner shared by the UI primitives (Plan 02).
// Filters out falsy values and joins with spaces, so primitives can compose
// conditional token classes without pulling in a `clsx`/`classnames` dependency.
// Output is identical to a hand-written template string, so existing className
// assertions in the unit tests keep matching.
export type ClassValue = string | false | null | undefined;

export function cx(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}
