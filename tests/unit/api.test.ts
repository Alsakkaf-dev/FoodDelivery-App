import { describe, it, expect } from 'vitest';
import { ok, fail, httpStatus, ERROR_STATUS } from '@/lib/utils/api';

describe('result envelope (SDD §6.1)', () => {
  it('ok wraps data', () => {
    expect(ok(5)).toEqual({ ok: true, data: 5 });
  });
  it('fail wraps a code + message', () => {
    const f = fail('validation_error', 'bad', { field: 'x' });
    expect(f.ok).toBe(false);
    if (!f.ok) {
      expect(f.error.code).toBe('validation_error');
      expect(f.error.details).toEqual({ field: 'x' });
    }
  });
});

describe('httpStatus / ERROR_STATUS mapping', () => {
  it('maps known domain codes to HTTP status', () => {
    expect(httpStatus('sold_out_or_insufficient')).toBe(409);
    expect(httpStatus('validation_error')).toBe(400);
    expect(httpStatus('rate_limited')).toBe(429);
    expect(httpStatus('not_found')).toBe(404);
    expect(ERROR_STATUS.unauthorized).toBe(401);
  });
  it('defaults unknown codes to 500', () => {
    expect(httpStatus('totally_unknown_code')).toBe(500);
  });
});
