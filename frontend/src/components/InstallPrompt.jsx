import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

/**
 * PWA install prompt — shows a banner when the browser fires
 * the `beforeinstallprompt` event (Chrome/Edge on Android/desktop).
 * On iOS we show static instructions since iOS doesn't support the event.
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already running as standalone (installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    // Detect iOS (Safari doesn't fire beforeinstallprompt)
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isInStandaloneMode = 'standalone' in window.navigator && window.navigator.standalone;
    const dismissed = sessionStorage.getItem('pwa-ios-dismissed');
    if (isIos && !isInStandaloneMode && !dismissed) {
      setShowIosTip(true);
      return;
    }

    // Chrome / Edge
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = sessionStorage.getItem('pwa-dismissed');
      if (!dismissed) setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setShowBanner(false);
      setInstalled(true);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
      setInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const dismissBanner = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa-dismissed', '1');
  };

  const dismissIosTip = () => {
    setShowIosTip(false);
    sessionStorage.setItem('pwa-ios-dismissed', '1');
  };

  if (installed) return null;

  // Chrome/Edge install banner
  if (showBanner) {
    return (
      <div className="pwa-banner" role="complementary" aria-label="Install app">
        <div className="pwa-banner-icon">
          <Smartphone size={22} />
        </div>
        <div className="pwa-banner-content">
          <div className="pwa-banner-title">Install ExpenseIQ</div>
          <div className="pwa-banner-sub">Add to your home screen for a native app experience</div>
        </div>
        <button className="btn btn-primary pwa-install-btn" onClick={handleInstall}>
          <Download size={14} /> Install
        </button>
        <button className="icon-btn pwa-dismiss-btn" onClick={dismissBanner} aria-label="Dismiss">
          <X size={16} />
        </button>
      </div>
    );
  }

  // iOS Safari tip
  if (showIosTip) {
    return (
      <div className="pwa-banner pwa-banner--ios" role="complementary" aria-label="iOS install tip">
        <div className="pwa-banner-icon">
          <Smartphone size={22} />
        </div>
        <div className="pwa-banner-content">
          <div className="pwa-banner-title">Add to Home Screen</div>
          <div className="pwa-banner-sub">
            Tap <strong>Share</strong> → <strong>Add to Home Screen</strong> to install ExpenseIQ
          </div>
        </div>
        <button className="icon-btn pwa-dismiss-btn" onClick={dismissIosTip} aria-label="Dismiss">
          <X size={16} />
        </button>
      </div>
    );
  }

  return null;
}
