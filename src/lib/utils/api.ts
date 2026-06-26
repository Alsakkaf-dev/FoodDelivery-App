// Standard response envelope (SDD §6.1): { ok:true, data } | { ok:false, error }.

export type ApiError = { code: string; message: string; details?: unknown };
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

export function ok<T>(data: T): ApiResult<T> {
  return { ok: true, data };
}
export function fail(code: string, message: string, details?: unknown): ApiResult<never> {
  return { ok: false, error: { code, message, details } };
}

// Map a domain error code to an HTTP status (used by route handlers).
export const ERROR_STATUS: Record<string, number> = {
  bad_request: 400,
  validation_error: 400,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  shop_not_open: 409,
  past_cutoff: 409,
  sold_out_or_insufficient: 409,
  invalid_transition: 409,
  delivery_requires_zone_address: 422,
  item_unavailable: 422,
  empty_cart: 422,
  rate_limited: 429,
  maps_unconfigured: 503,
  maps_upstream: 502,
  internal: 500,
};

export function httpStatus(code: string): number {
  return ERROR_STATUS[code] ?? 500;
}
