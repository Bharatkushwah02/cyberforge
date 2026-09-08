import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { LockIcon, SearchIcon, RefreshIcon, ArrowRightIcon } from '../ui/Icons';

export function SimulatedUrlBar() {
  const {
    currentView,
    setCurrentView,
    activeLabId,
    setActiveLabId,
    selectedProductId,
    fetchServerDocument,
    runNetworkDiagnostics,
    lookupOrder,
    searchProducts,
    addToast,
  } = useStore();

  const [inputUrl, setInputUrl] = useState('https://cyberforge.internal/catalog');

  // Compute canonical URL based on app state
  const getCurrentUrl = () => {
    const base = 'https://cyberforge.internal';
    switch (currentView) {
      case 'login':
        return `${base}/login`;
      case 'orders':
        return `${base}/orders?id=1042`;
      case 'docs':
        return `${base}/manuals?file=hardware_guide.pdf`;
      case 'diagnostics':
        return `${base}/diagnostics?host=127.0.0.1`;
      case 'cart':
        return `${base}/checkout`;
      case 'product':
        return `${base}/product?id=${selectedProductId}`;
      case 'labs':
        return `${base}/academy`;
      case 'store':
      default:
        return `${base}/catalog`;
    }
  };

  // Sync address bar whenever view changes
  useEffect(() => {
    setInputUrl(getCurrentUrl());
  }, [currentView, selectedProductId]);

  const handleNavigate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let url = inputUrl.trim();

    // Clean scheme
    let pathAndQuery = url;
    if (url.includes('cyberforge.internal')) {
      pathAndQuery = url.split('cyberforge.internal')[1] || '/';
    } else if (url.startsWith('https://') || url.startsWith('http://')) {
      try {
        const parsed = new URL(url);
        pathAndQuery = parsed.pathname + parsed.search;
      } catch {
        // fallback
      }
    }

    const [path, searchStr] = pathAndQuery.split('?');
    const params = new URLSearchParams(searchStr || '');

    // Check for Reflected XSS in URL
    if (url.includes('<script>') || url.includes('onerror=') || url.includes('alert(')) {
      addToast(
        '🚨 Reflected XSS Triggered via URL!',
        'Parameter reflected directly into page context without HTML escaping!',
        'danger'
      );
    }

    // Route logic
    if (path.includes('order')) {
      setCurrentView('orders');
      setActiveLabId('idor');
      const idParam = params.get('id') || '1042';
      lookupOrder(idParam);
    } else if (path.includes('login')) {
      setCurrentView('login');
      setActiveLabId('sqli');
    } else if (path.includes('doc') || path.includes('manual')) {
      setCurrentView('docs');
      setActiveLabId('traversal');
      const fileParam = params.get('file');
      if (fileParam) {
        fetchServerDocument(fileParam);
      }
    } else if (path.includes('diagnostic') || path.includes('ping')) {
      setCurrentView('diagnostics');
      setActiveLabId('command');
      const hostParam = params.get('host');
      if (hostParam) {
        runNetworkDiagnostics(hostParam);
      }
    } else if (path.includes('checkout') || path.includes('cart')) {
      setCurrentView('cart');
    } else if (path.includes('product')) {
      setCurrentView('product');
      setActiveLabId('xss');
    } else if (path.includes('academy') || path.includes('labs')) {
      setCurrentView('labs');
    } else {
      setCurrentView('store');
      const searchQuery = params.get('search') || params.get('q');
      if (searchQuery) {
        searchProducts(searchQuery);
        setActiveLabId('sqli');
      }
    }
  };

  return (
    <div className="w-full bg-zinc-950 border-b border-zinc-800 px-4 py-2.5 shadow-md">
      <div className="max-w-[1750px] mx-auto flex items-center space-x-3">
        {/* Mock Window Dots */}
        <div className="hidden sm:flex items-center space-x-1.5 shrink-0 pr-2 border-r border-zinc-800">
          <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
          <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
          <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block"></span>
        </div>

        {/* Back, Forward, Reload buttons */}
        <div className="flex items-center space-x-1 text-zinc-400 shrink-0">
          <button
            onClick={() => setCurrentView('store')}
            className="p-1.5 rounded-lg hover:bg-zinc-800 hover:text-white transition cursor-pointer"
            title="Go to Storefront"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentView('orders')}
            className="p-1.5 rounded-lg hover:bg-zinc-800 hover:text-white transition cursor-pointer"
            title="Go to Orders"
          >
            →
          </button>
          <button
            onClick={() => handleNavigate()}
            className="p-1.5 rounded-lg hover:bg-zinc-800 hover:text-white transition cursor-pointer"
            title="Reload simulated URL"
          >
            <RefreshIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* The Live Interactive Address Bar */}
        <form onSubmit={handleNavigate} className="flex-1 flex items-center">
          <div className="w-full flex items-center bg-black border border-zinc-700 hover:border-zinc-500 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 rounded-xl px-3 py-1.5 transition-all shadow-inner">
            <span className="flex items-center space-x-1 text-emerald-400 text-xs font-mono shrink-0 mr-2 select-none">
              <LockIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-zinc-500 font-sans hidden md:inline">Secure</span>
            </span>

            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://cyberforge.internal/..."
              className="flex-1 bg-transparent text-xs text-zinc-100 font-mono focus:outline-none placeholder-zinc-600 truncate"
              title="Edit simulated URL bar to test query parameters"
            />

            <button
              type="submit"
              className="ml-2 p-1 rounded-lg bg-zinc-800 hover:bg-emerald-500 hover:text-black text-zinc-300 text-xs transition cursor-pointer shrink-0"
              title="Navigate to URL"
            >
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
