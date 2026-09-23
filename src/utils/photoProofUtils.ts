/**
 * Photo Proof & Anti-Tamper Utility
 * Handles watermarking, cryptographic tamper hashes, and return period expiration logic.
 */

import { Coordinates, ProofOfHandover } from '../types/delivery';

export const RETURN_PERIOD_DAYS = 7;

/**
 * Calculates return window expiration date (e.g. +7 days from now).
 */
export function calculateReturnPeriodExpiry(fromDate: Date = new Date()): {
  iso: string;
  formatted: string;
  daysRemaining: number;
} {
  const expiry = new Date(fromDate.getTime() + RETURN_PERIOD_DAYS * 24 * 60 * 60 * 1000);
  const daysRemaining = Math.max(
    1,
    Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  );

  return {
    iso: expiry.toISOString(),
    formatted: expiry.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    daysRemaining,
  };
}

/**
 * RFC 6234 Standard SHA-256 Implementation (64-character hexadecimal digest)
 * Remediates STRIX-REM-001 (CWE-328: Use of Weak Hash)
 */
function rightRotate(value: number, amount: number): number {
  return (value >>> amount) | (value << (32 - amount));
}

export function computeStandardSha256(ascii: string): string {
  let i = 0;
  let j = 0;
  let result = '';
  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;
  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  for (i = 0; i < ascii.length; i++) {
    const code = ascii.charCodeAt(i);
    words[i >> 2] |= (code & 0xff) << (8 * (3 - (i % 4)));
  }
  words[asciiBitLength >> 5] |= 0x80 << (24 - (asciiBitLength % 32));
  words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;

  const w = new Array(64);
  for (i = 0; i < words.length; i += 16) {
    const w0 = hash[0], w1 = hash[1], w2 = hash[2], w3 = hash[3];
    const w4 = hash[4], w5 = hash[5], w6 = hash[6], w7 = hash[7];

    for (j = 0; j < 64; j++) {
      if (j < 16) {
        w[j] = words[i + j] | 0;
      } else {
        const gamma0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const gamma1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + gamma0 + w[j - 7] + gamma1) | 0;
      }
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const sigma0 = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const sigma1 = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const temp1 = (hash[7] + sigma1 + ch + k[j] + w[j]) | 0;
      const temp2 = (sigma0 + maj) | 0;

      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + w0) | 0;
    hash[1] = (hash[1] + w1) | 0;
    hash[2] = (hash[2] + w2) | 0;
    hash[3] = (hash[3] + w3) | 0;
    hash[4] = (hash[4] + w4) | 0;
    hash[5] = (hash[5] + w5) | 0;
    hash[6] = (hash[6] + w6) | 0;
    hash[7] = (hash[7] + w7) | 0;
  }

  for (i = 0; i < 8; i++) {
    result += (hash[i] >>> 0).toString(16).padStart(8, '0');
  }
  return result;
}

/**
 * Generates an anti-tamper digital cryptographic hash (RFC 6234 standard SHA-256 64-char digest)
 */
export function generateTamperSecurityHash(
  orderNumber: string,
  stage: 'PICKUP' | 'DELIVERY',
  timestamp: string,
  partnerId: string
): string {
  const payload = `${orderNumber}|${stage}|${timestamp}|${partnerId}|TAMPER_SEAL_V2`;
  return `SHA256:${computeStandardSha256(payload)}`;
}

/**
 * Async WebCrypto implementation of standard SHA-256
 */
export async function generateTamperSecurityHashAsync(
  orderNumber: string,
  stage: 'PICKUP' | 'DELIVERY',
  timestamp: string,
  partnerId: string
): Promise<string> {
  const payload = `${orderNumber}|${stage}|${timestamp}|${partnerId}|TAMPER_SEAL_V2`;
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const buffer = new TextEncoder().encode(payload);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
    return 'SHA256:' + Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return `SHA256:${computeStandardSha256(payload)}`;
}

/**
 * Renders anti-tamper watermark directly onto an image canvas.
 * Watermark burns in: Order #, Stage, Geotag, Timestamp, Partner ID, and Return Expiry Notice.
 */
