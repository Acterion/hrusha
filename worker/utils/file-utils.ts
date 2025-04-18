/**
 * Calculates SHA-256 hash of a file
 * @param file The file to hash
 * @returns Hex string of the hash
 */
export async function calculateFileHash(
  file: File | ArrayBuffer
): Promise<string> {
  // If we received a File object, get its ArrayBuffer
  const buffer = file instanceof File ? await file.arrayBuffer() : file;

  // Use the subtle crypto API to calculate a SHA-256 hash
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);

  // Convert the hash to a hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
