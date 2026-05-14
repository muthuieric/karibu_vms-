"use client";

import Image from "next/image";
import { Building2, Camera, ClipboardCheck, FileBadge2, Loader2, Search, UserCircle, UserRoundPlus } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import { ModalShell } from "@/components/dashboard/shared/ModalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CustomField = {
  id: string;
  label: string;
  active: boolean;
};

type Host = { id: string; name: string; phone: string; email: string; department_id: string };
type DepartmentWithHosts = { id: string; name: string; hosts: Host[] };

type VisitorFormData = {
  name: string;
  phone: string;
  id_number: string;
  doc_type: string;
  host_id: string;
  purpose: string;
  vehicle_reg: string;
};

type AddVisitorFormProps = {
  askPhone: boolean;
  askId: boolean;
  askHost: boolean;
  askPurpose: boolean;
  askVehicle: boolean;
  requirePhoto: boolean;
  isSubmitting: boolean;
  newVisitor: VisitorFormData;
  customFields: CustomField[];
  customAnswers: Record<string, string>;
  hostSearchQuery: string;
  isHostDropdownOpen: boolean;
  filteredDepartments: DepartmentWithHosts[];
  selfiePreview: string | null;
  agreedToTerms: boolean;
  selfieInputRef: React.RefObject<HTMLInputElement | null>;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onNewVisitorChange: (visitor: VisitorFormData) => void;
  onCustomAnswersChange: (answers: Record<string, string>) => void;
  onHostSearchQueryChange: (value: string) => void;
  onHostDropdownOpenChange: (value: boolean) => void;
  onSelfieFileChange: (file: File) => void;
  onSelfiePreviewChange: (preview: string) => void;
  onAgreedToTermsChange: (value: boolean) => void;
};

