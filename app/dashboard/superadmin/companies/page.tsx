"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AddCompanyModal from "@/components/dashboard/superadmin/companies/AddCompanyModal";
import CompaniesDirectoryCard from "@/components/dashboard/superadmin/companies/CompaniesDirectoryCard";
import CompanyVisitorStatsModal from "@/components/dashboard/superadmin/companies/CompanyVisitorStatsModal";
import CreateCompanyAdminModal from "@/components/dashboard/superadmin/companies/CreateCompanyAdminModal";
import SuperadminCompaniesHeader from "@/components/dashboard/superadmin/companies/SuperadminCompaniesHeader";

type Company = {
  id: string;
  name: string;
  address?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  created_at: string;
  subscription_status: string;
  is_locked: boolean;
};

type PlanType = "none" | "trial_1" | "trial_2";

export default function ManageCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [planType, setPlanType] = useState<PlanType>("trial_1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [adminForm, setAdminForm] = useState({ fullName: "", email: "", password: "" });
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  const [showVisitorsModal, setShowVisitorsModal] = useState(false);
  const [visitorStats, setVisitorStats] = useState({ total: 0, inside: 0, departed: 0, pending: 0 });
  const [loadingVisitors, setLoadingVisitors] = useState(false);
  const [viewingCompanyName, setViewingCompanyName] = useState("");

  const fetchCompanies = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });

    const formattedCompanies = ((data || []) as Company[]).map((c) => ({
      ...c,
      subscription_status: c.subscription_status || "trial",
      is_locked: c.is_locked || false,
    }));

    setCompanies(formattedCompanies);
    setLoading(false);
  };  

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCompanies();
  }, []);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let status = "unpaid";
    let endsAt = null;
    let startLocked = true; 

    if (planType === "trial_1" || planType === "trial_2") {
      status = "trial";
      startLocked = false; 
      const expiryDate = new Date();
      const monthsToAdd = planType === "trial_1" ? 1 : 2;
      expiryDate.setMonth(expiryDate.getMonth() + monthsToAdd);
      endsAt = expiryDate.toISOString();
    }
    
    const { error } = await supabase
      .from("companies")
      .insert([{ 
        name: newCompanyName,
        subscription_status: status,
        subscription_ends_at: endsAt,
        is_locked: startLocked,
        amount_paid: 0
      }]);

    if (error) {
      console.error("Database Insert Error:", error);
      alert(`Failed to create company: ${error.message}`);
    } else {
      setNewCompanyName("");
      setPlanType("trial_1");
      setShowAddModal(false);
      fetchCompanies();
    }
    setIsSubmitting(false);
  };

  const openAdminModal = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setAdminForm({ fullName: "", email: "", password: "" });
    setShowAdminModal(true);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingAdmin(true);

    try {
      const response = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...adminForm, companyId: selectedCompanyId }),
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await response.json();

        if (result.error) {
          alert(`Error: ${result.error}`);
        } else {
          alert("Admin account created successfully! They can now log in.");
          setShowAdminModal(false);
        }
      } else {
        alert(`Server Error (${response.status})`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown network error";
      alert(`Network/Connection failed: ${message}`);
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const viewCompanyVisitors = async (companyId: string, companyName: string) => {
    setViewingCompanyName(companyName);
    setShowVisitorsModal(true);
    setLoadingVisitors(true);

    const { data, error } = await supabase
      .from("visitors")
      .select("status")
      .eq("company_id", companyId);
      
    if (error) {
      console.error("Error fetching stats:", error);
      setVisitorStats({ total: 0, inside: 0, departed: 0, pending: 0 });
    } else {
      setVisitorStats({
        total: data.length,
        inside: data.filter(v => v.status === "checked_in").length,
        departed: data.filter(v => v.status === "checked_out").length,
        pending: data.filter(v => v.status === "pending").length,
      });
    }
    setLoadingVisitors(false);
  };

  const toggleCompanyLock = async (companyId: string, currentLockStatus: boolean) => {
    const action = currentLockStatus ? "Unlock" : "Lock";
    if (!window.confirm(`Are you sure you want to ${action} this company's account?`)) return;

    const { error } = await supabase
      .from("companies")
      .update({ is_locked: !currentLockStatus })
      .eq("id", companyId);

    if (error) {
      alert(`Failed to update lock status: ${error.message}`);
    } else {
      fetchCompanies();
    }
  };

  const approveCompany = async (companyId: string) => {
    if (!window.confirm("Are you sure you want to approve this company and start their 1-month free trial?")) return;

    try {
      const response = await fetch("/api/companies/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      });

      const data = await response.json();

      if (data.error) {
        alert(`Failed to approve company: ${data.error}`);
      } else {
        alert("Company approved and notification email sent!");
        fetchCompanies();
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Failed to connect to approval service.");
    }
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.contact_email && c.contact_email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <SuperadminCompaniesHeader onNewCompany={() => setShowAddModal(true)} />
      
      <CompaniesDirectoryCard
        companies={companies}
        filteredCompanies={filteredCompanies}
        loading={loading}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onOpenAdminModal={openAdminModal}
        onViewCompanyVisitors={viewCompanyVisitors}
        onToggleCompanyLock={toggleCompanyLock}
        onApproveCompany={approveCompany}
      />

      {showAddModal && (
        <AddCompanyModal
          newCompanyName={newCompanyName}
          planType={planType}
          isSubmitting={isSubmitting}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateCompany}
          onNewCompanyNameChange={setNewCompanyName}
          onPlanTypeChange={setPlanType}
        />
      )}

      {showAdminModal && (
        <CreateCompanyAdminModal
          adminForm={adminForm}
          isCreatingAdmin={isCreatingAdmin}
          onClose={() => setShowAdminModal(false)}
          onSubmit={handleCreateAdmin}
          onAdminFormChange={setAdminForm}
        />
      )}

      {showVisitorsModal && (
        <CompanyVisitorStatsModal
          companyName={viewingCompanyName}
          visitorStats={visitorStats}
          loadingVisitors={loadingVisitors}
          onClose={() => setShowVisitorsModal(false)}
        />
      )}
    </div>
  );
}
