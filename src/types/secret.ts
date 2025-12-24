export interface Secret {
  id: string;
  name: string;
  username: string;
  password: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface EncryptedVault {
  encryptedData: string;
  iv: string;
  salt: string;
}

export interface VaultData {
  secrets: Secret[];
  version: number;
}
