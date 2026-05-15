"use client";

import Image from "next/image";
import { Building2, Camera, CheckCircle2, ClipboardList, Loader2, Search, ShieldCheck, UserCircle } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

type Rules = {
  requirePhoto: boolean;
  askPhone: boolean;
  askId: boolean;
  askHost: boolean;
  askPurpose: boolean;
  askVehicle: boolean;
};

type VisitorCheckInFormProps = {
  companyName: string;
  gateName?: string | null;
  rules: Rules;
  customFields: CustomField[];
  customAnswers: Record<string, string>;
  newVisitor: VisitorFormData;
  hostSearchQuery: string;
  isHostDropdownOpen: boolean;
  filteredDepartments: DepartmentWithHosts[];
  selfiePreview: string | null;
  isSubmitting: boolean;
  agreedToTerms: boolean;
  selfieInputRef: React.RefObject<HTMLInputElement | null>;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  onSubmit: (event: React.FormEvent) => void;
  onNewVisitorChange: (visitor: VisitorFormData) => void;
  onHostSearchQueryChange: (value: string) => void;
  onHostDropdownOpenChange: (value: boolean) => void;
  onCustomAnswersChange: (answers: Record<string, string>) => void;
  onSelfieFileChange: (file: File) => void;
  onSelfiePreviewChange: (preview: string) => void;
  onAgreedToTermsChange: (value: boolean) => void;
};

