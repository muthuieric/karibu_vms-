"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, MessageSquare, Send, Clock, CheckCircle2, Phone, HelpCircle, CreditCard, Users } from "lucide-react";
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
          title="Support Center"
          description="Get help with Karibu VMS, find answers to common questions, or contact our team directly."
          icon={MessageSquare}
        />

        {/* Quick Help Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-[1.4rem] border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-5 flex flex-col items-start text-left space-y-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <HelpCircle className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-bold text-slate-900">Common questions</h3>
                <p className="text-sm text-slate-500 mt-1">Browse our knowledge base</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.4rem] border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-5 flex flex-col items-start text-left space-y-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-bold text-slate-900">Visitor setup help</h3>
                <p className="text-sm text-slate-500 mt-1">Manage gates and guards</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.4rem] border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-5 flex flex-col items-start text-left space-y-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <CreditCard className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-bold text-slate-900">Account and billing</h3>
                <p className="text-sm text-slate-500 mt-1">Payments and subscriptions</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.4rem] border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-5 flex flex-col items-start text-left space-y-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Phone className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-bold text-slate-900">Contact support</h3>
                <p className="text-sm text-slate-500 mt-1">Call us directly</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Create Ticket Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 rounded-[1.4rem] border-slate-100 bg-white shadow-sm">
              <CardHeader className="bg-white pb-5">
                <CardTitle className="text-lg text-slate-900">Submit a Ticket</CardTitle>
                <CardDescription className="text-slate-500">Need assistance? Let us know below.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <form onSubmit={support.handleSubmitTicket} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="support-subject" className="font-bold text-slate-700">Subject</Label>
                    <Input 
                      id="support-subject"
                      required 
                      placeholder="e.g. Need to add more gates" 
                      value={support.subject} 
                      onChange={(e) => support.setSubject(e.target.value)} 
                      className="h-11 bg-slate-50 border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support-description" className="font-bold text-slate-700">Description</Label>
                    <textarea 
                      id="support-description"
                      required 
                      placeholder="Please describe the issue or request in detail..." 
                      value={support.description} 
                      onChange={(e) => support.setDescription(e.target.value)} 
                      className="flex min-h-[120px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 resize-none"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm" disabled={support.isSubmitting || !support.subject.trim() || !support.description.trim()}>
                    {support.isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</> : <><Send className="w-4 h-4 mr-2" /> Submit Ticket</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Ticket History List */}
          <div className="lg:col-span-2">
            <Card className="h-full rounded-[1.4rem] border-slate-100 bg-white shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5">
                <CardTitle className="text-xl text-slate-900">Your Support History</CardTitle>
                <CardDescription className="text-slate-500">Track the status of your previous requests.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {support.loading ? (
                   <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
                ) : support.tickets.length === 0 ? (
                   <div className="p-8">
                     <EmptyState title="No support tickets" description="You haven't submitted any requests yet." icon={MessageSquare} />
                   </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50 border-b border-slate-100">
                        <TableRow>
                          <TableHead className="whitespace-nowrap pl-4 sm:pl-6 text-xs font-bold uppercase tracking-wider text-slate-500">Ticket Subject</TableHead>
                          <TableHead className="whitespace-nowrap text-xs font-bold uppercase tracking-wider text-slate-500">Status</TableHead>
                          <TableHead className="whitespace-nowrap text-right pr-4 sm:pr-6 text-xs font-bold uppercase tracking-wider text-slate-500">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {support.tickets.map((ticket) => (
                          <TableRow key={ticket.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
                            <TableCell className="pl-4 sm:pl-6 max-w-[250px] py-4">
                              <p className="font-bold text-slate-900 truncate">{ticket.subject}</p>
                              <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{ticket.description}</p>
                            </TableCell>
                            <TableCell className="whitespace-nowrap py-4">
                              {ticket.status === "pending" && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-orange-700 border border-orange-200">
                                  <Clock className="w-3.5 h-3.5" /> Pending Review
                                </span>
                              )}
                              {ticket.status === "in_progress" && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> In Progress
                                </span>
                              )}
                              {ticket.status === "resolved" && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap pr-4 sm:pr-6 text-sm font-bold text-slate-500 py-4">
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
