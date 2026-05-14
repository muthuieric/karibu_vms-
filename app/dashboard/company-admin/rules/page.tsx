"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Loader2, Camera, CheckCircle2, AlertCircle, Users, Briefcase, Car, Plus, Trash2, ListPlus, Lock, ClipboardList } from "lucide-react";
import { useBuildingRules } from "@/hooks/useBuildingRules";
import { PageContainer } from "@/components/dashboard/shared/AppShell";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { EmptyState } from "@/components/dashboard/shared/StateBlocks";
import { ToggleCard } from "@/components/dashboard/shared/ToggleCard";

export default function BuildingRulesPage() {
  const rules = useBuildingRules();

  return (
    <PageContainer className="max-w-6xl">
        <PageHeader
          title="Building Rules & Forms"
          eyebrow="Visitor intake policy"
          description="Decide what every visitor must provide before guards can approve entry."
          icon={ClipboardList}
        >
          {rules.updatingRules && (
            <div className="flex items-center text-sm font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full animate-pulse border border-primary/15">
              <Loader2 className="w-4 h-4 mr-2 animate-spin"/> Saving changes...
            </div>
          )}
        </PageHeader>

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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="h-fit overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-600 to-emerald-400" />
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <span className="rounded-2xl bg-blue-50 p-2.5 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                Required Visitor Fields
              </CardTitle>
              <CardDescription>Built-in policy controls used by public check-in and guard desk registration.</CardDescription>
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
              <ToggleCard
                id="photo-toggle"
                title="Security photo"
                description={rules.planTier === "basic" ? "Selfie verification is locked on the Basic plan." : "Require a photo capture before the visitor joins the approval queue."}
                icon={Camera}
                checked={rules.planTier === "basic" ? false : rules.requirePhoto}
                disabled={rules.updatingRules || rules.planTier === "basic"}
                badge={rules.planTier === "basic" ? <Badge variant="pending" className="gap-1"><Lock className="h-3 w-3" /> Premium</Badge> : null}
                onCheckedChange={(checked) => rules.handleToggleRule("require_photo", checked, rules.setRequirePhoto)}
              />
            </CardContent>
          </Card>

          <Card className="h-fit overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-orange-500 to-amber-300" />
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <span className="rounded-2xl bg-orange-50 p-2.5 text-warning-foreground">
                  <ListPlus className="h-5 w-5" />
                </span>
                Custom Form Builder
              </CardTitle>
              <CardDescription>Create site-specific visitor questions such as equipment serials, delivery references, or safety checks.</CardDescription>
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
                <Button onClick={rules.handleAddCustomField} disabled={!rules.newFieldName.trim() || rules.updatingRules} className="h-11 shrink-0 bg-warning text-white hover:bg-warning/90">
                  <Plus className="h-4 w-4" /> Add Field
                </Button>
              </div>

              <div className="space-y-3 mt-4">
                {rules.customFields.length === 0 ? (
                  <EmptyState title="No custom fields yet" description="Add a question above to show it on visitor registration forms." />
                ) : (
                  rules.customFields.map((field) => (
                    <div key={field.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm">
                      <span className="font-semibold text-base text-slate-800">{field.label}</span>
                      
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
    </PageContainer>
  );
}
