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
      <Card className="border-red-100 shadow-xl text-center p-8 bg-white/95 backdrop-blur-md">
        <MapPin className="w-20 h-20 text-red-500 mx-auto mb-6" />
        <CardTitle className="text-2xl font-black text-zinc-900 tracking-tight mb-2">
          Location Required
        </CardTitle>
        <p className="text-zinc-600 font-medium leading-relaxed mb-8">
          {message}
        </p>
        <Button onClick={onRetry} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold h-12 shadow-md">
          Try Again
        </Button>
      </Card>
    </div>
  );
}
