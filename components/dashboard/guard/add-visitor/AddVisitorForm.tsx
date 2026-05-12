"use client";

import Image from "next/image";
import { Camera, Loader2, ScanLine, UserCircle, X } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  isScanning: boolean;
  newVisitor: VisitorFormData;
  customFields: CustomField[];
  customAnswers: Record<string, string>;
  hostSearchQuery: string;
  isHostDropdownOpen: boolean;
  filteredDepartments: DepartmentWithHosts[];
  selfiePreview: string | null;
  agreedToTerms: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  selfieInputRef: React.RefObject<HTMLInputElement | null>;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onImageCapture: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
  isScanning,
  newVisitor,
  customFields,
  customAnswers,
  hostSearchQuery,
  isHostDropdownOpen,
  filteredDepartments,
  selfiePreview,
  agreedToTerms,
  fileInputRef,
  selfieInputRef,
  dropdownRef,
  onClose,
  onSubmit,
  onImageCapture,
  onNewVisitorChange,
  onCustomAnswersChange,
  onHostSearchQueryChange,
  onHostDropdownOpenChange,
  onSelfieFileChange,
  onSelfiePreviewChange,
  onAgreedToTermsChange,
}: AddVisitorFormProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-black">
          <X size={20} />
        </button>
        <CardHeader>
          <CardTitle>Register Visitor</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            ref={fileInputRef}
            onChange={onImageCapture}
          />

          <Button
            variant="outline"
            className="w-full mb-6 border-dashed border-2 py-8 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
          >
            {isScanning ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing ID Card...</>
            ) : (
              <><ScanLine className="mr-2 h-5 w-5" /> Auto-Fill using ID Card</>
            )}
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-zinc-500">Or enter manually</span></div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label className="mb-1 block font-semibold text-zinc-700">Full Name <span className="text-red-500">*</span></Label>
              <Input required value={newVisitor.name} onChange={(e) => onNewVisitorChange({ ...newVisitor, name: e.target.value })} placeholder="e.g. John Doe" className="h-10 bg-zinc-50" />
            </div>

            {askPhone && (
              <div>
                <Label className="mb-1 block font-semibold text-zinc-700">Phone Number <span className="text-red-500">*</span></Label>
                <PhoneInput
                  country="ke"
                  value={newVisitor.phone}
                  onChange={phone => onNewVisitorChange({ ...newVisitor, phone })}
                  inputClass="!w-full !h-10 !text-zinc-900 !bg-zinc-50 !rounded-md !border !border-zinc-300 focus:!ring-2 focus:!ring-blue-600 px-3"
                  containerClass="w-full"
                  buttonClass="!border-zinc-300 !bg-zinc-50 !rounded-l-md hover:!bg-zinc-100"
                />
              </div>
            )}

            {askId && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1 block font-semibold text-zinc-700">Document Type</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={newVisitor.doc_type}
                    onChange={(e) => onNewVisitorChange({ ...newVisitor, doc_type: e.target.value })}
                  >
                    <option value="National ID">National ID</option>
                    <option value="Passport">Passport</option>
                    <option value="Driver's License">Driver&apos;s License</option>
                  </select>
                </div>
                <div>
                  <Label className="mb-1 block font-semibold text-zinc-700">ID / Document No. <span className="text-red-500">*</span></Label>
                  <Input
                    required
                    value={newVisitor.id_number}
                    onChange={(e) => onNewVisitorChange({ ...newVisitor, id_number: e.target.value })}
                    placeholder="Enter ID number"
                    className="h-10 bg-zinc-50"
                  />
                </div>
              </div>
            )}

            {askHost && (
              <div className="relative" ref={dropdownRef}>
                <Label className="mb-1 block font-semibold text-zinc-700">Who are you visiting?</Label>
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
                  className="h-10 bg-zinc-50"
                  autoComplete="off"
                />

                <input type="text" className="hidden" required value={newVisitor.host_id} onChange={() => {}} />

                {isHostDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredDepartments.length === 0 ? (
                      <div className="p-3 text-sm text-zinc-500 text-center">No matching hosts found.</div>
                    ) : (
                      filteredDepartments.map((dept) => (
                        <div key={dept.id}>
                          <div className="px-3 py-1.5 text-xs font-bold bg-zinc-100 text-zinc-500 uppercase tracking-wider sticky top-0">
                            {dept.name}
                          </div>
                          {dept.hosts.map((host) => (
                            <div
                              key={host.id}
                              className="px-3 py-2 text-sm text-zinc-900 hover:bg-blue-50 cursor-pointer border-b border-zinc-50 last:border-0"
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
              <div>
                <Label className="mb-1 block font-semibold text-zinc-700">Purpose of Visit</Label>
                <Input
                  value={newVisitor.purpose}
                  onChange={(e) => onNewVisitorChange({ ...newVisitor, purpose: e.target.value })}
                  placeholder="e.g. Meeting, Delivery, Interview"
                  className="h-10 bg-zinc-50"
                />
              </div>
            )}

            {askVehicle && (
              <div>
                <Label className="mb-1 block font-semibold text-zinc-700">Vehicle Registration</Label>
                <Input
                  value={newVisitor.vehicle_reg}
                  onChange={(e) => onNewVisitorChange({ ...newVisitor, vehicle_reg: e.target.value })}
                  placeholder="e.g. KCA 123A (Leave blank if walk-in)"
                  className="h-10 bg-zinc-50 uppercase"
                />
              </div>
            )}

            {customFields.map((field) => (
              <div key={field.id}>
                <Label className="mb-1 block font-semibold text-zinc-700">{field.label}</Label>
                <Input
                  value={customAnswers[field.id] || ""}
                  onChange={(e) => onCustomAnswersChange({ ...customAnswers, [field.id]: e.target.value })}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  className="h-10 bg-zinc-50"
                />
              </div>
            ))}

            {requirePhoto && (
              <div className="space-y-3 pt-2 pb-2">
                <Label className="flex justify-between items-center font-semibold text-zinc-700">
                  Security Photo
                  <span className="text-xs text-red-500 font-bold uppercase tracking-wider">* Required</span>
                </Label>

                <div className="flex items-center gap-4 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                  <div className="w-16 h-16 rounded-full bg-white border-2 border-dashed border-zinc-300 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
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
                      <UserCircle className="w-8 h-8 text-zinc-300" />
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
                      className="w-full text-xs h-10 bg-white hover:bg-zinc-100 shadow-sm border-zinc-300 text-zinc-700 font-bold"
                      onClick={() => selfieInputRef.current?.click()}
                    >
                      <Camera className="w-4 h-4 mr-2" /> Take Photo
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 pt-4 border-t border-zinc-200">
              <div className="text-xs text-zinc-500 h-24 overflow-y-auto p-3 bg-zinc-50 border border-zinc-200 rounded-md leading-relaxed shadow-inner">
                <p className="font-bold mb-1 text-zinc-700">Terms and Conditions of Entry</p>
                <p>By registering, the visitor agrees to comply with all building security policies and procedures. The visitor consents to the collection, processing, and temporary storage of their personal data (including identification details and facial capture, if applicable) strictly for building security and safety audit purposes. Management reserves the right to deny entry, conduct searches, or escort individuals off the premises for non-compliance. Data is handled in accordance with local data protection laws.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => onAgreedToTermsChange(e.target.checked)}
                  className="mt-0.5 shrink-0 h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                />
                <Label htmlFor="terms" className="text-sm text-zinc-700 leading-snug cursor-pointer font-medium">
                  The visitor has agreed to the Terms and Conditions and consents to data processing. <span className="text-red-500">*</span>
                </Label>
              </div>
            </div>

            <Button type="submit" className="w-full mt-6 h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 shadow-sm transition-transform active:scale-[0.98]" disabled={isSubmitting || !agreedToTerms}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking Security...</> : "Register Visitor"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
