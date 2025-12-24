import { useState } from "react";
import { SecretForm } from "./SecretForm";
import { SecretList } from "./SecretList";
import { Lock, Plus, Shield, Search } from "lucide-react";
import { useVault } from "../context/vaultContext";

export function Vault() {
  const { lock, secrets } = useVault();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSecrets = secrets.filter(
    (secret) =>
      secret.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      secret.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-slate-800 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Secure Vault
                </h1>
                <p className="text-sm text-slate-600">
                  {secrets.length} {secrets.length === 1 ? "secret" : "secrets"}{" "}
                  stored
                </p>
              </div>
            </div>

            <button
              onClick={lock}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition font-medium"
            >
              <Lock className="w-4 h-4" />
              Lock Vault
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search secrets by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
            />
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            Add Secret
          </button>
        </div>

        {searchQuery && filteredSecrets.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No results found
            </h3>
            <p className="text-slate-600">Try a different search term</p>
          </div>
        ) : (
          <SecretList />
        )}

        {showForm && <SecretForm onClose={() => setShowForm(false)} />}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-3">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-xs text-slate-500 text-center">
            All data is encrypted using AES-256-GCM and stored locally in your
            browser. Vault automatically locks on page refresh or tab close.
          </p>
        </div>
      </footer>
    </div>
  );
}
