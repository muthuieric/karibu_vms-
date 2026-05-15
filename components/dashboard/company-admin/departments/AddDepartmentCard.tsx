"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AddDepartmentCardProps = {
  newDeptName: string;
  onNewDeptNameChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  onClose?: () => void;
};

export default function AddDepartmentCard({
  newDeptName,
  onNewDeptNameChange,
  onSubmit,
  onClose,
}: AddDepartmentCardProps) {
  const card = (
    <Card className="w-full max-w-md rounded-[1.4rem] border-slate-100 bg-white shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold">Add Department</CardTitle>
            <CardDescription className="mt-1">Create a visitor host group for check-in.</CardDescription>
          </div>
          {onClose && (
            <Button type="button" variant="ghost" onClick={onClose} className="h-9 w-9 shrink-0 rounded-full p-0 text-slate-400 hover:bg-slate-100 hover:text-slate-900">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="deptName" className="font-bold text-slate-700">Department Name</Label>
            <Input
              id="deptName"
              placeholder="e.g. Human Resources"
              value={newDeptName}
              onChange={(e) => onNewDeptNameChange(e.target.value)}
              className="bg-slate-50 border-slate-200 rounded-xl h-11"
              required
            />
          </div>
          <div className="sticky bottom-0 -mx-6 flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4">
            {onClose && (
              <Button type="button" variant="ghost" onClick={onClose} className="h-11 rounded-xl px-6 font-bold text-slate-500 hover:text-slate-900">
                Cancel
              </Button>
            )}
            <Button type="submit" className="h-11 rounded-xl bg-blue-600 px-8 font-bold text-white hover:bg-blue-700">Add Department</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  if (!onClose) return card;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4">
      {card}
    </div>
  );
}
