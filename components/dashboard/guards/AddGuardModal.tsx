"use client";

import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Gate = {
  id: string;
  name: string;
};

type NewGuard = {
  name: string;
  email: string;
  password: string;
  gateId: string;
};

type AddGuardModalProps = {
  gates: Gate[];
  newGuard: NewGuard;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onNewGuardChange: (guard: NewGuard) => void;
};

export default function AddGuardModal({
  gates,
  newGuard,
  isSubmitting,
  onClose,
  onSubmit,
  onNewGuardChange,
}: AddGuardModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-2xl relative border-0 rounded-xl overflow-hidden bg-white">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-zinc-900"></div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-full p-1.5 transition-colors"
        >
          <X size={18} />
        </button>
        <CardHeader className="pt-8 pb-4">
          <CardTitle className="text-xl font-bold text-zinc-900">Create Guard Account</CardTitle>
          <CardDescription className="text-zinc-500">They will use these credentials to log into the gate tablet.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label className="font-semibold text-zinc-700">Full Name</Label>
              <Input
                required
                placeholder="e.g. David Ochieng"
                value={newGuard.name}
                onChange={(e) => onNewGuardChange({ ...newGuard, name: e.target.value })}
                className="h-11 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-colors"
              />
            </div>
            <div>
              <Label className="font-semibold text-zinc-700">Email Address</Label>
              <Input
                required
                type="email"
                placeholder="david@building.com"
                value={newGuard.email}
                onChange={(e) => onNewGuardChange({ ...newGuard, email: e.target.value })}
                className="h-11 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-colors"
              />
            </div>
            <div>
              <Label className="font-semibold text-zinc-700">Initial Password</Label>
              <Input
                required
                type="password"
                placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                minLength={8}
                value={newGuard.password}
                onChange={(e) => onNewGuardChange({ ...newGuard, password: e.target.value })}
                className="h-11 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-colors"
              />
            </div>

            <div>
              <Label className="font-semibold text-zinc-700">Assign to Gate</Label>
              <select
                className="flex h-11 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 transition-colors"
                value={newGuard.gateId}
                onChange={(e) => onNewGuardChange({ ...newGuard, gateId: e.target.value })}
              >
                <option value="">Unassigned (Can access all)</option>
                {gates.map((gate) => (
                  <option key={gate.id} value={gate.id}>
                    {gate.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-zinc-500 mt-1">Select which gate this guard will manage.</p>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full h-12 text-base font-bold bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm transition-transform active:scale-[0.98]" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating Account...</>
                ) : (
                  "Create Guard Account"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
