import bcrypt from "bcryptjs";

/**
 * Enterprise Cryptographic Password Management & Verification Service
 * Conforms to SOC2 / ISO 27001 password storage standards using salted bcrypt hashes.
 */

export const INITIAL_HASHED_PASSWORDS = {
  lorenz: "$2b$10$gEyrrMquYumofTrT65FMHO4HmNTN9uJ.mpr3AM0biPpAu2yS9sr7a",
  renz: "$2b$10$RiwWeppTKX5mI2882FB3UuaINSYII4fZ1AFOZl2DYpozIpXHUMepW",
  janine: "$2b$10$.5cIzCXbjAx0nVEXFdUKAejW3KP8uPO6fgLDxg4Q4BjNvyuLyUu4u",
  sheila: "$2b$10$oqZQdcvaXXDGnRk2Dy3zWu1gErhO/tFMLy8JHWA4gZyjYqZFwTjjG",
  charles: "$2b$10$tGk58AFc3YYHUN6Wa6PH6.HtajKj9Z3tQcIunvDq5P56oDnxgiWpi",
  jordan: "$2b$10$isSJ.2GJUECohpbvzTv7HOUJMuhXtkFRBxmtC2Uled2Pntq.QcEUa",
  lourence: "$2b$10$ej23cOAcTtnsmCCnii5.ruLJ6vTl5IcQzQv7EWxzl6XgMkGj3fe2q",
  aira: "$2b$10$lXgsRRanu.RVDgbMpUQrJuZewT9o0Ci23llTjTe0dPEaG6QJfF7Ie",
  chef: "$2b$10$lFPKODct0k035ageVu5IOOoVGNZbQAuAfyt1YOZA8LiHSPguwlSze",
  driver: "$2b$10$2UJJzt0R5MzL9vj8/NcXmuQ9oLfjnel65gP8u1HvTQcBLItSi9KbC",
  unmask: "$2b$10$Zusb6Hj3I5HD60QaGLNNweWRiGF2vG/FqF43I8KySoxt5KXbO7nVC"
};

/**
 * Hashes a plaintext password with a cryptographically secure 10-round salt
 */
export function hashPassword(plainPassword: string): string {
  if (!plainPassword) return "";
  // If already hashed, don't double hash
  if (isPasswordHashed(plainPassword)) {
    return plainPassword;
  }
  return bcrypt.hashSync(plainPassword, 10);
}

/**
 * Asynchronously hashes a plaintext password
 */
export async function hashPasswordAsync(plainPassword: string): Promise<string> {
  if (!plainPassword) return "";
  if (isPasswordHashed(plainPassword)) {
    return plainPassword;
  }
  return bcrypt.hash(plainPassword, 10);
}

/**
 * Verifies a plaintext password against a stored bcrypt hash or legacy string
 */
export function verifyPassword(plainPassword: string, storedHashOrPlain: string): boolean {
  if (!plainPassword || !storedHashOrPlain) return false;

  // If the stored value is a valid bcrypt hash
  if (isPasswordHashed(storedHashOrPlain)) {
    try {
      return bcrypt.compareSync(plainPassword, storedHashOrPlain);
    } catch (err) {
      console.error("[Auth] Bcrypt comparison error:", err);
      return false;
    }
  }

  // Graceful fallback for legacy plain text passwords in local storage
  return plainPassword === storedHashOrPlain;
}

/**
 * Checks whether a given string is a standard bcrypt hash
 */
export function isPasswordHashed(value: string): boolean {
  if (!value || typeof value !== "string") return false;
  return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);
}
