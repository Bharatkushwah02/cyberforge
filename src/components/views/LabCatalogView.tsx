import React from 'react';
import { useStore } from '../../context/StoreContext';
import { LABS } from '../../lib/mockData';
import {
  BugIcon,
  CheckCircleIcon,
  CodeIcon,
  SparklesIcon,
  ArrowRightIcon,
  LockIcon,
} from '../ui/Icons';

export function LabCatalogView() {
  const {
    solvedLabs,
    setActiveLabId,
    setIsSourceModalOpen,
    setIsSolutionDrawerOpen,
    resetAllProgress,
  } = useStore();

  const solvedCount = solvedLabs.length;
  const progressPercent = Math.round((solvedCount / LABS.length) * 100);

  return (
    <div className="w-full space-y-10">
      {/* Academy Hero Header */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950/40 border border-zinc-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>PORTSWIGGER & JUICE SHOP STYLE RANGE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Interactive E-Commerce Vulnerability Academy
            </h1>
            <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Hands-on cybersecurity labs designed for beginners. Practice real web exploitation techniques inside a functional e-commerce environment.
            </p>
          </div>

          {/* Progress Card */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 min-w-[220px]">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400 font-semibold">LABS SOLVED</span>
              <span className="text-emerald-400 font-bold">{solvedCount} / {LABS.length}</span>
            </div>

            <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <span>Progress: {progressPercent}%</span>
              {solvedCount === LABS.length && (
                <span className="text-emerald-400 font-bold">ALL SOLVED! 🏆</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Labs Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Available Security Challenges (5 Labs)
          </h2>
          <button
            onClick={resetAllProgress}
            className="text-xs font-mono text-zinc-400 hover:text-red-400 transition cursor-pointer"
          >
            Reset All Labs Progress
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {LABS.map((lab) => {
            const isSolved = solvedLabs.includes(lab.id);

            return (
              <div
                key={lab.id}
                className={`p-6 sm:p-8 rounded-3xl border bg-zinc-900/90 shadow-xl transition hover:border-zinc-700 flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                  isSolved
                    ? 'border-emerald-500/60 bg-emerald-950/10'
                    : 'border-zinc-800'
                }`}
              >
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                      LAB 0{lab.number}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                      {lab.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-mono text-zinc-300 bg-zinc-900 border border-zinc-700">
                      {lab.difficulty}
                    </span>
                    {isSolved ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold font-mono">
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                        <span>SOLVED</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-xs font-mono">
                        <span>NOT SOLVED</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    {lab.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    <span className="text-emerald-400 font-mono font-bold">OBJECTIVE: </span>
                    {lab.objective}
                  </p>

                  <div className="text-xs font-mono text-zinc-500">
                    Target Endpoint: <code className="text-zinc-400">{lab.targetEndpoint}</code>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end space-x-3 md:space-x-0 md:space-y-2.5 shrink-0">
                  <button
                    onClick={() => setActiveLabId(lab.id)}
                    className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs font-mono transition cursor-pointer flex items-center justify-center space-x-2 shadow-md shadow-emerald-500/20"
                  >
                    <span>Launch Target</span>
                    <ArrowRightIcon className="w-4 h-4 text-zinc-950" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveLabId(lab.id);
                      setIsSourceModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-mono transition cursor-pointer flex items-center space-x-1.5 border border-zinc-700"
                  >
                    <CodeIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>View Source (DVWA)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
