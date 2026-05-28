"use client";

import Image from "next/image";
import type { ElementType, FormEvent, RefObject } from "react";
import {
  Building2,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  UserCircle,
} from "lucide-react";
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

type Host = {
  id: string;
  name: string;
  department_id: string;
};

type DepartmentWithHosts = {
  id: string;
  name: string;
  hosts: Host[];
};

type VisitorFormData = {
  name: string;
  phone: string;
  id_number: string;
  doc_type: string;
  host_id: string;
  purpose: string;
  vehicle_reg: string;
};

type ValidationErrors = Partial<Record<"name" | "phone" | "id_number" | "host_id" | "purpose" | "vehicle_reg" | "selfie" | "terms", string>>;

type Rules = {
  requirePhoto: boolean;
  askPhone: boolean;
  askId: boolean;
  askHost: boolean;
  askPurpose: boolean;
  askVehicle: boolean;
  requirePhone: boolean;
  requireId: boolean;
  requireHost: boolean;
  requirePurpose: boolean;
  requireVehicle: boolean;
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
  validationErrors: ValidationErrors;
  selfieInputRef: RefObject<HTMLInputElement | null>;
  dropdownRef: RefObject<HTMLDivElement | null>;
  onSubmit: (event: FormEvent) => void;
  onNewVisitorChange: (visitor: VisitorFormData) => void;
  onHostSearchQueryChange: (value: string) => void;
  onHostDropdownOpenChange: (value: boolean) => void;
  onCustomAnswersChange: (answers: Record<string, string>) => void;
  onSelfieFileChange: (file: File) => void;
  onSelfiePreviewChange: (preview: string) => void;
  onAgreedToTermsChange: (value: boolean) => void;
};

function RequiredMark() {
  return <span className="text-red-500">*</span>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="mt-1.5 text-sm font-medium text-red-600">{message}</p>;
}

