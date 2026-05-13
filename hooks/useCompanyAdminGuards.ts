"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type GuardProfile = {
  id: string;
  full_name: string;
  role: string;
  gate_id: string | null;
};

export type Gate = {
  id: string;
  name: string;
};

export function useCompanyAdminGuards() {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [guards, setGuards] = useState<GuardProfile[]>([]);
  const [gates, setGates] = useState<Gate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newGuard, setNewGuard] = useState({ name: "", email: "", password: "", gateId: "" });
  const [isEditingGuard, setIsEditingGuard] = useState(false);
  const [editingGuardData, setEditingGuardData] = useState({ id: "", name: "", gateId: "" });
  const [newGateName, setNewGateName] = useState("");
  const [isCreatingGate, setIsCreatingGate] = useState(false);
  const [editingGateId, setEditingGateId] = useState<string | null>(null);
  const [editingGateName, setEditingGateName] = useState("");
  const [isUpdatingGate, setIsUpdatingGate] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data: authData } = await supabase.auth.getUser();

    if (authData?.user) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", authData.user.id)
        .single();

      if (profileData?.company_id) {
        setCompanyId(profileData.company_id);

        const { data: guardsData } = await supabase
          .from("profiles")
          .select("*")
          .eq("company_id", profileData.company_id)
          .eq("role", "guard")
          .order("created_at", { ascending: false });

        setGuards(guardsData || []);

        try {
          const gatesRes = await fetch(`/api/gates?company_id=${profileData.company_id}`);
          if (gatesRes.ok) {
            const gatesJson = await gatesRes.json();
            if (gatesJson.data) setGates(gatesJson.data);
          }
        } catch (error) {
          console.error("Error fetching gates:", error);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const handleCreateGate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !newGateName.trim()) return;

    setIsCreatingGate(true);
    try {
      const response = await fetch("/api/gates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: companyId, name: newGateName }),
      });
      const result = await response.json();

      if (!response.ok) {
        alert(`Failed to create gate: ${result.error}`);
        return;
      }

      if (result.data) {
        setGates((prev) => [...prev, result.data]);
        setNewGateName("");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred while creating the gate.");
    } finally {
      setIsCreatingGate(false);
    }
  };

  const handleUpdateGate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGateId || !editingGateName.trim()) return;

    setIsUpdatingGate(true);
    try {
      const response = await fetch("/api/gates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingGateId, name: editingGateName }),
      });
      const result = await response.json();

      if (!response.ok) {
        alert(`Failed to update gate: ${result.error}`);
        return;
      }

      setGates((prev) => prev.map((gate) => (gate.id === editingGateId ? { ...gate, name: editingGateName } : gate)));
      setEditingGateId(null);
      setEditingGateName("");
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred while updating the gate.");
    } finally {
      setIsUpdatingGate(false);
    }
  };

  const handleDeleteGate = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the gate "${name}"?\n\nAny guards assigned to this gate will become Unassigned.`)) return;

    try {
      const response = await fetch(`/api/gates?id=${id}`, { method: "DELETE" });
      const result = await response.json();

      if (!response.ok) {
        alert(`Failed to delete gate: ${result.error}`);
        return;
      }

      setGates((prev) => prev.filter((gate) => gate.id !== id));
      setGuards((prev) => prev.map((guard) => (guard.gate_id === id ? { ...guard, gate_id: null } : guard)));
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred while deleting the gate.");
    }
  };

  const handleCreateGuard = async (e: React.FormEvent, onSuccess?: () => void) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert("Session expired. Please log in again.");
        return;
      }

      const response = await fetch("/api/guards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          fullName: newGuard.name,
          email: newGuard.email,
          password: newGuard.password,
          companyId,
          gateId: newGuard.gateId === "" ? null : newGuard.gateId,
        }),
      });
      const result = await response.json();

      if (result.error) {
        alert(`Error: ${result.error}`);
      } else {
        setNewGuard({ name: "", email: "", password: "", gateId: "" });
        onSuccess?.();
        fetchData();
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong connecting to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateGuard = async (e: React.FormEvent, onSuccess?: () => void) => {
    e.preventDefault();
    setIsEditingGuard(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert("Session expired. Please log in again.");
        return;
      }

      const response = await fetch("/api/guards", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          id: editingGuardData.id,
          fullName: editingGuardData.name,
          gateId: editingGuardData.gateId === "" ? null : editingGuardData.gateId,
        }),
      });
      const result = await response.json();

      if (result.error) {
        alert(`Error: ${result.error}`);
      } else {
        onSuccess?.();
        fetchData();
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong updating the guard.");
    } finally {
      setIsEditingGuard(false);
    }
  };

  const handleDeleteGuard = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to PERMANENTLY delete ${name}'s account?`)) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert("Session expired. Please log in again.");
        return;
      }

      const response = await fetch(`/api/guards?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const result = await response.json();

      if (result.error) {
        alert(`Error: ${result.error}`);
      } else {
        setGuards((prev) => prev.filter((guard) => guard.id !== id));
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete guard.");
    }
  };

  const getGateName = (gateId: string | null) => {
    if (!gateId) return "Unassigned";
    const gate = gates.find((item) => item.id === gateId);
    return gate ? gate.name : "Unknown Gate";
  };

  const startEditGuard = (guard: GuardProfile) => {
    setEditingGuardData({
      id: guard.id,
      name: guard.full_name,
      gateId: guard.gate_id || "",
    });
  };

  return {
    companyId,
    guards,
    gates,
    loading,
    isSubmitting,
    newGuard,
    isEditingGuard,
    editingGuardData,
    newGateName,
    isCreatingGate,
    editingGateId,
    editingGateName,
    isUpdatingGate,
    setNewGuard,
    setEditingGuardData,
    setNewGateName,
    setEditingGateId,
    setEditingGateName,
    handleCreateGate,
    handleUpdateGate,
    handleDeleteGate,
    handleCreateGuard,
    handleUpdateGuard,
    handleDeleteGuard,
    getGateName,
    startEditGuard,
  };
}
