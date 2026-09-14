"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, KeyRound, Loader2, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DEFAULT_HOST_PASSWORD } from "@/lib/password-policy";
import { getAuthHeaders } from "@/lib/client-auth";

type Host = {
  id: string;
  name: string;
  phone: string;
  email: string;
  department_id: string;
  company_id?: string;
  user_id?: string | null;
  created_at?: string;
};
type FilteredDepartment = {
  id: string;
  name: string;
  hostsToDisplay: Host[];
  isVisible: boolean;
};

type HostFormData = {
  name: string;
  phone: string;
  email: string;
};

type DepartmentsHostsListProps = {
  departmentsCount: number;
  filteredDepartments: FilteredDepartment[];
  searchQuery: string;
  selectedDeptId: string | null;
  newHost: HostFormData;
  companyId?: string;
  editingDeptId: string | null;
  editingDeptName: string;
  isUpdatingDept: boolean;
  editingHostId: string | null;
  editingHostData: HostFormData;
  isUpdatingHost: boolean;
  onSelectDept: (id: string | null) => void;
  onNewHostChange: (host: HostFormData) => void;
  onAddHost: (event: React.FormEvent) => void;
  onEditDeptStart: (id: string, name: string) => void;
  onEditingDeptNameChange: (value: string) => void;
  onUpdateDepartment: (event: React.FormEvent) => void;
  onCancelEditDepartment: () => void;
  onDeleteDepartment: (id: string, name: string) => void;
  onEditHostStart: (host: Host) => void;
  onEditingHostDataChange: (host: HostFormData) => void;
  onUpdateHost: (hostId: string) => void;
  onCancelEditHost: () => void;
  onDeleteHost: (id: string, name: string) => void;
  onClearSearch: () => void;
};

