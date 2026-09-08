import React from 'react';
import { useStore } from './context/StoreContext';
import { Navbar } from './components/layout/Navbar';
import { PortSwiggerBanner } from './components/layout/PortSwiggerBanner';
import { SimulatedUrlBar } from './components/layout/SimulatedUrlBar';
import { StoreCatalog } from './components/views/StoreCatalog';
import { LoginView } from './components/views/LoginView';
import { ProductView } from './components/views/ProductView';
import { CartCheckoutView } from './components/views/CartCheckoutView';
import { OrderHistoryView } from './components/views/OrderHistoryView';
import { PathTraversalView } from './components/views/PathTraversalView';
import { CommandInjectionView } from './components/views/CommandInjectionView';
import { LabCatalogView } from './components/views/LabCatalogView';
import { ViewSourceModal } from './components/modals/ViewSourceModal';
import { SolutionDrawer } from './components/modals/SolutionDrawer';
import { InterceptorDrawer } from './components/modals/InterceptorDrawer';
import { CheckCircleIcon, AlertTriangleIcon, BugIcon, XIcon, ShieldIcon } from './components/ui/Icons';
import { ToastMessage } from './context/StoreContext';

export function App() {
  const { currentView, toasts, removeToast } = useStore();

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Navbar */}
      <Navbar />

      {/* PortSwigger Dynamic Lab Objective & Solved Banner */}
      <PortSwiggerBanner />

      {/* Simulated Browser Address Bar for direct URL-based IDOR, SQLi & XSS */}
      <SimulatedUrlBar />

      {/* Main Full-Width View Area (fills wide screens without empty side gaps) */}
      <main className="flex-1 max-w-[1750px] w-full mx-auto px-4 sm:px-8 py-6">
        {currentView === 'store' && <StoreCatalog />}
        {currentView === 'login' && <LoginView />}
        {currentView === 'product' && <ProductView />}
        {currentView === 'cart' && <CartCheckoutView />}
        {currentView === 'orders' && <OrderHistoryView />}
        {currentView === 'docs' && <PathTraversalView />}
        {currentView === 'diagnostics' && <CommandInjectionView />}
        {currentView === 'labs' && <LabCatalogView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black py-8 text-center text-xs text-zinc-500 space-y-2">
        <div className="flex items-center justify-center space-x-2 text-zinc-400 font-mono">
          <ShieldIcon className="w-4 h-4 text-emerald-400" />
          <span>CYBERFORGE — Practical Web Security Range & Simulator</span>
        </div>
        <p className="max-w-xl mx-auto text-zinc-500 text-xs">
          Built for hands-on learning with realistic web targets. Features live SQL query execution, DOM XSS execution, IDOR horizontal escalation, and in-app URL bar parameter manipulation.
        </p>
      </footer>

      {/* Modals and Drawers */}
      <ViewSourceModal />
      <SolutionDrawer />
      <InterceptorDrawer />

      {/* Toast Notification Container */}
      <div className="fixed top-24 right-6 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t: ToastMessage) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl flex items-start space-x-3 text-xs animate-in slide-in-from-right duration-200 ${
              t.type === 'flag' || t.type === 'success'
                ? 'bg-zinc-950/95 border-emerald-500 text-emerald-300'
                : t.type === 'danger'
                ? 'bg-zinc-950/95 border-red-500 text-red-300'
                : 'bg-zinc-950/95 border-zinc-800 text-zinc-200'
            }`}
          >
            <div className="pt-0.5 shrink-0">
              {t.type === 'flag' || t.type === 'success' ? (
                <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
              ) : t.type === 'danger' ? (
                <AlertTriangleIcon className="w-5 h-5 text-red-400" />
              ) : (
                <BugIcon className="w-5 h-5 text-emerald-400" />
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-0.5">
              <h4 className="font-bold text-white text-sm">{t.title}</h4>
              <p className="leading-relaxed break-words text-zinc-300">{t.message}</p>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-zinc-500 hover:text-zinc-300 transition cursor-pointer p-0.5"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
