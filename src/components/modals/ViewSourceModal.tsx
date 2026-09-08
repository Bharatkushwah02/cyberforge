import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { LABS } from '../../lib/mockData';
import { CodeIcon, XIcon, AlertTriangleIcon, CheckCircleIcon } from '../ui/Icons';

export function ViewSourceModal() {
  const { isSourceModalOpen, setIsSourceModalOpen, activeLabId } = useStore();
  const [activeTab, setActiveTab] = useState<'vulnerable' | 'secure'>('vulnerable');

  if (!isSourceModalOpen || activeLabId === 'catalog') return null;

  const currentLab = LABS.find((l) => l.id === activeLabId);
  if (!currentLab) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CodeIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  DVWA STYLE SOURCE INSPECTOR
                </span>
                <span className="text-xs text-zinc-400 font-mono">Lab {currentLab.number}</span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                {currentLab.title}
              </h3>
            </div>
          </div>

          <button
            onClick={() => setIsSourceModalOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 pb-2 border-b border-zinc-800/80 bg-zinc-950/50 flex space-x-3">
          <button
            onClick={() => setActiveTab('vulnerable')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
              activeTab === 'vulnerable'
                ? 'bg-red-950/60 text-red-300 border border-red-700/60 shadow-sm shadow-red-900/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <AlertTriangleIcon className="w-4 h-4 text-red-400" />
            <span>Vulnerable Backend Code</span>
          </button>

          <button
            onClick={() => setActiveTab('secure')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
              activeTab === 'secure'
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/60 shadow-sm shadow-emerald-900/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
            <span>Patched / Secure Code</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'vulnerable' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="text-red-400 font-semibold">
                  File: {currentLab.vulnerableCode.file}
                </span>
                <span className="text-zinc-500">Language: {currentLab.vulnerableCode.language}</span>
              </div>

              {/* Code block */}
              <div className="relative rounded-xl overflow-hidden bg-zinc-950 border border-red-900/40 p-4 font-mono text-xs text-red-200 leading-relaxed shadow-inner">
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-red-900/40 text-[10px] text-red-300 border border-red-800/50">
                  INSECURE
                </div>
                <pre className="overflow-x-auto whitespace-pre">
                  <code>{currentLab.vulnerableCode.code}</code>
                </pre>
              </div>

              {/* Vulnerability Explanation */}
              <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/40 text-xs text-red-200 space-y-1.5">
                <div className="flex items-center space-x-2 font-bold text-red-300 uppercase tracking-wide">
                  <AlertTriangleIcon className="w-4 h-4 text-red-400" />
                  <span>The Root Cause Flaw</span>
                </div>
                <p className="leading-relaxed text-zinc-300">
                  {currentLab.vulnerableCode.vulnerabilityHighlight}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="text-emerald-400 font-semibold">
                  File: {currentLab.secureCode.file}
                </span>
                <span className="text-zinc-500">Language: {currentLab.secureCode.language}</span>
              </div>

              {/* Secure Code block */}
              <div className="relative rounded-xl overflow-hidden bg-zinc-950 border border-emerald-900/40 p-4 font-mono text-xs text-emerald-200 leading-relaxed shadow-inner">
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-900/40 text-[10px] text-emerald-300 border border-emerald-800/50">
                  DEFENSIVE STANDARD
                </div>
                <pre className="overflow-x-auto whitespace-pre">
                  <code>{currentLab.secureCode.code}</code>
                </pre>
              </div>

              {/* Remediation Explanation */}
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-200 space-y-1.5">
                <div className="flex items-center space-x-2 font-bold text-emerald-300 uppercase tracking-wide">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                  <span>How This Fix Mitigates The Attack</span>
                </div>
                <p className="leading-relaxed text-zinc-300">
                  {currentLab.secureCode.remediationExplanation}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
          <span className="text-xs text-zinc-400 font-mono">
            {activeTab === 'vulnerable' ? '⚠️ Study the bug in the code above' : '🛡️ Standard defensive engineering pattern'}
          </span>
          <button
            onClick={() => setIsSourceModalOpen(false)}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
