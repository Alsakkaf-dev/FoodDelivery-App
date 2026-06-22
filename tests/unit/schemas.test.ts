import { describe, it, expect } from 'vitest';
import { createOrderSchema, otpVerifySchema, configureSessionSchema } from '@/lib/utils/schemas';

const uuid = '11111111-1111-1111-1111-111111111111';
const base = { payment_method: 'cod' as const, items: [{ menu_item_id: uuid, qty: 1 }], idempotency_key: 'idem-12345678' };

describe('createOrderSchema', () => {
  it('accepts a valid pickup order', () => {
    expect(createOrderSchema.safeParse({ type: 'pickup', ...base }).success).toBe(true);
  });
  it('rejects an empty cart', () => {
    expect(createOrderSchema.safeParse({ type: 'pickup', ...base, items: [] }).success).toBe(false);
  });
  it('rejects a delivery order without zone + address (refine)', () => {
    expect(createOrderSchema.safeParse({ type: 'delivery', ...base }).success).toBe(false);
  });
  it('accepts a delivery order with zone + address', () => {
    expect(createOrderSchema.safeParse({ type: 'delivery', zone_id: uuid, address_id: uuid, ...base }).success).toBe(true);
  });
});

describe('otpVerifySchema', () => {
  it('requires a 6-digit code', () => {
    expect(otpVerifySchema.safeParse({ phone: '+60123456789', code: '123456' }).success).toBe(true);
    expect(otpVerifySchema.safeParse({ phone: '+60123456789', code: '12345' }).success).toBe(false);
  });
});

describe('configureSessionSchema', () => {
  it('rejects negative qty and a bad cut-off, accepts a valid config', () => {
    expect(configureSessionSchema.safeParse({ qty_total: -1, cutoff_time: '18:00', delivery_window: 'x', active_zone_ids: [] }).success).toBe(false);
    expect(configureSessionSchema.safeParse({ qty_total: 10, cutoff_time: 'bad', delivery_window: 'x', active_zone_ids: [] }).success).toBe(false);
    expect(configureSessionSchema.safeParse({ qty_total: 10, cutoff_time: '18:00', delivery_window: '2–7 PM', active_zone_ids: [uuid] }).success).toBe(true);
  });
});
