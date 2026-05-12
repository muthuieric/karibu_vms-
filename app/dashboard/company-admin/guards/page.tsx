"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AddGuardModal from "@/components/dashboard/guards/AddGuardModal";
import EditGuardModal from "@/components/dashboard/guards/EditGuardModal";
import GatesManagementCard from "@/components/dashboard/guards/GatesManagementCard";
import GuardsAccountsCard from "@/components/dashboard/guards/GuardsAccountsCard";
import GuardsPageHeader from "@/components/dashboard/guards/GuardsPageHeader";
import GuardsProfileError from "@/components/dashboard/guards/GuardsProfileError";

type GuardProfile = {
  id: string;
  full_name: string;
  role: string;
  gate_id: string | null;
};

type Gate = {
  id: string;
  name: string;
};

export default function ManageGuards() {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [guards, setGuards] = useState<GuardProfile[]>([]);
  const [gates, setGates] = useState<Gate[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Guard Modal State
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newGuard, setNewGuard] = useState({ name: "", email: "", password: "", gateId: "" });

  // Edit Guard Modal State
  const [showEditGuardModal, setShowEditGuardModal] = useState(false);
  const [isEditingGuard, setIsEditingGuard] = useState(false);
  const [editingGuardData, setEditingGuardData] = useState({ id: "", name: "", gateId: "" });

  // Gate Form State
  const [newGateName, setNewGateName] = useState("");
  const [isCreatingGate, setIsCreatingGate] = useState(false);
  
  // Gate Edit State
  const [editingGateId, setEditingGateId] = useState<string | null>(null);
  const [editingGateName, setEditingGateName] = useState("");
  const [isUpdatingGate, setIsUpdatingGate] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    // 1. Get logged-in Admin's profile
    const { data: authData } = await supabase.auth.getUser();
    
    if (authData?.user) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", authData.user.id)
        .single();

      if (profileData?.company_id) {
        setCompanyId(profileData.company_id);
        
        // 2. Fetch all profiles that belong to this building AND have the 'guard' role
        const { data: guardsData } = await supabase
          .from("profiles")
          .select("*")
          .eq("company_id", profileData.company_id)
          .eq("role", "guard")
          .order("created_at", { ascending: false });

        setGuards(guardsData || []);

        // 3. Fetch all gates for this company
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

  // --- GATE CRUD FUNCTIONS ---
  const handleCreateGate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !newGateName.trim()) return;

    setIsCreatingGate(true);
    try {
      const response = await fetch('/api/gates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId, name: newGateName })
      });
      
      const result = await response.json();

      if (!response.ok) {
        console.error("API Error:", result.error);
        alert(`Failed to create gate: ${result.error}`);
        return;
      }

      if (result.data) {
        setGates([...gates, result.data]);
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
      const response = await fetch('/api/gates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingGateId, name: editingGateName })
      });

      const result = await response.json();

      if (!response.ok) {
        alert(`Failed to update gate: ${result.error}`);
        return;
      }

      // Update UI locally
      setGates(gates.map(g => g.id === editingGateId ? { ...g, name: editingGateName } : g));
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
    const confirmDelete = window.confirm(`Are you sure you want to delete the gate "${name}"?\n\nAny guards assigned to this gate will become Unassigned.`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/gates?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        alert(`Failed to delete gate: ${result.error}`);
        return;
      }

      // Remove the gate from the screen instantly
      setGates((prev) => prev.filter((g) => g.id !== id));
      
      // Update any guards that were assigned to this gate locally to show as "Unassigned"
      setGuards((prev) => prev.map(g => g.gate_id === id ? { ...g, gate_id: null } : g));

    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred while deleting the gate.");
    }
  };

  // --- GUARD CRUD FUNCTIONS ---
  const handleCreateGuard = async (e: React.FormEvent) => {
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
          "Authorization": `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({
          fullName: newGuard.name,
          email: newGuard.email,
          password: newGuard.password,
          companyId: companyId,
          gateId: newGuard.gateId === "" ? null : newGuard.gateId, 
        }),
      });

      const result = await response.json();

      if (result.error) {
        alert(`Error: ${result.error}`);
      } else {
        setNewGuard({ name: "", email: "", password: "", gateId: "" });
        setShowModal(false);
        fetchData(); 
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong connecting to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateGuard = async (e: React.FormEvent) => {
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
          "Authorization": `Bearer ${session.access_token}` 
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
        setShowEditGuardModal(false);
        fetchData(); // Refresh the list
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong updating the guard.");
    } finally {
      setIsEditingGuard(false);
    }
  };

  const handleDeleteGuard = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to PERMANENTLY delete ${name}'s account?`);
    if (!confirmDelete) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert("Session expired. Please log in again.");
        return;
      }

      const response = await fetch(`/api/guards?id=${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${session.access_token}` 
        }
      });

      const result = await response.json();

      if (result.error) {
        alert(`Error: ${result.error}`);
      } else {
        setGuards((prev) => prev.filter((g) => g.id !== id));
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete guard.");
    }
  };

  const getGateName = (gateId: string | null) => {
    if (!gateId) return "Unassigned";
    const gate = gates.find(g => g.id === gateId);
    return gate ? gate.name : "Unknown Gate";
  };

  const openEditGuardModal = (guard: GuardProfile) => {
    setEditingGuardData({
      id: guard.id,
      name: guard.full_name,
      gateId: guard.gate_id || "",
    });
    setShowEditGuardModal(true);
  };

  if (!companyId && !loading) {
    return <GuardsProfileError />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        <GuardsPageHeader onAddGuard={() => setShowModal(true)} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GatesManagementCard
            gates={gates}
            newGateName={newGateName}
            isCreatingGate={isCreatingGate}
            editingGateId={editingGateId}
            editingGateName={editingGateName}
            isUpdatingGate={isUpdatingGate}
            onNewGateNameChange={setNewGateName}
            onCreateGate={handleCreateGate}
            onEditGateStart={(gate) => {
              setEditingGateId(gate.id);
              setEditingGateName(gate.name);
            }}
            onEditingGateNameChange={setEditingGateName}
            onUpdateGate={handleUpdateGate}
            onCancelEditGate={() => setEditingGateId(null)}
            onDeleteGate={handleDeleteGate}
          />

          <GuardsAccountsCard
            loading={loading}
            guards={guards}
            getGateName={getGateName}
            onEditGuard={openEditGuardModal}
            onDeleteGuard={handleDeleteGuard}
          />
        </div>
      </div>

      {showModal && (
        <AddGuardModal
          gates={gates}
          newGuard={newGuard}
          isSubmitting={isSubmitting}
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateGuard}
          onNewGuardChange={setNewGuard}
        />
      )}

      {showEditGuardModal && (
        <EditGuardModal
          gates={gates}
          editingGuardData={editingGuardData}
          isEditingGuard={isEditingGuard}
          onClose={() => setShowEditGuardModal(false)}
          onSubmit={handleUpdateGuard}
          onEditingGuardDataChange={setEditingGuardData}
        />
      )}
    </div>
  );
}
