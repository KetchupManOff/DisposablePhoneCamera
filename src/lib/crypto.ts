/**
 * Chiffrement / déchiffrement de base pour les photos stockées localement.
 * V1 : encodage XOR simple avec une clé dérivée (pas de sécurité forte,
 * juste de l'obfuscation pour l'expérience "verrouillée").
 *
 * Dans une V2, on pourra utiliser Web Crypto API (SubtleCrypto) avec
 * un mot de passe utilisateur ou un PIN.
 */

function getKey(): string {
  // Clé dérivée du domaine + user agent (simple obfuscation)
  return `dispo-cam-${navigator.userAgent.length}`;
}

/** Encode une string base64 en la "chiffrant" via XOR */
export function encrypt(dataUrl: string): string {
  const key = getKey();
  let result = '';
  for (let i = 0; i < dataUrl.length; i++) {
    result += String.fromCharCode(
      dataUrl.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  // Encode en base64 pour éviter les caractères binaires dans IndexedDB
  return btoa(result);
}

/** Décode une string chiffrée */
export function decrypt(encrypted: string): string {
  const key = getKey();
  const decoded = atob(encrypted);
  let result = '';
  for (let i = 0; i < decoded.length; i++) {
    result += String.fromCharCode(
      decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return result;
}