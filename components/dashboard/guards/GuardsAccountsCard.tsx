"use client";

import { Loader2, Pencil, Trash2, UserX } from "lucide-react";
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
    <Card className="shadow-sm border-zinc-200 bg-white md:col-span-2">
      <CardHeader className="pb-4">
        <CardTitle>Active Guard Accounts</CardTitle>
        <CardDescription>Personnel authorized to log into the Gate Dashboard.</CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-zinc-900" />
            <p className="font-medium">Loading security profiles...</p>
          </div>
        ) : guards.length === 0 ? (
          <div className="text-center py-16 bg-zinc-50 sm:rounded-xl sm:border border-dashed border-zinc-200 m-0 sm:m-2">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-zinc-100">
              <UserX className="w-8 h-8 text-zinc-400" />
            </div>
            <p className="text-zinc-900 font-bold text-lg">No guards registered</p>
            <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">Click &quot;Add New Guard&quot; to create login credentials for your security personnel.</p>
          </div>
        ) : (
          <div className="rounded-none sm:rounded-md border-y sm:border overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50">
                <TableRow>
                  <TableHead className="whitespace-nowrap pl-4 sm:pl-6">Guard Details</TableHead>
                  <TableHead className="whitespace-nowrap">Assigned Gate</TableHead>
                  <TableHead className="whitespace-nowrap text-right pr-4 sm:pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guards.map((guard) => (
                  <TableRow key={guard.id} className="hover:bg-zinc-50/80 transition-colors">
                    <TableCell className="pl-4 sm:pl-6">
                      <div className="font-bold whitespace-nowrap text-zinc-900">
                        {guard.full_name}
                      </div>
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${guard.gate_id ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10" : "bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20"}`}>
                        {getGateName(guard.gate_id)}
                      </span>
                    </TableCell>

                    <TableCell className="text-right pr-4 sm:pr-6 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditGuard(guard)}
                          className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          title="Edit Guard"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteGuard(guard.id, guard.full_name)}
                          className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
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
