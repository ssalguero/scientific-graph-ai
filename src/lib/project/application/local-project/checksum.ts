/** SHA-256 hex — works in browser (Web Crypto) and Node (dynamic import). */
export const computeEnvelopeChecksum = async (
  envelopeJson: string
): Promise<string> => {
  if (typeof globalThis.crypto?.subtle !== "undefined") {
    const buffer = await globalThis.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(envelopeJson)
    );
    return Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(envelopeJson, "utf8").digest("hex");
};

/** Synchronous SHA-256 for Node unit tests only. */
export const computeEnvelopeChecksumNode = (envelopeJson: string): string => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createHash } = require("node:crypto") as typeof import("node:crypto");
  return createHash("sha256").update(envelopeJson, "utf8").digest("hex");
};

export const verifyEnvelopeChecksum = (
  envelopeJson: string,
  checksum: string | undefined
): "VALID" | "CHECKSUM_FAILED" | "NOT_VERIFIED" => {
  if (!checksum) {
    return "NOT_VERIFIED";
  }
  const computed = computeEnvelopeChecksumNode(envelopeJson);
  return computed === checksum ? "VALID" : "CHECKSUM_FAILED";
};
