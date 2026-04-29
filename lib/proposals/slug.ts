import { customAlphabet } from 'nanoid';

// Lowercase alphanumerics, no easily-confused chars.
// 24 chars * log2(34) ≈ 122 bits of entropy — unguessable.
const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
const generate = customAlphabet(alphabet, 24);

export function generateSlug(): string {
  return generate();
}
