"use client";

import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import type { GeofenceDebugDetails } from "@/hooks/usePublicGateCheckIn";

type GateGeofenceErrorStateProps = {
  message: string;
  onRetry: () => void;
  distanceMeters?: number | null;
  radiusMeters?: number | null;
  accuracyMeters?: number | null;
  debugDetails?: GeofenceDebugDetails | null;
};

function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export default function GateGeofenceErrorState({
  message,
  onRetry,
  distanceMeters,
  radiusMeters,
  accuracyMeters,
  debugDetails,
}: GateGeofenceErrorStateProps) {
  const hasSafeLocationSummary =
    typeof distanceMeters === "number" &&
    typeof radiusMeters === "number" &&
    typeof accuracyMeters === "number";
  const isAccuracyTooLow = hasSafeLocationSummary && accuracyMeters > radiusMeters;

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
        {hasSafeLocationSummary && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
            <div className="grid gap-2 text-sm font-medium text-slate-700">
              {isAccuracyTooLow ? (
                <p className="font-bold text-red-700">
                  Your device location is not accurate enough. Enable precise location and try again.
                </p>
              ) : null}
              <p>Estimated distance from allowed location: <span className="font-bold text-slate-950">{formatDistance(distanceMeters)}</span></p>
              <p>Allowed radius: <span className="font-bold text-slate-950">{Math.round(radiusMeters)} m</span></p>
              <p>Location accuracy: <span className="font-bold text-slate-950">±{Math.round(accuracyMeters)} m</span></p>
            </div>
          </div>
        )}
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
