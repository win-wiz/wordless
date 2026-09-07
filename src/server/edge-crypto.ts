const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";

  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(paddedBase64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function sha256Bytes(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", textEncoder.encode(value));
  return new Uint8Array(digest);
}

async function importAesKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    await sha256Bytes(secret),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
}

export function randomHex(byteLength: number) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

export function randomUuid() {
  return crypto.randomUUID();
}

export async function sha256Hex(value: string) {
  return bytesToHex(await sha256Bytes(value));
}

export async function encryptJson(
  version: string,
  payload: object,
  secret: string,
) {
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await importAesKey(secret),
    textEncoder.encode(JSON.stringify(payload)),
  );
  const encryptedBytes = new Uint8Array(encrypted);
  const authTagLength = 16;

  return [
    version,
    bytesToBase64Url(iv),
    bytesToBase64Url(encryptedBytes.slice(-authTagLength)),
    bytesToBase64Url(encryptedBytes.slice(0, -authTagLength)),
  ].join(".");
}

export async function decryptJson<T>(
  token: string,
  expectedVersion: string,
  secret: string,
) {
  const [tokenVersion, ivPart, authTagPart, encryptedPart] = token.split(".");

  if (
    tokenVersion !== expectedVersion ||
    !ivPart ||
    !authTagPart ||
    !encryptedPart
  ) {
    throw new Error("Invalid daily challenge token format.");
  }

  try {
    const iv = base64UrlToBytes(ivPart);
    const authTag = base64UrlToBytes(authTagPart);
    const encrypted = base64UrlToBytes(encryptedPart);
    const combined = new Uint8Array(encrypted.length + authTag.length);

    combined.set(encrypted, 0);
    combined.set(authTag, encrypted.length);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      await importAesKey(secret),
      combined,
    );
    const payload = JSON.parse(textDecoder.decode(decrypted)) as T;

    return payload;
  } catch {
    throw new Error("Daily challenge token verification failed.");
  }
}
