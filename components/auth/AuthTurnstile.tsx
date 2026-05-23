"use client";

import { Turnstile } from "@marsidev/react-turnstile";

type AuthTurnstileProps = {
  onSuccess: (token: string) => void;
  onFailure: (message: string) => void;
};

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
export const TURNSTILE_ENABLED = Boolean(TURNSTILE_SITE_KEY);
export const TURNSTILE_ERROR_MESSAGE = "CAPTCHA verification failed. Please try again.";
export const TURNSTILE_EXPIRED_MESSAGE = "CAPTCHA verification expired. Please complete it again.";

export function AuthTurnstile({ onSuccess, onFailure }: AuthTurnstileProps) {
  if (!TURNSTILE_ENABLED) return null;

  return (
    <div className="flex min-h-[65px] justify-center">
      <Turnstile
        siteKey={TURNSTILE_SITE_KEY}
        onSuccess={onSuccess}
        onError={() => onFailure(TURNSTILE_ERROR_MESSAGE)}
        onExpire={() => onFailure(TURNSTILE_EXPIRED_MESSAGE)}
        options={{ theme: "light" }}
      />
    </div>
  );
}
