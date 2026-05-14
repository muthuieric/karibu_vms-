"use client";

import { ModalShell } from "@/components/dashboard/shared/ModalShell";

type Visitor = {
  name: string;
  document_type: string;
  id_number: string;
  host_name?: string;
  host_confirmed?: boolean;
  purpose?: string;
  vehicle_reg?: string;
  custom_data?: Record<string, string>;
};

type AdminVisitInfoModalProps = {
  visitor: Visitor;
  customFieldLabels: Record<string, string>;
  onClose: () => void;
};

export default function AdminVisitInfoModal({ visitor, customFieldLabels, onClose }: AdminVisitInfoModalProps) {
  return (
    <ModalShell
      title="Visit Details"
      description={`Extra information provided by ${visitor.name}.`}
      onClose={onClose}
      className="max-w-sm"
    >
      <div className="space-y-5 rounded-[1.4rem] border border-slate-100 bg-slate-50/50 p-5 mt-2">
        {visitor.document_type && (
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">ID / Document</p>
            <p className="text-lg font-bold leading-snug text-slate-900">{visitor.document_type} - {visitor.id_number || "N/A"}</p>
          </div>
        )}
        
        {visitor.host_name && (
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Host Name</p>
            <p className="text-lg font-bold leading-snug text-slate-900">{visitor.host_name}</p>
          </div>
        )}

        {visitor.host_name && (
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Host Status</p>
            {visitor.host_confirmed ? (
              <div className="inline-flex mt-1 items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                Confirmed Arrival
              </div>
            ) : (
              <div className="inline-flex mt-1 items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-800 border border-orange-200">
                Pending Confirmation
              </div>
            )}
          </div>
        )}

        {visitor.purpose && (
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Purpose of Visit</p>
            <p className="text-lg font-bold leading-snug text-slate-900">{visitor.purpose}</p>
          </div>
        )}
        
        {visitor.vehicle_reg && (
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Vehicle Registration</p>
            <p className="font-mono text-lg font-bold leading-snug text-slate-900 uppercase">{visitor.vehicle_reg}</p>
          </div>
        )}
        
        {visitor.custom_data && Object.entries(visitor.custom_data).map(([fieldId, value]) => {
          if (!value.trim()) return null;
          const label = customFieldLabels[fieldId] || "Custom Field";
          return (
            <div key={fieldId}>
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
              <p className="text-lg font-bold leading-snug text-slate-900">{value}</p>
            </div>
          );
        })}
      </div>
    </ModalShell>
  );
}
