"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { IdCard, Loader2, Camera, CheckCircle2, AlertCircle, Users, Briefcase, Car, Plus, Trash2, ListPlus, Lock, ClipboardList, MapPin, Crosshair, QrCode, Phone } from "lucide-react";
import { useBuildingRules } from "@/hooks/useBuildingRules";
import { PageContainer } from "@/components/dashboard/shared/AppShell";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { EmptyState } from "@/components/dashboard/shared/StateBlocks";
import { ToggleCard } from "@/components/dashboard/shared/ToggleCard";

function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

type VerificationOption = {
  value: "qr_pass" | "sms_otp";
  title: string;
  description: string;
  icon: typeof QrCode;
};

const verificationOptions: VerificationOption[] = [
  {
    value: "qr_pass",
    title: "QR Pass Verification",
    description: "Visitors receive a locked digital pass that security approves from the guard dashboard.",
    icon: QrCode,
  },
  // {
  //   value: "sms_otp",
  //   title: "SMS OTP Verification",
  //   description: "Security sends and confirms the visitor entry code by SMS.",
  //   icon: MessageSquareText,
  // },
];

export default function BuildingRulesPage() {
  const rules = useBuildingRules();
  const parsedRadius = rules.radius ? parseInt(rules.radius, 10) : 200;
  const allowedRadius = Number.isNaN(parsedRadius) ? 200 : parsedRadius;
  const isCurrentDeviceOutsideSavedLocation =
    Boolean(rules.distanceTest) && rules.distanceTest!.distanceMeters > allowedRadius;

  return (
    <PageContainer className="max-w-6xl">
        <PageHeader
          title="Visitor rules"
          eyebrow="Visitor intake policy"
          description="Choose what information guests must provide before entry."
          icon={ClipboardList}
        >
          {rules.updatingRules && (
            <div className="flex items-center text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-xl animate-pulse border border-blue-100">
              <Loader2 className="w-4 h-4 mr-2 animate-spin"/> Saving changes...
            </div>
          )}
        </PageHeader>

        {rules.message && !rules.updatingRules && (
          <div className={`p-4 rounded-xl text-sm font-medium border flex items-start gap-3 animate-in fade-in shadow-sm ${
            rules.message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-red-50 text-red-800 border-red-100'
          }`}>
            {rules.message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />}
            <div>
              <p className="font-bold">{rules.message.type === 'success' ? 'Success' : 'Action Failed'}</p>
              <p className="mt-0.5">{rules.message.text}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          
          <div className="space-y-6">
            <Card className="h-fit overflow-hidden rounded-[1.4rem] border-slate-100 shadow-sm bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <span className="rounded-2xl bg-blue-50 p-2 text-blue-600">
                    <IdCard className="h-5 w-5" />
                  </span>
                  Required visitor details
                </CardTitle>
                <CardDescription>Core information requested during check-in.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <ToggleCard
                  id="phone-toggle"
                  title="Phone number"
                  description="Ask visitors for a phone number."
                  icon={Phone}
                  checked={rules.askPhone}
                  disabled={rules.updatingRules}
                  onCheckedChange={(checked) => rules.handleToggleRule("ask_phone", checked, rules.setAskPhone)}
                />
                <ToggleCard
                  id="id-toggle"
                  title="ID / passport number"
                  description="Ask visitors for an ID, passport, or document number."
                  icon={IdCard}
                  checked={rules.askId}
                  disabled={rules.updatingRules}
                  onCheckedChange={(checked) => rules.handleToggleRule("ask_id", checked, rules.setAskId)}
                />
                <ToggleCard
                  id="purpose-toggle"
                  title="Purpose of visit"
                  description="Capture a short reason for entry so admins can audit visitor intent."
                  icon={Briefcase}
                  checked={rules.askPurpose}
                  disabled={rules.updatingRules}
                  onCheckedChange={(checked) => rules.handleToggleRule("ask_purpose", checked, rules.setAskPurpose)}
                  tone="success"
                />
                <ToggleCard
                  id="vehicle-toggle"
                  title="Vehicle registration"
                  description="Record license plates for drive-in guests and delivery vehicles."
                  icon={Car}
                  checked={rules.askVehicle}
                  disabled={rules.updatingRules}
                  onCheckedChange={(checked) => rules.handleToggleRule("ask_vehicle", checked, rules.setAskVehicle)}
                  tone="warning"
                />
              </CardContent>
            </Card>

            <Card className="h-fit overflow-hidden rounded-[1.4rem] border-slate-100 shadow-sm bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <span className="rounded-2xl bg-indigo-50 p-2 text-indigo-600">
                    <Users className="h-5 w-5" />
                  </span>
                  Approval flow
                </CardTitle>
                <CardDescription>Determine who authorizes entry.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <ToggleCard
                  id="host-toggle"
                  title="Host selection"
                  description="Ask visitors to choose who they are here to see, grouped by department."
                  icon={Users}
                  checked={rules.askHost}
                  disabled={rules.updatingRules}
                  onCheckedChange={(checked) => rules.handleToggleRule("ask_host", checked, rules.setAskHost)}
                />
              </CardContent>
            </Card>

            <Card className="h-fit overflow-hidden rounded-[1.4rem] border-slate-100 shadow-sm bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <span className="rounded-2xl bg-purple-50 p-2 text-purple-600">
                    <Camera className="h-5 w-5" />
                  </span>
                  Photo and identity
                </CardTitle>
                <CardDescription>Visual verification requirements.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <ToggleCard
                  id="photo-toggle"
                  title="Security photo"
                  description={rules.planTier === "basic" ? "Selfie verification is locked on the Basic plan." : "Require a photo capture before the visitor joins the approval queue."}
                  icon={Camera}
                  checked={rules.planTier === "basic" ? false : rules.requirePhoto}
                  disabled={rules.updatingRules || rules.planTier === "basic"}
                  badge={rules.planTier === "basic" ? <Badge variant="pending" className="gap-1 bg-amber-50 text-amber-600 border-amber-200"><Lock className="h-3 w-3" /> Premium</Badge> : null}
                  onCheckedChange={(checked) => rules.handleToggleRule("require_photo", checked, rules.setRequirePhoto)}
                />
              </CardContent>
            </Card>

            <Card className="h-fit overflow-hidden rounded-[1.4rem] border-slate-100 shadow-sm bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <span className="rounded-2xl bg-blue-50 p-2 text-blue-600">
                    <QrCode className="h-5 w-5" />
                  </span>
                  Verification method
                </CardTitle>
                <CardDescription>Choose one active verification path for Premium visitor check-in.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {rules.verificationPlanState === "unknown" ? (
                  <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-800">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Unable to confirm your plan. Please refresh or contact support.
                    </div>
                  </div>
                ) : !rules.canChooseVerification ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Verification method selection is available on Premium.
                    </div>
                  </div>
                ) : null}

                {rules.qrPassSetupWarning && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {rules.qrPassSetupWarning}
                    </div>
                  </div>
                )}

                {verificationOptions.map((option) => {
                  const Icon = option.icon;
                  const selected = rules.visitorVerificationMethod === option.value;
                  const optionDisabled = !rules.canChooseVerification || rules.updatingRules || (option.value === "qr_pass" && !rules.isQrPassFrontendEnabled);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={optionDisabled}
                      onClick={() => rules.handleVerificationMethodChange(option.value)}
                      className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left shadow-sm transition ${
                        selected
                          ? "border-blue-300 bg-blue-50 ring-2 ring-blue-100"
                          : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                      } ${optionDisabled ? "cursor-not-allowed opacity-70" : ""}`}
                      aria-pressed={selected}
                    >
                      <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
                        selected ? "border-blue-200 bg-white text-blue-700" : "border-slate-200 bg-slate-50 text-slate-500"
                      }`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="text-base font-black text-slate-900">{option.title}</span>
                          <span className={`h-4 w-4 rounded-full border ${
                            selected ? "border-blue-600 bg-blue-600 shadow-[inset_0_0_0_4px_white]" : "border-slate-300 bg-white"
                          }`} />
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-slate-500">{option.description}</span>
                      </span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="h-fit overflow-hidden rounded-[1.4rem] border-slate-100 shadow-sm bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <span className="rounded-2xl bg-orange-50 p-2 text-orange-600">
                    <ListPlus className="h-5 w-5" />
                  </span>
                  Custom questions
                </CardTitle>
                <CardDescription>Add extra intake fields for your site.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Company name"
                    value={rules.newQuestion}
                    onChange={(e) => rules.setNewQuestion(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") rules.handleAddQuestion(); }}
                    disabled={rules.updatingRules}
                  />
                  <Button type="button" onClick={rules.handleAddQuestion} disabled={rules.updatingRules || !rules.newQuestion.trim()}>
                    <Plus className="w-4 h-4 mr-2"/> Add
                  </Button>
                </div>

                {rules.customQuestions.length === 0 ? (
                  <EmptyState title="No custom questions" description="Add questions such as company name, item serial number, or delivery reference." icon={ListPlus} />
                ) : (
                  <div className="space-y-2">
                    {rules.customQuestions.map((q, index) => (
                      <div key={`${q}-${index}`} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
                        <span className="text-sm font-medium text-slate-700">{q}</span>
                        <Button type="button" variant="ghost" size="icon" onClick={() => rules.handleRemoveQuestion(index)} disabled={rules.updatingRules}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="h-fit overflow-hidden rounded-[1.4rem] border-slate-100 shadow-sm bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <span className="rounded-2xl bg-emerald-50 p-2 text-emerald-600">
                    <MapPin className="h-5 w-5" />
                  </span>
                  Location guardrail
                </CardTitle>
                <CardDescription>Restrict guard check-in to your allowed premises radius.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input id="latitude" value={rules.latitude} onChange={(e) => rules.setLatitude(e.target.value)} placeholder="-1.286389" disabled={rules.updatingRules} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input id="longitude" value={rules.longitude} onChange={(e) => rules.setLongitude(e.target.value)} placeholder="36.817223" disabled={rules.updatingRules} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="radius">Allowed radius (meters)</Label>
                  <Input id="radius" value={rules.radius} onChange={(e) => rules.setRadius(e.target.value)} placeholder="200" disabled={rules.updatingRules} />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={rules.useCurrentLocation} disabled={rules.updatingRules || rules.locating}>
                    {rules.locating ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Crosshair className="w-4 h-4 mr-2"/>}
                    Use current location
                  </Button>
                  <Button type="button" onClick={rules.saveLocationRules} disabled={rules.updatingRules}>
                    Save location rules
                  </Button>
                </div>

                {rules.distanceTest && (
                  <div className={`rounded-2xl border p-4 text-sm ${isCurrentDeviceOutsideSavedLocation ? "border-red-100 bg-red-50 text-red-700" : "border-emerald-100 bg-emerald-50 text-emerald-700"}`}>
                    <p className="font-bold">Current distance: {formatDistance(rules.distanceTest.distanceMeters)}</p>
                    <p className="mt-1 text-xs font-medium opacity-80">Accuracy: ±{Math.round(rules.distanceTest.accuracyMeters)} m · Allowed radius: {allowedRadius} m</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
    </PageContainer>
  );
}
