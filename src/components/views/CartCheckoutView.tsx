import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  ShoppingCartIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  BugIcon,
  ArrowRightIcon,
} from '../ui/Icons';
import { CartItem } from '../../types/store';

export function CartCheckoutView() {
  const {
    cart,
    user,
    removeFromCart,
    updateCartItemPrice,
    checkout,
    setCurrentView,
  } = useStore();

  const [tamperedPriceInput, setTamperedPriceInput] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [successfulOrder, setSuccessfulOrder] = useState<any | null>(null);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto p-8 rounded-3xl bg-zinc-950 border border-zinc-800 text-center space-y-5 my-12">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
          <AlertTriangleIcon className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Authentication Required</h2>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            You must create an account or sign in to access the cart, checkout pipeline, and wallet balance.
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

  const laptopItem = cart.find((i: CartItem) => i.product.id === 1);
  const cartTotal = cart.reduce((sum: number, item: CartItem) => {
    const price = item.tamperedPrice !== undefined ? item.tamperedPrice : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const handleApplyTamperedPrice = () => {
    const num = parseFloat(tamperedPriceInput);
    if (!isNaN(num) && laptopItem) {
      updateCartItemPrice(laptopItem.product.id, num);
      setCheckoutError(null);
    }
  };

  const handleCheckoutSubmit = () => {
    setCheckoutError(null);
    const res = checkout();
    if (!res.success) {
      setCheckoutError(res.error || 'Checkout failed');
    } else {
      setSuccessfulOrder(res.order);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
            <BugIcon className="w-3.5 h-3.5" />
            <span>CHECKOUT PIPELINE — LAB 4 TARGET (PRICE MANIPULATION)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Cart & Order Payment Processing
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
            The server calculates billing based on client-sent pricing parameters. Test if you can purchase items below listed cost.
          </p>
        </div>

        {/* User Wallet Balance Badge */}
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-base font-mono">
            $
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 block uppercase font-bold">
              Account Wallet Balance
            </span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              ${user.walletBalance.toFixed(2)} USD
            </span>
          </div>
        </div>
      </div>

      {successfulOrder ? (
        /* Order Confirmation Success State */
        <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-zinc-950 border-2 border-emerald-500/80 shadow-2xl space-y-6 animate-in zoom-in-95">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircleIcon className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                PAYMENT ACCEPTED & PROCESSED
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                Order {successfulOrder.orderNumber} Confirmed!
              </h2>
              <p className="text-xs text-zinc-400 font-mono">Date: {successfulOrder.date}</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-black border border-zinc-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Total Billed to Wallet:</span>
              <span className="text-emerald-400 font-bold text-base">
                ${successfulOrder.total.toFixed(2)} USD
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Remaining Wallet Balance:</span>
              <span className="text-zinc-200 font-bold">
                ${user.walletBalance.toFixed(2)} USD
              </span>
            </div>

            <div className="pt-3 border-t border-zinc-800 text-zinc-300 space-y-1">
              <span className="text-emerald-400 font-bold">EXPLOIT VERIFIED:</span>
              <p className="text-zinc-400">
                You successfully purchased the $1,999.00 workstation using price parameter manipulation! The server trusted the client's submitted price without database verification.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentView('orders')}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition cursor-pointer"
            >
              View Order in History (IDOR Target)
            </button>
            <button
              onClick={() => {
                setSuccessfulOrder(null);
                setCurrentView('store');
              }}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono transition cursor-pointer border border-zinc-800"
            >
              Return to Store
            </button>
          </div>
        </div>
      ) : (
        /* Full-Width Cart Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-xl">
              <h2 className="text-lg font-bold text-white">Cart Summary</h2>

              {cart.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 space-y-3">
                  <ShoppingCartIcon className="w-10 h-10 mx-auto text-zinc-700" />
                  <p className="text-sm">Your cart is empty.</p>
                  <button
                    onClick={() => setCurrentView('store')}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs"
                  >
                    Browse Catalog
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {cart.map((item: CartItem) => {
                    const isTampered = item.tamperedPrice !== undefined;
                    const effectivePrice = item.tamperedPrice !== undefined ? item.tamperedPrice : item.product.price;

                    return (
                      <div
                        key={item.product.id}
                        className="py-4 flex items-center justify-between space-x-4 flex-wrap sm:flex-nowrap gap-y-3"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 rounded-xl object-cover bg-black border border-zinc-800"
                        />

                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-white truncate">
                            {item.product.name}
                          </h3>
                          <p className="text-xs text-zinc-400 font-mono">
                            Qty: {item.quantity} | Catalog Price: ${item.product.price.toFixed(2)}
                          </p>
                          {isTampered && (
                            <span className="inline-flex items-center text-[11px] font-mono text-amber-400 font-bold">
                              ⚠️ PARAMETER TAMPERED: ${effectivePrice.toFixed(2)}
                            </span>
                          )}
                        </div>

                        <div className="text-right space-y-1">
                          <div className="text-base font-bold font-mono text-emerald-400">
                            ${(effectivePrice * item.quantity).toFixed(2)}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-xs text-zinc-500 hover:text-red-400 font-mono transition cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Interactive Parameter Tampering Console */}
            {laptopItem && (
              <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2 font-mono text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <h3 className="font-bold uppercase tracking-wider text-emerald-400">
                      Client-Side Parameter Tampering Console
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500">HTTP Body Inspector</span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  The frontend sends the checkout payload. Because the developer didn't re-validate the price on the server, you can modify the <code className="text-emerald-400 font-mono">price</code> field before sending!
                </p>

                <div className="p-4 rounded-2xl bg-black border border-zinc-800 font-mono text-xs space-y-3">
                  <div className="text-zinc-400">
                    <span className="text-emerald-400 font-bold">POST</span> /api/checkout HTTP/1.1
                  </div>

                  <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                    <span className="text-zinc-400">"productId": {laptopItem.product.id},</span>
                    <span className="text-zinc-400">"price":</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-emerald-400 font-bold">$</span>
                      <input
                        type="text"
                        value={tamperedPriceInput}
                        onChange={(e) => setTamperedPriceInput(e.target.value)}
                        placeholder="Enter custom price..."
                        className="w-44 px-3 py-1.5 rounded-xl bg-zinc-900 border border-emerald-500 text-emerald-300 font-mono font-bold text-xs focus:outline-none placeholder-zinc-600"
                      />
                    </div>
                    <button
                      onClick={handleApplyTamperedPrice}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs transition cursor-pointer"
                    >
                      Apply Tamper
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Checkout Action Card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-white">Payment Summary</h3>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Cart Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Express Shipping</span>
                  <span className="text-emerald-400 font-bold">FREE</span>
                </div>
                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-base font-bold text-white">
                  <span>Total Due</span>
                  <span className="text-emerald-400 font-mono text-xl">${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              {checkoutError && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300 flex items-center space-x-2">
                  <AlertTriangleIcon className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{checkoutError}</span>
                </div>
              )}

              <button
                onClick={handleCheckoutSubmit}
                disabled={cart.length === 0}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs tracking-wider transition cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <span>Pay with Wallet (${user.walletBalance.toFixed(2)})</span>
                <ArrowRightIcon className="w-4 h-4 text-black" />
              </button>

              <p className="text-xs text-zinc-400 text-center leading-relaxed">
                If the total exceeds $50.00, your payment will be declined. Tamper the price parameter above to match your balance!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