function SectionHeader({
  step,
  title,
  icon: Icon,
}: {
  step: number;
  title: string;
  icon: ElementType;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
        {step}
      </span>

      <div className="flex min-w-0 items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
        <h2 className="break-words text-base font-bold text-slate-900">
          {title}
        </h2>
      </div>
    </div>
  );
}

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
  validationErrors,
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
  const hasVisitDetails =
    rules.askHost ||
    rules.askPurpose ||
    rules.askVehicle ||
    customFields.length > 0;

  let sectionCounter = 1;
  const visitorDetailsStep = sectionCounter++;
  const visitDetailsStep = hasVisitDetails ? sectionCounter++ : null;
  const verificationStep = rules.requirePhoto ? sectionCounter++ : null;
  const agreementStep = sectionCounter++;

  return (
    <div className="relative z-10 mx-auto w-full max-w-xl space-y-4">
      <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
        {/* Top brand */}
        <div className="border-b border-slate-100 bg-white px-5 py-3">
          <div className="flex items-center justify-center gap-2 text-center">
            <Image
              src="/icon_only2.png"
              alt="Luffi Tech logo"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
              priority
            />

            <p className="text-xs font-semibold">
              <span className="text-slate-500">Powered by </span>
              <span className="text-black">Luffi</span>{" "}
              <span className="text-purple-600">Tech</span>
            </p>
          </div>
        </div>

        {/* Header */}
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 p-2">
            <Image
              src="/icon.svg"
              alt="Karibu VMS logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              priority
            />
          </div>

          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-700">
            Visitor self check-in
          </p>

          <h1 className="break-words text-2xl font-bold tracking-tight text-slate-900">
            {companyName}
          </h1>

          <div className="mt-2 flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-500">
            <MapPin className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
            <span className="break-words">
              {gateName ? gateName : "Visitor Registration"}
            </span>
          </div>
        </div>

        <CardContent className="p-5 sm:p-6">
          <form onSubmit={onSubmit} className="space-y-6" noValidate>
            {/* Section 1 */}
            <section className="space-y-4" aria-labelledby="visitor-details-heading">
              <SectionHeader
                step={visitorDetailsStep}
                title="Visitor details"
                icon={UserCircle}
              />

              <div className="grid gap-4">
                <div>
                  <Label
                    htmlFor="visitor-name"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    Full Name <RequiredMark />
                  </Label>

                  <Input
                    id="visitor-name"
                    required
                    value={newVisitor.name}
                    onChange={(e) =>
                      onNewVisitorChange({ ...newVisitor, name: e.target.value })
                    }
                    placeholder="e.g. John Doe"
                    className="h-11 rounded-xl border-slate-200 bg-slate-50 text-base focus:bg-white focus:ring-blue-500/20"
                    autoComplete="name"
                  />
                  <FieldError message={validationErrors.name} />
                </div>

                {rules.askPhone && (
                  <div>
                    <Label
                      htmlFor="visitor-phone"
                      className="mb-1.5 block text-sm font-semibold text-slate-700"
                    >
                      Phone Number {rules.requirePhone && <RequiredMark />}
                    </Label>

                    <PhoneInput
                      inputProps={{
                        id: "visitor-phone",
                        autoComplete: "tel",
                        required: rules.requirePhone,
                      }}
                      country="ke"
                      value={newVisitor.phone}
                      onChange={(phone) =>
                        onNewVisitorChange({ ...newVisitor, phone })
                      }
                      inputClass="!w-full !h-11 !text-slate-900 !bg-slate-50 focus:!bg-white !rounded-xl !border !border-slate-200 focus:!ring-2 focus:!ring-blue-500/20 px-3 !text-base"
                      containerClass="w-full"
                      buttonClass="!border-slate-200 !bg-slate-100 !rounded-l-xl hover:!bg-slate-200"
                    />
                    <FieldError message={validationErrors.phone} />
                  </div>
                )}

                {rules.askId && (
                  <>
                    <div>
                      <Label
                        htmlFor="visitor-doc-type"
                        className="mb-1.5 block text-sm font-semibold text-slate-700"
                      >
                        Document Type
                      </Label>

                      <select
                        id="visitor-doc-type"
                        className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-base text-slate-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={newVisitor.doc_type}
                        onChange={(e) =>
                          onNewVisitorChange({
                            ...newVisitor,
                            doc_type: e.target.value,
                          })
                        }
                      >
                        <option value="National ID">National ID</option>
                        <option value="Passport">Passport</option>
                        <option value="Driver's License">
                          Driver&apos;s License
                        </option>
                      </select>
                    </div>

                    <div>
                      <Label
                        htmlFor="visitor-id-number"
                        className="mb-1.5 block text-sm font-semibold text-slate-700"
                      >
                        ID Number {rules.requireId && <RequiredMark />}
                      </Label>

                      <Input
                        id="visitor-id-number"
                        required={rules.requireId}
                        value={newVisitor.id_number}
                        onChange={(e) =>
                          onNewVisitorChange({
                            ...newVisitor,
                            id_number: e.target.value,
                          })
                        }
                        placeholder="Enter ID Number"
                        className="h-11 rounded-xl border-slate-200 bg-slate-50 text-base focus:bg-white focus:ring-blue-500/20"
                        autoComplete="off"
                      />
                      <FieldError message={validationErrors.id_number} />
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Section 2 */}
            {hasVisitDetails && (
              <section className="space-y-4" aria-labelledby="visit-details-heading">
                <SectionHeader
                  step={visitDetailsStep || 2}
                  title="Visit details"
                  icon={ClipboardCheck}
                />

                <div className="grid gap-4">
                  {rules.askHost && (
                    <div className="relative" ref={dropdownRef}>
                      <Label
                        htmlFor="visitor-host-search"
                        className="mb-1.5 block text-sm font-semibold text-slate-700"
                      >
                      Who are you visiting? {rules.requireHost && <RequiredMark />}
                      </Label>

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
                          className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-11 text-base focus:bg-white focus:ring-blue-500/20"
                          autoComplete="off"
                        />
                      </div>

                      <input
                        type="text"
                        className="hidden"
                        required={rules.requireHost}
                        value={newVisitor.host_id}
                        onChange={() => {}}
                      />
                      <FieldError message={validationErrors.host_id} />

                      {isHostDropdownOpen && (
                        <div className="absolute z-10 mt-2 max-h-60 w-full overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                          {filteredDepartments.length === 0 ? (
                            <div className="p-4 text-center text-sm font-medium text-slate-500">
                              No matching hosts found.
                            </div>
                          ) : (
                            filteredDepartments.map((dept) => (
                              <div key={dept.id}>
                                <div className="sticky top-0 flex items-center gap-2 border-y border-slate-100 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 backdrop-blur-md first:border-t-0">
                                  <Building2 className="h-3.5 w-3.5" />
                                  {dept.name}
                                </div>

                                {dept.hosts.map((host) => (
                                  <button
                                    type="button"
                                    key={host.id}
                                    className="block w-full cursor-pointer px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-blue-50"
                                    onClick={() => {
                                      onNewVisitorChange({
                                        ...newVisitor,
                                        host_id: host.id,
                                      });
                                      onHostSearchQueryChange(host.name);
                                      onHostDropdownOpenChange(false);
                                    }}
                                  >
                                    <div className="font-semibold text-slate-900">
                                      {host.name}
                                    </div>
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
                      <Label
                        htmlFor="visitor-purpose"
                        className="mb-1.5 block text-sm font-semibold text-slate-700"
                      >
                        Purpose of Visit {rules.requirePurpose && <RequiredMark />}
                      </Label>

                      <Input
                        id="visitor-purpose"
                        required={rules.requirePurpose}
                        value={newVisitor.purpose}
                        onChange={(e) =>
                          onNewVisitorChange({
                            ...newVisitor,
                            purpose: e.target.value,
                          })
                        }
                        placeholder="e.g. Meeting, Delivery, Interview"
                        className="h-11 rounded-xl border-slate-200 bg-slate-50 text-base focus:bg-white focus:ring-blue-500/20"
                      />
                      <FieldError message={validationErrors.purpose} />
                    </div>
                  )}

                  {rules.askVehicle && (
                    <div>
                      <Label
                        htmlFor="visitor-vehicle"
                        className="mb-1.5 block text-sm font-semibold text-slate-700"
                      >
                        Vehicle Registration {rules.requireVehicle && <RequiredMark />}
                      </Label>

                      <Input
                        id="visitor-vehicle"
                        required={rules.requireVehicle}
                        value={newVisitor.vehicle_reg}
                        onChange={(e) =>
                          onNewVisitorChange({
                            ...newVisitor,
                            vehicle_reg: e.target.value,
                          })
                        }
                        placeholder="e.g. KCA 123A"
                        className="h-11 rounded-xl border-slate-200 bg-slate-50 text-base uppercase focus:bg-white focus:ring-blue-500/20"
                      />
                      <FieldError message={validationErrors.vehicle_reg} />
                    </div>
                  )}

                  {customFields.map((field) => (
                    <div key={field.id}>
                      <Label
                        htmlFor={`custom-field-${field.id}`}
                        className="mb-1.5 block text-sm font-semibold text-slate-700"
                      >
                        {field.label}
                      </Label>

                      <Input
                        id={`custom-field-${field.id}`}
                        value={customAnswers[field.id] || ""}
                        onChange={(e) =>
                          onCustomAnswersChange({
                            ...customAnswers,
                            [field.id]: e.target.value,
                          })
                        }
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="h-11 rounded-xl border-slate-200 bg-slate-50 text-base focus:bg-white focus:ring-blue-500/20"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Section 3 */}
            {rules.requirePhoto && (
              <section className="space-y-4" aria-labelledby="verification-heading">
                <SectionHeader
                  step={verificationStep || 3}
                  title="Verification"
                  icon={Camera}
                />

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3">
                    <Label className="flex items-center justify-between text-sm font-semibold text-slate-700">
                      Security Photo
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-500">
                        Required
                      </span>
                    </Label>

                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Provide a clear face photo for security review.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
                      {selfiePreview ? (
                        <Image
                          src={selfiePreview}
                          alt="Selfie preview"
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <UserCircle className="h-9 w-9 text-slate-300" />
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
                        className="h-11 w-full rounded-xl border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 hover:bg-slate-100"
                        onClick={() => selfieInputRef.current?.click()}
                      >
                        <Camera className="mr-2 h-5 w-5 text-slate-500" />
                        {selfiePreview ? "Retake Photo" : "Take Photo"}
                      </Button>
                    </div>
                  </div>
                  <FieldError message={validationErrors.selfie} />
                </div>
              </section>
            )}

            {/* Section 4 */}
            <section className="space-y-4" aria-labelledby="entry-agreement-heading">
              <SectionHeader
                step={agreementStep}
                title="Entry agreement"
                icon={ShieldCheck}
              />

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p className="mb-3 font-bold text-slate-800">
                  Please review this notice before submitting your visit request.
                </p>

                <div className="max-h-48 space-y-4 overflow-y-auto rounded-lg border border-slate-200 bg-white p-4 pr-3">
                  <div>
                    <strong className="mb-1 block text-slate-800">
                      Information collected
                    </strong>
                    <p className="leading-relaxed">
                      We may collect your name, phone number, identification details,
                      visit purpose, host details, vehicle registration, photo, and
                      any extra information required by this building.
                    </p>
                  </div>

                  <div>
                    <strong className="mb-1 block text-slate-800">
                      Why this information is needed
                    </strong>
                    <p className="leading-relaxed">
                      Your details are used to verify your visit, support building
                      access control, help the security team manage visitor records,
                      and contact the relevant host where required.
                    </p>
                  </div>

                  <div>
                    <strong className="mb-1 block text-slate-800">
                      Who can access it
                    </strong>
                    <p className="leading-relaxed">
                      Visitor information is available only to authorized security
                      personnel, building administrators, and approved staff who need
                      it for visitor management.
                    </p>
                  </div>

                  <div>
                    <strong className="mb-1 block text-slate-800">
                      Data protection
                    </strong>
                    <p className="leading-relaxed">
                      The information should be handled securely and used only for
                      legitimate visitor management, safety, and access control
                      purposes in line with applicable data protection requirements.
                    </p>
                  </div>

                  <div>
                    <strong className="mb-1 block text-slate-800">
                      Your confirmation
                    </strong>
                    <p className="leading-relaxed">
                      By ticking the checkbox, you confirm that the information you
                      have provided is accurate and that you consent to its use for
                      this visit.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => onAgreedToTermsChange(e.target.checked)}
                  className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />

                <Label
                  htmlFor="terms"
                  className="cursor-pointer select-none text-sm font-medium leading-relaxed text-slate-800"
                >
                  I confirm that the information provided is accurate and I consent
                  to the collection and use of my details for visitor management and
                  security purposes. <RequiredMark />
                </Label>
              </div>
              <FieldError message={validationErrors.terms} />
            </section>

            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-blue-600 text-base font-bold text-white shadow-sm hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Submit Registration
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
