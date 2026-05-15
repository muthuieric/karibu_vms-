"use client";

import {
  Building2,
  CalendarDays,
  CheckCircle,
  Eye,
  Lock,
  Mail,
  MapPin,
  Phone,
  Unlock,
  User,
  UserPlus,
} from "lucide-react";

import { DataTableShell } from "@/components/dashboard/shared/DataTableShell";
import { SearchInput, SelectField } from "@/components/dashboard/shared/Fields";
import { EmptyState, LoadingState } from "@/components/dashboard/shared/StateBlocks";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  plan_tier?: string;
};

type CompaniesDirectoryCardProps = {
  companies: Company[];
  filteredCompanies: Company[];
  loading: boolean;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onOpenAdminModal: (companyId: string) => void;
  onViewCompanyVisitors: (companyId: string, companyName: string) => void;
  onToggleCompanyLock: (companyId: string, currentLockStatus: boolean) => void;
  onApproveCompany: (companyId: string) => void;
  onChangePlanTier: (companyId: string, newTier: string) => void;
};

function workspaceStatus(company: Company) {
  if (company.is_locked) return "locked";
  if (company.subscription_status === "pending_approval") return "pending";
  return company.subscription_status || "trial";
}

function WorkspaceStatusBadge({ company }: { company: Company }) {
  const status = workspaceStatus(company);
  const label = company.subscription_status === "pending_approval" ? "Pending approval" : status;

  return <StatusBadge status={status}>{label}</StatusBadge>;
}

export default function CompaniesDirectoryCard({
  companies,
  filteredCompanies,
  loading,
  searchTerm,
  onSearchTermChange,
  onOpenAdminModal,
  onViewCompanyVisitors,
  onToggleCompanyLock,
  onApproveCompany,
  onChangePlanTier,
}: CompaniesDirectoryCardProps) {
  return (
    <DataTableShell
      title="Workspaces List"
      description="Search, review, and manage every workspace on the platform."
      filters={
        <div className="w-full md:w-96">
          <SearchInput
            placeholder="Search workspace or email..."
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
          />
        </div>
      }
    >
      {loading ? (
        <div className="p-5">
          <LoadingState label="Loading workspaces..." />
        </div>
      ) : companies.length === 0 ? (
        <div className="p-5">
          <EmptyState title="No workspaces found" description="Create your first workspace to begin onboarding clients." />
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="p-5">
          <EmptyState title="No matching workspaces" description="Try adjusting your search query." />
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="pl-6">Workspace</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                          <Building2 className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 font-bold text-slate-900">
                            <span className="max-w-[220px] truncate">{company.name}</span>
                            {company.is_locked && <Lock className="h-3.5 w-3.5 shrink-0 text-red-600" />}
                          </div>
                          <div className="mt-0.5 flex max-w-[240px] items-center gap-1 truncate text-xs text-slate-500">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {company.address || "No address provided"}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          {company.contact_name || "N/A"}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          {company.contact_email || "N/A"}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          {company.contact_phone || "N/A"}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <SelectField
                        value={company.plan_tier || "basic"}
                        onChange={(event) => onChangePlanTier(company.id, event.target.value)}
                        className="min-h-8 w-32 py-1 text-xs uppercase tracking-wider"
                      >
                        <option value="basic">Basic</option>
                        <option value="premium">Premium</option>
                        <option value="custom">Custom</option>
                      </SelectField>
                    </TableCell>

                    <TableCell>
                      <WorkspaceStatusBadge company={company} />
                    </TableCell>

                    <TableCell className="text-sm text-slate-600">
                      {new Date(company.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </TableCell>

                    <TableCell className="pr-6">
                      <div className="flex justify-end gap-2">
                        {company.subscription_status === "pending_approval" ? (
                          <Button size="sm" onClick={() => onApproveCompany(company.id)}>
                            <CheckCircle className="h-4 w-4" /> Approve
                          </Button>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => onOpenAdminModal(company.id)}>
                              <UserPlus className="h-4 w-4" /> Admin
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => onViewCompanyVisitors(company.id, company.name)}>
                              <Eye className="h-4 w-4" /> Data
                            </Button>
                            <Button
                              size="sm"
                              variant={company.is_locked ? "default" : "destructive"}
                              onClick={() => onToggleCompanyLock(company.id, company.is_locked)}
                            >
                              {company.is_locked ? <><Unlock className="h-4 w-4" /> Unlock</> : <><Lock className="h-4 w-4" /> Lock</>}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="divide-y divide-slate-100 md:hidden">
            {filteredCompanies.map((company) => (
              <div key={company.id} className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="truncate">{company.name}</span>
                      {company.is_locked && <Lock className="h-3.5 w-3.5 shrink-0 text-red-600" />}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{company.address || "No address provided"}</span>
                    </div>
                  </div>
                  <WorkspaceStatusBadge company={company} />
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    {company.contact_name || "N/A"}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {company.contact_email || "N/A"}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {company.contact_phone || "N/A"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {new Date(company.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                  <SelectField
                    value={company.plan_tier || "basic"}
                    onChange={(event) => onChangePlanTier(company.id, event.target.value)}
                    className="min-h-8 py-1 text-xs uppercase tracking-wider"
                  >
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="custom">Custom</option>
                  </SelectField>
                </div>

                <div className="flex flex-wrap gap-2">
                  {company.subscription_status === "pending_approval" ? (
                    <Button size="sm" className="w-full" onClick={() => onApproveCompany(company.id)}>
                      <CheckCircle className="h-4 w-4" /> Approve & Start Trial
                    </Button>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => onOpenAdminModal(company.id)}>
                        <UserPlus className="h-4 w-4" /> Admin
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => onViewCompanyVisitors(company.id, company.name)}>
                        <Eye className="h-4 w-4" /> Data
                      </Button>
                      <Button
                        size="sm"
                        variant={company.is_locked ? "default" : "destructive"}
                        className="w-full"
                        onClick={() => onToggleCompanyLock(company.id, company.is_locked)}
                      >
                        {company.is_locked ? <><Unlock className="h-4 w-4" /> Unlock Workspace</> : <><Lock className="h-4 w-4" /> Lock Workspace</>}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </DataTableShell>
  );
}
