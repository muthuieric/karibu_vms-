"use client";

import { Loader2, Pencil, Trash2, UserX } from "lucide-react";
import { EmptyState } from "@/components/dashboard/shared/StateBlocks";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type GuardProfile = {
  id: string;
  full_name: string;
  role: string;
  gate_id: string | null;
};

type GuardsAccountsCardProps = {
  loading: boolean;
  guards: GuardProfile[];
  getGateName: (gateId: string | null) => string;
  onEditGuard: (guard: GuardProfile) => void;
  onDeleteGuard: (id: string, name: string) => void;
};

export default function GuardsAccountsCard({
  loading,
  guards,
  getGateName,
  onEditGuard,
  onDeleteGuard,
}: GuardsAccountsCardProps) {
  return (
    <Card className="rounded-[1.4rem] border-slate-100 bg-white shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Guard Accounts</CardTitle>
        <CardDescription>Personnel authorized to manage visitor entry points.</CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-600" />
            <p className="font-bold">Loading security profiles...</p>
          </div>
        ) : guards.length === 0 ? (
          <EmptyState title="No guards registered" description="Create login credentials for your security personnel." icon={UserX} className="m-0 sm:m-2" />
        ) : (
          <div className="rounded-none sm:rounded-2xl border-y sm:border border-slate-100 overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="whitespace-nowrap pl-4 sm:pl-6 text-slate-500 font-bold uppercase tracking-wider text-xs">Guard Details</TableHead>
                  <TableHead className="whitespace-nowrap text-slate-500 font-bold uppercase tracking-wider text-xs">Assigned entry point</TableHead>
                  <TableHead className="whitespace-nowrap text-right pr-4 sm:pr-6 text-slate-500 font-bold uppercase tracking-wider text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guards.map((guard) => (
                  <TableRow key={guard.id}>
                    <TableCell className="pl-4 sm:pl-6">
                      <div className="font-bold whitespace-nowrap text-slate-900">
                        {guard.full_name}
                      </div>
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      <StatusBadge status={guard.gate_id ? "active" : "pending"}>{getGateName(guard.gate_id)}</StatusBadge>
                    </TableCell>

                    <TableCell className="text-right pr-4 sm:pr-6 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditGuard(guard)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-lg"
                          title="Edit guard"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteGuard(guard.id, guard.full_name)}
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-lg"
                          title="Permanently Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
