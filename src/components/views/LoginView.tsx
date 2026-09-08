import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { LockIcon, UnlockIcon, AlertTriangleIcon, CheckCircleIcon, BugIcon } from '../ui/Icons';

export function LoginView() {
  const { user, loginWithSql, logout, setCurrentView, registerUser, databaseUsers } = useStore();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  
  // Login form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginResult, setLoginResult] = useState<{
    success: boolean;
    queryExecuted: string;
    isBypass: boolean;
    error?: string;
  } | null>(null);

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = loginWithSql(username, password);
    setLoginResult(res);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    const res = registerUser(regUsername, regName, regEmail, regPassword);
    if (!res.success) {
      setRegError(res.error || 'Failed to register');
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Target Info */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
          <BugIcon className="w-3.5 h-3.5" />
          <span>AUTHENTICATION GATEWAY — LAB 1 TARGET</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Account Portal & Database Authentication
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Create a new user account or exploit the unparameterized login SQL query to bypass authentication.
        </p>
      </div>

      {user && user.role === 'admin' ? (
        /* Admin Logged-In State */
        <div className="max-w-3xl mx-auto p-8 rounded-3xl bg-zinc-950 border-2 border-emerald-500/80 shadow-2xl space-y-6 animate-in zoom-in-95">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <UnlockIcon className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                ROOT PRIVILEGES ACTIVE
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                Authenticated as: {user.name}
              </h2>
              <p className="text-xs text-zinc-400 font-mono">Role: {user.role} | ID: {user.id}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-2 font-mono text-xs text-zinc-300">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span>EXPLOIT CONFIRMED: AUTHENTICATION BYPASS</span>
              <span>{"FLAG{SQLI_AUTH_BYPASS_ADMIN_ROOT_4492}"}</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              You bypassed the password check using SQL injection! The boolean statement evaluated to TRUE for the administrator row.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentView('store')}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition cursor-pointer"
            >
              Continue to Storefront
            </button>
            <button
              onClick={() => {
                logout();
                setLoginResult(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono transition cursor-pointer border border-zinc-800"
            >
              Log Out of Admin
            </button>
          </div>
        </div>
      ) : user ? (
        /* Regular User Logged-In State */
        <div className="max-w-3xl mx-auto p-8 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl space-y-6 animate-in zoom-in-95">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-14 h-14 rounded-2xl bg-black border border-zinc-800"
              />
              <div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold">
                  ACTIVE USER SESSION
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  Welcome back, {user.name}!
                </h2>
                <p className="text-xs text-zinc-400 font-mono">ID: {user.id} | Wallet: ${user.walletBalance.toFixed(2)} USD</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl text-xs font-mono transition cursor-pointer"
            >
              Sign Out
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentView('store')}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition cursor-pointer"
            >
              Access Storefront Range
            </button>
            <button
              onClick={() => setCurrentView('orders')}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono transition cursor-pointer border border-zinc-800"
            >
              View Orders
            </button>
          </div>
        </div>
      ) : (
        /* Login and Register Form */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Container */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-6">
            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-zinc-800 pb-3 space-x-3">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Sign In (Authentication)
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition cursor-pointer ${
                  mode === 'register'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                + Register New Account (Real DB Storage)
              </button>
            </div>

            {mode === 'signin' ? (
              /* Sign In Form */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-mono font-semibold text-zinc-300 block mb-1.5">
                    Username or Email
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username..."
                    className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-700 text-xs sm:text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-semibold text-zinc-300 block mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-700 text-xs sm:text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs tracking-wider transition cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  Sign In to Security Range
                </button>

                {loginResult && !loginResult.success && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300 flex items-center space-x-2">
                    <AlertTriangleIcon className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{loginResult.error}</span>
                  </div>
                )}
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono font-semibold text-zinc-300 block mb-1">
                      Username (Unique ID)
                    </label>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="e.g. shadow_hunter"
                      className="w-full px-4 py-2.5 rounded-xl bg-black border border-zinc-700 text-xs sm:text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono font-semibold text-zinc-300 block mb-1">
                      Full Display Name
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. John Wick"
                      className="w-full px-4 py-2.5 rounded-xl bg-black border border-zinc-700 text-xs sm:text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono font-semibold text-zinc-300 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="john@cybermart.internal"
                    className="w-full px-4 py-2.5 rounded-xl bg-black border border-zinc-700 text-xs sm:text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-semibold text-zinc-300 block mb-1">
                    Password (Stored in DB)
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Enter password to store in DB"
                    className="w-full px-4 py-2.5 rounded-xl bg-black border border-zinc-700 text-xs sm:text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                {regError && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300">
                    {regError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs tracking-wider transition cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  Create & Save Account to Database
                </button>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  Notice: Once saved, your account will exist in the real database table and will be visible when performing SQLi or IDOR attacks!
                </p>
              </form>
            )}
          </div>

          {/* Database State and Query Inspector */}
          <div className="lg:col-span-5 space-y-4">
            {/* Live SQL Query Box */}
            <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Live Backend SQL Constructor
                </h3>
              </div>

              <div className="p-3.5 rounded-xl bg-black border border-zinc-800 font-mono text-xs leading-relaxed text-zinc-300 overflow-x-auto">
                <span className="text-emerald-400 font-bold">SELECT</span> * <span className="text-emerald-400 font-bold">FROM</span> users <span className="text-emerald-400 font-bold">WHERE</span> username = '<span className="text-amber-300 font-bold">{username}</span>' <span className="text-emerald-400 font-bold">AND</span> password = '<span className="text-amber-300 font-bold">{password}</span>';
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                The input string is not parameterized. Injecting quotes alters the SQL execution tree.
              </p>
            </div>

            {/* Database Engine Status */}
            <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                    Database Engine: SQLite / MySQL Emulation
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                  ONLINE
                </span>
              </div>

              <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Database Name:</span>
                  <span className="text-zinc-200 font-bold">cyberforge_prod</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Target Table:</span>
                  <span className="text-emerald-400 font-bold">users</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Total Committed Records:</span>
                  <span className="text-zinc-200">{databaseUsers.length} user rows</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Storage Engine:</span>
                  <span className="text-zinc-400">Persistent LocalStorage Store</span>
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
                🔒 Direct table enumeration is protected. User identifiers and password hashes can only be exfiltrated via SQL Injection or authenticated access.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
