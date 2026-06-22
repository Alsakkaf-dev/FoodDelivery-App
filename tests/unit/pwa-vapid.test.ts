import { describe, it, expect } from 'vitest';
import { urlBase64ToUint8Array } from '@/components/pwa/push-optin';

// The VAPID public key is base64url-encoded; pushManager.subscribe needs the raw
// bytes as a Uint8Array. Verify the conversion (padding + url-safe alphabet).
describe('urlBase64ToUint8Array', () => {
  it('decodes a padded-stripped base64url string to its bytes', () => {
    // "Hello" → base64 "SGVsbG8=" → base64url (no pad) "SGVsbG8"
    const out = urlBase64ToUint8Array('SGVsbG8');
    expect(Array.from(out)).toEqual([72, 101, 108, 108, 111]);
  });

  it('maps the url-safe alphabet (- _) back to (+ /)', () => {
    // bytes [251, 239, 190] → base64 "++++"? use a known url-safe vector:
    // base64url "-_8" == base64 "+/8" == bytes [251, 255]
    const out = urlBase64ToUint8Array('-_8');
    expect(Array.from(out)).toEqual([251, 255]);
  });

  it('returns a Uint8Array of the expected length for a realistic key', () => {
    // A P-256 uncompressed public key is 65 bytes.
    const key = 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM';
    const out = urlBase64ToUint8Array(key);
    expect(out).toBeInstanceOf(Uint8Array);
    expect(out.length).toBe(65);
  });
});
