"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AddDepartmentCard from "@/components/dashboard/company-admin/departments/AddDepartmentCard";
import DepartmentsHeader from "@/components/dashboard/company-admin/departments/DepartmentsHeader";
import DepartmentsHostsList from "@/components/dashboard/company-admin/departments/DepartmentsHostsList";
import DepartmentsSearch from "@/components/dashboard/company-admin/departments/DepartmentsSearch";

type Department = { id: string; name: string };
type Host = { id: string; name: string; phone: string; email: string; department_id: string };

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Create Form States
  const [newDeptName, setNewDeptName] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [newHost, setNewHost] = useState({ name: "", phone: "", email: "" });

  // Edit Department States
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [editingDeptName, setEditingDeptName] = useState("");
  const [isUpdatingDept, setIsUpdatingDept] = useState(false);

  // Edit Host States
  const [editingHostId, setEditingHostId] = useState<string | null>(null);
  const [editingHostData, setEditingHostData] = useState({ name: "", phone: "", email: "" });
  const [isUpdatingHost, setIsUpdatingHost] = useState(false);

  const loadDepartmentsAndHosts = async (compId: string) => {
    try {
      const deptsRes = await fetch(`/api/departments?company_id=${compId}`);
      if (deptsRes.ok) {
        const deptsJson = await deptsRes.json();
        if (deptsJson.data) setDepartments(deptsJson.data);
      }

      const hostsRes = await fetch(`/api/hosts?company_id=${compId}`);
      if (hostsRes.ok) {
        const hostsJson = await hostsRes.json();
        if (hostsJson.data) setHosts(hostsJson.data);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const fetchCompanyData = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error("No session found", sessionError);
        setIsLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        alert(`Error fetching profile: ${profileError.message}`);
        setIsLoading(false);
        return;
      }

      if (profile?.company_id) {
        setCompanyId(profile.company_id);
        await loadDepartmentsAndHosts(profile.company_id);
      } else {
        alert("Warning: Your profile does not have an assigned company_id.");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCompanyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- DEPARTMENT CRUD ---
  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !newDeptName.trim()) return;

    try {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId, name: newDeptName })
      });
      
      const result = await response.json();
      if (!response.ok) return alert(`Failed to save: ${result.error}`);

      if (result.data) {
        setDepartments([...departments, result.data]);
        setNewDeptName("");
      }
    } catch (err) {
      console.error("Unexpected department save error:", err);
      alert("An unexpected error occurred while saving.");
    }
  };

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeptId || !editingDeptName.trim()) return;

    setIsUpdatingDept(true);
    try {
      const response = await fetch('/api/departments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingDeptId, name: editingDeptName })
      });

      const result = await response.json();
      if (!response.ok) {
        alert(`Failed to update department: ${result.error}`);
        return;
      }

      setDepartments(departments.map(d => d.id === editingDeptId ? { ...d, name: editingDeptName } : d));
      setEditingDeptId(null);
    } catch (error) {
      console.error("Unexpected department update error:", error);
      alert("An error occurred while updating the department.");
    } finally {
      setIsUpdatingDept(false);
    }
  };

  const handleDeleteDepartment = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the "${name}" department?\n\nAny hosts inside this department will also be removed.`)) return;

    try {
      const response = await fetch(`/api/departments?id=${id}`, { method: 'DELETE' });
      const result = await response.json();

      if (!response.ok) return alert(`Failed to delete: ${result.error}`);

      setDepartments(departments.filter(d => d.id !== id));
      setHosts(hosts.filter(h => h.department_id !== id)); // Remove associated hosts locally
    } catch (error) {
      console.error("Unexpected department delete error:", error);
      alert("An error occurred while deleting.");
    }
  };

  // --- HOST CRUD ---
  const handleAddHost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !selectedDeptId || !newHost.name) return;

    try {
      const response = await fetch('/api/hosts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          company_id: companyId, 
          department_id: selectedDeptId, 
          name: newHost.name, 
          phone: newHost.phone, 
          email: newHost.email 
        })
      });
      
      const result = await response.json();
      if (!response.ok) return alert(`Failed to save host: ${result.error}`);

      if (result.data) {
        setHosts([...hosts, result.data]);
        setNewHost({ name: "", phone: "", email: "" });
        setSelectedDeptId(null);
      }
    } catch (err) {
      console.error("Unexpected host save error:", err);
      alert("An unexpected error occurred while saving.");
    }
  };

  const handleUpdateHost = async (hostId: string) => {
    if (!editingHostData.name.trim()) return alert("Host name is required.");

    setIsUpdatingHost(true);
    try {
      const response = await fetch('/api/hosts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: hostId, 
          name: editingHostData.name,
          phone: editingHostData.phone,
          email: editingHostData.email
        })
      });

      const result = await response.json();
      if (!response.ok) {
        alert(`Failed to update host: ${result.error}`);
        return;
      }

      setHosts(hosts.map(h => h.id === hostId ? { ...h, ...editingHostData } : h));
      setEditingHostId(null);
    } catch (error) {
      console.error("Unexpected host update error:", error);
      alert("An error occurred while updating the host.");
    } finally {
      setIsUpdatingHost(false);
    }
  };

  const handleDeleteHost = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the host "${name}"?`)) return;

    try {
      const response = await fetch(`/api/hosts?id=${id}`, { method: 'DELETE' });
      const result = await response.json();

      if (!response.ok) return alert(`Failed to delete: ${result.error}`);

      setHosts(hosts.filter(h => h.id !== id));
    } catch (error) {
      console.error("Unexpected host delete error:", error);
      alert("An error occurred while deleting.");
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">Loading your workspace...</div>;
  }

  // Smart Filter Logic
  const filteredDepartments = departments.map(dept => {
    const matchesDept = dept.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchingHosts = hosts.filter(h => 
      h.department_id === dept.id && 
      (
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (h.phone && h.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (h.email && h.email.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    );
    
    const hostsToDisplay = matchesDept ? hosts.filter(h => h.department_id === dept.id) : matchingHosts;
    
    return {
      ...dept,
      hostsToDisplay,
      isVisible: matchesDept || matchingHosts.length > 0
    };
  }).filter(d => d.isVisible);

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <DepartmentsHeader />

      <AddDepartmentCard
        newDeptName={newDeptName}
        onNewDeptNameChange={setNewDeptName}
        onSubmit={handleAddDepartment}
      />

      {departments.length > 0 && (
        <DepartmentsSearch
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      )}

      <DepartmentsHostsList
        departmentsCount={departments.length}
        filteredDepartments={filteredDepartments}
        searchQuery={searchQuery}
        selectedDeptId={selectedDeptId}
        newHost={newHost}
        editingDeptId={editingDeptId}
        editingDeptName={editingDeptName}
        isUpdatingDept={isUpdatingDept}
        editingHostId={editingHostId}
        editingHostData={editingHostData}
        isUpdatingHost={isUpdatingHost}
        onSelectDept={setSelectedDeptId}
        onNewHostChange={setNewHost}
        onAddHost={handleAddHost}
        onEditDeptStart={(id, name) => {
          setEditingDeptId(id);
          setEditingDeptName(name);
        }}
        onEditingDeptNameChange={setEditingDeptName}
        onUpdateDepartment={handleUpdateDepartment}
        onCancelEditDepartment={() => setEditingDeptId(null)}
        onDeleteDepartment={handleDeleteDepartment}
        onEditHostStart={(host) => {
          setEditingHostId(host.id);
          setEditingHostData({ name: host.name, phone: host.phone || "", email: host.email || "" });
        }}
        onEditingHostDataChange={setEditingHostData}
        onUpdateHost={handleUpdateHost}
        onCancelEditHost={() => setEditingHostId(null)}
        onDeleteHost={handleDeleteHost}
        onClearSearch={() => setSearchQuery("")}
      />
    </div>
  );
}
