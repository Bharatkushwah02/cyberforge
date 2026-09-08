import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { LABS } from '../../lib/mockData';
import { SparklesIcon, XIcon, CheckCircleIcon } from '../ui/Icons';

export function SolutionDrawer() {
  const { isSolutionDrawerOpen, setIsSolutionDrawerOpen, activeLabId, addToast } = useStore();
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [copiedPayloadIndex, setCopiedPayloadIndex] = useState<number | null>(null);

  if (!isSolutionDrawerOpen || activeLabId === 'catalog') return null;

  const currentLab = LABS.find((l) => l.id === activeLabId);
  if (!currentLab) return null;

  const toggleHint = (index: number) => {
    if (revealedHints.includes(index)) {
      setRevealedHints(revealedHints.filter((i) => i !== index));
    } else {
      setRevealedHints([...revealedHints, index]);
    }
  };

  const copyPayload = (payload: string, index: number) => {
    navigator.clipboard.writeText(payload);
    setCopiedPayloadIndex(index);
    addToast('Payload Copied!', `"${payload}" copied to clipboard.`, 'info');
    setTimeout(() => setCopiedPayloadIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-900 border-l border-zinc-700 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <SparklesIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-amber-400 uppercase">
                  PortSwigger Academy Guide
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Hints & Solutions
                </h3>
              </div>
            </div>

            <button
              onClick={() => setIsSolutionDrawerOpen(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Overview Card */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <span className="text-[11px] font-mono text-emerald-400 font-semibold tracking-wider uppercase">
                Vulnerability Overview
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {currentLab.overview}
              </p>
            </div>

            {/* Progressive Hints Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold font-mono text-zinc-200 uppercase tracking-wider">
                  Progressive Hints
                </h4>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {revealedHints.length}/{currentLab.hints.length} revealed
                </span>
              </div>

              <div className="space-y-2">
                {currentLab.hints.map((hint, idx) => {
                  const isRevealed = revealedHints.includes(idx);
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-zinc-800 bg-zinc-950/50 overflow-hidden transition"
                    >
                      <button
                        onClick={() => toggleHint(idx)}
                        className="w-full px-4 py-2.5 text-left flex items-center justify-between text-xs font-medium text-zinc-300 hover:text-white cursor-pointer"
                      >
                        <span className="font-mono text-amber-400 font-semibold">
                          💡 Hint {idx + 1}
                        </span>
                        <span className="text-[11px] text-zinc-400 font-mono">
                          {isRevealed ? 'Hide' : 'Click to Reveal'}
                        </span>
                      </button>

                      {isRevealed && (
                        <div className="px-4 pb-3 pt-1 text-xs text-zinc-300 border-t border-zinc-800/60 leading-relaxed bg-amber-950/10">
                          {hint}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick-Copy Exploitation Payloads */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold font-mono text-zinc-200 uppercase tracking-wider">
                Sample Exploit Payloads
              </h4>

              <div className="space-y-2.5">
                {currentLab.samplePayloads.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-zinc-800 bg-zinc-950 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">{item.title}</span>
                      <button
                        onClick={() => copyPayload(item.payload, idx)}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-emerald-400 hover:text-emerald-300 text-[11px] font-mono transition cursor-pointer"
                      >
                        {copiedPayloadIndex === idx ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>

                    <div className="p-2 rounded bg-zinc-900 border border-zinc-800 font-mono text-[11px] text-emerald-300 break-all select-all">
                      {item.payload}
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-tight">
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Step-by-Step Solution Walkthrough */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold font-mono text-zinc-200 uppercase tracking-wider">
                Full Solution Walkthrough
              </h4>

              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 space-y-3">
                {currentLab.solutionSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 text-xs text-zinc-300">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 font-mono text-[10px] font-bold text-emerald-400">
                      {idx + 1}
                    </span>
                    <p className="pt-0.5 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-950/80">
            <button
              onClick={() => setIsSolutionDrawerOpen(false)}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              Close Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
