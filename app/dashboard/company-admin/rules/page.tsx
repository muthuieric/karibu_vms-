"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Loader2, Camera, CheckCircle2, AlertCircle, Users, Briefcase, Car, Plus, Trash2, ListPlus, Lock } from "lucide-react";
import { useBuildingRules } from "@/hooks/useBuildingRules";

export default function BuildingRulesPage() {
  const rules = useBuildingRules();

  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
        
        {/* Header Section */}
        <div className="border-b border-zinc-200 pb-4 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">Building Rules & Forms</h1>
            <p className="text-zinc-500 mt-1 text-sm md:text-base">Customize the questions visitors are asked at the gate.</p>
          </div>
          {rules.updatingRules && (
            <div className="flex items-center text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full animate-pulse border border-blue-100">
              <Loader2 className="w-4 h-4 mr-2 animate-spin"/> Saving changes...
            </div>
          )}
        </div>

        {rules.message && !rules.updatingRules && (
          <div className={`p-4 rounded-xl text-sm font-medium border flex items-start gap-3 animate-in fade-in shadow-sm ${
            rules.message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            {rules.message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 text-green-600 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />}
            <div>
              <p className="font-bold">{rules.message.type === 'success' ? 'Success' : 'Action Failed'}</p>
              <p className="mt-0.5">{rules.message.text}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* STANDARD RULES */}
          <Card className="shadow-sm border-0 border-t-4 border-t-blue-600 bg-white h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center">
                <ShieldCheck className="mr-2 h-5 w-5 text-blue-600" /> Standard Questions
              </CardTitle>
              <CardDescription className="text-sm">Built-in fields you can quickly enable or disable.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              
              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-200 transition-colors shadow-sm hover:shadow-md">
                <div className="space-y-1 pr-4">
                  <Label className="text-base font-bold flex items-center gap-2 cursor-pointer text-zinc-900" htmlFor="host-toggle">
                    <Users className="w-4 h-4 text-zinc-500"/> Host Name
                  </Label>
                  <p className="text-sm text-zinc-500 leading-snug">Ask visitors who they are here to see.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input id="host-toggle" type="checkbox" className="sr-only peer" checked={rules.askHost} onChange={(e) => rules.handleToggleRule("ask_host", e.target.checked, rules.setAskHost)} disabled={rules.updatingRules} />
                  <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-200 transition-colors shadow-sm hover:shadow-md">
                <div className="space-y-1 pr-4">
                  <Label className="text-base font-bold flex items-center gap-2 cursor-pointer text-zinc-900" htmlFor="purpose-toggle">
                    <Briefcase className="w-4 h-4 text-zinc-500"/> Purpose of Visit
                  </Label>
                  <p className="text-sm text-zinc-500 leading-snug">Log the reason for the visitor&apos;s entry.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input id="purpose-toggle" type="checkbox" className="sr-only peer" checked={rules.askPurpose} onChange={(e) => rules.handleToggleRule("ask_purpose", e.target.checked, rules.setAskPurpose)} disabled={rules.updatingRules} />
                  <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-200 transition-colors shadow-sm hover:shadow-md">
                <div className="space-y-1 pr-4">
                  <Label className="text-base font-bold flex items-center gap-2 cursor-pointer text-zinc-900" htmlFor="vehicle-toggle">
                    <Car className="w-4 h-4 text-zinc-500"/> Vehicle Reg
                  </Label>
                  <p className="text-sm text-zinc-500 leading-snug">Log the license plate if driving.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input id="vehicle-toggle" type="checkbox" className="sr-only peer" checked={rules.askVehicle} onChange={(e) => rules.handleToggleRule("ask_vehicle", e.target.checked, rules.setAskVehicle)} disabled={rules.updatingRules} />
                  <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className={`flex items-center justify-between p-4 rounded-xl border transition-colors shadow-sm hover:shadow-md ${rules.planTier === "basic" ? "bg-zinc-100 border-zinc-200 opacity-80" : "bg-zinc-50 border-zinc-200"}`}>
                <div className="space-y-1 pr-4">
                  <Label className="text-base font-bold flex items-center gap-2 cursor-pointer text-zinc-900" htmlFor="photo-toggle">
                    <Camera className="w-4 h-4 text-zinc-500"/> Require Photo
                    {rules.planTier === "basic" && <Lock className="w-4 h-4 text-amber-600 ml-1" />}
                  </Label>
                  <p className="text-sm text-zinc-500 leading-snug">Guards must capture a selfie before entry.</p>
                  {rules.planTier === "basic" && (
                    <p className="text-xs font-semibold text-amber-600 mt-1">Selfie verification is locked on the Basic plan. Upgrade to Premium to enable.</p>
                  )}
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input id="photo-toggle" type="checkbox" className="sr-only peer" checked={rules.planTier === "basic" ? false : rules.requirePhoto} onChange={(e) => rules.handleToggleRule("require_photo", e.target.checked, rules.setRequirePhoto)} disabled={rules.updatingRules || rules.planTier === "basic"} />
                  <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
            </CardContent>
          </Card>

          {/* CUSTOM FORM BUILDER */}
          <Card className="shadow-sm border-0 border-t-4 border-t-amber-500 bg-white h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg font-bold">
                <ListPlus className="mr-2 h-5 w-5 text-amber-500" /> Custom Form Builder
              </CardTitle>
              <CardDescription className="text-sm">Create unique questions (e.g. &quot;Laptop Serial No&quot;, &quot;Temperature&quot;).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="flex gap-2">
                <Input 
                  value={rules.newFieldName}
                  onChange={(e) => rules.setNewFieldName(e.target.value)}
                  placeholder="Enter new field name..." 
                  className="flex-1 bg-zinc-50 h-11"
                  onKeyDown={(e) => e.key === 'Enter' && rules.handleAddCustomField()}
                />
                <Button onClick={rules.handleAddCustomField} disabled={!rules.newFieldName.trim() || rules.updatingRules} className="bg-amber-500 hover:bg-amber-600 text-white shrink-0 h-11">
                  <Plus className="w-4 h-4 mr-2" /> Add Field
                </Button>
              </div>

              <div className="space-y-3 mt-4">
                {rules.customFields.length === 0 ? (
                  <div className="text-center p-6 border-2 border-dashed border-zinc-200 rounded-xl text-zinc-400 text-sm">
                    No custom fields created yet.
                  </div>
                ) : (
                  rules.customFields.map((field) => (
                    <div key={field.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-200 shadow-sm">
                      <span className="font-semibold text-base text-zinc-800">{field.label}</span>
                      
                      <div className="flex items-center gap-4">
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input 
                            type="checkbox" className="sr-only peer" 
                            checked={field.active} 
                            onChange={(e) => rules.handleToggleCustomField(field.id, e.target.checked)} 
                            disabled={rules.updatingRules}
                          />
                          <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-red-500 hover:bg-red-50 hover:text-red-700"
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

        </div>
      </div>
    </div>
  );
}
