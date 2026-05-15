"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const SmartChatbot = dynamic(() => import("@/components/SmartChatbot"), {
  ssr: false,
});

export default function LazySmartChatbot() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(() => setShouldLoad(true), { timeout: 3000 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timer = globalThis.setTimeout(() => setShouldLoad(true), 1500);
    return () => globalThis.clearTimeout(timer);
  }, []);

  return shouldLoad ? <SmartChatbot /> : null;
}
