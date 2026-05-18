"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { IdCard, Loader2, Camera, CheckCircle2, AlertCircle, Users, Briefcase, Car, Plus, Trash2, ListPlus, Lock, ClipboardList, MapPin, Crosshair } from "lucide-react";
import { useBuildingRules } from "@/hooks/useBuildingRules";
import { PageContainer } from "@/components/dashboard/shared/AppShell";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { EmptyState } from "@/components/dashboard/shared/StateBlocks";
import { ToggleCard } from "@/components/dashboard/shared/ToggleCard";
import { Label } from "@/components/ui/label";

export default function BuildingRulesPage() {
  const rules = useBuildingRules();

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
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm font-medium text-blue-900">
                    For best accuracy, set this location using a mobile phone while standing at the actual entrance/gate. Laptop browser location may be inaccurate.
                  </div>
                  
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

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
                    <p className="font-bold text-slate-900">Saved allowed location</p>
                    <div className="mt-2 grid gap-1 text-xs font-medium sm:grid-cols-2">
                      <p>Latitude: <span className="font-bold text-slate-800">{rules.latitude || "Not set"}</span></p>
                      <p>Longitude: <span className="font-bold text-slate-800">{rules.longitude || "Not set"}</span></p>
                      <p>Allowed radius: <span className="font-bold text-slate-800">{rules.radius || "200"} meters</span></p>
                      <p>Device accuracy: <span className="font-bold text-slate-800">{rules.locationAccuracy !== null ? `~${Math.round(rules.locationAccuracy)} meters` : "Not captured this session"}</span></p>
                    </div>
                  </div>

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
