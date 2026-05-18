"use client";

import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import type { GeofenceDebugDetails } from "@/hooks/usePublicGateCheckIn";

type GateGeofenceErrorStateProps = {
  message: string;
  onRetry: () => void;
  debugDetails?: GeofenceDebugDetails | null;
};

export default function GateGeofenceErrorState({
  message,
  onRetry,
  debugDetails,
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
        {process.env.NODE_ENV === "development" && debugDetails && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              Geofence debug
            </p>
            <dl className="grid grid-cols-1 gap-2 text-xs text-slate-700">
              {Object.entries(debugDetails).map(([key, value]) => (
                <div key={key} className="flex items-start justify-between gap-3">
                  <dt className="font-semibold text-slate-500">{key}</dt>
                  <dd className="max-w-[11rem] break-words text-right font-mono text-slate-900">
                    {value ?? "null"}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </Card>
    </div>
  );
}
