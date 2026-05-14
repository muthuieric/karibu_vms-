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
  Layers, // NEW: Icon for plans
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTableShell } from "@/components/dashboard/shared/DataTableShell";
import { EmptyState, LoadingState } from "@/components/dashboard/shared/StateBlocks";
import { SearchInput } from "@/components/dashboard/shared/Fields";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
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
  plan_tier?: string; // NEW: Added plan tier tracking
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
  onChangePlanTier: (companyId: string, newTier: string) => void; // NEW: Callback to change plan
};

function CompanyStatusBadge({ company }: { company: Company }) {
  const status = company.subscription_status === "pending_approval" ? "pending" : company.subscription_status;
  return <StatusBadge status={status}>{company.subscription_status === "pending_approval" ? "Pending approval" : company.subscription_status}</StatusBadge>;
}

function CompanyMobileStatusBadge({ company }: { company: Company }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
      company.subscription_status === "pending_approval" ? "bg-purple-50 text-purple-700 border-purple-200" :
      company.subscription_status === "paid" ? "bg-green-50 text-green-700 border-green-200" :
      company.subscription_status === "trial" ? "bg-amber-50 text-amber-700 border-amber-200" :
      "bg-red-50 text-red-700 border-red-200"
    }`}>
      {company.subscription_status === "pending_approval" ? "PENDING" : company.subscription_status}
    </span>
  );
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
  onChangePlanTier, // NEW
}: CompaniesDirectoryCardProps) {
  return (
    <DataTableShell
      title="Registered Buildings"
      description="All organizations currently using your platform."
      filters={
        <div className="w-full md:w-96">
          <SearchInput
            placeholder="Search by company or email..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </div>
      }
    >

      <div className="p-0">
        {loading ? (
          <LoadingState label="Loading companies..." />
        ) : companies.length === 0 ? (
          <EmptyState title="No companies found" description="Click New Company to onboard your first client." />
        ) : filteredCompanies.length === 0 ? (
          <EmptyState title="No matching companies" description="Try adjusting your search query." />
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader className="bg-zinc-50/80">
                  <TableRow>
                    <TableHead className="pl-6 py-4 text-zinc-600 whitespace-nowrap">Company Info</TableHead>
                    <TableHead className="py-4 text-zinc-600 whitespace-nowrap">Contact Details</TableHead>
                    <TableHead className="text-zinc-600 whitespace-nowrap">Plan Tier</TableHead> {/* NEW COLUMN */}
                    <TableHead className="text-zinc-600 whitespace-nowrap">Status</TableHead>
                    <TableHead className="text-zinc-600 whitespace-nowrap">Date Added</TableHead>
                    <TableHead className="pr-6 text-right text-zinc-600 whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => (
                    <TableRow key={company.id} className="hover:bg-zinc-50/80 transition-colors">
                      <TableCell className="pl-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="bg-zinc-100 p-2 rounded-md border border-zinc-200 shrink-0">
                            <Building2 className="w-5 h-5 text-zinc-500" />
                          </div>
                          <div>
                            <div className="font-bold text-zinc-900 flex items-center gap-2">
                              <span className="truncate max-w-[200px]">{company.name}</span>
                              {company.is_locked && (
                                <span title="Account Locked"><Lock className="inline h-3.5 w-3.5 text-red-600 shrink-0" /></span>
                              )}
                            </div>
                            <div className="text-xs text-zinc-500 truncate max-w-[200px] flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" /> {company.address || "No address provided"}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-zinc-400" />
                            {company.contact_name || "N/A"}
                          </div>
                          <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-zinc-400" />
                            {company.contact_email || "N/A"}
                          </div>
                          <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-zinc-400" />
                            {company.contact_phone || "N/A"}
                          </div>
                        </div>
                      </TableCell>

                      {/* NEW: PLAN TIER DROPDOWN */}
                      <TableCell className="whitespace-nowrap">
                        <select
                          value={company.plan_tier || "basic"}
                          onChange={(e) => onChangePlanTier(company.id, e.target.value)}
                          className={`h-7 rounded border bg-white px-2 text-xs font-bold shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer uppercase tracking-wider
                            ${(company.plan_tier || "basic") === "basic" ? "text-zinc-600 border-zinc-200" : ""}
                            ${company.plan_tier === "premium" ? "text-blue-600 border-blue-200 bg-blue-50/50" : ""}
                            ${company.plan_tier === "custom" ? "text-purple-600 border-purple-200 bg-purple-50/50" : ""}
                          `}
                        >
                          <option value="basic">Basic</option>
                          <option value="premium">Premium</option>
                          <option value="custom">Custom</option>
                        </select>
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        <CompanyStatusBadge company={company} />
                      </TableCell>

                      <TableCell className="text-sm text-zinc-600 whitespace-nowrap">
                        {new Date(company.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </TableCell>

                      <TableCell className="pr-6 text-right space-x-2 whitespace-nowrap flex justify-end items-center h-full pt-4">
                        {company.subscription_status === "pending_approval" ? (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white font-bold" onClick={() => onApproveCompany(company.id)}>
                            <CheckCircle className="h-4 w-4 mr-1" /> Approve & Start Trial
                          </Button>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 bg-white" onClick={() => onOpenAdminModal(company.id)}>
                              <UserPlus className="h-4 w-4 mr-1" /> Add Admin
                            </Button>
                            <Button size="sm" variant="outline" className="text-zinc-700 border-zinc-200 hover:bg-zinc-50 bg-white" onClick={() => onViewCompanyVisitors(company.id, company.name)}>
                              <Eye className="h-4 w-4 mr-1" /> View Data
                            </Button>
                            <Button
                              size="sm"
                              variant={company.is_locked ? "default" : "destructive"}
                              className={company.is_locked ? "bg-zinc-800 hover:bg-zinc-900 text-white" : "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"}
                              onClick={() => onToggleCompanyLock(company.id, company.is_locked)}
                            >
                              {company.is_locked ? <><Unlock className="h-4 w-4 mr-1" /> Unlock</> : <><Lock className="h-4 w-4 mr-1" /> Lock</>}
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="md:hidden divide-y divide-zinc-100">
              {filteredCompanies.map((company) => (
                <div key={company.id} className="p-4 space-y-4 hover:bg-zinc-50/50 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-semibold text-zinc-900 flex items-start gap-2 leading-tight">
                      <Building2 className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="line-clamp-2">{company.name}</span>
                        <span className="text-[10px] font-normal text-zinc-500 block mt-0.5 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" /> {company.address || "No address"}
                        </span>
                      </div>
                      {company.is_locked && (
                        <span title="Account Locked">
                          <Lock className="inline h-3.5 w-3.5 text-red-600 shrink-0 mt-0.5" />
                        </span>
                      )}
                    </div>
                    <div>
                      <CompanyMobileStatusBadge company={company} />
                    </div>
                  </div>

                  <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100 space-y-1.5">
                    <div className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      {company.contact_name || "N/A"}
                    </div>
                    <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-zinc-400" />
                      {company.contact_email || "N/A"}
                    </div>
                    <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-zinc-400" />
                      {company.contact_phone || "N/A"}
                    </div>
                  </div>

                  {/* NEW: PLAN & DATE ON MOBILE */}
                  <div className="flex items-center justify-between text-xs text-zinc-500 mt-2">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                      Applied: {new Date(company.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 shrink-0" />
                      <select
                        value={company.plan_tier || "basic"}
                        onChange={(e) => onChangePlanTier(company.id, e.target.value)}
                        className={`h-6 rounded border bg-white px-1.5 text-[10px] font-bold shadow-sm focus:outline-none cursor-pointer uppercase
                          ${(company.plan_tier || "basic") === "basic" ? "text-zinc-600 border-zinc-200" : ""}
                          ${company.plan_tier === "premium" ? "text-blue-600 border-blue-200 bg-blue-50/50" : ""}
                          ${company.plan_tier === "custom" ? "text-purple-600 border-purple-200 bg-purple-50/50" : ""}
                        `}
                      >
                        <option value="basic">Basic</option>
                        <option value="premium">Premium</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-100">
                    {company.subscription_status === "pending_approval" ? (
                      <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold" onClick={() => onApproveCompany(company.id)}>
                        <CheckCircle className="h-4 w-4 mr-1" /> Approve & Start Trial
                      </Button>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50 bg-white min-w-[120px]" onClick={() => onOpenAdminModal(company.id)}>
                          <UserPlus className="h-4 w-4 mr-1" /> Add Admin
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 text-zinc-700 border-zinc-200 hover:bg-zinc-50 bg-white min-w-[120px]" onClick={() => onViewCompanyVisitors(company.id, company.name)}>
                          <Eye className="h-4 w-4 mr-1" /> View Data
                        </Button>
                        <Button
                          size="sm"
                          variant={company.is_locked ? "default" : "destructive"}
                          className={`w-full ${company.is_locked ? "bg-zinc-800 hover:bg-zinc-900 text-white" : "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"}`}
                          onClick={() => onToggleCompanyLock(company.id, company.is_locked)}
                        >
                          {company.is_locked ? <><Unlock className="h-4 w-4 mr-1" /> Unlock Account</> : <><Lock className="h-4 w-4 mr-1" /> Lock Account</>}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DataTableShell>
  );
}
