"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AddDepartmentCardProps = {
  newDeptName: string;
  onNewDeptNameChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
};

export default function AddDepartmentCard({
  newDeptName,
  onNewDeptNameChange,
  onSubmit,
}: AddDepartmentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Department</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex gap-4 items-end">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="deptName">Department Name</Label>
            <Input
              id="deptName"
              placeholder="e.g. Human Resources"
              value={newDeptName}
              onChange={(e) => onNewDeptNameChange(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="bg-zinc-900 text-white hover:bg-zinc-800">Create</Button>
        </form>
      </CardContent>
    </Card>
  );
}
