"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertOctagon, Flag, Loader2, Plus, X } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import { useCompanyBlacklist } from "@/hooks/useCompanyBlacklist";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { EmptyState, ErrorState } from "@/components/dashboard/shared/StateBlocks";
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
          title="Restricted Access"
          description="Manage blacklisted individuals blocked from checking in."
          icon={AlertOctagon}
          tone="danger"
        >
          <Button onClick={() => setShowRedFlagModal(true)} variant="destructive" className="w-full sm:w-auto">
            <Plus className="h-4 w-4" /> Add Red Flag
          </Button>
        </PageHeader>

        {/* RED FLAGS / BLACKLIST TABLE */}
        <Card>
          <CardHeader className="border-b border-border pb-5">
            <CardTitle className="text-xl">Blacklisted Visitors</CardTitle>
            <CardDescription>These individuals will be strictly prohibited from passing the security gates.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-6">
            {blacklist.loading ? (
               <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>
            ) : blacklist.redFlags.length === 0 ? (
               <EmptyState title="No visitors blacklisted" description="Your building is clear of restricted individuals." icon={Flag} />
            ) : (
              <div className="rounded-none sm:rounded-2xl border-y sm:border border-border overflow-x-auto bg-surface">
                <Table>
                  <TableHeader className="bg-surface-muted">
                    <TableRow>
                      <TableHead className="whitespace-nowrap pl-4 sm:pl-6">Name</TableHead>
                      <TableHead className="whitespace-nowrap">ID Number</TableHead>
                      <TableHead className="whitespace-nowrap">Phone Number</TableHead>
                      <TableHead className="whitespace-nowrap">Reason for Restriction</TableHead>
                      <TableHead className="whitespace-nowrap text-right pr-4 sm:pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blacklist.redFlags.map((flag) => (
                      <TableRow key={flag.id} className="hover:bg-red-50/30 transition-colors">
                        <TableCell className="font-bold text-zinc-900 whitespace-nowrap pl-4 sm:pl-6">{flag.name}</TableCell>
                        <TableCell className="font-mono text-zinc-600 whitespace-nowrap bg-zinc-50/50">{flag.id_number}</TableCell>
                        <TableCell className="font-mono text-zinc-600 whitespace-nowrap">{flag.phone}</TableCell>
                        <TableCell className="text-zinc-600 max-w-[300px] truncate" title={flag.reason}>{flag.reason}</TableCell>
                        <TableCell className="text-right whitespace-nowrap pr-4 sm:pr-6">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => blacklist.handleDeleteRedFlag(flag.id, flag.name)}
                            className="h-8 px-3 text-zinc-600 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900 transition-colors shadow-sm"
                            title="Remove from Blacklist"
                          >
                            <X className="h-4 w-4 sm:mr-1" />
                            <span className="hidden sm:inline font-semibold">Pardon</span>
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

      {/* --- ADD RED FLAG MODAL --- */}
      {showRedFlagModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-2xl relative border-0 rounded-xl overflow-hidden bg-white">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600"></div>
            <button 
              onClick={() => setShowRedFlagModal(false)} 
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-full p-1.5 transition-colors"
            >
              <X size={18} />
            </button>
            <CardHeader className="pt-8 pb-4">
              <CardTitle className="text-xl font-bold text-red-700 flex items-center gap-2">
                <AlertOctagon className="h-5 w-5" /> Block Visitor
              </CardTitle>
              <CardDescription className="text-zinc-500">Prevent a specific individual from registering at any gate.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(event) => blacklist.handleCreateRedFlag(event, () => setShowRedFlagModal(false))} className="space-y-4">
                <div>
                  <Label className="font-semibold text-zinc-700">Visitor Name <span className="text-red-500">*</span></Label>
                  <Input 
                    required 
                    placeholder="e.g. John Doe" 
                    value={blacklist.newRedFlag.name} 
                    onChange={(e) => blacklist.setNewRedFlag({...blacklist.newRedFlag, name: e.target.value})} 
                    className="h-11 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-red-600 transition-colors"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="font-semibold text-zinc-700">ID Number <span className="text-red-500">*</span></Label>
                    <Input 
                      required 
                      placeholder="e.g. 12345678" 
                      value={blacklist.newRedFlag.id_number} 
                      onChange={(e) => blacklist.setNewRedFlag({...blacklist.newRedFlag, id_number: e.target.value})} 
                      className="h-11 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-red-600 transition-colors"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold text-zinc-700">Phone Number <span className="text-red-500">*</span></Label>
                    <PhoneInput 
                      country="ke" 
                      value={blacklist.newRedFlag.phone} 
                      onChange={phone => blacklist.setNewRedFlag({ ...blacklist.newRedFlag, phone })} 
                      inputClass="!w-full !h-11 !text-zinc-900 !bg-zinc-50 !rounded-md !border !border-zinc-300 focus:!ring-2 focus:!ring-red-600 px-3" 
                      containerClass="w-full" 
                      buttonClass="!border-zinc-300 !bg-zinc-50 !rounded-l-md hover:!bg-zinc-100"
                    />
                  </div>
                </div>

                <p className="text-xs text-zinc-500 mt-1.5 leading-snug">
                  The system will block future check-ins if the visitor matches ANY of these details.
                </p>

                <div>
                  <Label className="font-semibold text-zinc-700">Reason for Restriction <span className="text-red-500">*</span></Label>
                  <Input 
                    required 
                    placeholder="e.g. Hostile behavior, banned by management" 
                    value={blacklist.newRedFlag.reason} 
                    onChange={(e) => blacklist.setNewRedFlag({...blacklist.newRedFlag, reason: e.target.value})} 
                    className="h-11 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-red-600 transition-colors"
                  />
                </div>
                
                <div className="pt-4">
                  <Button type="submit" variant="destructive" className="w-full h-12 text-base font-bold shadow-sm transition-transform active:scale-[0.98]" disabled={blacklist.isSubmittingRedFlag}>
                    {blacklist.isSubmittingRedFlag ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...</>
                    ) : (
                      "Add to Blacklist"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}
