"use client";

import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

type GateGeofenceErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export default function GateGeofenceErrorState({
  message,
  onRetry,
}: GateGeofenceErrorStateProps) {
  return (
    <div className="w-full max-w-md mx-auto relative z-10 px-4">
      <Card className="border-destructive/15 text-center p-8">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-destructive/15 bg-destructive/10 text-destructive">
          <MapPin className="w-10 h-10" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight mb-2">
          Location Required
        </CardTitle>
        <p className="text-text-muted font-medium leading-relaxed mb-8">
          {message}
        </p>
        <Button onClick={onRetry} className="w-full font-bold h-12">
          Try Again
        </Button>
      </Card>
    </div>
  );
}
