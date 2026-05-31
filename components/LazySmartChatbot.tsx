"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const SmartChatbot = dynamic(() => import("@/components/SmartChatbot"), {
  ssr: false,
  loading: () => null,
});

export default function LazySmartChatbot() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const loadChatbot = () => setShouldLoad(true);

    if ("requestIdleCallback" in window && "cancelIdleCallback" in window) {
      const idleId = window.requestIdleCallback(loadChatbot, { timeout: 8000 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timer = window.setTimeout(loadChatbot, 8000);
    return () => window.clearTimeout(timer);
  }, []);

  return shouldLoad ? <SmartChatbot /> : null;
}
