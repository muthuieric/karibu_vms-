"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISSED_KEY = "karibu-vms-install-prompt-dismissed-v2";
const DISMISS_DAYS = 7;

function isIosSafari() {
  if (typeof window === "undefined") return false;

  const userAgent = window.navigator.userAgent;
  const isIosDevice = /iPad|iPhone|iPod/.test(userAgent);
  const isIpadOs = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  const isSafari = /Safari/.test(userAgent) && !/CriOS|FxiOS|EdgiOS/.test(userAgent);

  return (isIosDevice || isIpadOs) && isSafari;
}

function isStandalone() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && window.navigator.standalone === true)
  );
}

function wasRecentlyDismissed() {
  const dismissedAt = window.localStorage.getItem(DISMISSED_KEY);
  if (!dismissedAt) return false;

  const dismissedTime = Number(dismissedAt);
  if (Number.isNaN(dismissedTime)) return false;

  const maxAge = DISMISS_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - dismissedTime < maxAge;
}

export default function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showManualPrompt, setShowManualPrompt] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isStandalone() || wasRecentlyDismissed()) return;

    if (isIosSafari()) {
      const iosTimer = window.setTimeout(() => {
        setShowIosPrompt(true);
        setIsVisible(true);
      }, 2500);

      return () => window.clearTimeout(iosTimer);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setShowManualPrompt(false);
      setIsVisible(true);
    };

    const handleInstalled = () => {
      setInstallEvent(null);
      setShowManualPrompt(false);
      setIsVisible(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    const manualTimer = window.setTimeout(() => {
      if (!isStandalone()) {
        setShowManualPrompt(true);
        setIsVisible(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      window.clearTimeout(manualTimer);
    };
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;

    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
    setShowManualPrompt(false);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setInstallEvent(null);
    setShowIosPrompt(false);
    setShowManualPrompt(false);
    setIsVisible(false);
  };

  if (!isVisible || (!installEvent && !showIosPrompt && !showManualPrompt)) return null;

  const message = showIosPrompt
    ? "On iPhone, tap Share, then Add to Home Screen."
    : installEvent
      ? "Install Karibu VMS for faster access to visitor check-ins."
      : "Add Karibu VMS to your home screen from your browser menu for faster access.";

  const manualHelp = showManualPrompt && !installEvent && !showIosPrompt;

  return (
    <div className="fixed inset-x-3 bottom-4 z-50 mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-xl shadow-slate-900/10 sm:bottom-5 sm:left-auto sm:right-5 sm:mx-0">
      <div className="flex items-start gap-3">
        <Image
          src="/logo.svg"
          alt=""
          width={40}
          height={40}
          className="mt-0.5 h-10 w-10 shrink-0 rounded-xl bg-slate-50 object-contain p-1"
        />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-5">{message}</p>

          {manualHelp ? (
            <p className="mt-1 text-xs leading-5 text-slate-500">
              In Chrome, open the three-dot menu and choose Install app or Add to Home screen.
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            {installEvent ? (
              <button
                type="button"
                onClick={handleInstall}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Install App
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
