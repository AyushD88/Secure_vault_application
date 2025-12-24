import { UnlockVault } from "./components/UnlockVault";
import { Vault } from "./components/Vault";
import { useVault, VaultProvider } from "./context/vaultContext";

function VaultApp() {
  const { isLocked } = useVault();

  return isLocked ? <UnlockVault /> : <Vault />;
}

function App() {
  return (
    <VaultProvider>
      <VaultApp />
    </VaultProvider>
  );
}

export default App;
