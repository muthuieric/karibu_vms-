"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type Ticket = {
  id: string;
  subject: string;
  description: string;
  status: "pending" | "in_progress" | "resolved";
  created_at: string;
};

export function useCompanySupport() {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data: authData } = await supabase.auth.getUser();

    if (authData?.user) {
      setUserId(authData.user.id);
      const { data: profileData } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", authData.user.id)
        .single();

      if (profileData?.company_id) {
        setCompanyId(profileData.company_id);

        try {
          const res = await fetch(`/api/support?company_id=${profileData.company_id}`);
          if (res.ok) {
            const json = await res.json();
            if (json.data) setTickets(json.data);
          }
        } catch (err) {
          console.error("Error fetching tickets:", err);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !userId || !subject.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: companyId, created_by: userId, subject, description }),
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error);

      setTickets((prev) => [result.data, ...prev]);
      setSubject("");
      setDescription("");
      alert("Ticket submitted successfully! Our team will review it shortly.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit ticket.";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    companyId,
    tickets,
    loading,
    subject,
    description,
    isSubmitting,
    setSubject,
    setDescription,
    handleSubmitTicket,
  };
}
