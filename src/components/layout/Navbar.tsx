import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { LABS } from '../../lib/mockData';
import {
  ShieldIcon,
  ShoppingCartIcon,
  SearchIcon,
  LockIcon,
  UnlockIcon,
  VolumeIcon,
  VolumeMuteIcon,
  RefreshIcon,
  BugIcon,
  CheckCircleIcon,
  FileTextIcon,
} from '../ui/Icons';

export function Navbar() {
  const {
    activeLabId,
    setActiveLabId,
    solvedLabs,
    cart,
    user,
    logout,
    soundEnabled,
    toggleSound,
    resetAllProgress,
    currentView,
    setCurrentView,
  } = useStore();

  const [isLabDropdownOpen, setIsLabDropdownOpen] = useState(false);

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const solvedCount = solvedLabs.length;

  return (
    <header className="bg-black border-b border-zinc-800 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-[1750px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Platform Name */}
          <div
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => setCurrentView('store')}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-black font-bold shadow-lg shadow-emerald-500/20">
              <ShieldIcon className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">
                  CYBER<span className="text-emerald-400">FORGE</span>
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-zinc-900 text-emerald-400 border border-zinc-700 rounded-md">
                  VULN-RANGE
                </span>
              </div>
              <p className="text-xs text-zinc-400">Hands-on Security Simulation</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1.5">
            <button
              onClick={() => setCurrentView('store')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                currentView === 'store'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              Catalog (SQLi)
            </button>

            <button
              onClick={() => setCurrentView('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                currentView === 'orders'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <FileTextIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Invoices (IDOR)</span>
            </button>

            <button
              onClick={() => setCurrentView('docs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                currentView === 'docs'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              Docs (Path Traversal)
            </button>

            <button
              onClick={() => setCurrentView('diagnostics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                currentView === 'diagnostics'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              Diagnostics (Command Inj)
            </button>

            <button
              onClick={() => setCurrentView('labs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-emerald-400 hover:bg-emerald-500/10 ${
                currentView === 'labs' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : ''
              }`}
            >
              All 5 Labs
            </button>
          </nav>

          {/* Quick Lab Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLabDropdownOpen(!isLabDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono font-medium text-zinc-200 transition cursor-pointer"
            >
              <BugIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate max-w-[120px] sm:max-w-[180px]">
                {activeLabId === 'catalog'
                  ? 'Select Lab...'
                  : `Lab ${LABS.find((l) => l.id === activeLabId)?.number}: ${activeLabId.toUpperCase()}`}
              </span>
              <span className="text-[10px] text-zinc-500">▼</span>
            </button>

            {isLabDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-black border border-zinc-700 shadow-2xl p-2 z-50 space-y-1 animate-in zoom-in-95">
                <div className="px-3 py-2 text-[10px] font-mono text-zinc-400 uppercase tracking-wider border-b border-zinc-800 font-bold">
                  Target Selection
                </div>
                {LABS.map((l) => {
                  const isSolved = solvedLabs.includes(l.id);
                  return (
                    <button
                      key={l.id}
                      onClick={() => {
                        setActiveLabId(l.id);
                        setIsLabDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-mono flex items-center justify-between hover:bg-zinc-900 transition cursor-pointer"
                    >
                      <div className="truncate">
                        <span className="text-zinc-500 mr-2">0{l.number}</span>
                        <span className="text-white font-semibold">{l.title.split(':')[0]}</span>
                      </div>
                      {isSolved && (
                        <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* User Session & Status */}
          <div className="flex items-center space-x-2.5">
            {!user ? (
              <button
                onClick={() => setCurrentView('login')}
                className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs transition cursor-pointer shadow-md shadow-emerald-500/20"
              >
                <LockIcon className="w-3.5 h-3.5 text-black" />
                <span>Sign In / Register</span>
              </button>
            ) : user.role === 'admin' ? (
              <div className="flex items-center space-x-2">
                <div
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-950/80 border border-red-700 text-red-300 rounded-xl text-xs font-mono"
                >
                  <UnlockIcon className="w-3.5 h-3.5 text-red-400" />
                  <span className="font-bold">ADMIN (PWNED)</span>
                </div>
                <button
                  onClick={logout}
                  className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl text-xs font-mono transition cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl text-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="font-mono text-xs">{user.username} (${user.walletBalance.toFixed(0)})</span>
                </div>
                <button
                  onClick={logout}
                  className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl text-xs font-mono transition cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition cursor-pointer"
              title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            >
              {soundEnabled ? (
                <VolumeIcon className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeMuteIcon className="w-4 h-4 text-zinc-600" />
              )}
            </button>

            {/* Reset Store */}
            <button
              onClick={resetAllProgress}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 border border-zinc-800 transition cursor-pointer"
              title="Reset all store and lab progress"
            >
              <RefreshIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
