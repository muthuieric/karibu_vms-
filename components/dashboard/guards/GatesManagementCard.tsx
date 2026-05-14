"use client";

import { DoorOpen, Loader2, Pencil, Trash2, X } from "lucide-react";
import { EmptyState } from "@/components/dashboard/shared/StateBlocks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Gate = {
  id: string;
  name: string;
};

type GatesManagementCardProps = {
  gates: Gate[];
  newGateName: string;
  isCreatingGate: boolean;
  editingGateId: string | null;
  editingGateName: string;
  isUpdatingGate: boolean;
  onNewGateNameChange: (value: string) => void;
  onCreateGate: (event: React.FormEvent) => void;
  onEditGateStart: (gate: Gate) => void;
  onEditingGateNameChange: (value: string) => void;
  onUpdateGate: (event: React.FormEvent) => void;
  onCancelEditGate: () => void;
  onDeleteGate: (id: string, name: string) => void;
};

export default function GatesManagementCard({
  gates,
  newGateName,
  isCreatingGate,
  editingGateId,
  editingGateName,
  isUpdatingGate,
  onNewGateNameChange,
  onCreateGate,
  onEditGateStart,
  onEditingGateNameChange,
  onUpdateGate,
  onCancelEditGate,
  onDeleteGate,
}: GatesManagementCardProps) {
  return (
    <Card className="md:col-span-1 h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <DoorOpen className="h-5 w-5" /> Building Gates
        </CardTitle>
        <CardDescription>Define entry points.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onCreateGate} className="flex gap-2 mb-6">
          <Input
            placeholder="e.g. Main Gate"
            value={newGateName}
            onChange={(e) => onNewGateNameChange(e.target.value)}
            required
          />
          <Button type="submit" disabled={isCreatingGate || !newGateName.trim()}>
            {isCreatingGate ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
          </Button>
        </form>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {gates.length === 0 ? (
            <EmptyState title="No gates created yet" description="Add your first entry point to assign guards correctly." icon={DoorOpen} className="py-6" />
          ) : (
            gates.map((gate) => (
              <div key={gate.id} className="p-3 border border-border rounded-xl bg-surface-muted flex flex-col justify-center transition-colors">
                {editingGateId === gate.id ? (
                  <form onSubmit={onUpdateGate} className="flex gap-2 w-full items-center">
                    <Input
                      value={editingGateName}
                      onChange={(e) => onEditingGateNameChange(e.target.value)}
                      className="h-8 text-sm"
                      autoFocus
                    />
                    <Button type="submit" size="sm" disabled={isUpdatingGate} className="h-8 px-2">
                      Save
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={onCancelEditGate} className="h-8 px-2">
                      <X className="w-4 h-4" />
                    </Button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium text-sm text-text-main">{gate.name}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditGateStart(gate)}
                        className="h-7 w-7 p-0 text-text-muted hover:text-primary hover:bg-primary/10 transition-all"
                        title="Edit Gate"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteGate(gate.id, gate.name)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all"
                        title="Delete Gate"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
