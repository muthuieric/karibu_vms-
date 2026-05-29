// components/analytics/MicrosoftClarity.tsx
"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

export default function MicrosoftClarity() {
  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

    if (!projectId) return;

    Clarity.init(projectId);
  }, []);

  return null;
}