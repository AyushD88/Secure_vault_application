import { useState } from "react";
import { Secret } from "../types/secret";
import { Eye, EyeOff, Copy, Trash2, StickyNote } from "lucide-react";
import { useVault } from "../context/vaultContext";

export function SecretList() {
  const { secrets, removeSecret } = useVault();
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(
    new Set()
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const togglePasswordVisibility = (id: string) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisiblePasswords(newVisible);
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeSecret(id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete secret:", err);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (secrets.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <StickyNote className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          No secrets yet
        </h3>
        <p className="text-slate-600">
          Click "Add Secret" to store your first password securely
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {secrets.map((secret: Secret) => (
        <div
          key={secret.id}
          className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {secret.name}
              </h3>
              <p className="text-sm text-slate-500">
                Added {formatDate(secret.createdAt)}
              </p>
            </div>
            <button
              onClick={() => setDeleteConfirm(secret.id)}
              className="text-slate-400 hover:text-red-600 transition"
              title="Delete secret"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Username
              </label>
              <div className="flex items-center gap-2">
                <p className="flex-1 text-slate-900 font-mono text-sm bg-slate-50 px-3 py-2 rounded-lg">
                  {secret.username}
                </p>
                <button
                  onClick={() =>
                    copyToClipboard(secret.username, `${secret.id}-username`)
                  }
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                  title="Copy username"
                >
                  {copiedId === `${secret.id}-username` ? (
                    <span className="text-green-600 text-xs font-medium">
                      Copied!
                    </span>
                  ) : (
                    <Copy className="w-4 h-4 text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Password
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 text-slate-900 font-mono text-sm bg-slate-50 px-3 py-2 rounded-lg">
                  {visiblePasswords.has(secret.id)
                    ? secret.password
                    : "••••••••••••••••"}
                </div>
                <button
                  onClick={() => togglePasswordVisibility(secret.id)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                  title={
                    visiblePasswords.has(secret.id)
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {visiblePasswords.has(secret.id) ? (
                    <EyeOff className="w-4 h-4 text-slate-600" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-600" />
                  )}
                </button>
                <button
                  onClick={() =>
                    copyToClipboard(secret.password, `${secret.id}-password`)
                  }
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                  title="Copy password"
                >
                  {copiedId === `${secret.id}-password` ? (
                    <span className="text-green-600 text-xs font-medium">
                      Copied!
                    </span>
                  ) : (
                    <Copy className="w-4 h-4 text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            {secret.notes && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Notes
                </label>
                <p className="text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded-lg whitespace-pre-wrap">
                  {secret.notes}
                </p>
              </div>
            )}
          </div>

          {deleteConfirm === secret.id && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-700 mb-3">
                Are you sure you want to delete this secret? This action cannot
                be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(secret.id)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
