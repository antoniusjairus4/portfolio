'use client';

import React, { useState } from 'react';
import { VentureItem } from '@/content/ventures';
import { VENTURE_THEMES } from '@/content/ventureThemes';

interface TamperBlock {
  id: number;
  data: string;
  prevHash: string;
  hash: string;
}

async function calcHash(id: number, data: string, prevHash: string): Promise<string> {
  const msg = `${id}-${data}-${prevHash}`;
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    // Basic fallback for non-subtle crypto test environments
    let h = 0;
    for (let i = 0; i < msg.length; i++) h = (Math.imul(31, h) + msg.charCodeAt(i)) | 0;
    return Math.abs(h).toString(16).padStart(16, '0');
  }
  const encoder = new TextEncoder();
  const buffer = await window.crypto.subtle.digest('SHA-256', encoder.encode(msg));
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
}

const INITIAL_BLOCKS = [
  { id: 1, data: 'Genesis Block: Asset Genesis $100,000' },
  { id: 2, data: 'Tx #102: Transfer 4.5 BTC to Escrow' },
  { id: 3, data: 'Tx #103: Settle Ledger Balance $24,500' },
  { id: 4, data: 'Tx #104: Asset Verification Approved' },
  { id: 5, data: 'Tx #105: Final Ledger Checkpoint' },
];

export const PalindromeDemo: React.FC<{ venture: VentureItem }> = ({ venture }) => {
  const theme = VENTURE_THEMES[venture.themeKey];
  const [blocks, setBlocks] = useState<TamperBlock[]>([]);
  const [editedIndex, setEditedIndex] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  const initBlocks = React.useCallback(async () => {
    setEditedIndex(null);
    const list: TamperBlock[] = [];
    let prev = '0000000000000000';
    for (const item of INITIAL_BLOCKS) {
      const hash = await calcHash(item.id, item.data, prev);
      list.push({ id: item.id, data: item.data, prevHash: prev, hash });
      prev = hash;
    }
    setBlocks(list);
    setIsReady(true);
  }, []);

  React.useEffect(() => {
    initBlocks();
  }, [initBlocks]);

  const handleEdit = async (idx: number, newData: string) => {
    const updated = [...blocks];
    updated[idx] = { ...updated[idx], data: newData };

    // Recompute target block hash
    const targetPrev = idx === 0 ? '0000000000000000' : updated[idx - 1].hash;
    updated[idx].hash = await calcHash(updated[idx].id, newData, targetPrev);

    setBlocks(updated);
    setEditedIndex(idx);
  };

  if (!isReady) return <div className="p-8 text-center opacity-50">Loading ledger demo...</div>;

  return (
    <div
      className="w-full max-w-2xl mx-auto p-6 md:p-8 rounded-2xl border transition-colors duration-300"
      style={{
        backgroundColor: theme.surface,
        borderColor: `${theme.text}20`,
        color: theme.text,
        fontFamily: theme.fontFamily,
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b" style={{ borderColor: `${theme.text}15` }}>
        <div>
          <h4 className="text-xl font-bold tracking-tight">Ledger Integrity Sandbox</h4>
          <p className="text-xs opacity-75 mt-0.5">
            Interactive mechanism demonstration (SHA-256 Web Crypto hash-chaining).
          </p>
        </div>
        <button
          onClick={initBlocks}
          className="px-4 py-2 text-xs font-semibold rounded-full transition-all focus-visible:outline-none"
          style={{
            backgroundColor: theme.accent,
            color: theme.onAccent,
          }}
        >
          Reset Ledger
        </button>
      </div>

      <div className="space-y-4" role="region" aria-label="Ledger chain tamper test">
        {blocks.map((blk, idx) => {
          const isBroken = editedIndex !== null && idx > editedIndex;
          const isTarget = editedIndex === idx;

          return (
            <div
              key={blk.id}
              className="p-4 rounded-xl border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
              style={{
                backgroundColor: isBroken ? `${theme.danger}10` : `${theme.bg}`,
                borderColor: isBroken ? theme.danger : isTarget ? theme.accent : `${theme.text}15`,
              }}
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold opacity-60">BLOCK #{blk.id}</span>
                  {isBroken && (
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{ backgroundColor: theme.danger, color: '#FFFFFF' }}
                    >
                      CHAIN BROKEN
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={blk.data}
                  onChange={(e) => handleEdit(idx, e.target.value)}
                  className="w-full text-sm font-medium bg-transparent border-b border-transparent focus:border-current focus:outline-none py-1"
                  style={{ color: isBroken ? theme.danger : theme.text }}
                  aria-label={`Block ${blk.id} transaction content`}
                />
              </div>

              <div className="font-mono text-[11px] space-y-0.5 md:text-right shrink-0">
                <div className="opacity-50">Prev: {blk.prevHash}</div>
                <div className="font-semibold" style={{ color: isBroken ? theme.danger : theme.accent }}>
                  Hash: {blk.hash}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editedIndex !== null && (
        <div
          className="mt-6 p-3 rounded-lg text-xs font-medium flex items-center justify-between"
          style={{ backgroundColor: `${theme.danger}15`, color: theme.danger }}
          role="alert"
        >
          <span>Chain broken at block {editedIndex + 2}! Downstream hash validation failed.</span>
          <button onClick={initBlocks} className="underline font-bold hover:opacity-80">
            Restore Chain
          </button>
        </div>
      )}
    </div>
  );
};
