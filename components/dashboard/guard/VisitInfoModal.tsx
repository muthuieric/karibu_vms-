"use client";

import { Clock, ShieldCheck, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Visitor = {
  id: string;
  name: string;
  host_name?: string;
  host_confirmed?: boolean;
  purpose?: string;
  vehicle_reg?: string;
  custom_data?: Record<string, string>;
};

type VisitInfoModalProps = {
  visitor: Visitor | null;
  onClose: () => void;
  customFieldLabels: Record<string, string>;
};

export default function VisitInfoModal({
  visitor,
  onClose,
  customFieldLabels,
}: VisitInfoModalProps) {
  if (!visitor) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
      <Card className="w-full max-w-sm shadow-xl relative border-0 overflow-hidden bg-white max-h-[80vh] overflow-y-auto rounded-2xl">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition-colors">
          <X size={18} />
        </button>
        <CardHeader className="pt-8 pb-4 border-b border-slate-100">
          <CardTitle className="text-xl font-bold text-slate-900">Visit Details</CardTitle>
          <CardDescription className="text-slate-500">Extra information provided by {visitor.name}.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-5 bg-slate-50/50">
          {visitor.host_name && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Host Name</p>
              <p className="font-medium text-slate-900 text-lg leading-snug">{visitor.host_name}</p>
            </div>
          )}

          {visitor.host_name && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Host Status</p>
              {visitor.host_confirmed ? (
                <div className="flex items-center text-emerald-600 font-semibold text-base mt-1">
                  <ShieldCheck className="w-5 h-5 mr-1.5" />
                  Host confirmed arrival
                </div>
              ) : (
                <div className="flex items-center text-orange-600 font-medium text-base mt-1">
                  <Clock className="w-5 h-5 mr-1.5" />
                  Pending host confirmation
                </div>
              )}
            </div>
          )}

          {visitor.purpose && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Purpose of Visit</p>
              <p className="font-medium text-slate-900 text-lg leading-snug">{visitor.purpose}</p>
            </div>
          )}
          {visitor.vehicle_reg && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Vehicle Registration</p>
              <p className="font-mono font-medium text-slate-900 text-lg leading-snug">{visitor.vehicle_reg}</p>
            </div>
          )}

          {visitor.custom_data && Object.entries(visitor.custom_data).map(([fieldId, value]) => {
            if (!value.trim()) return null;
            const label = customFieldLabels[fieldId] || "Custom Field";
            return (
              <div key={fieldId}>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                <p className="font-medium text-slate-900 text-lg leading-snug">{value}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
