"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Flag, Loader2, OctagonX, Plus, X } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import { useCompanyBlacklist } from "@/hooks/useCompanyBlacklist";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { EmptyState, ErrorState } from "@/components/dashboard/shared/StateBlocks";
import { ModalShell } from "@/components/dashboard/shared/ModalShell";
import "react-phone-input-2/lib/style.css";

export default function BlacklistPage() {
  const blacklist = useCompanyBlacklist();
  const [showRedFlagModal, setShowRedFlagModal] = useState(false);

  if (!blacklist.companyId && !blacklist.loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center bg-background">
        <ErrorState
          title="Profile Error"
          description="Could not verify your building manager profile. Please log in again."
        />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background p-4 md:p-6 lg:p-8 pb-20">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        
        <PageHeader
          title="Restricted List"
          description="Manage restricted individuals blocked from checking in."
          icon={OctagonX}
          tone="danger"
        >
          <Button onClick={() => setShowRedFlagModal(true)} variant="destructive" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" /> Restrict Visitor
          </Button>
        </PageHeader>

        {blacklist.identifierWarning && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-950">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <span>
              Restricted visitor matching requires at least one identifier such as phone, ID/passport, or vehicle registration.
            </span>
          </div>
        )}

        {/* RED FLAGS / RESTRICTED LIST TABLE */}
        <Card>
          <CardHeader className="border-b border-border pb-5">
            <CardTitle className="text-xl">Restricted Visitors</CardTitle>
            <CardDescription>This visitor should not be allowed entry.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-6">
            {blacklist.loading ? (
               <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>
            ) : blacklist.redFlags.length === 0 ? (
               <EmptyState title="No visitors restricted" description="Your building is clear of restricted individuals." icon={Flag} />
            ) : (
              <div className="rounded-none sm:rounded-2xl border-y sm:border border-border overflow-x-auto bg-surface">
                <Table>
                  <TableHeader className="bg-surface-muted">
                    <TableRow>
                      <TableHead className="whitespace-nowrap pl-4 sm:pl-6">Name</TableHead>
                      <TableHead className="whitespace-nowrap">ID Number</TableHead>
                      <TableHead className="whitespace-nowrap">Phone Number</TableHead>
                      <TableHead className="whitespace-nowrap">Vehicle</TableHead>
                      <TableHead className="whitespace-nowrap">Reason for Restriction</TableHead>
                      <TableHead className="whitespace-nowrap text-right pr-4 sm:pr-6">Remove</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blacklist.redFlags.map((flag) => (
                      <TableRow key={flag.id} className="hover:bg-red-50/30 transition-colors">
                        <TableCell className="font-bold text-zinc-900 whitespace-nowrap pl-4 sm:pl-6">{flag.name}</TableCell>
                        <TableCell className="font-mono text-zinc-600 whitespace-nowrap bg-zinc-50/50">{flag.id_number || "Not provided"}</TableCell>
                        <TableCell className="font-mono text-zinc-600 whitespace-nowrap">{flag.phone || "Not provided"}</TableCell>
                        <TableCell className="font-mono text-zinc-600 whitespace-nowrap bg-zinc-50/50">{flag.vehicle_reg || "Not provided"}</TableCell>
                        <TableCell className="text-zinc-600 max-w-[300px] truncate" title={flag.reason}>{flag.reason}</TableCell>
                        <TableCell className="text-right whitespace-nowrap pr-4 sm:pr-6">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => blacklist.handleDeleteRedFlag(flag.id, flag.name)}
                            className="h-8 px-3 text-zinc-600 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900 transition-colors shadow-sm"
                            title="Remove from Restricted List"
                            aria-label={`Remove ${flag.name} from restricted list`}
                          >
                            <X className="h-4 w-4 sm:mr-1" />
                            <span className="hidden sm:inline font-semibold">Remove</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* --- ADD RESTRICTED VISITOR MODAL --- */}
      {showRedFlagModal && (
        <ModalShell
          title="Restrict visitor"
          description="This visitor should not be allowed entry."
          onClose={() => setShowRedFlagModal(false)}
          footer={
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 w-full">
              <Button type="button" variant="ghost" className="w-full sm:w-auto h-11 font-bold" onClick={() => setShowRedFlagModal(false)}>
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={() => {
                  const form = document.getElementById('restrict-form') as HTMLFormElement;
                  if (form) form.requestSubmit();
                }}
                className="w-full sm:w-auto h-11 bg-red-600 hover:bg-red-700 text-white font-bold"
                disabled={blacklist.isSubmittingRedFlag}
              >
                {blacklist.isSubmittingRedFlag ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...</>
                ) : (
                  "Add to Restricted List"
                )}
              </Button>
            </div>
          }
        >
          <form id="restrict-form" onSubmit={(event) => blacklist.handleCreateRedFlag(event, () => setShowRedFlagModal(false))} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Visitor identity</h3>
              
              <div className="space-y-2">
                <Label htmlFor="blacklist-name" className="font-bold text-slate-700">Visitor Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="blacklist-name"
                  required 
                  placeholder="e.g. John Doe" 
                  value={blacklist.newRedFlag.name} 
                  onChange={(e) => blacklist.setNewRedFlag({...blacklist.newRedFlag, name: e.target.value})} 
                  className="h-11 bg-slate-50 border-slate-200"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="blacklist-id-number" className="font-bold text-slate-700">ID Number</Label>
                  <Input 
                    id="blacklist-id-number"
                    placeholder="e.g. 12345678" 
                    value={blacklist.newRedFlag.id_number} 
                    onChange={(e) => blacklist.setNewRedFlag({...blacklist.newRedFlag, id_number: e.target.value})} 
                    className="h-11 bg-slate-50 border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blacklist-phone" className="font-bold text-slate-700">Phone Number</Label>
                  <PhoneInput 
                    inputProps={{ id: "blacklist-phone" }}
                    country="ke" 
                    value={blacklist.newRedFlag.phone} 
                    onChange={phone => blacklist.setNewRedFlag({ ...blacklist.newRedFlag, phone })} 
                    inputClass="!w-full !h-11 !text-slate-900 !bg-slate-50 !rounded-xl !border !border-slate-200 focus:!ring-2 focus:!ring-blue-600 px-3" 
                    containerClass="w-full" 
                    buttonClass="!border-slate-200 !bg-slate-50 !rounded-l-xl hover:!bg-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="blacklist-vehicle" className="font-bold text-slate-700">Vehicle Registration</Label>
                <Input
                  id="blacklist-vehicle"
                  placeholder="e.g. KCA 123A"
                  value={blacklist.newRedFlag.vehicle_reg}
                  onChange={(e) => blacklist.setNewRedFlag({ ...blacklist.newRedFlag, vehicle_reg: e.target.value })}
                  className="h-11 bg-slate-50 border-slate-200 uppercase"
                />
              </div>

              <p className="text-xs text-slate-500 leading-snug">
                Add at least one strong identifier. Name is supporting information and will not block entry by itself.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Reason for restriction</h3>
              <div className="space-y-2">
                <Label htmlFor="blacklist-reason" className="font-bold text-slate-700">Review note <span className="text-red-500">*</span></Label>
                <Input 
                  id="blacklist-reason"
                  required 
                  placeholder="e.g. Hostile behavior, banned by management" 
                  value={blacklist.newRedFlag.reason} 
                  onChange={(e) => blacklist.setNewRedFlag({...blacklist.newRedFlag, reason: e.target.value})} 
                  className="h-11 bg-slate-50 border-slate-200"
                />
              </div>
            </div>
          </form>
        </ModalShell>
      )}

    </div>
  );
}
