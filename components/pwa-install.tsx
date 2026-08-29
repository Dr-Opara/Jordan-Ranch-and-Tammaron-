"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const INSTALLED_KEY = "jrt-pwa-installed";
const DISMISSED_UNTIL_KEY = "jrt-pwa-dismissed-until";
const DISMISS_DAYS = 7;

function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

function isIOSDevice() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const iPadOS = window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1;
  return iOS || iPadOS;
}

export default function PwaInstall() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  const allowed = useMemo(() => {
    if (!pathname) return true;
    return !(
      pathname.startsWith("/advertise") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/api")
    );
  }, [pathname]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!allowed || isStandaloneMode()) {
      if (isStandaloneMode()) localStorage.setItem(INSTALLED_KEY, "1");
      setVisible(false);
      return;
    }

    if (localStorage.getItem(INSTALLED_KEY) === "1") return;

    const dismissedUntil = Number(localStorage.getItem(DISMISSED_UNTIL_KEY) || 0);
    if (dismissedUntil > Date.now()) return;

    const ios = isIOSDevice();
    setIsIOS(ios);
    if (ios) setVisible(true);

    const onBeforeInstallPrompt = (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent;
      installEvent.preventDefault();
      setDeferredPrompt(installEvent);
      setVisible(true);
    };

    const onInstalled = () => {
      localStorage.setItem(INSTALLED_KEY, "1");
      localStorage.removeItem(DISMISSED_UNTIL_KEY);
      setDeferredPrompt(null);
      setShowIOSInstructions(false);
      setVisible(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [allowed]);

  const install = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      localStorage.setItem(INSTALLED_KEY, "1");
      localStorage.removeItem(DISMISSED_UNTIL_KEY);
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISSED_UNTIL_KEY, String(Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000));
    setVisible(false);
  };

  if (!allowed || !visible) return null;

  return (
    <>
      <aside className="pwa-install-banner" aria-label="Install JRT.Community">
        <div className="pwa-install-icon" aria-hidden="true"><img src="/icon-192" alt="" /></div>
        <div className="pwa-install-copy">
          <strong>Get the JRT App</strong>
          <span>{isIOS ? "Add JRT.Community to your iPhone Home Screen." : "Install JRT.Community for faster access."}</span>
        </div>
        <button className="pwa-install-button" type="button" onClick={install}>{isIOS ? "Add" : "Install"}</button>
        <button className="pwa-install-close" type="button" aria-label="Dismiss install prompt" onClick={dismiss}>×</button>
      </aside>

      {showIOSInstructions && (
        <div className="pwa-ios-backdrop" role="presentation" onClick={() => setShowIOSInstructions(false)}>
          <section className="pwa-ios-sheet" role="dialog" aria-modal="true" aria-labelledby="pwa-ios-title" onClick={(event) => event.stopPropagation()}>
            <div className="pwa-ios-handle" aria-hidden="true" />
            <h2 id="pwa-ios-title">Add JRT.Community to your iPhone</h2>
            <ol>
              <li>Tap the <strong>Share</strong> button in Safari.</li>
              <li>Scroll and tap <strong>Add to Home Screen</strong>.</li>
              <li>Tap <strong>Add</strong>.</li>
            </ol>
            <p>JRT will appear on your Home Screen and open like an app.</p>
            <button className="pwa-ios-done" type="button" onClick={() => setShowIOSInstructions(false)}>Got it</button>
          </section>
        </div>
      )}
    </>
  );
}
