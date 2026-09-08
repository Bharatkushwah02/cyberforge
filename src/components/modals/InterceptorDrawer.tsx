import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { BugIcon, XIcon, ArrowRightIcon, RefreshIcon } from '../ui/Icons';

export function InterceptorDrawer() {
  const {
    isInterceptorOpen,
    setIsInterceptorOpen,
    activeLabId,
    lookupOrder,
    loginWithSql,
    fetchServerDocument,
    runNetworkDiagnostics,
    addToast,
  } = useStore();

  const [tamperedFilename, setTamperedFilename] = useState('../../../../etc/passwd');
  const [tamperedHost, setTamperedHost] = useState('127.0.0.1 && cat secret_root_flag.txt');
  const [tamperedOrderId, setTamperedOrderId] = useState('1001');
  const [tamperedLoginPayload, setTamperedLoginPayload] = useState("' OR 1=1 --");

  if (!isInterceptorOpen) return null;

  const handleForwardTampered = () => {
    if (activeLabId === 'traversal') {
      fetchServerDocument(tamperedFilename);
    } else if (activeLabId === 'command') {
      runNetworkDiagnostics(tamperedHost);
    } else if (activeLabId === 'idor') {
      lookupOrder(tamperedOrderId);
    } else if (activeLabId === 'sqli') {
      loginWithSql(tamperedLoginPayload, 'any_pass');
    } else {
      addToast('Forwarded', 'Tampered request forwarded to target.', 'info');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 w-96 max-w-[calc(100vw-2rem)] bg-zinc-900 border-2 border-emerald-500/80 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
      {/* Header */}
      <div className="px-4 py-2.5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-wider">
            HTTP Interceptor (Burp Mode)
          </span>
        </div>
        <button
          onClick={() => setIsInterceptorOpen(false)}
          className="text-zinc-400 hover:text-white transition cursor-pointer"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3 text-xs">
        <div className="p-2 rounded bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-zinc-400 space-y-1">
          <div className="text-emerald-400 font-bold">
            {activeLabId === 'traversal' && 'GET /api/docs?file=hardware_guide.pdf HTTP/1.1'}
            {activeLabId === 'command' && 'POST /api/diagnostics HTTP/1.1'}
            {activeLabId === 'idor' && 'GET /api/v1/orders?id=1042 HTTP/1.1'}
            {activeLabId === 'sqli' && 'POST /api/v1/auth/login HTTP/1.1'}
            {activeLabId === 'xss' && 'POST /api/v1/products/1/reviews HTTP/1.1'}
          </div>
          <div>Host: cyberforge.internal</div>
          <div>User-Agent: Mozilla/5.0 (CyberRange/1.0)</div>
          <div>Cookie: session=researcher_token; role=customer</div>
        </div>

        {/* Dynamic Parameter Tampering Inputs */}
        {activeLabId === 'traversal' && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-zinc-300 font-semibold block">
              Tamper Parameter: <span className="text-emerald-400">file</span>
            </label>
            <input
              type="text"
              value={tamperedFilename}
              onChange={(e) => setTamperedFilename(e.target.value)}
              className="w-full px-3 py-1.5 bg-zinc-950 border border-emerald-500/50 rounded-lg text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-400"
              placeholder="e.g. ../../../../etc/passwd"
            />
          </div>
        )}

        {activeLabId === 'command' && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-zinc-300 font-semibold block">
              Tamper Parameter: <span className="text-emerald-400">host</span>
            </label>
            <input
              type="text"
              value={tamperedHost}
              onChange={(e) => setTamperedHost(e.target.value)}
              className="w-full px-3 py-1.5 bg-zinc-950 border border-emerald-500/50 rounded-lg text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-400"
              placeholder="e.g. 127.0.0.1 && cat secret_root_flag.txt"
            />
          </div>
        )}

        {activeLabId === 'idor' && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-zinc-300 font-semibold block">
              Tamper Parameter: <span className="text-emerald-400">order_id</span>
            </label>
            <input
              type="text"
              value={tamperedOrderId}
              onChange={(e) => setTamperedOrderId(e.target.value)}
              className="w-full px-3 py-1.5 bg-zinc-950 border border-emerald-500/50 rounded-lg text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-400"
              placeholder="Enter Order ID to fetch..."
            />
          </div>
        )}

        {activeLabId === 'sqli' && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-zinc-300 font-semibold block">
              Tamper Payload: <span className="text-amber-400">username</span>
            </label>
            <input
              type="text"
              value={tamperedLoginPayload}
              onChange={(e) => setTamperedLoginPayload(e.target.value)}
              className="w-full px-3 py-1.5 bg-zinc-950 border border-amber-500/50 rounded-lg text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
        )}

        {/* Forward Button */}
        <button
          onClick={handleForwardTampered}
          className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-zinc-950 font-bold font-mono text-xs transition cursor-pointer flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20"
        >
          <span>Forward Tampered Request</span>
          <ArrowRightIcon className="w-4 h-4 text-zinc-950" />
        </button>
      </div>
    </div>
  );
}