export default function AddVisitorForm({
  askPhone,
  askId,
  askHost,
  askPurpose,
  askVehicle,
  requirePhoto,
  isSubmitting,
  newVisitor,
  customFields,
  customAnswers,
  hostSearchQuery,
  isHostDropdownOpen,
  filteredDepartments,
  selfiePreview,
  agreedToTerms,
  selfieInputRef,
  dropdownRef,
  onClose,
  onSubmit,
  onNewVisitorChange,
  onCustomAnswersChange,
  onHostSearchQueryChange,
  onHostDropdownOpenChange,
  onSelfieFileChange,
  onSelfiePreviewChange,
  onAgreedToTermsChange,
}: AddVisitorFormProps) {
  return (
    <ModalShell
      title="Register walk-in visitor"
      description="Capture the visitor details required by building policy before sending them to the approval queue."
      onClose={onClose}
      className="max-w-3xl overflow-hidden"
    >
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="rounded-[1.4rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-primary p-3 text-white shadow-lg shadow-blue-500/20">
                  <UserRoundPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-950">Desk registration</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Fields shown here follow the company&apos;s visitor rules. The visitor will appear as pending after submission.
                  </p>
                </div>
              </div>
            </div>

            <section className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label className="font-bold text-slate-800">Full Name <span className="text-destructive">*</span></Label>
                <Input required value={newVisitor.name} onChange={(e) => onNewVisitorChange({ ...newVisitor, name: e.target.value })} placeholder="e.g. John Doe" className="h-12 bg-white" />
            </div>

            {askPhone && (
              <div className="space-y-2">
                <Label className="font-bold text-slate-800">Phone Number <span className="text-destructive">*</span></Label>
                <PhoneInput
                  country="ke"
                  value={newVisitor.phone}
                  onChange={phone => onNewVisitorChange({ ...newVisitor, phone })}
                  inputClass="!w-full !h-12 !text-slate-950 !bg-white !rounded-xl !border !border-slate-200 focus:!ring-2 focus:!ring-blue-600 px-3"
                  containerClass="w-full"
                  buttonClass="!border-slate-200 !bg-slate-50 !rounded-l-xl hover:!bg-slate-100"
                />
              </div>
            )}

            {askId && (
              <>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-800">Document Type</Label>
                  <select
                    className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={newVisitor.doc_type}
                    onChange={(e) => onNewVisitorChange({ ...newVisitor, doc_type: e.target.value })}
                  >
                    <option value="National ID">National ID</option>
                    <option value="Passport">Passport</option>
                    <option value="Driver's License">Driver&apos;s License</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-800">ID / Document No. <span className="text-destructive">*</span></Label>
                  <Input
                    required
                    value={newVisitor.id_number}
                    onChange={(e) => onNewVisitorChange({ ...newVisitor, id_number: e.target.value })}
                    placeholder="Enter ID number"
                    className="h-12 bg-white"
                  />
                </div>
              </>
            )}

            {askHost && (
              <div className="relative space-y-2 md:col-span-2" ref={dropdownRef}>
                <Label className="font-bold text-slate-800">Who are you visiting?</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Type to search for a host..."
                  value={hostSearchQuery}
                  onChange={(e) => {
                    onHostSearchQueryChange(e.target.value);
                    onHostDropdownOpenChange(true);
                    onNewVisitorChange({ ...newVisitor, host_id: "" });
                  }}
                  onFocus={() => onHostDropdownOpenChange(true)}
                  className="h-12 bg-white pl-9"
                  autoComplete="off"
                />
                </div>

                <input type="text" className="hidden" required value={newVisitor.host_id} onChange={() => {}} />

                {isHostDropdownOpen && (
                  <div className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-modal">
                    {filteredDepartments.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500">No matching hosts found.</div>
                    ) : (
                      filteredDepartments.map((dept) => (
                        <div key={dept.id}>
                          <div className="sticky top-0 flex items-center gap-2 bg-slate-50 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                            <Building2 className="h-3.5 w-3.5" />
                            {dept.name}
                          </div>
                          {dept.hosts.map((host) => (
                            <div
                              key={host.id}
                              className="cursor-pointer border-b border-slate-50 px-3 py-3 text-sm font-semibold text-slate-900 hover:bg-blue-50 last:border-0"
                              onClick={() => {
                                onNewVisitorChange({ ...newVisitor, host_id: host.id });
                                onHostSearchQueryChange(host.name);
                                onHostDropdownOpenChange(false);
                              }}
                            >
                              {host.name}
                            </div>
                          ))}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {askPurpose && (
              <div className="space-y-2">
                <Label className="font-bold text-slate-800">Purpose of Visit</Label>
                <Input
                  value={newVisitor.purpose}
                  onChange={(e) => onNewVisitorChange({ ...newVisitor, purpose: e.target.value })}
                  placeholder="e.g. Meeting, Delivery, Interview"
                  className="h-12 bg-white"
                />
              </div>
            )}

            {askVehicle && (
              <div className="space-y-2">
                <Label className="font-bold text-slate-800">Vehicle Registration</Label>
                <Input
                  value={newVisitor.vehicle_reg}
                  onChange={(e) => onNewVisitorChange({ ...newVisitor, vehicle_reg: e.target.value })}
                  placeholder="e.g. KCA 123A (Leave blank if walk-in)"
                  className="h-12 bg-white uppercase"
                />
              </div>
            )}

            {customFields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label className="font-bold text-slate-800">{field.label}</Label>
                <Input
                  value={customAnswers[field.id] || ""}
                  onChange={(e) => onCustomAnswersChange({ ...customAnswers, [field.id]: e.target.value })}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  className="h-12 bg-white"
                />
              </div>
            ))}
            </section>

            {requirePhoto && (
              <section className="space-y-3 rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-4">
                <Label className="flex items-center justify-between font-bold text-slate-800">
                  Security Photo
                  <span className="text-xs font-bold uppercase tracking-wider text-destructive">Required</span>
                </Label>

                <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 shadow-sm">
                    {selfiePreview ? (
                      <Image
                        src={selfiePreview}
                        alt="Selfie preview"
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <UserCircle className="h-9 w-9 text-slate-300" />
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      ref={selfieInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onSelfieFileChange(file);
                          onSelfiePreviewChange(URL.createObjectURL(file));
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 w-full bg-white text-sm font-bold"
                      onClick={() => selfieInputRef.current?.click()}
                    >
                      <Camera className="h-4 w-4" /> Capture Photo
                    </Button>
                  </div>
                </div>
              </section>
            )}

            <section className="space-y-3 rounded-[1.4rem] border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 font-bold text-slate-950">
                <FileBadge2 className="h-4 w-4 text-primary" />
                Entry consent
              </div>
              <div className="h-24 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
                <p className="mb-1 font-bold text-slate-700">Terms and Conditions of Entry</p>
                <p>By registering, the visitor agrees to comply with all building security policies and procedures. The visitor consents to the collection, processing, and temporary storage of their personal data (including identification details and facial capture, if applicable) strictly for building security and safety audit purposes. Management reserves the right to deny entry, conduct searches, or escort individuals off the premises for non-compliance. Data is handled in accordance with local data protection laws.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => onAgreedToTermsChange(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <Label htmlFor="terms" className="cursor-pointer text-sm font-medium leading-snug text-slate-700">
                  The visitor has agreed to the Terms and Conditions and consents to data processing. <span className="text-destructive">*</span>
                </Label>
              </div>
            </section>

            <Button type="submit" className="h-[52px] w-full text-base font-bold shadow-lg shadow-blue-500/20" disabled={isSubmitting || !agreedToTerms}>
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Checking Security...</> : <><ClipboardCheck className="h-4 w-4" /> Register Visitor</>}
            </Button>
          </form>
    </ModalShell>
  );
}
