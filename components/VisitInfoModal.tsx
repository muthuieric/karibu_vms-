"use client";

import { Clock, ShieldCheck, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { canUseHostConfirmation, getHostReviewLabel } from "@/lib/visitor-display";

type Visitor = {
  name: string;
  host_name?: string;
  host_confirmed?: boolean;
  purpose?: string;
  vehicle_reg?: string;
  custom_data?: Record<string, string>;
};

type VisitInfoModalProps = {
  visitor: Visitor;
  customFieldLabels: Record<string, string>;
  planTier?: string;
  onClose: () => void;
};

export default function VisitInfoModal({ visitor, customFieldLabels, planTier = "basic", onClose }: VisitInfoModalProps) {
  const showHostReview = Boolean(visitor.host_name && canUseHostConfirmation(planTier));

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
      <Card className="w-full max-w-sm shadow-2xl relative border border-slate-200 bg-white max-h-[90vh] flex flex-col rounded-2xl overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition-colors z-10" aria-label="Close modal">
          <X size={18} />
        </button>
        <CardHeader className="pt-6 pb-4 border-b border-slate-100 shrink-0 bg-white">
          <CardTitle className="text-xl font-bold text-slate-900">Visit Details</CardTitle>
          <CardDescription className="text-slate-500">Extra information provided by {visitor.name}.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-5 bg-slate-50/50 overflow-y-auto">
          {visitor.host_name && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Host Name</p>
              <p className="font-medium text-slate-900 text-lg leading-snug break-words">{visitor.host_name}</p>
            </div>
          )}

          {showHostReview && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Host review</p>
              {visitor.host_confirmed ? (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200 mt-1">
                  <ShieldCheck className="w-4 h-4" />
                  {getHostReviewLabel(visitor.host_confirmed)}
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-800 border border-orange-200 mt-1">
                  <Clock className="w-4 h-4" />
                  {getHostReviewLabel(visitor.host_confirmed)}
                </div>
              )}
            </div>
          )}

          {visitor.purpose && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Purpose of Visit</p>
              <p className="font-medium text-slate-900 text-lg leading-snug break-words">{visitor.purpose}</p>
            </div>
          )}
          {visitor.vehicle_reg && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Vehicle Registration</p>
              <p className="font-mono font-medium text-slate-900 text-lg leading-snug break-words">{visitor.vehicle_reg}</p>
            </div>
          )}

          {visitor.custom_data && Object.entries(visitor.custom_data).map(([fieldId, value]) => {
            if (!value.trim()) return null;
            const label = customFieldLabels[fieldId] || "Custom Field";
            return (
              <div key={fieldId}>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="font-medium text-slate-900 text-lg leading-snug break-words">{value}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