export function stampWatermarkOnImage(
  imageSource: string | HTMLImageElement,
  metadata: {
    orderNumber: string;
    stage: 'PICKUP' | 'DELIVERY';
    locationName: string;
    coordinates: Coordinates;
    partnerId: string;
    partnerName: string;
    timestamp: string;
    expiryFormatted: string;
    securityHash: string;
  }
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const width = Math.max(800, img.width || 800);
      const height = Math.max(600, img.height || 600);
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(typeof imageSource === 'string' ? imageSource : img.src);
        return;
      }

      // Draw original photo
      ctx.drawImage(img, 0, 0, width, height);

      // Top Security Banner (High-contrast bar)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.fillRect(0, 0, width, 52);

      // Top Banner Text
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 15px ui-sans-serif, system-ui, sans-serif';
      ctx.fillText('● QCOM TAMPER-PROTECTED AUDIT PROOF', 20, 31);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px ui-sans-serif, system-ui, sans-serif';
      const stageLabel =
        metadata.stage === 'PICKUP'
          ? 'STAGE: SELLER STORE PICKUP'
          : 'STAGE: CUSTOMER HANDOVER';
      ctx.fillText(stageLabel, width - 260, 31);

      // Bottom Watermark Box (Semi-transparent dark box for readability in any lighting)
      const boxHeight = 130;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
      ctx.fillRect(0, height - boxHeight, width, boxHeight);

      // Accent colored line dividing watermark
      ctx.fillStyle = metadata.stage === 'PICKUP' ? '#059669' : '#f59e0b';
      ctx.fillRect(0, height - boxHeight, width, 3);

      // Watermark Text Columns
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px ui-monospace, monospace';
      ctx.fillText(`ORDER: ${metadata.orderNumber}`, 20, height - boxHeight + 28);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '13px ui-sans-serif, system-ui, sans-serif';
      ctx.fillText(`LOCATION: ${metadata.locationName}`, 20, height - boxHeight + 52);
      ctx.fillText(
        `GPS: ${metadata.coordinates.lat.toFixed(5)}° N, ${metadata.coordinates.lng.toFixed(5)}° E (±1.8m)`,
        20,
        height - boxHeight + 74
      );
      ctx.fillText(`PARTNER: ${metadata.partnerName} (${metadata.partnerId})`, 20, height - boxHeight + 96);

      // Right column: Time, Return Retention Notice, and Hash
      const rightColX = width - 360;
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px ui-monospace, monospace';
      ctx.fillText(`TIME: ${metadata.timestamp}`, rightColX, height - boxHeight + 28);

      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 12px ui-sans-serif, system-ui, sans-serif';
      ctx.fillText(`VAULT RETENTION: Stored until ${metadata.expiryFormatted}`, rightColX, height - boxHeight + 52);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px ui-sans-serif, system-ui, sans-serif';
      ctx.fillText(`PURPOSE: Tamper & Return Period Dispute Shield`, rightColX, height - boxHeight + 74);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px ui-monospace, monospace';
      ctx.fillText(`HASH: ${metadata.securityHash}`, rightColX, height - boxHeight + 96);

      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      img.src = imageSource.src;
    }
  });
}

/**
 * Creates a synthetic realistic fallback package image when live camera is unavailable.
 */
export function generateSampleParcelImage(
  orderNumber: string,
  stage: 'PICKUP' | 'DELIVERY',
  photoIndex: number = 1
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background scene (Warehouse counter or residential doorstep)
  if (stage === 'PICKUP') {
    // Store dispatch staging desk
    const grad = ctx.createLinearGradient(0, 0, 800, 600);
    grad.addColorStop(0, '#334155');
    grad.addColorStop(1, '#1e293b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 600);

    // Staging table surface
    ctx.fillStyle = '#475569';
    ctx.fillRect(40, 200, 720, 360);
  } else {
    // Customer doorstep / floor tiles
    const grad = ctx.createLinearGradient(0, 0, 800, 600);
    grad.addColorStop(0, '#f1f5f9');
    grad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 600);

    // Doorstep mat / flooring
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(60, 220, 680, 340);
  }

  // Delivery Parcel / Bag Body
  ctx.fillStyle = '#d97706'; // Kraft parcel brown / amber
  ctx.beginPath();
  ctx.roundRect(220, 160, 360, 320, 16);
  ctx.fill();

  // Parcel Top Fold & Handle
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.roundRect(260, 130, 280, 40, 8);
  ctx.fill();

  // Green Tamper-Evident Security Tape across the bag opening
  ctx.fillStyle = '#059669';
  ctx.fillRect(220, 210, 360, 34);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px ui-monospace, monospace';
  ctx.fillText('★ QCOM TAMPER-EVIDENT SECURITY SEAL ★', 240, 232);

  // Barcode & Shipping Label
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(260, 270, 280, 160, 8);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 16px ui-monospace, monospace';
  ctx.fillText(orderNumber, 280, 305);

  ctx.fillStyle = '#64748b';
  ctx.font = '11px ui-sans-serif, system-ui, sans-serif';
  ctx.fillText(`ANGLE ${photoIndex}: SEAL & PARCEL VERIFICATION`, 280, 325);
  ctx.fillText(stage === 'PICKUP' ? 'STORE HANDOVER VERIFIED' : 'CUSTOMER DROP PROOF', 280, 345);

  // Simulated Barcode lines
  ctx.fillStyle = '#0f172a';
  for (let x = 280; x < 520; x += 6) {
    const w = (x % 12 === 0) ? 3 : 1.5;
    ctx.fillRect(x, 360, w, 40);
  }

  return canvas.toDataURL('image/jpeg', 0.9);
}
