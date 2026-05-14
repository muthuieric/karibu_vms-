"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LifeBuoy, Loader2, MessageSquare, Send, Clock, CheckCircle2 } from "lucide-react";
import { useCompanySupport } from "@/hooks/useCompanySupport";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { EmptyState } from "@/components/dashboard/shared/StateBlocks";

export default function SupportPage() {
  const support = useCompanySupport();

  if (!support.companyId && !support.loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <p className="text-red-500 font-medium">Profile error. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background p-4 md:p-6 lg:p-8 pb-20">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        
        <PageHeader
          title="Help Desk"
          description="Submit support requests or report issues directly to the Karibu VMS team."
          icon={LifeBuoy}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Create Ticket Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 pb-5">
                <CardTitle className="text-lg">Submit a Ticket</CardTitle>
                <CardDescription>Need assistance? Let us know below.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={support.handleSubmitTicket} className="space-y-4">
                  <div>
                    <Label className="font-semibold text-zinc-700">Subject</Label>
                    <Input 
                      required 
                      placeholder="e.g. Need to add more gates" 
                      value={support.subject} 
                      onChange={(e) => support.setSubject(e.target.value)} 
                      className="h-11 bg-zinc-50 mt-1.5"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold text-zinc-700">Description</Label>
                    <textarea 
                      required 
                      placeholder="Please describe the issue or request in detail..." 
                      value={support.description} 
                      onChange={(e) => support.setDescription(e.target.value)} 
                      className="flex min-h-[120px] w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm shadow-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 mt-1.5 resize-none"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white font-bold" disabled={support.isSubmitting || !support.subject.trim() || !support.description.trim()}>
                    {support.isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</> : <><Send className="w-4 h-4 mr-2" /> Submit Ticket</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Ticket History List */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="bg-white border-b border-zinc-100 pb-5">
                <CardTitle className="text-xl">Your Support History</CardTitle>
                <CardDescription>Track the status of your previous requests.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6 sm:pt-6 bg-zinc-50/30">
                {support.loading ? (
                   <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>
                ) : support.tickets.length === 0 ? (
                   <EmptyState title="No support tickets" description="You haven&apos;t submitted any requests yet." icon={MessageSquare} />
                ) : (
                  <div className="rounded-none sm:rounded-md border-y sm:border overflow-x-auto bg-white shadow-sm">
                    <Table>
                      <TableHeader className="bg-zinc-50">
                        <TableRow>
                          <TableHead className="whitespace-nowrap pl-4 sm:pl-6">Ticket Subject</TableHead>
                          <TableHead className="whitespace-nowrap">Status</TableHead>
                          <TableHead className="whitespace-nowrap text-right pr-4 sm:pr-6">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {support.tickets.map((ticket) => (
                          <TableRow key={ticket.id} className="hover:bg-zinc-50/50 transition-colors">
                            <TableCell className="pl-4 sm:pl-6 max-w-[250px]">
                              <p className="font-bold text-zinc-900 truncate">{ticket.subject}</p>
                              <p className="text-xs text-zinc-500 truncate mt-0.5">{ticket.description}</p>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {ticket.status === "pending" && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                                  <Clock className="w-3.5 h-3.5" /> Pending Review
                                </span>
                              )}
                              {ticket.status === "in_progress" && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> In Progress
                                </span>
                              )}
                              {ticket.status === "resolved" && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 border border-green-200">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap pr-4 sm:pr-6 text-sm text-zinc-500">
                              {new Date(ticket.created_at).toLocaleDateString()}
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
          
        </div>
      </div>
    </div>
  );
}
