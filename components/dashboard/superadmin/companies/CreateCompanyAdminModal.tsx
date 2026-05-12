"use client";

import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AdminForm = {
  fullName: string;
  email: string;
  password: string;
};

type CreateCompanyAdminModalProps = {
  adminForm: AdminForm;
  isCreatingAdmin: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onAdminFormChange: (form: AdminForm) => void;
};

export default function CreateCompanyAdminModal({
  adminForm,
  isCreatingAdmin,
  onClose,
  onSubmit,
  onAdminFormChange,
}: CreateCompanyAdminModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl relative border-0 overflow-hidden bg-white">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-full p-1.5 transition-colors">
          <X size={18} />
        </button>
        <CardHeader className="pt-8 pb-4 border-b border-zinc-100/50">
          <CardTitle className="text-xl font-bold">Create Company Admin</CardTitle>
          <CardDescription>Generate credentials for the Building Manager.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label className="font-semibold text-zinc-700">Admin Full Name</Label>
              <Input
                required
                placeholder="e.g. Jane Doe"
                value={adminForm.fullName}
                onChange={(e) => onAdminFormChange({ ...adminForm, fullName: e.target.value })}
                className="mt-1.5 h-11 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <Label className="font-semibold text-zinc-700">Email Address</Label>
              <Input
                required
                type="email"
                placeholder="manager@building.com"
                value={adminForm.email}
                onChange={(e) => onAdminFormChange({ ...adminForm, email: e.target.value })}
                className="mt-1.5 h-11 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <Label className="font-semibold text-zinc-700">Initial Password</Label>
              <Input
                required
                type="password"
                placeholder="Min 6 characters"
                minLength={6}
                value={adminForm.password}
                onChange={(e) => onAdminFormChange({ ...adminForm, password: e.target.value })}
                className="mt-1.5 h-11 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="pt-4">
              <Button type="submit" className="w-full h-11 text-base font-bold bg-blue-600 hover:bg-blue-700" disabled={isCreatingAdmin}>
                {isCreatingAdmin ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating...</> : "Create Admin Account"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
