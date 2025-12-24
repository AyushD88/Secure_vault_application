import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode, ReactElement } from "react";
import {
  vaultExists,
  initializeVault,
  unlockVault,
  addSecret,
  deleteSecret,
} from "../services/vaultStorage";
import type { Secret } from "../types/secret";

interface VaultContextType {
  isLocked: boolean;
  vaultExists: boolean;
  secrets: Secret[];
  error: string | null;
  createVault: (masterPassword: string) => Promise<void>;
  unlock: (masterPassword: string) => Promise<void>;
  lock: () => void;
  addNewSecret: (
    secret: Omit<Secret, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  removeSecret: (secretId: string) => Promise<void>;
  clearError: () => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const [isLocked, setIsLocked] = useState(true);
  const [vaultExistsState, setVaultExistsState] = useState(false);
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [masterPassword, setMasterPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setVaultExistsState(vaultExists());
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      setIsLocked(true);
      setSecrets([]);
      setMasterPassword(null);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const createVault = async (password: string) => {
    try {
      setError(null);
      if (!password) {
        setError("Master password cannot be empty");
        return;
      }
      await initializeVault(password);
      setVaultExistsState(true);
      setMasterPassword(password);
      setSecrets([]);
      setIsLocked(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create vault");
      throw err;
    }
  };

  const unlock = async (password: string) => {
    try {
      setError(null);
      if (!password) {
        setError("Master password cannot be empty");
        return;
      }
      const vaultData = await unlockVault(password);
      setMasterPassword(password);
      setSecrets(vaultData.secrets);
      setIsLocked(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unlock vault");
      throw err;
    }
  };

  const lock = () => {
    setIsLocked(true);
    setSecrets([]);
    setMasterPassword(null);
    setError(null);
  };

  const addNewSecret = async (
    secret: Omit<Secret, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!masterPassword) {
      throw new Error("Vault is locked");
    }
    try {
      setError(null);
      await addSecret(masterPassword, secret);
      const vaultData = await unlockVault(masterPassword);
      setSecrets(vaultData.secrets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add secret");
      throw err;
    }
  };

  const removeSecret = async (secretId: string) => {
    if (!masterPassword) {
      throw new Error("Vault is locked");
    }
    try {
      setError(null);
      await deleteSecret(masterPassword, secretId);
      const vaultData = await unlockVault(masterPassword);
      setSecrets(vaultData.secrets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete secret");
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <VaultContext.Provider
      value={{
        isLocked,
        vaultExists: vaultExistsState,
        secrets,
        error,
        createVault,
        unlock,
        lock,
        addNewSecret,
        removeSecret,
        clearError,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error("useVault must be used within VaultProvider");
  }
  return context;
}