export default function VisitorCheckInForm({
  companyName,
  gateName,
  rules,
  customFields,
  customAnswers,
  newVisitor,
  hostSearchQuery,
  isHostDropdownOpen,
  filteredDepartments,
  selfiePreview,
  isSubmitting,
  agreedToTerms,
  selfieInputRef,
  dropdownRef,
  onSubmit,
  onNewVisitorChange,
  onHostSearchQueryChange,
  onHostDropdownOpenChange,
  onCustomAnswersChange,
  onSelfieFileChange,
  onSelfiePreviewChange,
  onAgreedToTermsChange,
}: VisitorCheckInFormProps) {
  return (
    <Card className="relative z-10 w-full max-w-5xl overflow-hidden border-white/80 bg-white/90 shadow-modal backdrop-blur">
      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
        <CardHeader className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-slate-950 to-emerald-700 p-7 text-white lg:p-10">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_34%)]" />
          <div className="relative">
            <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <CardDescription className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-100">Welcome to</CardDescription>
            <CardTitle className="text-3xl font-black tracking-tight text-white md:text-4xl">{companyName}</CardTitle>
            <p className="mt-3 text-sm leading-6 text-blue-50/85">
              Register your visit{gateName ? ` at ${gateName}` : ""}. Security will review your request once submitted.
            </p>
            <div className="mt-8 grid gap-3 text-sm font-semibold text-white/90">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-blue-700">1</span>
                Enter visitor details
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-blue-700">2</span>
                Complete security requirements
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-blue-700">3</span>
                Wait for guard approval
              </div>
            </div>
          </div>
        </CardHeader>

      <CardContent className="p-5 md:p-7">
        <div className="mb-6 flex items-center gap-3 rounded-[1.25rem] border border-blue-100 bg-blue-50/80 p-4">
          <div className="rounded-2xl bg-primary p-2.5 text-white">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-slate-950">Visitor registration</p>
            <p className="text-sm text-slate-500">Use your legal name and reachable phone number where required.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="visitor-name" className="mb-1 block">Full Name <span className="text-destructive">*</span></Label>
            <Input id="visitor-name" required value={newVisitor.name} onChange={(e) => onNewVisitorChange({ ...newVisitor, name: e.target.value })} placeholder="e.g. John Doe" className="h-12" autoComplete="name" />
          </div>

          {rules.askPhone && (
            <div>
              <Label htmlFor="visitor-phone" className="mb-1 block">Phone Number <span className="text-destructive">*</span></Label>
              <PhoneInput
                inputProps={{ id: "visitor-phone", autoComplete: "tel", required: true }}
                country="ke"
                value={newVisitor.phone}
                onChange={phone => onNewVisitorChange({ ...newVisitor, phone })}
                inputClass="!w-full !h-12 !text-slate-900 !bg-white !rounded-xl !border !border-slate-200 focus:!ring-2 focus:!ring-blue-500/20 px-3"
                containerClass="w-full"
                buttonClass="!border-slate-200 !bg-slate-50 !rounded-l-xl hover:!bg-slate-100"
              />
            </div>
          )}

          {rules.askId && (
            <>
              <div>
                <Label htmlFor="visitor-doc-type" className="mb-1 block">Document Type</Label>
                <select
                  id="visitor-doc-type"
                  className="flex h-12 w-full rounded-xl border border-input bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={newVisitor.doc_type}
                  onChange={(e) => onNewVisitorChange({ ...newVisitor, doc_type: e.target.value })}
                >
                  <option value="National ID">National ID</option>
                  <option value="Passport">Passport</option>
                  <option value="Driver's License">Driver&apos;s License</option>
                </select>
              </div>
              <div>
                <Label htmlFor="visitor-id-number" className="mb-1 block">ID Number <span className="text-destructive">*</span></Label>
                <Input
                  id="visitor-id-number"
                  required
                  value={newVisitor.id_number}
                  onChange={(e) => onNewVisitorChange({ ...newVisitor, id_number: e.target.value })}
                  placeholder="Enter ID Number"
                  className="h-12"
                  autoComplete="id number"
                />
              </div>
            </>
          )}

          {rules.askHost && (
            <div className="relative md:col-span-2" ref={dropdownRef}>
              <Label htmlFor="visitor-host-search" className="mb-1 block">Who are you visiting?</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="visitor-host-search"
                type="text"
                placeholder="Type to search for a host..."
                value={hostSearchQuery}
                onChange={(e) => {
                  onHostSearchQueryChange(e.target.value);
                  onHostDropdownOpenChange(true);
                  onNewVisitorChange({ ...newVisitor, host_id: "" });
                }}
                onFocus={() => onHostDropdownOpenChange(true)}
                className="h-12 pl-9"
                autoComplete="off"
              />
              </div>

              <input type="text" className="hidden" required value={newVisitor.host_id} onChange={() => {}} />

              {isHostDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-surface border border-border rounded-2xl shadow-modal max-h-60 overflow-y-auto">
                  {filteredDepartments.length === 0 ? (
                    <div className="p-4 text-sm text-text-muted text-center">No matching hosts found.</div>
                  ) : (
                    filteredDepartments.map((dept) => (
                      <div key={dept.id}>
                        <div className="px-3 py-2 text-xs font-bold bg-surface-muted text-text-muted uppercase tracking-wider sticky top-0 backdrop-blur-sm flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5" />
                          {dept.name}
                        </div>
                        {dept.hosts.map((host) => (
                          <button
                            type="button"
                            key={host.id}
                            className="block w-full px-4 py-3 text-left text-sm text-text-main hover:bg-primary/5 cursor-pointer border-b border-border last:border-0 transition-colors"
                            onClick={() => {
                              onNewVisitorChange({ ...newVisitor, host_id: host.id });
                              onHostSearchQueryChange(host.name);
                              onHostDropdownOpenChange(false);
                            }}
                          >
                            <div className="font-medium">{host.name}</div>
                          </button>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {rules.askPurpose && (
            <div>
              <Label htmlFor="visitor-purpose" className="mb-1 block">Purpose of Visit</Label>
              <Input
                id="visitor-purpose"
                value={newVisitor.purpose}
                onChange={(e) => onNewVisitorChange({ ...newVisitor, purpose: e.target.value })}
                placeholder="e.g. Meeting, Delivery, Interview"
                className="h-12"
              />
            </div>
          )}

          {rules.askVehicle && (
            <div>
              <Label htmlFor="visitor-vehicle" className="mb-1 block">Vehicle Registration</Label>
              <Input
                id="visitor-vehicle"
                value={newVisitor.vehicle_reg}
                onChange={(e) => onNewVisitorChange({ ...newVisitor, vehicle_reg: e.target.value })}
                placeholder="e.g. KCA 123A (Leave blank if walk-in)"
                className="h-12 uppercase"
              />
            </div>
          )}

          {customFields.map((field) => (
            <div key={field.id}>
              <Label htmlFor={`custom-field-${field.id}`} className="mb-1 block">{field.label}</Label>
              <Input
                id={`custom-field-${field.id}`}
                value={customAnswers[field.id] || ""}
                onChange={(e) => onCustomAnswersChange({ ...customAnswers, [field.id]: e.target.value })}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                className="h-12"
              />
            </div>
          ))}
          </div>

          {rules.requirePhoto && (
            <div className="space-y-3 rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
              <div>
                <Label className="flex justify-between items-center">
                  Security Photo
                  <span className="text-xs text-destructive font-bold uppercase tracking-wider">* Required</span>
                </Label>
                <p className="text-[11px] text-text-muted mt-1 font-medium">Accepted formats: JPG, PNG, WEBP, HEIC</p>
              </div>

              <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-border">
                <div className="w-20 h-20 rounded-2xl bg-surface border-2 border-dashed border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  {selfiePreview ? (
                    <Image
                      src={selfiePreview}
                      alt="Selfie preview"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <UserCircle className="w-9 h-9 text-text-muted" />
                  )}
                </div>

                <div className="flex-1">
                  <input
                    id="visitor-selfie"
                    aria-label="Security photo"
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
                    className="w-full text-sm h-12 font-bold"
                    onClick={() => selfieInputRef.current?.click()}
                  >
                    <Camera className="w-5 h-5" /> Take Selfie
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3 rounded-[1.25rem] border border-slate-200 bg-white p-4">
            <div className="text-xs text-text-muted h-24 overflow-y-auto p-3 bg-surface-muted border border-border rounded-xl leading-relaxed shadow-inner">
              <p className="font-bold mb-1 text-text-main">Terms and Conditions of Entry</p>
              <p>By registering, you agree to comply with all building security policies and procedures. You consent to the collection, processing, and temporary storage of your personal data (including identification details and facial capture, if applicable) strictly for building security and safety audit purposes. Management reserves the right to deny entry, conduct searches, or escort individuals off the premises for non-compliance. Your data will be handled in accordance with local data protection laws.</p>
            </div>
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="terms"
                required
                checked={agreedToTerms}
                onChange={(e) => onAgreedToTermsChange(e.target.checked)}
                className="mt-0.5 shrink-0 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
              <Label htmlFor="terms" className="text-sm text-text-main leading-snug cursor-pointer font-medium">
                I agree to the Terms and Conditions and consent to the processing of my data. <span className="text-destructive">*</span>
              </Label>
            </div>
          </div>

          <Button type="submit" className="w-full mt-6 h-14 text-lg font-bold" disabled={isSubmitting || !agreedToTerms}>
            {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</> : <><CheckCircle2 className="h-5 w-5" /> Submit Registration</>}
          </Button>
        </form>
      </CardContent>
      </div>
    </Card>
  );
}
