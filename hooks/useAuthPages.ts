"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TURNSTILE_ENABLED, TURNSTILE_ERROR_MESSAGE } from "@/components/auth/AuthTurnstile";
import { getAppUrl } from "@/lib/app-url";
import { isStrongPassword, PASSWORD_REQUIREMENTS_MESSAGE } from "@/lib/password-policy";
import { supabase } from "@/lib/supabase";
import { compressLogoImage, fileToBase64, validateLogoFile } from "@/lib/company-logo";

const EXPIRED_RESET_LINK_MESSAGE = "This reset link has expired or is invalid. Please request a new password reset link.";
const RATE_LIMIT_MESSAGE = "Too many reset emails were requested. Please wait a few minutes before trying again.";

export function useLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const getSafeNextUrl = () => {
    const next = new URLSearchParams(window.location.search).get("next");
    if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
    return next;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (TURNSTILE_ENABLED && !captchaToken) {
      setError(TURNSTILE_ERROR_MESSAGE);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: { captchaToken: captchaToken ?? undefined },
      });
      if (authError) throw authError;

      if (authData.user) {
        let profile: { role?: string | null; company_id?: string | null } | null = null;

        try {
          const { data: fetchedProfile, error: profileError } = await supabase
            .from("profiles")
            .select("role, company_id")
            .eq("id", authData.user.id)
            .maybeSingle();

          if (!profileError && fetchedProfile) {
            profile = fetchedProfile;
          }
        } catch {
          // Ignore fetch error and proceed to auto-heal
        }

        // 1. Auto-heal: call profile-sync API to insert/sync missing profile
        if (!profile) {
          try {
            const syncRes = await fetch("/api/auth/profile-sync", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(authData.session?.access_token
                  ? { Authorization: `Bearer ${authData.session.access_token}` }
                  : {}),
              },
              body: JSON.stringify({ userId: authData.user.id }),
            });
            if (syncRes.ok) {
              const syncData = await syncRes.json();
              if (syncData.profile) {
                profile = syncData.profile;
              }
            }
          } catch (syncErr) {
            console.warn("Profile sync error during login:", syncErr);
          }
        }

        // 2. Fallback: check user_metadata on authData.user directly
        if (!profile) {
          const meta = authData.user.user_metadata || {};
          const metaRole = meta.role ? String(meta.role).trim().toLowerCase() : null;
          if (metaRole) {
            profile = {
              role: metaRole,
              company_id: meta.companyId || meta.company_id || null,
            };
          }
        }

        if (!profile) {
          await supabase.auth.signOut();
          throw new Error(`Profile not found! Please check your database. Your exact Auth UUID is: ${authData.user.id}`);
        }

        const rawRole = profile.role || "";
        const userRole = rawRole.trim().toLowerCase();

        if (userRole === "super_admin" || userRole === "superadmin") {
          window.location.href = "/dashboard/superadmin";
        } else if (userRole === "admin" || userRole === "company_admin" || userRole === "company-admin") {
          if (profile.company_id) {
            const { data: company } = await supabase.from("companies").select("hard_locked").eq("id", profile.company_id).maybeSingle();
            if (company?.hard_locked) {
              window.location.href = "/dashboard/company-admin";
              return;
            }
          }
          window.location.href = "/dashboard/company-admin";
        } else if (userRole === "guard") {
          const nextUrl = getSafeNextUrl();
          if (profile.company_id) {
            const { data: company } = await supabase.from("companies").select("hard_locked").eq("id", profile.company_id).maybeSingle();
            if (company?.hard_locked) {
              window.location.href = nextUrl || "/dashboard/guard";
              return;
            }
          }
          window.location.href = nextUrl || "/dashboard/guard";
        } else if (userRole === "host") {
          const nextUrl = getSafeNextUrl();
          window.location.href = nextUrl || "/dashboard/host";
        } else {
          setError(`Your account has an unknown role: "${rawRole}"`);
          await supabase.auth.signOut();
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid login credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    password,
    loading,
    error,
    captchaToken,
    isCaptchaEnabled: TURNSTILE_ENABLED,
    setEmail,
    setPassword,
    setCaptchaToken,
    setError,
    handleLogin,
  };
}

