import React from 'react';
import { useStore } from '../../context/StoreContext';
import { LABS } from '../../lib/mockData';
import {
  CodeIcon,
  SparklesIcon,
  CheckCircleIcon,
  BugIcon,
  ArrowRightIcon,
} from '../ui/Icons';

export function PortSwiggerBanner() {
  const {
    activeLabId,
    solvedLabs,
    setActiveLabId,
    setIsSourceModalOpen,
    setIsSolutionDrawerOpen,
    setIsInterceptorOpen,
    isInterceptorOpen,
  } = useStore();

  if (activeLabId === 'catalog') {
    return null;
  }

  const currentLab = LABS.find((l) => l.id === activeLabId);
  if (!currentLab) return null;

  const isSolved = solvedLabs.includes(currentLab.id);

  const currentIndex = LABS.findIndex((l) => l.id === activeLabId);
  const nextLab = currentIndex < LABS.length - 1 ? LABS[currentIndex + 1] : null;

  return (
    <div className="w-full bg-black border-b border-zinc-800 sticky top-16 z-30 transition-all duration-300">
      {/* Solved Celebration Header Banner */}
      {isSolved && (
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white px-4 py-2.5 shadow-lg shadow-emerald-500/20 animate-solved">
          <div className="max-w-[1750px] mx-auto flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-emerald-600 shadow">
                <CheckCircleIcon className="w-5 h-5" />
              </span>
              <div>
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-100 font-mono">
                  Lab Solved!
                </span>
                <p className="text-xs text-emerald-50 font-medium">
                  Objective successfully achieved. Great job!
                </p>
              </div>
            </div>

            {nextLab && (
              <button
                onClick={() => setActiveLabId(nextLab.id)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-black/90 hover:bg-black text-emerald-300 hover:text-emerald-200 text-xs font-semibold rounded-xl border border-emerald-400/40 transition-all cursor-pointer shadow-sm"
              >
                <span>Next Challenge: {nextLab.title.split(':')[0]}</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* PortSwigger Lab Control Bar */}
      <div className="max-w-[1750px] mx-auto px-4 py-3 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Lab Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1 flex-wrap gap-y-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                LAB {currentLab.number} OF {LABS.length}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-900 text-zinc-300 border border-zinc-700">
                {currentLab.category}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-zinc-900 text-zinc-300 border border-zinc-700 font-mono">
                {currentLab.difficulty}
              </span>
              {isSolved ? (
                <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-400">
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                  <span>Solved</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 text-xs font-medium text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping mr-1"></span>
                  <span>Active Target</span>
                </span>
              )}
            </div>

            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
              {currentLab.title}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 mt-0.5 leading-relaxed">
              <span className="text-emerald-400 font-semibold font-mono">OBJECTIVE: </span>
              {currentLab.objective}
            </p>
          </div>

          {/* Action Tools */}
          <div className="flex items-center space-x-2 shrink-0 flex-wrap gap-y-2">
            <button
              onClick={() => setIsSourceModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-medium transition cursor-pointer"
              title="Inspect backend source code flaw"
            >
              <CodeIcon className="w-4 h-4 text-emerald-400" />
              <span>View Source (DVWA)</span>
            </button>

            <button
              onClick={() => setIsSolutionDrawerOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-medium transition cursor-pointer"
              title="Get guidance and solution steps"
            >
              <SparklesIcon className="w-4 h-4 text-amber-400" />
              <span>Solution & Hints</span>
            </button>

            <button
              onClick={() => setIsInterceptorOpen(!isInterceptorOpen)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                isInterceptorOpen
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600 shadow-sm shadow-emerald-500/20'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
              }`}
              title="Built-in mini HTTP interceptor & repeater"
            >
              <BugIcon className={`w-4 h-4 ${isInterceptorOpen ? 'text-emerald-400' : 'text-zinc-500'}`} />
              <span>Interceptor {isInterceptorOpen ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
