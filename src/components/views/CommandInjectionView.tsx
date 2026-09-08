import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { DiagnosticResult } from '../../types/store';
import {
  TerminalIcon,
  SearchIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  BugIcon,
  LockIcon,
  ArrowRightIcon,
} from '../ui/Icons';

export function CommandInjectionView() {
  const { runNetworkDiagnostics, user, setCurrentView } = useStore();

  const [hostInput, setHostInput] = useState('127.0.0.1');
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<DiagnosticResult | null>(() => {
    return runNetworkDiagnostics('127.0.0.1');
  });

  if (!user) {
    return (
      <div className="max-w-xl mx-auto p-8 rounded-3xl bg-zinc-950 border border-zinc-800 text-center space-y-5 my-12">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
          <AlertTriangleIcon className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Authentication Required</h2>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Please register an account or sign in to access the CyberForge Edge Diagnostics console.
          </p>
        </div>
        <button
          onClick={() => setCurrentView('login')}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition cursor-pointer font-mono"
        >
          Sign In / Register Account
        </button>
      </div>
    );
  }

  const handleRunPing = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!hostInput.trim()) return;

    setIsRunning(true);
    setTimeout(() => {
      const res = runNetworkDiagnostics(hostInput);
      setLastResult(res);
      setIsRunning(false);
    }, 400);
  };

  const handleSelectStandardHost = (h: string) => {
    setHostInput(h);
    setIsRunning(true);
    setTimeout(() => {
      const res = runNetworkDiagnostics(h);
      setLastResult(res);
      setIsRunning(false);
    }, 300);
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
            <BugIcon className="w-3.5 h-3.5" />
            <span>OPERATING SYSTEM EXECUTION — LAB 5 TARGET (COMMAND INJECTION)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Edge Server Network Diagnostic Console
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed max-w-3xl">
            The server verifies connectivity to remote edge hosts by invoking the system ping command. Test if you can inject shell operators (<code className="text-emerald-400 font-mono">&&</code>, <code className="text-emerald-400 font-mono">;</code>, <code className="text-emerald-400 font-mono">|</code>) to execute arbitrary commands as the server user.
          </p>
        </div>

        {/* Standard Network Targets */}
        <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center space-x-2 text-xs font-mono">
          <span className="text-zinc-500 text-[11px]">Standard Nodes:</span>
          <button
            onClick={() => handleSelectStandardHost('127.0.0.1')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-[11px] ${
              hostInput === '127.0.0.1'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            127.0.0.1 (Loopback)
          </button>
          <button
            onClick={() => handleSelectStandardHost('8.8.8.8')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-[11px] ${
              hostInput === '8.8.8.8'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            8.8.8.8 (Google DNS)
          </button>
          <button
            onClick={() => handleSelectStandardHost('1.1.1.1')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-[11px] ${
              hostInput === '1.1.1.1'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            1.1.1.1 (Cloudflare)
          </button>
        </div>
      </div>

      {/* Target Host Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400 font-bold uppercase tracking-wider">
              HTTP Endpoint: POST /api/diagnostics
            </span>
          </div>

          <div className="text-xs font-mono text-zinc-500">
            Backend Command: <code className="text-zinc-300">ping -c 2 [host]</code>
          </div>
        </div>

        <form onSubmit={handleRunPing} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={hostInput}
              onChange={(e) => setHostInput(e.target.value)}
              placeholder="Enter Target Host or IP address to ping (e.g. 127.0.0.1)..."
              className="w-full px-4 py-3 bg-black border border-zinc-700 focus:border-emerald-500 rounded-xl text-xs sm:text-sm text-white font-mono focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isRunning}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-mono transition cursor-pointer flex items-center space-x-2 shadow-md shadow-emerald-500/20 shrink-0 disabled:opacity-50"
          >
            {isRunning ? (
              <span>Pinging Host...</span>
            ) : (
              <>
                <span>Run Diagnostic</span>
                <TerminalIcon className="w-4 h-4 text-black" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* RCE Breach Confirmation Banner */}
      {lastResult?.commandInjected && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950 via-zinc-950 to-black border-2 border-red-500 shadow-2xl space-y-2 animate-in zoom-in-95">
          <div className="flex items-center space-x-2 text-red-400 font-bold text-xs sm:text-sm font-mono uppercase">
            <AlertTriangleIcon className="w-5 h-5 text-red-400" />
            <span>Remote Code Execution Confirmed: OS Shell Injection</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed font-mono">
            The application passed untrusted input directly into <code className="text-emerald-400 font-bold">child_process.exec()</code>. The host operating system executed your chained command as <code className="text-amber-300 font-bold">www-data</code>!
          </p>
          <div className="p-3 rounded-xl bg-black border border-red-800 font-mono text-xs text-emerald-400 font-bold flex items-center justify-between flex-wrap gap-2">
            <span>CAPTURED CTF ROOT FLAG:</span>
            <span className="select-all text-xs bg-zinc-900 px-2 py-1 rounded">
              FLAG&#123;OS_COMMAND_INJECTION_ROOT_RCE_9981&#125;
            </span>
          </div>
        </div>
      )}

      {/* Interactive Terminal Output Console */}
      <div className="rounded-3xl border border-zinc-800 bg-black overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="px-6 py-3.5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
            <span className="text-xs font-mono text-zinc-400 ml-2">
              server-shell: /bin/sh -c "ping -c 2 {hostInput}"
            </span>
          </div>

          <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">
            Interactive Shell STDOUT
          </span>
        </div>

        {/* Terminal Body */}
        <div className="p-6 font-mono text-xs leading-relaxed text-zinc-300 overflow-x-auto min-h-[220px]">
          <div className="text-emerald-400 font-bold mb-2">
            www-data@cyberforge-core:~$ ping -c 2 {hostInput}
          </div>

          {isRunning ? (
            <div className="text-zinc-500 flex items-center space-x-2 animate-pulse">
              <span>Sending ICMP ECHO requests...</span>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-black text-zinc-200">
              {lastResult?.output}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