export function useRegisterPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    companyName: "",
    address: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    planTier: "basic",
  });

  const handleLogoChange = async (file: File | null) => {
    if (!file) {
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }

    const validation = validateLogoFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid logo file.");
      return;
    }

    setError(null);
    setLogoFile(file);

    try {
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    } catch {
      setLogoPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (TURNSTILE_ENABLED && !captchaToken) {
      setError(TURNSTILE_ERROR_MESSAGE);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    if (!isStrongPassword(formData.password)) {
      setError(PASSWORD_REQUIREMENTS_MESSAGE);
      return;
    }

    setLoading(true);
    try {
      let logoPayload: { logoBase64?: string; logoExt?: string; logoMimeType?: string } = {};

      if (logoFile) {
        try {
          const compressed = await compressLogoImage(logoFile);
          const base64 = await fileToBase64(compressed.file);
          logoPayload = {
            logoBase64: base64,
            logoExt: compressed.ext,
            logoMimeType: compressed.contentType,
          };
        } catch (compressionErr) {
          console.error("Logo compression error:", compressionErr);
          setError(compressionErr instanceof Error ? compressionErr.message : "Failed to process logo.");
          setLoading(false);
          return;
        }
      }

      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, ...logoPayload, captchaToken }),
      });
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSuccess(true);
      }
    } catch (error) {
      console.error(error);
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    success,
    error,
    captchaToken,
    isCaptchaEnabled: TURNSTILE_ENABLED,
    formData,
    logoFile,
    logoPreview,
    handleLogoChange,
    setFormData,
    setCaptchaToken,
    setError,
    handleSubmit,
  };
}

export function useForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (TURNSTILE_ENABLED && !captchaToken) {
      setError(TURNSTILE_ERROR_MESSAGE);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getAppUrl()}/reset-password`,
        captchaToken: captchaToken ?? undefined,
      });

      if (error) {
        const message = error.message.toLowerCase();
        if (message.includes("rate limit") || message.includes("too many")) {
          setError(RATE_LIMIT_MESSAGE);
        } else {
          setError(error.message);
        }
      } else {
        setSuccess(true);
      }
    } catch (error) {
      console.error(error);
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    success,
    error,
    captchaToken,
    isCaptchaEnabled: TURNSTILE_ENABLED,
    email,
    setEmail,
    setCaptchaToken,
    setError,
    handleSubmit,
  };
}

export function useResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingLink, setCheckingLink] = useState(true);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let mounted = true;

    const prepareRecoverySession = async () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const queryParams = new URLSearchParams(window.location.search);
      const urlError = hashParams.get("error") || queryParams.get("error");
      const urlErrorCode = hashParams.get("error_code") || queryParams.get("error_code");

      if (urlError || urlErrorCode) {
        if (mounted) {
          setRecoveryError(EXPIRED_RESET_LINK_MESSAGE);
          setCheckingLink(false);
        }
        return;
      }

      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          if (mounted) {
            setRecoveryError(EXPIRED_RESET_LINK_MESSAGE);
            setCheckingLink(false);
          }
          return;
        }

        window.history.replaceState(null, document.title, window.location.pathname);
      }

      const { data, error } = await supabase.auth.getSession();
      if (mounted) {
        if (error || !data.session) {
          setRecoveryError(EXPIRED_RESET_LINK_MESSAGE);
        }
        setCheckingLink(false);
      }
    };

    prepareRecoverySession();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!password) {
      setFormError("Password is required.");
      return;
    }

    if (!isStrongPassword(password)) {
      setFormError(PASSWORD_REQUIREMENTS_MESSAGE);
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match. Please try again.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setFormError(error.message);
      } else {
        setSuccess(true);
        window.setTimeout(() => router.push("/login"), 1500);
      }
    } catch (error) {
      console.error(error);
      setFormError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    checkingLink,
    recoveryError,
    formError,
    success,
    password,
    confirmPassword,
    setPassword,
    setConfirmPassword,
    handleSubmit,
  };
}
