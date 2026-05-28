"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { IdCard, Loader2, Camera, CheckCircle2, AlertCircle, Users, Briefcase, Car, Plus, Trash2, ListPlus, Lock, ClipboardList, MapPin, Crosshair, QrCode, MessageSquareText, Phone } from "lucide-react";
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
  {
    value: "sms_otp",
    title: "SMS OTP Verification",
    description: "Security sends and confirms the visitor entry code by SMS.",
    icon: MessageSquareText,
  },
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
                <CardDescription>Create site-specific visitor questions such as equipment serials or safety checks.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    value={rules.newFieldName}
                    onChange={(e) => rules.setNewFieldName(e.target.value)}
                    placeholder="Enter new field name..." 
                    className="flex-1 bg-slate-50 border-slate-200 h-11 rounded-xl"
                    onKeyDown={(e) => e.key === 'Enter' && rules.handleAddCustomField()}
                  />
                  <Button onClick={rules.handleAddCustomField} disabled={!rules.newFieldName.trim() || rules.updatingRules} className="h-11 shrink-0 bg-blue-600 text-white hover:bg-blue-700 font-bold rounded-xl px-4">
                    <Plus className="h-4 w-4 mr-1.5" /> Add
                  </Button>
                </div>

                <div className="space-y-3 mt-4 max-h-[300px] overflow-y-auto pr-1">
                  {rules.customFields.length === 0 ? (
                    <EmptyState title="No custom fields yet" description="Add a question above to show it on visitor registration forms." />
                  ) : (
                    rules.customFields.map((field) => (
                      <div key={field.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3.5 shadow-sm transition-colors hover:bg-slate-100">
                        <span className="font-bold text-sm text-slate-800">{field.label}</span>
                        
                        <div className="flex items-center gap-3">
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input 
                              type="checkbox" className="sr-only peer" 
                              checked={field.active} 
                              onChange={(e) => rules.handleToggleCustomField(field.id, e.target.checked)} 
                              disabled={rules.updatingRules}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                            aria-label={`Delete ${field.label}`}
                            onClick={() => rules.handleDeleteCustomField(field.id)}
                            disabled={rules.updatingRules}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="h-fit overflow-hidden rounded-[1.4rem] border-slate-100 shadow-sm bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <span className="rounded-2xl bg-teal-50 p-2 text-teal-600">
                    <MapPin className="h-5 w-5" />
                  </span>
                  Location verification
                </CardTitle>
                <CardDescription>Limit public check-in to visitors who are near your building.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className={`flex items-center justify-between p-4 rounded-xl border border-slate-200 ${rules.planTier === "basic" ? "bg-slate-100 opacity-80" : "bg-slate-50"}`}>
                  <div>
                    <p className="font-bold text-slate-900 flex items-center gap-2">
                      Enable location verification
                      {rules.planTier === "basic" && <Lock className="w-4 h-4 text-amber-600" />}
                    </p>
                    <p className="text-sm text-slate-700 mt-0.5">Visitors must be physically present.</p>
                    {rules.planTier === "basic" && (
                      <p className="text-[11px] font-bold text-amber-900 mt-1 uppercase tracking-wider">Premium feature</p>
                    )}
                  </div>
                  <Switch 
                    aria-label="Enable location verification"
                    checked={rules.planTier === "basic" ? false : rules.enableGeofence} 
                    onCheckedChange={rules.setEnableGeofence} 
                    disabled={rules.planTier === "basic" || rules.updatingRules}
                  />
                </div>

                <div className={`space-y-5 ${!rules.enableGeofence ? 'pointer-events-none' : ''}`}>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-950">
                    For accurate geofencing, set this location using a mobile phone while standing at the actual entrance/gate. Laptop or desktop browser location may be inaccurate.
                  </div>
                  {rules.isLikelyDesktop && (
                    <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-800">
                      Desktop location may be unreliable. We recommend using a phone to save this location.
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="building-latitude" className="font-bold text-slate-700 text-xs uppercase tracking-wider">Building latitude</Label>
                      <Input 
                        id="building-latitude"
                        type="number" 
                        step="any" 
                        placeholder="-1.2921"
                        value={rules.latitude} 
                        onChange={(e) => rules.setLatitude(e.target.value)} 
                        className="bg-white border-slate-200 rounded-xl h-11 placeholder:text-slate-500"
                        disabled={rules.updatingRules}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="building-longitude" className="font-bold text-slate-700 text-xs uppercase tracking-wider">Building longitude</Label>
                      <Input 
                        id="building-longitude"
                        type="number" 
                        step="any" 
                        placeholder="36.8219"
                        value={rules.longitude} 
                        onChange={(e) => rules.setLongitude(e.target.value)} 
                        className="bg-white border-slate-200 rounded-xl h-11 placeholder:text-slate-500"
                        disabled={rules.updatingRules}
                      />
                    </div>
                  </div>

                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={rules.handleFetchLocation} 
                    disabled={rules.updatingRules}
                    className="w-full h-11 rounded-xl border-blue-200 text-blue-700 font-bold hover:bg-blue-50 disabled:opacity-100"
                  >
                    <Crosshair className="w-4 h-4 mr-2" /> Use my current location
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={rules.handleTestDistance}
                    disabled={rules.updatingRules || rules.testingDistance}
                    className="w-full h-11 rounded-xl border-slate-200 text-slate-800 font-bold hover:bg-slate-50 disabled:opacity-100"
                  >
                    {rules.testingDistance ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Crosshair className="w-4 h-4 mr-2" />}
                    Test my current distance
                  </Button>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
                    <p className="font-bold text-slate-900">Saved allowed location</p>
                    <div className="mt-2 grid gap-1 text-xs font-medium sm:grid-cols-2">
                      <p>Latitude: <span className="font-bold text-slate-800">{rules.latitude || "Not set"}</span></p>
                      <p>Longitude: <span className="font-bold text-slate-800">{rules.longitude || "Not set"}</span></p>
                      <p>Allowed radius: <span className="font-bold text-slate-800">{rules.radius || "200"} meters</span></p>
                      <p>Device accuracy: <span className="font-bold text-slate-800">{rules.locationAccuracy !== null ? `~${Math.round(rules.locationAccuracy)} meters` : "Not captured this session"}</span></p>
                    </div>
                  </div>

                  {rules.distanceTest && (
                    <div className={`rounded-xl border p-3 text-sm ${isCurrentDeviceOutsideSavedLocation ? "border-red-100 bg-red-50 text-red-800" : "border-emerald-100 bg-emerald-50 text-emerald-800"}`}>
                      <p className="font-bold text-slate-900">Current distance test</p>
                      <div className="mt-2 grid gap-1 text-xs font-medium sm:grid-cols-2">
                        <p>Current latitude: <span className="font-bold">{rules.distanceTest.currentLat}</span></p>
                        <p>Current longitude: <span className="font-bold">{rules.distanceTest.currentLng}</span></p>
                        <p>Saved latitude: <span className="font-bold">{rules.distanceTest.savedLat}</span></p>
                        <p>Saved longitude: <span className="font-bold">{rules.distanceTest.savedLng}</span></p>
                        <p>Estimated distance: <span className="font-bold">{formatDistance(rules.distanceTest.distanceMeters)}</span></p>
                        <p>Accuracy: <span className="font-bold">~{Math.round(rules.distanceTest.accuracyMeters)} meters</span></p>
                      </div>
                      {isCurrentDeviceOutsideSavedLocation && (
                        <p className="mt-3 text-sm font-bold">
                          This device is currently outside the saved allowed location. If you are physically at the gate, save the location again using a mobile phone.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-1.5 pt-2">
                    <Label htmlFor="allowed-radius" className="font-bold text-slate-700 text-xs uppercase tracking-wider">Allowed radius (Meters)</Label>
                    <Input 
                      id="allowed-radius"
                      type="number" 
                      min="10" 
                      max="5000"
                      value={rules.radius} 
                      onChange={(e) => rules.setRadius(e.target.value)} 
                      className="max-w-[200px] bg-white border-slate-200 rounded-xl h-11"
                      disabled={rules.updatingRules}
                    />
                    <p className="text-xs text-slate-500 font-medium">Recommended: 100 to 500 meters.</p>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="mb-3 text-xs font-bold text-slate-500">
                    Recommended setup: open this admin page on your phone, stand at the gate, then tap Use my current location.
                  </p>
                  <Button 
                    onClick={rules.handleSaveGeofence} 
                    disabled={rules.updatingRules} 
                    className="w-full h-11 px-8 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
                  >
                    Save Visitor Rules
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
    </PageContainer>
  );
}
