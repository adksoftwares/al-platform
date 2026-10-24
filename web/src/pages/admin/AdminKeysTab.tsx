import React, { useEffect, useState } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { Key, Plus, Copy, Check, Loader2 } from 'lucide-react';
import { database } from '../../config/firebase';
import type { AccessCode } from '../../types';

export const AdminKeysTab: React.FC = () => {
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const codesRef = ref(database, 'admin_settings/premium_codes');
    const unsubscribe = onValue(codesRef, (snapshot) => {
      const list: AccessCode[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const val = child.val();
          if (val) {
            list.push({
              code: child.key || '',
              isUsed: Boolean(val.isUsed),
              usedBy: val.usedBy || '',
              usedAt: val.usedAt || 0,
            });
          }
        });
      }
      setCodes(list.sort((a, b) => (b.usedAt || 0) - (a.usedAt || 0)));
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const generateRandomCodes = (count: number = 10): string[] => {
    if (!globalThis.crypto?.getRandomValues) {
      throw new Error('Secure random generation is unavailable in this browser.');
    }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const existing = new Set(codes.map((item) => item.code));
    const generated = new Set<string>();

    while (generated.size < count) {
      const bytes = new Uint8Array(12);
      globalThis.crypto.getRandomValues(bytes);
      // 36 * 7 = 252; rejecting bytes 252-255 avoids modulo bias.
      if (bytes.some((byte) => byte >= 252)) continue;
      const code = Array.from(bytes, (byte) => chars[byte % chars.length]).join('');
      if (!existing.has(code)) generated.add(code);
    }
    return [...generated];
  };

  const handleGenerate10 = async () => {
    setIsGenerating(true);
    try {
      const newCodes = generateRandomCodes(10);
      const updates: Record<string, any> = {};
      newCodes.forEach((c) => {
        updates[c] = {
          isUsed: false,
          usedBy: '',
          usedAt: 0,
        };
      });

      await update(ref(database, 'admin_settings/premium_codes'), updates);
      showToast('10 New Premium Access Codes Generated!');
    } catch (err: any) {
      showToast('Error generating codes: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyUnused = () => {
    const unused = codes.filter((c) => !c.isUsed).map((c) => c.code).join('\n');
    if (unused) {
      navigator.clipboard.writeText(unused);
      showToast('All unused codes copied to clipboard!');
    } else {
      showToast('No unused codes found.');
    }
  };

  const handleCopySingle = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 rounded-xl bg-brand-600/20 border border-brand-500/40 text-brand-300 text-xs font-semibold flex items-center justify-between shadow-lg">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Actions header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Access Codes Generator</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate and manage single-use 12-character license keys for manual sale or Gumroad.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleGenerate10}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            <span>Generate 10</span>
          </button>

          <button
            onClick={handleCopyUnused}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Unused</span>
          </button>
        </div>
      </div>

      {/* Codes Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin mb-2" />
          <p className="text-xs text-slate-400">Loading access codes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {codes.map((item) => (
            <div
              key={item.code}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800/90 flex items-center justify-between gap-3 shadow-md"
            >
              <div className="flex items-center space-x-3 truncate">
                <div className="p-2 bg-slate-800 text-slate-400 rounded-xl shrink-0">
                  <Key className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="font-mono font-bold text-sm tracking-wider text-white block truncate">
                    {item.code}
                  </span>
                  <div className="mt-1">
                    {item.isUsed ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30">
                        USED {item.usedBy ? `(${item.usedBy.substring(0, 6)}...)` : ''}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        UNUSED
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleCopySingle(item.code)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="Copy Code"
              >
                {copiedCode === item.code ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}

          {codes.length === 0 && (
            <div className="col-span-full p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-400 text-xs">
              No access codes generated yet. Click "Generate 10" above to create codes.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
