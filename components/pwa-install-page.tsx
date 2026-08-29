"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function isIOSDevice() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const iPadOS = window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1;
  return iOS || iPadOS;
}

function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

export default function PwaInstallPage() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showIOS, setShowIOS] = useState(false);

  useEffect(() => {
    setIsIOS(isIOSDevice());
    setInstalled(isStandaloneMode());

    const beforeInstall = (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent;
      installEvent.preventDefault();
      setPromptEvent(installEvent);
    };

    const appInstalled = () => {
      localStorage.setItem("jrt-pwa-installed", "1");
      localStorage.removeItem("jrt-pwa-dismissed-until");
      setInstalled(true);
      setPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", beforeInstall);
    window.addEventListener("appinstalled", appInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstall);
      window.removeEventListener("appinstalled", appInstalled);
    };
  }, []);

  const install = async () => {
    if (installed) {
      window.location.href = "/home";
      return;
    }

    if (isIOS) {
      setShowIOS(true);
      return;
    }

    if (promptEvent) {
      await promptEvent.prompt();
      const result = await promptEvent.userChoice;
      if (result.outcome === "accepted") {
        localStorage.setItem("jrt-pwa-installed", "1");
        localStorage.removeItem("jrt-pwa-dismissed-until");
      }
      setPromptEvent(null);
      return;
    }

    setShowIOS(false);
  };

  return (
    <main className="install-page">
      <section className="install-card">
        <div className="install-app-icon" aria-hidden="true">JRT</div>
        <p className="install-kicker">JRT.Community</p>
        <h1>{installed ? "JRT is already installed" : "Get the JRT.Community App"}</h1>
        <p className="install-copy">
          Add JRT.Community directly to your phone for faster access. No App Store or Play Store required.
        </p>

        <button className="install-primary" type="button" onClick={install}>
          {installed ? "Open JRT" : isIOS ? "Add to iPhone" : "Install JRT"}
        </button>

        {!installed && !isIOS && !promptEvent && (
          <p className="install-note">
            If the install button is not available yet, open this page in Chrome or your phone&apos;s default browser and use its <strong>Add to Home screen</strong> option.
          </p>
        )}

        {!installed && isIOS && (
          <div className="install-steps">
            <strong>On iPhone</strong>
            <span>1. Open this page in Safari.</span>
            <span>2. Tap the Share button.</span>
            <span>3. Tap Add to Home Screen, then Add.</span>
          </div>
        )}

        {!installed && !isIOS && (
          <div className="install-steps">
            <strong>On Android</strong>
            <span>1. Open this page in Chrome.</span>
            <span>2. Tap Install JRT.</span>
            <span>3. Approve the browser installation prompt.</span>
          </div>
        )}

        <a className="install-secondary" href="/">Continue to JRT.Community</a>
      </section>

      {showIOS && (
        <div className="pwa-ios-backdrop" role="presentation" onClick={() => setShowIOS(false)}>
          <section className="pwa-ios-sheet" role="dialog" aria-modal="true" aria-labelledby="install-ios-title" onClick={(event) => event.stopPropagation()}>
            <div className="pwa-ios-handle" aria-hidden="true" />
            <h2 id="install-ios-title">Add JRT.Community to your iPhone</h2>
            <ol>
              <li>Open this page in <strong>Safari</strong>.</li>
              <li>Tap the <strong>Share</strong> button.</li>
              <li>Tap <strong>Add to Home Screen</strong>.</li>
              <li>Tap <strong>Add</strong>.</li>
            </ol>
            <p>JRT will appear on your Home Screen and open like an app.</p>
            <button className="pwa-ios-done" type="button" onClick={() => setShowIOS(false)}>Got it</button>
          </section>
        </div>
      )}
    </main>
  );
}
