const crypto = require("crypto");
const { machineId } = require("node-machine-id");

/**
 * 4. Validate a machine file
 * https://github.com/keygen-sh/example-node-cryptographic-license-files
 * @param {string} KEYGEN_PUBLIC_KEY
 * @param {string} machineFile
 * @param {string} license_key
 */
export default async function validateMachineFile(
  KEYGEN_PUBLIC_KEY,
  machineFile,
  license_key
) {
  const fingerprint = await machineId();

  // Sanity checks for public key
  if (!KEYGEN_PUBLIC_KEY) {
    throw new Error("DER-encoded Ed25519 public key is required");
  }

  if (!machineFile) {
    throw new Error("License file is required");
  }

  if (!license_key) {
    throw new Error("License key is required");
  }

  const encodedPayload = machineFile.replace(
    /-----(?:BEGIN|END) MACHINE FILE-----\n?/g,
    ""
  );

  const decodedPayload = Buffer.from(encodedPayload, "base64").toString();
  const payload = JSON.parse(decodedPayload);

  const { enc, sig, alg } = payload;
  if (alg !== "aes-256-gcm+ed25519") {
    throw new Error(`License file algorithm is not supported: ${alg}`);
  }

  // Format is good
  console.log(`License file format is valid!`);

  const decodedPublicKey = Buffer.from(KEYGEN_PUBLIC_KEY, "base64");

  const publicKey = crypto.createPublicKey({
    key: decodedPublicKey,
    format: "der",
    type: "spki",
  });
  const signatureBytes = Buffer.from(sig, "base64");
  const dataBytes = Buffer.from(`machine/${enc}`);
  const ok = crypto.verify(null, dataBytes, publicKey, signatureBytes);

  if (!ok) {
    throw new Error(`License file signature verification failed!`);
  }

  // Signature is good
  console.log(`License file signature is valid!`);

  const [ciphertext, iv, tag] = enc.split(".");
  const digest = crypto
    .createHash("sha256")
    .update(license_key + fingerprint)
    .digest();
  const aes = crypto.createDecipheriv(
    "aes-256-gcm",
    digest,
    Buffer.from(iv, "base64")
  );

  aes.setAuthTag(Buffer.from(tag, "base64"));
  aes.setAAD(Buffer.from(""));

  let plaintext = aes.update(Buffer.from(ciphertext, "base64"), null, "utf-8");
  plaintext += aes.final("utf8");

  // Decryption succeeded
  console.log(`License file decrypted!`);

  const { meta, data, included } = JSON.parse(plaintext);
  const { issued, expiry } = meta;
  if (
    new Date(issued).getTime() > Date.now() ||
    new Date(expiry).getTime() < Date.now()
  ) {
    throw new Error(`License file has expired`);
  }

  console.log(`License file:`);
  console.log(JSON.stringify({ meta, data, included }, null, 2));
  process.exit(0);
}
