"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isStrongPassword, PASSWORD_REQUIREMENTS_MESSAGE } from "@/lib/password-policy";
import { supabase } from "@/lib/supabase";

export function useLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;

      if (authData.user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .maybeSingle();

        if (profileError) throw new Error(`Database error: ${profileError.message}`);
        if (!profile) throw new Error(`Profile not found! Please check your database. Your exact Auth UUID is: ${authData.user.id}`);

        const rawRole = profile.role || "";
        const userRole = rawRole.trim().toLowerCase();

        if (userRole === "super_admin" || userRole === "superadmin") {
          window.location.href = "/dashboard/superadmin";
        } else if (userRole === "admin" || userRole === "company_admin") {
          window.location.href = "/dashboard/company-admin";
        } else if (userRole === "guard") {
          window.location.href = "/dashboard/guard";
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

  return { email, password, loading, error, setEmail, setPassword, handleLogin };
}

export function useRegisterPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) return alert("Passwords do not match. Please try again.");

    if (!isStrongPassword(formData.password)) {
      return alert(`Weak Password: ${PASSWORD_REQUIREMENTS_MESSAGE}`);
    }

    setLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (data.error) {
        alert(`Registration failed: ${data.error}`);
      } else {
        setSuccess(true);
      }
    } catch (error) {
      console.error(error);
      alert("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { loading, success, formData, setFormData, handleSubmit };
}

export function useForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        alert(`Error: ${error.message}`);
      } else {
        setSuccess(true);
      }
    } catch (error) {
      console.error(error);
      alert("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { loading, success, email, setEmail, handleSubmit };
}

export function useResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) return alert("Passwords do not match. Please try again.");

    if (!isStrongPassword(password)) {
      return alert(`Weak Password: ${PASSWORD_REQUIREMENTS_MESSAGE}`);
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        alert(`Error: ${error.message}`);
      } else {
        alert("Password successfully updated! You can now log in.");
        router.push("/login");
      }
    } catch (error) {
      console.error(error);
      alert("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { loading, password, confirmPassword, setPassword, setConfirmPassword, handleSubmit };
}
