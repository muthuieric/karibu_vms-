"use client";

import { Suspense, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock3,
  Loader2,
  Search,
  ShieldCheck,
  UserCheck,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type HostConfirmVisitor = {
  id: string;
  name: string;
  phone?: string | null;
  purpose?: string | null;
  photo_url?: string | null;
  host_confirmed?: boolean | null;
  status?: string | null;
  host_name?: string | null;
  company_name?: string | null;
  building_name?: string | null;
  checked_in_at?: string | null;
  created_at?: string | null;
  vehicle_reg?: string | null;
  custom_data?: Record<string, string> | null;
};

type ConfirmationState = "lookup" | "review" | "approved" | "declined" | "alreadyConfirmed";

function getArrivalTime(visitor: HostConfirmVisitor) {
  return visitor.checked_in_at || visitor.created_at || null;
}

function formatArrivalTime(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value?.trim()) return null;

  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3 last:border-b-0 last:pb-0">
      <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span className="min-w-0 break-words text-right text-sm font-bold text-slate-900">
        {value}
      </span>
    </div>
  );
}

function StatusNotice({
  tone,
  title,
  description,
}: {
  tone: "info" | "success" | "warning" | "danger";
  title: string;
  description?: string;
}) {
  const styles = {
    info: {
      icon: ShieldCheck,
      className: "border-blue-200 bg-blue-50 text-blue-700",
      iconClassName: "bg-blue-100 text-blue-700",
    },
    success: {
      icon: CheckCircle2,
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      iconClassName: "bg-emerald-100 text-emerald-700",
    },
    warning: {
      icon: AlertTriangle,
      className: "border-orange-200 bg-orange-50 text-orange-700",
      iconClassName: "bg-orange-100 text-orange-700",
    },
    danger: {
      icon: XCircle,
      className: "border-red-200 bg-red-50 text-red-700",
      iconClassName: "bg-red-100 text-red-700",
    },
  }[tone];

  const Icon = styles.icon;

  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      aria-live="polite"
      className={cn("rounded-2xl border p-4", styles.className)}
    >
      <div className="flex gap-3">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            styles.iconClassName
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>

        <div className="min-w-0">
          <p className="font-bold leading-snug">{title}</p>
          {description && (
            <p className="mt-1 break-words text-sm font-medium leading-relaxed text-current/80">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function VisitorSummary({ visitor }: { visitor: HostConfirmVisitor }) {
  const arrivedAt = formatArrivalTime(getArrivalTime(visitor));
  const customEntries = Object.entries(visitor.custom_data || {}).filter(([, value]) =>
    value?.trim()
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-5 duration-500">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
        <div className="mb-5 flex justify-center">
          {visitor.photo_url ? (
            <Image
              src={visitor.photo_url}
              alt={`${visitor.name} visitor photo`}
              width={88}
              height={88}
              className="h-22 w-22 rounded-full border-2 border-white object-cover shadow-sm"
              unoptimized
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-2xl font-bold text-blue-700 shadow-sm">
              {visitor.name?.charAt(0)?.toUpperCase() || "V"}
            </div>
          )}
        </div>

        <div className="mb-5 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Visitor</p>
          <h2 className="mt-1 break-words text-2xl font-bold tracking-tight text-slate-900">
            {visitor.name}
          </h2>

          <p className="mt-2 flex items-center justify-center gap-2 text-sm font-semibold text-slate-500">
            <Clock3 className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
            <span>{arrivedAt ? `Arrival time: ${arrivedAt}` : "Arrival time not provided"}</span>
          </p>
        </div>

        <div className="space-y-3">
          <DetailRow label="Name" value={visitor.name} />
          <DetailRow label="Phone" value={visitor.phone} />
          <DetailRow label="Purpose" value={visitor.purpose} />
          <DetailRow label="Host" value={visitor.host_name} />
          <DetailRow label="Building" value={visitor.company_name || visitor.building_name} />
          <DetailRow label="Arrived At" value={arrivedAt} />
          <DetailRow label="Vehicle" value={visitor.vehicle_reg} />

          {customEntries.map(([field, value]) => (
            <DetailRow key={field} label={field.replace(/[_-]/g, " ")} value={value} />
          ))}
        </div>
      </div>
    </div>
  );
}

function HostConfirmContent() {
  const params = useParams();
  const companyId = params.companyId as string;

  const [confirmationState, setConfirmationState] = useState<ConfirmationState>("lookup");
  const [otpInput, setOtpInput] = useState("");
  const [visitor, setVisitor] = useState<HostConfirmVisitor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearchVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput || otpInput.trim().length < 4) return;

    setErrorMsg("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/host-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, otp: otpInput.trim(), action: "lookup" }),
      });

      const result = await response.json();

      if (!response.ok || !result.visitor) {
        throw new Error(result.error || "No active visitor found with this OTP code.");
      }

      setVisitor(result.visitor);

      if (
        result.visitor.host_confirmed === true ||
        result.visitor.status === "approved" ||
        result.visitor.status === "visited"
      ) {
        setConfirmationState("alreadyConfirmed");
      } else {
        setConfirmationState("review");
      }
    } catch (error: unknown) {
      setErrorMsg(error instanceof Error ? error.message : "This confirmation link is invalid or expired.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmVisit = async () => {
    if (!visitor) return;

    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/host-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: visitor.id, companyId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to confirm visitor.");
      }

      setConfirmationState("approved");
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg("We could not update this visit. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetFlow = () => {
    setOtpInput("");
    setVisitor(null);
    setErrorMsg("");
    setConfirmationState("lookup");
  };

  const isLookup = confirmationState === "lookup";
  const isReview = confirmationState === "review" && visitor;
  const isApproved = confirmationState === "approved";
  const isDeclined = confirmationState === "declined";
  const isAlreadyConfirmed = confirmationState === "alreadyConfirmed";

  if (isApproved || isDeclined || isAlreadyConfirmed) {
    return (
      <main className="flex w-full justify-center px-4 py-8">
        <Card className="relative z-10 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white text-center shadow-sm">
          <CardContent className="space-y-6 p-6 sm:p-8">
            {isApproved && (
              <>
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-200 bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
                </div>

                <div>
                  <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
                    Visit approved
                  </CardTitle>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                    {visitor?.name || "This visitor"} has been approved successfully.
                  </p>
                </div>
              </>
            )}

            {isDeclined && (
              <>
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-red-200 bg-red-50 text-red-700">
                  <XCircle className="h-10 w-10" aria-hidden="true" />
                </div>

                <div>
                  <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
                    Visit declined
                  </CardTitle>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                    {visitor?.name || "This visitor"} should not proceed until the request is reviewed again.
                  </p>
                </div>
              </>
            )}

            {isAlreadyConfirmed && (
              <>
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-200 bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
                </div>

                <div>
                  <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
                    Already confirmed
                  </CardTitle>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                    {visitor?.name || "This visitor"} was previously approved for this request.
                  </p>
                </div>
              </>
            )}

            {visitor && <VisitorSummary visitor={visitor} />}

            <Button
              type="button"
              size="lg"
              variant="outline"
              className="h-12 w-full rounded-xl font-bold"
              onClick={resetFlow}
            >
              Confirm Another Visitor
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex w-full justify-center px-4 py-8">
      <Card className="relative z-10 w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700">
            <Building2 className="h-6 w-6" aria-hidden="true" />
          </div>

          <CardDescription className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-700">
            Karibu VMS
          </CardDescription>

          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Visitor confirmation
          </CardTitle>

          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
            Review the visitor request before allowing the guest to proceed.
          </p>
        </CardHeader>

        <CardContent>
          {isLookup && (
            <form onSubmit={handleSearchVisitor} className="space-y-4">
              {errorMsg && (
                <StatusNotice
                  tone="warning"
                  title="Visitor not found"
                  description={errorMsg}
                />
              )}

              <div>
                <Label
                  htmlFor="host-confirm-otp"
                  className="mb-2 block text-center text-sm font-bold text-slate-700"
                >
                  Visitor OTP Code
                </Label>

                <div className="relative">
                  <UserCheck className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <Input
                    id="host-confirm-otp"
                    required
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="e.g. 8492"
                    className="h-14 rounded-xl border-slate-200 bg-slate-50 pl-11 text-center text-2xl font-bold tracking-widest text-slate-900 shadow-inner focus-visible:ring-2 focus-visible:ring-blue-500/20"
                    aria-describedby="host-confirm-help"
                  />
                </div>

                <p
                  id="host-confirm-help"
                  className="mt-2 text-center text-sm font-medium leading-relaxed text-slate-500"
                >
                  Enter the visitor code shared for this visit request.
                </p>
              </div>

              <Button
                type="submit"
                className="mt-6 h-14 w-full rounded-xl bg-blue-600 text-lg font-bold text-white hover:bg-blue-700"
                disabled={isLoading || otpInput.trim().length < 4}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                    Locating Visit...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" aria-hidden="true" />
                    Verify Code
                  </>
                )}
              </Button>
            </form>
          )}

          {isReview && (
            <div className="space-y-6">
              <VisitorSummary visitor={visitor} />

              {errorMsg && (
                <StatusNotice
                  tone="danger"
                  title="Update failed"
                  description={errorMsg}
                />
              )}

              <div className="space-y-3">
                <Button
                  type="button"
                  onClick={handleConfirmVisit}
                  className="h-14 w-full rounded-xl bg-emerald-600 text-lg font-bold text-white hover:bg-emerald-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 h-5 w-5" aria-hidden="true" />
                      Confirm Visit
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={() => setConfirmationState("declined")}
                  variant="outline"
                  className="h-12 w-full rounded-xl border-red-200 font-bold text-red-700 hover:bg-red-50 hover:text-red-800"
                  disabled={isLoading}
                >
                  <XCircle className="mr-2 h-5 w-5" aria-hidden="true" />
                  Decline Visit
                </Button>

                <Button
                  type="button"
                  onClick={resetFlow}
                  variant="outline"
                  className="h-12 w-full rounded-xl font-bold text-slate-600"
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-5 w-5" aria-hidden="true" />
                  Not This Visitor? Try Again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

export default function HostConfirmWrapper() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="flex w-full items-center justify-center">
        <Suspense
          fallback={
            <div
              className="flex min-h-screen w-full items-center justify-center px-4"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" aria-hidden="true" />
              <span className="sr-only">Loading visit request...</span>
            </div>
          }
        >
          <HostConfirmContent />
        </Suspense>
      </div>

 <footer className="mt-6 flex flex-col items-center justify-center gap-2 text-center">
  <div className="flex h-9 w-9 items-center justify-center overflow-hidden">
  <Image
    src="/icon_only2.png"
    alt="Luffi Tech logo"
    width={32}
    height={32}
    className="h-8 w-8 object-contain"
  />
</div>

 <p className="text-xs font-semibold">
  <span className="text-slate-500">Powered by </span>
  <span className="text-black">Luffi</span>{" "}
  <span className="text-purple-600">Tech</span>
</p>
</footer>
    </div>
  );
}
