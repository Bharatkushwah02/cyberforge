import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, User } from '../../types/store';
import {
  SearchIcon,
  ShoppingCartIcon,
  SparklesIcon,
  AlertTriangleIcon,
  LockIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from '../ui/Icons';

export function StoreCatalog() {
  const {
    products,
    searchProducts,
    addToCart,
    setSelectedProductId,
    setCurrentView,
    setActiveLabId,
    databaseUsers,
    user,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);
  const [executedSql, setExecutedSql] = useState<string | null>(null);
  const [isLeakDetected, setIsLeakDetected] = useState(false);
  const [leakedUsers, setLeakedUsers] = useState<User[] | null>(null);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto p-8 rounded-3xl bg-zinc-950 border border-zinc-800 text-center space-y-5 my-12">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
          <AlertTriangleIcon className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Authentication Required</h2>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Access to the CyberForge Hardware Range and catalog database requires an authenticated session.
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

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const res = searchProducts(searchQuery);
    setSearchResults(res.results);
    setExecutedSql(res.queryExecuted);
    setIsLeakDetected(res.isSqlLeak);
    if (res.isSqlLeak) {
      setLeakedUsers(res.leakedUsers || databaseUsers);
    } else {
      setLeakedUsers(null);
    }
  };

  const displayProducts = searchResults !== null ? searchResults : products.filter((p) => !p.isHidden);

  return (
    <div className="w-full space-y-8">
      {/* Hero Storefront Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-950 via-zinc-900 to-black border border-zinc-800 p-8 sm:p-12 shadow-2xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1"></span>
            <span>CYBER SECURITY RANGE & RESEARCH EQUIPMENT</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Security Hardware & Penetration Testing Tools
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            Welcome to the internal CyberForge catalog. Search for field equipment or test the database queries for input validation vulnerabilities.
          </p>
        </div>
      </div>

      {/* SQLi Product Search Bar (Lab 1 Target) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-5 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <SearchIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Database Product Catalog Query
              </h2>
              <p className="text-xs text-zinc-400">
                Executes: <code className="text-zinc-300 font-mono text-[11px]">SELECT * FROM products WHERE name LIKE '%[query]%'</code>
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-zinc-500">
            Query Parameter: <code className="text-zinc-300">search</code>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search security equipment, tactical hardware, catalog products..."
              className="w-full px-4 py-3 bg-black border border-zinc-700 focus:border-emerald-500 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-mono transition cursor-pointer flex items-center space-x-2 shadow-md shadow-emerald-500/20 shrink-0"
          >
            <span>Query Database</span>
            <SearchIcon className="w-4 h-4 text-black" />
          </button>
          {searchResults !== null && (
            <button
              type="button"
              onClick={() => {
                setSearchResults(null);
                setSearchQuery('');
                setExecutedSql(null);
                setIsLeakDetected(false);
                setLeakedUsers(null);
              }}
              className="px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono transition cursor-pointer shrink-0"
            >
              Clear
            </button>
          )}
        </form>

        {/* Live SQL Query Visualizer */}
        {executedSql && (
          <div className="p-4 rounded-2xl bg-black border border-zinc-800 font-mono text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 font-semibold uppercase tracking-wider">
                Raw SQL Query Sent to Backend Database:
              </span>
              {isLeakDetected ? (
                <span className="text-emerald-400 font-bold flex items-center space-x-1.5">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                  <span>SQL INJECTION BYPASS TRIGGERED!</span>
                </span>
              ) : (
                <span className="text-zinc-500">Standard Escaped Query</span>
              )}
            </div>
            <div className="p-3 rounded-xl bg-zinc-950 text-emerald-300 overflow-x-auto text-xs whitespace-pre border border-zinc-800/80">
              {executedSql}
            </div>
          </div>
        )}

        {/* Leaked Users Database Table Dump (Deliver User's specific request!) */}
        {isLeakDetected && leakedUsers && (
          <div className="p-5 rounded-2xl bg-black border-2 border-emerald-500/80 space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <h3 className="text-sm font-bold font-mono text-emerald-400 uppercase tracking-wider">
                  💥 LEAKED DATABASE TABLE: users ({leakedUsers.length} Records Dumped)
                </h3>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                Query: <code className="text-emerald-300">UNION SELECT id, username, password</code>
              </span>
            </div>

            <p className="text-xs text-zinc-300">
              Because the search parameter was vulnerable to SQL Injection, the internal credentials of registered users were extracted directly from database memory:
            </p>

            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-900 text-zinc-400 uppercase text-[11px] border-b border-zinc-800">
                  <tr>
                    <th className="p-2.5">User ID</th>
                    <th className="p-2.5">Username</th>
                    <th className="p-2.5">Display Name</th>
                    <th className="p-2.5">Password / Hash (DUMPED)</th>
                    <th className="p-2.5">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 bg-zinc-950 text-zinc-200">
                  {leakedUsers.map((u) => (
                    <tr key={u.id} className={u.role === 'admin' ? 'bg-emerald-950/20 text-emerald-300' : ''}>
                      <td className="p-2.5 font-bold">{u.id}</td>
                      <td className="p-2.5 text-white">{u.username}</td>
                      <td className="p-2.5 text-zinc-300">{u.name}</td>
                      <td className="p-2.5 text-amber-400 font-bold select-all">
                        {u.password || 'password123'}
                      </td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'admin' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Product Grid (4 columns on wide screens to eliminate empty side gaps!) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Available Equipment ({displayProducts.length} Items)
          </h2>
          {isLeakDetected && (
            <span className="px-3 py-1 rounded-full bg-red-950 border border-red-700 text-red-400 text-xs font-mono font-bold animate-pulse">
              ⚠️ CLASSIFIED PROTOTYPE EXPOSED BY SQLI
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayProducts.map((product: Product) => (
            <div
              key={product.id}
              className={`rounded-2xl border bg-zinc-950 overflow-hidden flex flex-col justify-between transition hover:border-zinc-700 shadow-xl ${
                product.isHidden
                  ? 'border-red-500 ring-2 ring-red-500/20 bg-red-950/10'
                  : 'border-zinc-800'
              }`}
            >
              {/* Image */}
              <div className="relative h-48 bg-black overflow-hidden group">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90"
                />
                {product.isHidden && (
                  <div className="absolute inset-0 bg-red-950/80 flex items-center justify-center p-4 text-center">
                    <span className="px-3 py-1.5 rounded-lg bg-red-900 text-white font-mono font-bold text-xs shadow-lg border border-red-400/40">
                      CLASSIFIED PROTOTYPE (LEAKED)
                    </span>
                  </div>
                )}
                {product.originalPrice && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-emerald-500 text-black text-xs font-bold font-mono">
                    SAVE ${(product.originalPrice - product.price).toFixed(0)}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <span>{product.category}</span>
                    <span className="text-amber-400">★ {product.rating}</span>
                  </div>

                  <h3 className="text-base font-bold text-white line-clamp-1">
                    {product.name}
                  </h3>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-zinc-500 font-mono block">Price</span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-lg font-bold font-mono text-emerald-400">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs font-mono text-zinc-500 line-through">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedProductId(product.id);
                        setCurrentView('product');
                        setActiveLabId('xss');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition cursor-pointer border border-zinc-800"
                    >
                      Reviews
                    </button>

                    <button
                      onClick={() => addToCart(product)}
                      className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black transition cursor-pointer shadow-md shadow-emerald-500/20"
                      title="Add to cart"
                    >
                      <ShoppingCartIcon className="w-4 h-4 text-black" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
