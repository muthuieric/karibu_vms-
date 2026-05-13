"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export type Department = { id: string; name: string };
export type Host = { id: string; name: string; phone: string; email: string; department_id: string };

export function useCompanyDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [newDeptName, setNewDeptName] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [newHost, setNewHost] = useState({ name: "", phone: "", email: "" });
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [editingDeptName, setEditingDeptName] = useState("");
  const [isUpdatingDept, setIsUpdatingDept] = useState(false);
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

  useEffect(() => {
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

    fetchCompanyData();
  }, []);

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !newDeptName.trim()) return;

    try {
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: companyId, name: newDeptName }),
      });
      const result = await response.json();
      if (!response.ok) return alert(`Failed to save: ${result.error}`);

      if (result.data) {
        setDepartments((prev) => [...prev, result.data]);
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
      const response = await fetch("/api/departments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingDeptId, name: editingDeptName }),
      });
      const result = await response.json();
      if (!response.ok) return alert(`Failed to update department: ${result.error}`);

      setDepartments((prev) => prev.map((dept) => (dept.id === editingDeptId ? { ...dept, name: editingDeptName } : dept)));
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
      const response = await fetch(`/api/departments?id=${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) return alert(`Failed to delete: ${result.error}`);

      setDepartments((prev) => prev.filter((dept) => dept.id !== id));
      setHosts((prev) => prev.filter((host) => host.department_id !== id));
    } catch (error) {
      console.error("Unexpected department delete error:", error);
      alert("An error occurred while deleting.");
    }
  };

  const handleAddHost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !selectedDeptId || !newHost.name) return;

    try {
      const response = await fetch("/api/hosts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          department_id: selectedDeptId,
          name: newHost.name,
          phone: newHost.phone,
          email: newHost.email,
        }),
      });
      const result = await response.json();
      if (!response.ok) return alert(`Failed to save host: ${result.error}`);

      if (result.data) {
        setHosts((prev) => [...prev, result.data]);
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
      const response = await fetch("/api/hosts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: hostId, ...editingHostData }),
      });
      const result = await response.json();
      if (!response.ok) return alert(`Failed to update host: ${result.error}`);

      setHosts((prev) => prev.map((host) => (host.id === hostId ? { ...host, ...editingHostData } : host)));
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
      const response = await fetch(`/api/hosts?id=${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) return alert(`Failed to delete: ${result.error}`);

      setHosts((prev) => prev.filter((host) => host.id !== id));
    } catch (error) {
      console.error("Unexpected host delete error:", error);
      alert("An error occurred while deleting.");
    }
  };

  const filteredDepartments = useMemo(() => {
    return departments
      .map((dept) => {
        const query = searchQuery.toLowerCase();
        const matchesDept = dept.name.toLowerCase().includes(query);
        const matchingHosts = hosts.filter(
          (host) =>
            host.department_id === dept.id &&
            (host.name.toLowerCase().includes(query) ||
              (host.phone && host.phone.toLowerCase().includes(query)) ||
              (host.email && host.email.toLowerCase().includes(query)))
        );
        const hostsToDisplay = matchesDept ? hosts.filter((host) => host.department_id === dept.id) : matchingHosts;

        return { ...dept, hostsToDisplay, isVisible: matchesDept || matchingHosts.length > 0 };
      })
      .filter((dept) => dept.isVisible);
  }, [departments, hosts, searchQuery]);

  return {
    departments,
    isLoading,
    searchQuery,
    newDeptName,
    selectedDeptId,
    newHost,
    editingDeptId,
    editingDeptName,
    isUpdatingDept,
    editingHostId,
    editingHostData,
    isUpdatingHost,
    filteredDepartments,
    setSearchQuery,
    setNewDeptName,
    setSelectedDeptId,
    setNewHost,
    setEditingDeptId,
    setEditingDeptName,
    setEditingHostId,
    setEditingHostData,
    handleAddDepartment,
    handleUpdateDepartment,
    handleDeleteDepartment,
    handleAddHost,
    handleUpdateHost,
    handleDeleteHost,
  };
}
