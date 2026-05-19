"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISSED_KEY = "karibu-vms-install-prompt-dismissed";

function isIosSafari() {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/CriOS|FxiOS|EdgiOS/.test(userAgent);

  return isIos && isSafari;
}

function isStandalone() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && window.navigator.standalone === true)
  );
}

export default function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const wasDismissed = window.localStorage.getItem(DISMISSED_KEY) === "true";

    if (wasDismissed || isStandalone()) {
      return;
    }

    if (isIosSafari()) {
      window.setTimeout(() => {
        setShowIosPrompt(true);
        setIsVisible(true);
      }, 0);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    const handleInstalled = () => {
      setInstallEvent(null);
      setIsVisible(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installEvent) {
      return;
    }

    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    window.localStorage.setItem(DISMISSED_KEY, "true");
    setInstallEvent(null);
    setShowIosPrompt(false);
    setIsVisible(false);
  };

  if (!isVisible || (!installEvent && !showIosPrompt)) {
    return null;
  }

  return (
    <div className="fixed inset-x-3 bottom-4 z-50 mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-3 text-slate-900 shadow-lg shadow-slate-900/10 sm:bottom-5 sm:right-5 sm:left-auto sm:mx-0">
      <div className="flex items-start gap-3">
        <Image
          src="/logo.svg"
          alt=""
          width={36}
          height={36}
          className="mt-0.5 h-9 w-9 shrink-0 rounded-md bg-slate-50 object-contain p-1"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-5">
            {showIosPrompt
              ? "On iPhone, tap Share, then Add to Home Screen."
              : "Install Karibu VMS for faster access to visitor check-ins."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {installEvent && (
              <button
                type="button"
                onClick={handleInstall}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Install App
              </button>
            )}
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
