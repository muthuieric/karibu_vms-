"use client";

import { Loader2, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Host = { id: string; name: string; phone: string; email: string; department_id: string };
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
  return (
    <div className="space-y-6">
      {departmentsCount === 0 && (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
          No departments created yet. Create one above to get started!
        </div>
      )}

      {filteredDepartments.map((dept) => (
        <Card key={dept.id} className="overflow-hidden">
          <CardHeader className="bg-zinc-50 border-b py-3 px-4 sm:px-6">
            {editingDeptId === dept.id ? (
              <form onSubmit={onUpdateDepartment} className="flex flex-1 gap-2 items-center">
                <Input
                  value={editingDeptName}
                  onChange={(e) => onEditingDeptNameChange(e.target.value)}
                  className="h-9 max-w-sm bg-white"
                  autoFocus
                />
                <Button type="submit" size="sm" disabled={isUpdatingDept} className="h-9 bg-blue-600 hover:bg-blue-700 text-white">
                  {isUpdatingDept ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={onCancelEditDepartment} className="h-9">
                  <X className="w-4 h-4" />
                </Button>
              </form>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg m-0">{dept.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-zinc-400 hover:text-blue-600 hover:bg-blue-50"
                      onClick={() => onEditDeptStart(dept.id, dept.name)}
                      title="Edit Department"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => onDeleteDepartment(dept.id, dept.name)}
                      title="Delete Department"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => onSelectDept(dept.id)} className="w-fit">
                  + Add Host
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-0 sm:p-6 sm:pt-4">
            {selectedDeptId === dept.id && (
              <form onSubmit={onAddHost} className="m-4 sm:m-0 sm:mb-6 p-4 bg-blue-50/50 rounded-lg border border-blue-100 flex gap-4 items-end flex-wrap">
                <div className="grid gap-1.5 flex-1 min-w-[200px]">
                  <Label>Host Name *</Label>
                  <Input required value={newHost.name} onChange={(e) => onNewHostChange({ ...newHost, name: e.target.value })} placeholder="John Doe" className="bg-white" />
                </div>
                <div className="grid gap-1.5 flex-1 min-w-[200px]">
                  <Label>Phone Number</Label>
                  <Input value={newHost.phone} onChange={(e) => onNewHostChange({ ...newHost, phone: e.target.value })} placeholder="+2547..." className="bg-white" />
                </div>
                <div className="grid gap-1.5 flex-1 min-w-[200px]">
                  <Label>Email</Label>
                  <Input type="email" value={newHost.email} onChange={(e) => onNewHostChange({ ...newHost, email: e.target.value })} placeholder="john@example.com" className="bg-white" />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button type="submit" className="flex-1 sm:flex-none">Save Host</Button>
                  <Button type="button" variant="ghost" onClick={() => onSelectDept(null)}>Cancel</Button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-zinc-50/50">
                    <TableHead>Host Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dept.hostsToDisplay.map(host => (
                    editingHostId === host.id ? (
                      <TableRow key={host.id} className="bg-blue-50/30">
                        <TableCell className="p-2 align-top">
                          <Input value={editingHostData.name} onChange={e => onEditingHostDataChange({ ...editingHostData, name: e.target.value })} className="h-9 min-w-[120px] bg-white" />
                        </TableCell>
                        <TableCell className="p-2 align-top">
                          <Input value={editingHostData.phone} onChange={e => onEditingHostDataChange({ ...editingHostData, phone: e.target.value })} className="h-9 min-w-[120px] bg-white" />
                        </TableCell>
                        <TableCell className="p-2 align-top">
                          <Input value={editingHostData.email} onChange={e => onEditingHostDataChange({ ...editingHostData, email: e.target.value })} className="h-9 min-w-[120px] bg-white" />
                        </TableCell>
                        <TableCell className="p-2 text-right align-top whitespace-nowrap">
                          <Button size="sm" onClick={() => onUpdateHost(host.id)} disabled={isUpdatingHost} className="h-9 bg-blue-600 hover:bg-blue-700 text-white mr-1">
                            {isUpdatingHost ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={onCancelEditHost} className="h-9 px-2">
                            <X className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow key={host.id}>
                        <TableCell className="font-medium text-zinc-900">{host.name}</TableCell>
                        <TableCell className="text-zinc-600">{host.phone || "-"}</TableCell>
                        <TableCell className="text-zinc-600">{host.email || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2.5 text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => onEditHostStart(host)}
                            >
                              <Pencil className="w-3.5 h-3.5 sm:mr-1" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2.5 text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => onDeleteHost(host.id, host.name)}
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:mr-1" />
                              <span className="hidden sm:inline">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  ))}
                  {dept.hostsToDisplay.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500 py-6 border-b-0">
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
        <div className="text-center py-10 text-zinc-500 bg-white rounded-lg border">
          <p className="font-medium text-zinc-900 mb-1">No results found</p>
          <p>No departments or hosts matched &quot;{searchQuery}&quot;</p>
          <Button variant="link" onClick={onClearSearch} className="text-blue-600 mt-2">
            Clear search
          </Button>
        </div>
      )}
    </div>
  );
}
