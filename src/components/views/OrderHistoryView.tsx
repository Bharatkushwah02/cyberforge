import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types/store';
import {
  FileTextIcon,
  SearchIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  BugIcon,
  LockIcon,
  UnlockIcon,
} from '../ui/Icons';

export function OrderHistoryView() {
  const { lookupOrder, orders, user, setCurrentView } = useStore();

  const [targetIdInput, setTargetIdInput] = useState(user?.id || '1042');
  const [currentOrder, setCurrentOrder] = useState<Order>(() => {
    if (user) {
      const myOrder = orders.find((o) => o.customerId === user.id);
      if (myOrder) return myOrder;
    }
    return orders[0];
  });
  const [isIdorExposed, setIsIdorExposed] = useState(false);
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
            You must create an account or sign in to view your orders and invoices.
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

  const handleLookup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    const res = lookupOrder(targetIdInput);
    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.order) {
      setCurrentOrder(res.order);
      setIsIdorExposed(res.isIdor);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
            <BugIcon className="w-3.5 h-3.5" />
            <span>ACCESS CONTROL — LAB 2 TARGET (IDOR)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Customer Invoices & Order Lookup Portal
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed max-w-3xl">
            Invoices are retrieved by their object identifier. Test if you can access records belonging to other accounts without authorization checks.
          </p>
        </div>

        {/* Current Authenticated User Badge */}
        <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-300">
            ID
          </div>
          <div className="text-xs font-mono">
            <span className="text-zinc-500 block uppercase text-[10px]">Active Session</span>
            <span className="text-white font-bold">{user.username} ({user.id})</span>
          </div>
        </div>
      </div>

      {/* IDOR Parameter Bar */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400 font-bold uppercase tracking-wider">
              HTTP Endpoint: GET /api/v1/orders?id=
            </span>
          </div>

          <div className="text-xs font-mono text-zinc-500">
            Object Parameter: <code className="text-zinc-300">order_id</code>
          </div>
        </div>

        <form onSubmit={handleLookup} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={targetIdInput}
              onChange={(e) => setTargetIdInput(e.target.value)}
              placeholder="Enter Order ID to query invoice..."
              className="w-full px-4 py-3 bg-black border border-zinc-700 focus:border-emerald-500 rounded-xl text-xs sm:text-sm text-white font-mono focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-mono transition cursor-pointer flex items-center space-x-2 shadow-md shadow-emerald-500/20 shrink-0"
          >
            <span>Fetch Record</span>
            <SearchIcon className="w-4 h-4 text-black" />
          </button>
        </form>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300 flex items-center space-x-2">
            <AlertTriangleIcon className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* IDOR Exploit Confirmation Banner */}
      {isIdorExposed && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950 via-zinc-950 to-black border-2 border-red-500 shadow-2xl space-y-2 animate-in zoom-in-95">
          <div className="flex items-center space-x-2 text-red-400 font-bold text-xs sm:text-sm font-mono uppercase">
            <AlertTriangleIcon className="w-5 h-5 text-red-400" />
            <span>IDOR Breach Confirmed: Horizontal Privilege Escalation</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            You are authenticated as <code className="text-amber-300">{user.username}</code>, yet the server returned the private invoice belonging to <code className="text-red-300 font-bold">{currentOrder.customerName}</code> without checking object ownership!
          </p>
          {currentOrder.vipToken && (
            <div className="p-3 rounded-xl bg-black border border-red-800 font-mono text-xs text-emerald-400 font-bold flex items-center justify-between flex-wrap gap-2">
              <span>CAPTURED CTF FLAG:</span>
              <span className="select-all text-xs bg-zinc-900 px-2 py-1 rounded">{currentOrder.vipToken}</span>
            </div>
          )}
        </div>
      )}

      {/* Full-Width Order Invoice Card (Responsive, no empty side gaps) */}
      <div
        className={`p-6 sm:p-10 rounded-3xl bg-zinc-950 border shadow-2xl space-y-6 ${
          currentOrder.isConfidential
            ? 'border-red-500/70 ring-2 ring-red-500/20 bg-red-950/10'
            : 'border-zinc-800'
        }`}
      >
        <div className="flex items-start justify-between flex-wrap gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center space-x-3 flex-wrap gap-y-2">
              <span className="text-2xl font-bold text-white tracking-tight">
                Invoice {currentOrder.orderNumber}
              </span>
              {currentOrder.isConfidential ? (
                <span className="px-3 py-1 rounded-full bg-red-950 border border-red-700 text-red-400 text-xs font-mono font-bold">
                  CONFIDENTIAL EXECUTIVE ORDER
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-mono">
                  {currentOrder.status}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 font-mono mt-1">Generated: {currentOrder.date}</p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-zinc-500 font-mono block">Order Total</span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
              ${currentOrder.total.toFixed(2)} USD
            </span>
          </div>
        </div>

        {/* Customer & Shipping Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
          <div className="p-5 rounded-2xl bg-black border border-zinc-800 space-y-2">
            <span className="text-zinc-500 block uppercase text-[10px] font-bold">Customer Profile</span>
            <div className="text-white font-bold text-sm">{currentOrder.customerName}</div>
            <div className="text-zinc-400">{currentOrder.customerEmail}</div>
            <div className="text-zinc-500">Internal Account ID: {currentOrder.customerId}</div>
          </div>

          <div className="p-5 rounded-2xl bg-black border border-zinc-800 space-y-2">
            <span className="text-zinc-500 block uppercase text-[10px] font-bold">Delivery Destination</span>
            <div className="text-zinc-300 leading-relaxed">{currentOrder.shippingAddress}</div>
          </div>
        </div>

        {/* Purchased Items List */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-semibold uppercase text-zinc-400">
            Purchased Line Items
          </h3>
          <div className="rounded-2xl border border-zinc-800 bg-black overflow-hidden divide-y divide-zinc-800">
            {currentOrder.items.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="font-bold text-white text-sm block">{item.name}</span>
                  <span className="text-zinc-500">Quantity: {item.quantity} × ${item.price.toFixed(2)}</span>
                </div>
                <span className="font-bold text-emerald-400 text-sm">
                  ${(item.quantity * item.price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Confidential Internal Notes (Leaked via IDOR) */}
        {currentOrder.internalNotes && (
          <div className="p-5 rounded-2xl bg-black border border-zinc-800 space-y-1.5 text-xs font-mono">
            <span className="text-amber-400 font-bold block">Internal Dispatch Notes:</span>
            <p className="text-zinc-300 leading-relaxed">{currentOrder.internalNotes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
