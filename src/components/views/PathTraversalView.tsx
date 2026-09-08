import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ServerDocument } from '../../types/store';
import {
  FileTextIcon,
  SearchIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  BugIcon,
  LockIcon,
  UnlockIcon,
  ArrowRightIcon,
} from '../ui/Icons';

export function PathTraversalView() {
  const { fetchServerDocument, user, setCurrentView } = useStore();

  const [filenameInput, setFilenameInput] = useState('hardware_guide.pdf');
  const [currentDocument, setCurrentDocument] = useState<ServerDocument | null>(() => {
    const res = fetchServerDocument('hardware_guide.pdf');
    return res.document || null;
  });
  const [isExploitActive, setIsExploitActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto p-8 rounded-3xl bg-zinc-950 border border-zinc-800 text-center space-y-5 my-12">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
          <AlertTriangleIcon className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Authentication Required</h2>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Please register an account or sign in to access the CyberForge technical specification repository.
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

  const handleFetch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    const res = fetchServerDocument(filenameInput);
    if (res.error) {
      setErrorMsg(res.error);
      setCurrentDocument(null);
      setIsExploitActive(false);
    } else if (res.document) {
      setCurrentDocument(res.document);
      setIsExploitActive(res.isTraversal);
    }
  };

  const handleSelectPublicDoc = (name: string) => {
    setFilenameInput(name);
    setErrorMsg(null);
    const res = fetchServerDocument(name);
    if (res.document) {
      setCurrentDocument(res.document);
      setIsExploitActive(res.isTraversal);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
            <BugIcon className="w-3.5 h-3.5" />
            <span>FILE INCLUSION — LAB 4 TARGET (PATH TRAVERSAL / LFI)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Technical Manuals & Server Document Portal
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed max-w-3xl">
            The server retrieves documentation files by passing the filename parameter to the filesystem. Test if you can escape the public directory using dot-dot-slash (<code className="text-emerald-400 font-mono">../</code>) sequences.
          </p>
        </div>

        {/* Public Manual Catalog Shortcuts */}
        <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center space-x-2 text-xs font-mono">
          <span className="text-zinc-500 text-[11px]">Public Docs:</span>
          <button
            onClick={() => handleSelectPublicDoc('hardware_guide.pdf')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-[11px] ${
              filenameInput === 'hardware_guide.pdf'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            hardware_guide.pdf
          </button>
          <button
            onClick={() => handleSelectPublicDoc('firmware_v2.bin')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-[11px] ${
              filenameInput === 'firmware_v2.bin'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            firmware_v2.bin
          </button>
          <button
            onClick={() => handleSelectPublicDoc('datasheet_laptop.txt')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-[11px] ${
              filenameInput === 'datasheet_laptop.txt'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            datasheet_laptop.txt
          </button>
        </div>
      </div>

      {/* Path Traversal Parameter Query Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400 font-bold uppercase tracking-wider">
              HTTP Endpoint: GET /api/docs?file=
            </span>
          </div>

          <div className="text-xs font-mono text-zinc-500">
            Query Parameter: <code className="text-zinc-300">file</code>
          </div>
        </div>

        <form onSubmit={handleFetch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={filenameInput}
              onChange={(e) => setFilenameInput(e.target.value)}
              placeholder="Enter document filename (e.g. hardware_guide.pdf or path sequence)..."
              className="w-full px-4 py-3 bg-black border border-zinc-700 focus:border-emerald-500 rounded-xl text-xs sm:text-sm text-white font-mono focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-mono transition cursor-pointer flex items-center space-x-2 shadow-md shadow-emerald-500/20 shrink-0"
          >
            <span>Fetch Document</span>
            <SearchIcon className="w-4 h-4 text-black" />
          </button>
        </form>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-xs font-mono text-red-300 flex items-center space-x-2.5">
            <AlertTriangleIcon className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Traversal Breach Confirmation Banner */}
      {isExploitActive && currentDocument?.isRestricted && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950 via-zinc-950 to-black border-2 border-red-500 shadow-2xl space-y-2 animate-in zoom-in-95">
          <div className="flex items-center space-x-2 text-red-400 font-bold text-xs sm:text-sm font-mono uppercase">
            <AlertTriangleIcon className="w-5 h-5 text-red-400" />
            <span>Directory Traversal Breach Confirmed: Arbitrary File Disclosure</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed font-mono">
            The server resolved relative <code className="text-emerald-400 font-bold">../</code> path navigation outside <code className="text-zinc-400">/var/www/cyberforge/public/docs/</code> and returned internal system configuration!
          </p>
          <div className="p-3 rounded-xl bg-black border border-red-800 font-mono text-xs text-emerald-400 font-bold flex items-center justify-between flex-wrap gap-2">
            <span>CAPTURED CTF FLAG:</span>
            <span className="select-all text-xs bg-zinc-900 px-2 py-1 rounded">
              FLAG&#123;DIRECTORY_PATH_TRAVERSAL_ARBITRARY_READ_4829&#125;
            </span>
          </div>
        </div>
      )}

      {/* Document File Viewer Container */}
      {currentDocument && (
        <div
          className={`p-6 sm:p-8 rounded-3xl bg-zinc-950 border shadow-2xl space-y-5 ${
            currentDocument.isRestricted
              ? 'border-red-500/70 ring-2 ring-red-500/20 bg-red-950/10'
              : 'border-zinc-800'
          }`}
        >
          <div className="flex items-start justify-between flex-wrap gap-4 pb-4 border-b border-zinc-800">
            <div>
              <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                <span className="text-xl font-bold text-white tracking-tight font-mono">
                  {currentDocument.title}
                </span>
                {currentDocument.isRestricted ? (
                  <span className="px-3 py-1 rounded-full bg-red-950 border border-red-700 text-red-400 text-xs font-mono font-bold animate-pulse">
                    RESTRICTED INTERNAL SERVER FILE
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-mono">
                    {currentDocument.category}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 font-mono mt-1">
                Filesystem Location: <code className="text-zinc-300">/var/www/cyberforge/public/docs/{currentDocument.filename}</code>
              </p>
            </div>

            <div className="text-right font-mono text-xs text-zinc-400">
              <span>Size: {currentDocument.content.length} bytes</span>
            </div>
          </div>

          {/* Raw File Contents */}
          <div className="rounded-2xl border border-zinc-800 bg-black p-5 font-mono text-xs text-zinc-200 overflow-x-auto leading-relaxed shadow-inner">
            <pre className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-black">
              {currentDocument.content}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
