import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  BugIcon,
  ShoppingCartIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  SparklesIcon,
  XIcon,
} from '../ui/Icons';

export function ProductView() {
  const {
    products,
    selectedProductId,
    reviews,
    addReview,
    addToCart,
    setCurrentView,
    setActiveLabId,
    user,
  } = useStore();

  const product = products.find((p) => p.id === selectedProductId) || products[0];
  const productReviews = reviews.filter((r) => r.productId === product.id);

  const [authorName, setAuthorName] = useState(user?.name || '');
  const [commentInput, setCommentInput] = useState('');
  const [rating, setRating] = useState(5);
  
  // Stored XSS simulated browser popup state
  const [activeXssAlert, setActiveXssAlert] = useState<{
    open: boolean;
    cookie: string;
  } | null>(null);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto p-8 rounded-3xl bg-zinc-950 border border-zinc-800 text-center space-y-5 my-12">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
          <AlertTriangleIcon className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Authentication Required</h2>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Please create an account or sign in to view product specs and submit community reviews.
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

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const res = addReview(product.id, authorName, commentInput, rating);
    if (res.triggeredXss && res.cookieStolen) {
      setActiveXssAlert({
        open: true,
        cookie: res.cookieStolen,
      });
    }
    setCommentInput('');
  };

  return (
    <div className="w-full space-y-10">
      {/* Simulated Browser Alert Modal for XSS */}
      {activeXssAlert && activeXssAlert.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in zoom-in-95 duration-150">
          <div className="bg-zinc-900 border-2 border-red-500 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-red-400 font-mono font-bold text-xs uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping"></span>
              <span>cybermart.internal says:</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-amber-300 break-all select-all leading-relaxed shadow-inner">
              {activeXssAlert.cookie}
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              🚨 <span className="font-bold text-white">Cross-Site Scripting Executed!</span> The browser executed the injected JavaScript inside the page context and accessed <code className="text-emerald-400">document.cookie</code>!
            </p>

            <button
              onClick={() => setActiveXssAlert(null)}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold font-mono text-xs rounded-xl transition cursor-pointer"
            >
              OK (Dismiss Alert)
            </button>
          </div>
        </div>
      )}

      {/* Product Hero Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Product Image */}
        <div className="rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl h-96 relative group">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90"
          />
        </div>

        {/* Product Details */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono">
              <span>{product.category}</span>
              <span>•</span>
              <span className="text-amber-400">★ {product.rating} (Verified Hardware)</span>
            </div>

            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {product.name}
            </h1>

            <p className="text-sm text-zinc-300 leading-relaxed">
              {product.description}
            </p>

            <div className="pt-4 flex items-baseline space-x-3">
              <span className="text-3xl font-black font-mono text-emerald-400">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-sm font-mono text-zinc-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800 flex items-center space-x-4">
            <button
              onClick={() => {
                addToCart(product);
                setCurrentView('cart');
              }}
              className="flex-1 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm tracking-wide transition cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
            >
              <ShoppingCartIcon className="w-4 h-4 text-zinc-950" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reviews & Stored XSS Lab Section */}
      <div className="pt-8 border-t border-zinc-800 space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-mono mb-2">
              <BugIcon className="w-3.5 h-3.5" />
              <span>STORED XSS — LAB 3 TARGET</span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              Customer Reviews & Community Feedback
            </h2>
            <p className="text-xs text-zinc-400">
              User submissions are stored in the database and rendered without output encoding.
            </p>
          </div>
        </div>

        {/* Review Submission Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 shadow-xl">
          <h3 className="text-base font-bold text-white">
            Leave a Customer Review
          </h3>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono font-semibold text-zinc-300 block mb-1">
                  Your Name / Alias
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Anonymous Researcher"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-sm text-white font-mono focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-semibold text-zinc-300 block mb-1">
                  Rating
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-sm text-white font-mono focus:border-violet-500 focus:outline-none"
                >
                  <option value={5}>★★★★★ (5/5)</option>
                  <option value={4}>★★★★☆ (4/5)</option>
                  <option value={3}>★★★☆☆ (3/5)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono font-semibold text-zinc-300 block mb-1">
                Review Comment (Unsanitized Input Field)
              </label>
              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                rows={3}
                placeholder="Type review or paste XSS payload..."
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-700 text-sm text-white font-mono focus:border-violet-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs font-mono tracking-wide transition cursor-pointer shadow-lg shadow-violet-600/20"
            >
              Submit Stored Review
            </button>
          </form>
        </div>

        {/* Rendered Reviews List */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">
            Existing Verified Reviews ({productReviews.length})
          </h3>

          <div className="space-y-4">
            {productReviews.map((rev) => (
              <div
                key={rev.id}
                className={`p-5 rounded-2xl border bg-zinc-900/80 space-y-3 ${
                  rev.isMalicious
                    ? 'border-red-500/80 bg-red-950/20 ring-1 ring-red-500/30'
                    : 'border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={rev.avatar}
                      alt={rev.author}
                      className="w-8 h-8 rounded-full bg-zinc-950 border border-zinc-700"
                    />
                    <div>
                      <span className="text-xs font-bold text-white font-mono">
                        {rev.author}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono ml-2">
                        {rev.createdAt}
                      </span>
                    </div>
                  </div>

                  {rev.isMalicious && (
                    <span className="px-2.5 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800 text-[10px] font-mono font-bold">
                      MALICIOUS SCRIPT DETECTED & EXECUTED
                    </span>
                  )}
                </div>

                {/* Raw unescaped rendering for demonstration! */}
                <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-xs text-zinc-200 leading-relaxed font-sans">
                  {/* Safely inject for HTML tags demo without crashing React */}
                  <div dangerouslySetInnerHTML={{ __html: rev.comment }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
