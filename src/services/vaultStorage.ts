import type { EncryptedVault, Secret, VaultData } from '../types/secret';
import {
  deriveKey,
  encryptData,
  decryptData,
  generateSalt,
  generateIV,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  uint8ArrayToBase64,
  base64ToUint8Array,
} from '../utils/crypto';

const VAULT_STORAGE_KEY = 'encrypted_vault';

export async function initializeVault(masterPassword: string): Promise<void> {
  const salt = await generateSalt();
  const iv = await generateIV();
  const key = await deriveKey(masterPassword, salt);

  const initialVaultData: VaultData = {
    secrets: [],
    version: 1,
  };

  const dataString = JSON.stringify(initialVaultData);
  const encryptedBuffer = await encryptData(dataString, key, iv);

  const encryptedVault: EncryptedVault = {
    encryptedData: arrayBufferToBase64(encryptedBuffer),
    iv: uint8ArrayToBase64(iv),
    salt: uint8ArrayToBase64(salt),
  };

  localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(encryptedVault));
}

export function vaultExists(): boolean {
  return localStorage.getItem(VAULT_STORAGE_KEY) !== null;
}

export async function unlockVault(masterPassword: string): Promise<VaultData> {
  const storedVault = localStorage.getItem(VAULT_STORAGE_KEY);

  if (!storedVault) {
    throw new Error('Vault does not exist');
  }

  const encryptedVault: EncryptedVault = JSON.parse(storedVault);
  const salt = base64ToUint8Array(encryptedVault.salt);
  const iv = base64ToUint8Array(encryptedVault.iv);
  const encryptedData = base64ToArrayBuffer(encryptedVault.encryptedData);

  const key = await deriveKey(masterPassword, salt);

  try {
    const decryptedString = await decryptData(encryptedData, key, iv);
    const vaultData: VaultData = JSON.parse(decryptedString);
    return vaultData;
  } catch (error) {
    throw new Error('Incorrect master password');
  }
}

export async function saveVault(
  masterPassword: string,
  vaultData: VaultData
): Promise<void> {
  const storedVault = localStorage.getItem(VAULT_STORAGE_KEY);

  if (!storedVault) {
    throw new Error('Vault does not exist');
  }

  const encryptedVault: EncryptedVault = JSON.parse(storedVault);
  const salt = base64ToUint8Array(encryptedVault.salt);
  const iv = await generateIV();
  const key = await deriveKey(masterPassword, salt);

  const dataString = JSON.stringify(vaultData);
  const encryptedBuffer = await encryptData(dataString, key, iv);

  const updatedVault: EncryptedVault = {
    encryptedData: arrayBufferToBase64(encryptedBuffer),
    iv: uint8ArrayToBase64(iv),
    salt: encryptedVault.salt,
  };

  localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(updatedVault));
}

export async function addSecret(
  masterPassword: string,
  secret: Omit<Secret, 'id' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  const vaultData = await unlockVault(masterPassword);

  const newSecret: Secret = {
    ...secret,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  vaultData.secrets.push(newSecret);
  await saveVault(masterPassword, vaultData);
}

export async function deleteSecret(
  masterPassword: string,
  secretId: string
): Promise<void> {
  const vaultData = await unlockVault(masterPassword);
  vaultData.secrets = vaultData.secrets.filter((s) => s.id !== secretId);
  await saveVault(masterPassword, vaultData);
}

export async function updateSecret(
  masterPassword: string,
  secretId: string,
  updates: Partial<Omit<Secret, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const vaultData = await unlockVault(masterPassword);
  const secretIndex = vaultData.secrets.findIndex((s) => s.id === secretId);

  if (secretIndex === -1) {
    throw new Error('Secret not found');
  }

  vaultData.secrets[secretIndex] = {
    ...vaultData.secrets[secretIndex],
    ...updates,
    updatedAt: Date.now(),
  };

  await saveVault(masterPassword, vaultData);
}

export function clearVault(): void {
  localStorage.removeItem(VAULT_STORAGE_KEY);
}
