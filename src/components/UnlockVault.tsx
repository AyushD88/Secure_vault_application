import { useState } from "react";
import { Lock, KeyRound } from "lucide-react";
import { useVault } from "../context/vaultContext";

export function UnlockVault() {
  const { vaultExists, createVault, unlock, error, clearError } = useVault();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!password) {
      return;
    }

    if (!vaultExists && isCreating) {
      if (password !== confirmPassword) {
        return;
      }
    }

    setLoading(true);

    try {
      if (vaultExists) {
        await unlock(password);
      } else {
        await createVault(password);
      }
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-slate-100 p-4 rounded-full">
              <Lock className="w-12 h-12 text-slate-700" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">
            Secure Vault
          </h1>
          <p className="text-center text-slate-600 mb-8">
            {vaultExists
              ? "Enter your master password to unlock"
              : "Create a master password to secure your vault"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Master Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
                  placeholder="Enter master password"
                  autoFocus
                />
              </div>
            </div>

            {!vaultExists && isCreating && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
                    placeholder="Confirm master password"
                  />
                </div>
                {password &&
                  confirmPassword &&
                  password !== confirmPassword && (
                    <p className="text-red-600 text-sm mt-2">
                      Passwords do not match
                    </p>
                  )}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={
                loading ||
                !password ||
                (!vaultExists && isCreating && password !== confirmPassword)
              }
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : vaultExists ? (
                "Unlock Vault"
              ) : (
                "Create Vault"
              )}
            </button>

            {!vaultExists && !isCreating && (
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="w-full text-slate-600 hover:text-slate-800 font-medium py-2 transition"
              >
                Need to create a vault? Click here
              </button>
            )}
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              Your data is encrypted using AES-256-GCM and stored locally in
              your browser. Never shared or transmitted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
