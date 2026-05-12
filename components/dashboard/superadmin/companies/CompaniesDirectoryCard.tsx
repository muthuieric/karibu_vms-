"use client";

import {
  Building2,
  CalendarDays,
  CheckCircle,
  Eye,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Search,
  Unlock,
  User,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
};

function CompanyStatusBadge({ company }: { company: Company }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${
      company.subscription_status === "pending_approval" ? "bg-purple-50 text-purple-700 border-purple-200" :
      company.subscription_status === "paid" ? "bg-green-50 text-green-700 border-green-200" :
      company.subscription_status === "trial" ? "bg-amber-50 text-amber-700 border-amber-200" :
      "bg-red-50 text-red-700 border-red-200"
    }`}>
      {company.subscription_status === "pending_approval" ? "PENDING APPROVAL" : company.subscription_status.toUpperCase()}
    </span>
  );
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
}: CompaniesDirectoryCardProps) {
  return (
    <Card className="shadow-sm border-zinc-200 bg-white/90 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-4 border-b border-zinc-200/60 mb-2 space-y-5">
        <div>
          <CardTitle>Registered Buildings/Companies</CardTitle>
          <CardDescription>All organizations currently using your platform.</CardDescription>
        </div>
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search by company or email..."
            className="pl-9 bg-white/80 border-zinc-200 focus:ring-indigo-500 w-full"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500 px-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-600" />
            <p>Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 px-4">
            <div className="bg-white border border-zinc-200 shadow-sm w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-zinc-400" />
            </div>
            <p className="font-bold text-zinc-900 text-lg">No companies found</p>
            <p className="text-sm mt-1 max-w-sm mx-auto">Click &quot;New Company&quot; to onboard your first client.</p>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 px-4">
            <p className="font-bold text-zinc-900">No matching companies</p>
            <p className="text-sm mt-1">Try adjusting your search query.</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader className="bg-zinc-50/80">
                  <TableRow>
                    <TableHead className="pl-6 py-4 text-zinc-600 whitespace-nowrap">Company Info</TableHead>
                    <TableHead className="py-4 text-zinc-600 whitespace-nowrap">Contact Details</TableHead>
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

                  <div className="flex items-center text-xs text-zinc-500 gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                    Applied: {new Date(company.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
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
      </CardContent>
    </Card>
  );
}
