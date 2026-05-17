"use client";

import Image from "next/image";
import { Building2, Camera, CheckCircle2, Loader2, Search, UserCircle, MapPin } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const hasVisitDetails = rules.askHost || rules.askPurpose || rules.askVehicle || customFields.length > 0;
  
  let sectionCounter = 1;
  const visitorDetailsStep = sectionCounter++;
  const visitDetailsStep = hasVisitDetails ? sectionCounter++ : null;
  const verificationStep = rules.requirePhoto ? sectionCounter++ : null;
  const agreementStep = sectionCounter++;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 relative z-10">
      <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
        
        {/* Header Card */}
        <div className="bg-blue-600 p-8 text-white text-center flex flex-col items-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 mb-4 backdrop-blur-sm border border-white/20 shadow-inner">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight">{companyName}</h1>
          <div className="flex items-center justify-center gap-1.5 text-blue-100 text-sm font-medium">
            <MapPin className="w-4 h-4" />
            <span>{gateName ? gateName : "Visitor Registration"}</span>
          </div>
        </div>

        <CardContent className="p-6 sm:p-8">
          <form onSubmit={onSubmit} className="space-y-8">
            
            {/* Section 1: Visitor details */}
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">{visitorDetailsStep}</span>
                Visitor details
              </h2>
              
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="visitor-name" className="mb-1.5 block font-semibold text-slate-700">Full Name <span className="text-red-500">*</span></Label>
                  <Input id="visitor-name" required value={newVisitor.name} onChange={(e) => onNewVisitorChange({ ...newVisitor, name: e.target.value })} placeholder="e.g. John Doe" className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-blue-500/20 text-base" autoComplete="name" />
                </div>

                {rules.askPhone && (
                  <div className="sm:col-span-2">
                    <Label htmlFor="visitor-phone" className="mb-1.5 block font-semibold text-slate-700">Phone Number <span className="text-red-500">*</span></Label>
                    <PhoneInput
                      inputProps={{ id: "visitor-phone", autoComplete: "tel", required: true }}
                      country="ke"
                      value={newVisitor.phone}
                      onChange={phone => onNewVisitorChange({ ...newVisitor, phone })}
                      inputClass="!w-full !h-12 !text-slate-900 !bg-slate-50 focus:!bg-white !rounded-xl !border !border-slate-200 focus:!ring-2 focus:!ring-blue-500/20 px-3 !text-base"
                      containerClass="w-full"
                      buttonClass="!border-slate-200 !bg-slate-100 !rounded-l-xl hover:!bg-slate-200"
                    />
                  </div>
                )}

                {rules.askId && (
                  <>
                    <div className="sm:col-span-2">
                      <Label htmlFor="visitor-doc-type" className="mb-1.5 block font-semibold text-slate-700">Document Type</Label>
                      <select
                        id="visitor-doc-type"
                        className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-colors"
                        value={newVisitor.doc_type}
                        onChange={(e) => onNewVisitorChange({ ...newVisitor, doc_type: e.target.value })}
                      >
                        <option value="National ID">National ID</option>
                        <option value="Passport">Passport</option>
                        <option value="Driver's License">Driver&apos;s License</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="visitor-id-number" className="mb-1.5 block font-semibold text-slate-700">ID Number <span className="text-red-500">*</span></Label>
                      <Input
                        id="visitor-id-number"
                        required
                        value={newVisitor.id_number}
                        onChange={(e) => onNewVisitorChange({ ...newVisitor, id_number: e.target.value })}
                        placeholder="Enter ID Number"
                        className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-blue-500/20 text-base"
                        autoComplete="off"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Section 2: Visit Details */}
            {hasVisitDetails && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">{visitDetailsStep}</span>
                  Visit details
                </h2>
                
                <div className="grid gap-5 sm:grid-cols-2">
                  {rules.askHost && (
                    <div className="relative sm:col-span-2" ref={dropdownRef}>
                      <Label htmlFor="visitor-host-search" className="mb-1.5 block font-semibold text-slate-700">Who are you visiting?</Label>
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="visitor-host-search"
                          type="text"
                          placeholder="Search for a host..."
                          value={hostSearchQuery}
                          onChange={(e) => {
                            onHostSearchQueryChange(e.target.value);
                            onHostDropdownOpenChange(true);
                            onNewVisitorChange({ ...newVisitor, host_id: "" });
                          }}
                          onFocus={() => onHostDropdownOpenChange(true)}
                          className="h-12 pl-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-blue-500/20 text-base"
                          autoComplete="off"
                        />
                      </div>

                      <input type="text" className="hidden" required value={newVisitor.host_id} onChange={() => {}} />

                      {isHostDropdownOpen && (
                        <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto overflow-x-hidden">
                          {filteredDepartments.length === 0 ? (
                            <div className="p-4 text-sm text-slate-500 text-center font-medium">No matching hosts found.</div>
                          ) : (
                            filteredDepartments.map((dept) => (
                              <div key={dept.id}>
                                <div className="px-4 py-2 text-xs font-bold bg-slate-50 text-slate-500 uppercase tracking-wider sticky top-0 backdrop-blur-md flex items-center gap-2 border-y border-slate-100 first:border-t-0">
                                  <Building2 className="h-3.5 w-3.5" />
                                  {dept.name}
                                </div>
                                {dept.hosts.map((host) => (
                                  <button
                                    type="button"
                                    key={host.id}
                                    className="block w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-blue-50 cursor-pointer transition-colors"
                                    onClick={() => {
                                      onNewVisitorChange({ ...newVisitor, host_id: host.id });
                                      onHostSearchQueryChange(host.name);
                                      onHostDropdownOpenChange(false);
                                    }}
                                  >
                                    <div className="font-semibold text-slate-900">{host.name}</div>
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
                    <div className="sm:col-span-2">
                      <Label htmlFor="visitor-purpose" className="mb-1.5 block font-semibold text-slate-700">Purpose of Visit</Label>
                      <Input
                        id="visitor-purpose"
                        value={newVisitor.purpose}
                        onChange={(e) => onNewVisitorChange({ ...newVisitor, purpose: e.target.value })}
                        placeholder="e.g. Meeting, Delivery, Interview"
                        className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-blue-500/20 text-base"
                      />
                    </div>
                  )}

                  {rules.askVehicle && (
                    <div className="sm:col-span-2">
                      <Label htmlFor="visitor-vehicle" className="mb-1.5 block font-semibold text-slate-700">Vehicle Registration</Label>
                      <Input
                        id="visitor-vehicle"
                        value={newVisitor.vehicle_reg}
                        onChange={(e) => onNewVisitorChange({ ...newVisitor, vehicle_reg: e.target.value })}
                        placeholder="e.g. KCA 123A (Leave blank if walk-in)"
                        className="h-12 uppercase rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-blue-500/20 text-base"
                      />
                    </div>
                  )}

                  {customFields.map((field) => (
                    <div key={field.id} className="sm:col-span-2">
                      <Label htmlFor={`custom-field-${field.id}`} className="mb-1.5 block font-semibold text-slate-700">{field.label}</Label>
                      <Input
                        id={`custom-field-${field.id}`}
                        value={customAnswers[field.id] || ""}
                        onChange={(e) => onCustomAnswersChange({ ...customAnswers, [field.id]: e.target.value })}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-blue-500/20 text-base"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 3: Verification */}
            {rules.requirePhoto && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">{verificationStep}</span>
                  Verification
                </h2>
                
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <div className="mb-4">
                    <Label className="flex justify-between items-center font-semibold text-slate-700">
                      Security Photo
                      <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded-full">* Required</span>
                    </Label>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Please provide a clear photo of your face.</p>
                  </div>

                  <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                      {selfiePreview ? (
                        <Image
                          src={selfiePreview}
                          alt="Selfie preview"
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <UserCircle className="w-10 h-10 text-slate-300" />
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
                        className="w-full h-12 font-bold text-sm bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 rounded-xl"
                        onClick={() => selfieInputRef.current?.click()}
                      >
                        <Camera className="w-5 h-5 mr-2 text-slate-500" /> 
                        {selfiePreview ? "Retake Photo" : "Take Photo"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 4: Entry agreement */}
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">{agreementStep}</span>
                Entry agreement
              </h2>
              
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 space-y-4 shadow-inner">
                <p className="font-bold text-slate-800">Please review the notice before submitting your visit request.</p>
                
                <div>
                  <strong className="text-slate-700 block mb-1">A. Information collected</strong>
                  <p className="leading-relaxed">We collect your name, phone number, identification details, visit purpose, vehicle information, and photo (if required by the building) to process your visit.</p>
                </div>
                
                <div>
                  <strong className="text-slate-700 block mb-1">B. Purpose & Data handling</strong>
                  <p className="leading-relaxed">This data is strictly used for visitor verification, building access control, and safety records. It is handled securely and only accessed by authorized staff in accordance with visitor record policies.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 mt-4 bg-blue-50/60 p-4 rounded-xl border border-blue-100">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => onAgreedToTermsChange(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                />
                <Label htmlFor="terms" className="text-sm font-medium text-slate-800 leading-relaxed cursor-pointer select-none">
                  I confirm that the information provided is accurate and I consent to the collection and use of my details for visitor management and security purposes. <span className="text-red-500">*</span>
                </Label>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all hover:shadow focus:ring-4 focus:ring-blue-500/20" 
              disabled={isSubmitting || !agreedToTerms}
            >
              {isSubmitting ? <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Processing...</> : <><CheckCircle2 className="mr-2 h-6 w-6" /> Submit Registration</>}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