export default function DepartmentsHostsList({
  departmentsCount,
  filteredDepartments,
  searchQuery,
  selectedDeptId,
  newHost,
  companyId,
  editingDeptId,
  editingDeptName,
  isUpdatingDept,
  editingHostId,
  editingHostData,
  isUpdatingHost,
  onSelectDept,
  onNewHostChange,
  onAddHost,
  onEditDeptStart,
  onEditingDeptNameChange,
  onUpdateDepartment,
  onCancelEditDepartment,
  onDeleteDepartment,
  onEditHostStart,
  onEditingHostDataChange,
  onUpdateHost,
  onCancelEditHost,
  onDeleteHost,
  onClearSearch,
}: DepartmentsHostsListProps) {
  const [resettingHostId, setResettingHostId] = useState<string | null>(null);

  const handleResetHostPassword = async (host: Host) => {
    const confirmed = window.confirm(
      `Reset login password for ${host.name} to the standard default password (${DEFAULT_HOST_PASSWORD})?\n\nThe host will be required to change it upon first login.`
    );
    if (!confirmed) return;

    try {
      setResettingHostId(host.id);
      const headers = await getAuthHeaders(true);
      const res = await fetch("/api/hosts/reset-password", {
        method: "POST",
        headers,
        body: JSON.stringify({
          hostId: host.id,
          companyId: host.company_id || companyId,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to reset password.");
      }

      alert(`Password for ${host.name} has been reset to:\n\n${json.defaultPassword || DEFAULT_HOST_PASSWORD}\n\nHost must change this password upon their next login.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setResettingHostId(null);
    }
  };

  return (
    <div className="space-y-6">
      {departmentsCount === 0 && (
        <div className="rounded-[1.4rem] border border-slate-100 bg-white py-10 text-center font-bold text-slate-500 shadow-sm">
          No departments yet. Add a department to organize visitor hosts.
        </div>
      )}

      {filteredDepartments.map((dept) => (
        <Card key={dept.id} className="overflow-hidden rounded-[1.4rem] border-slate-100 shadow-sm bg-white">
          <CardHeader className="bg-white py-4 px-4 sm:px-6">
            {editingDeptId === dept.id ? (
              <form onSubmit={onUpdateDepartment} className="flex flex-1 gap-2 items-center">
                <Input
                  value={editingDeptName}
                  onChange={(e) => onEditingDeptNameChange(e.target.value)}
                  className="h-10 max-w-sm bg-white border-slate-200 rounded-xl"
                  autoFocus
                />
                <Button type="submit" disabled={isUpdatingDept} className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">
                  {isUpdatingDept ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </Button>
                <Button type="button" variant="ghost" onClick={onCancelEditDepartment} className="h-10 w-10 p-0 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-200">
                  <X className="w-4 h-4" />
                </Button>
              </form>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg font-bold text-slate-900 m-0">{dept.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      onClick={() => onEditDeptStart(dept.id, dept.name)}
                      title="Edit Department"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      onClick={() => onDeleteDepartment(dept.id, dept.name)}
                      title="Delete Department"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => onSelectDept(dept.id)} className="w-fit h-9 font-bold border-blue-200 text-blue-700 hover:bg-blue-50 rounded-lg">
                  Add Host
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-0 sm:p-6 sm:pt-4">
            {selectedDeptId === dept.id && (
              <form onSubmit={onAddHost} className="m-4 sm:m-0 sm:mb-6 p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col gap-4 shadow-sm">
                <div className="rounded-xl border border-blue-200/80 bg-white/80 p-3 text-xs text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>
                      <strong>Default Password:</strong>{" "}
                      <code className="rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 font-mono font-bold text-blue-700">
                        {DEFAULT_HOST_PASSWORD}
                      </code>
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">
                    Host will be prompted to set a personal password upon first login.
                  </span>
                </div>

                <div className="flex gap-4 items-end flex-wrap">
                  <div className="grid gap-1.5 flex-1 min-w-[200px]">
                    <Label htmlFor={`host-name-${dept.id}`} className="font-bold text-blue-900">Host Name *</Label>
                    <Input id={`host-name-${dept.id}`} required value={newHost.name} onChange={(e) => onNewHostChange({ ...newHost, name: e.target.value })} placeholder="John Doe" className="bg-white border-blue-200 rounded-xl h-10" />
                  </div>
                  <div className="grid gap-1.5 flex-1 min-w-[200px]">
                    <Label htmlFor={`host-phone-${dept.id}`} className="font-bold text-blue-900">Phone Number</Label>
                    <Input id={`host-phone-${dept.id}`} value={newHost.phone} onChange={(e) => onNewHostChange({ ...newHost, phone: e.target.value })} placeholder="+2547..." className="bg-white border-blue-200 rounded-xl h-10" />
                  </div>
                  <div className="grid gap-1.5 flex-1 min-w-[200px]">
                    <Label htmlFor={`host-email-${dept.id}`} className="font-bold text-blue-900">Email</Label>
                    <Input id={`host-email-${dept.id}`} type="email" value={newHost.email} onChange={(e) => onNewHostChange({ ...newHost, email: e.target.value })} placeholder="john@example.com" className="bg-white border-blue-200 rounded-xl h-10" />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button type="submit" className="flex-1 sm:flex-none h-10 px-6 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl">Add Host</Button>
                    <Button type="button" variant="ghost" onClick={() => onSelectDept(null)} className="h-10 px-4 font-bold text-blue-700 hover:bg-blue-100 rounded-xl">Cancel</Button>
                  </div>
                </div>
              </form>
            )}

            <div className="overflow-x-auto rounded-xl sm:border border-slate-100 sm:mt-2">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-100">
                    <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-xs h-10">Host Name</TableHead>
                    <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-xs h-10">Phone</TableHead>
                    <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-xs h-10">Email</TableHead>
                    <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-xs h-10 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dept.hostsToDisplay.map(host => (
                    editingHostId === host.id ? (
                      <TableRow key={host.id} className="bg-blue-50/30 border-b border-slate-100">
                        <TableCell className="p-2 align-top">
                          <Input value={editingHostData.name} onChange={e => onEditingHostDataChange({ ...editingHostData, name: e.target.value })} className="h-10 min-w-[120px] bg-white border-slate-200 rounded-lg" />
                        </TableCell>
                        <TableCell className="p-2 align-top">
                          <Input value={editingHostData.phone} onChange={e => onEditingHostDataChange({ ...editingHostData, phone: e.target.value })} className="h-10 min-w-[120px] bg-white border-slate-200 rounded-lg" />
                        </TableCell>
                        <TableCell className="p-2 align-top">
                          <Input value={editingHostData.email} onChange={e => onEditingHostDataChange({ ...editingHostData, email: e.target.value })} className="h-10 min-w-[120px] bg-white border-slate-200 rounded-lg" />
                        </TableCell>
                        <TableCell className="p-2 text-right align-top whitespace-nowrap">
                          <Button size="sm" onClick={() => onUpdateHost(host.id)} disabled={isUpdatingHost} className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg mr-1">
                            {isUpdatingHost ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={onCancelEditHost} className="h-10 px-3 text-slate-500 hover:bg-slate-200 rounded-lg">
                            <X className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow key={host.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <TableCell className="font-bold text-slate-900 h-12">{host.name}</TableCell>
                        <TableCell className="text-slate-500 font-medium h-12">{host.phone || "-"}</TableCell>
                        <TableCell className="text-slate-500 font-medium h-12">{host.email || "-"}</TableCell>
                        <TableCell className="text-right h-12">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/dashboard/host?hostId=${host.id}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50/70 px-2 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                              title="Open Host Portal for this host"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Portal
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all rounded-lg"
                              onClick={() => handleResetHostPassword(host)}
                              disabled={resettingHostId === host.id}
                              title={`Reset password to default (${DEFAULT_HOST_PASSWORD})`}
                            >
                              <KeyRound className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-lg"
                              onClick={() => onEditHostStart(host)}
                              title="Edit Host"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-lg"
                              onClick={() => onDeleteHost(host.id, host.name)}
                              title="Delete Host"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  ))}
                  {dept.hostsToDisplay.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-slate-500 font-medium py-8 border-b-0">
                        {searchQuery ? "No matching hosts found in this department." : "No hosts added to this department yet."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}

      {departmentsCount > 0 && filteredDepartments.length === 0 && (
        <div className="text-center py-10 text-slate-500 bg-white rounded-[1.4rem] border border-slate-100 shadow-sm font-medium">
          <p className="font-bold text-slate-900 mb-1">No results found</p>
          <p>No departments or hosts matched &quot;{searchQuery}&quot;</p>
          <Button variant="link" onClick={onClearSearch} className="text-blue-600 font-bold mt-2">
            Clear search
          </Button>
        </div>
      )}
    </div>
  );
}
