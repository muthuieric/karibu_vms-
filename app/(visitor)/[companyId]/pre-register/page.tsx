"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CalendarClock, CheckCircle2, Clock, ExternalLink, Loader2, Sparkles, User } from "lucide-react";
import PublicGatePageShell from "@/components/PublicGatePageShell";
import VisitorPassCard, { type SafeVisitorPass } from "@/components/visitor/VisitorPassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CompanyPublicData = {
  id: string;
  name: string;
  logo_url?: string | null;
  is_locked?: boolean | null;
};

type HostData = {
  id: string;
  name: string;
  department_id?: string;
};

function getMinDateTimeString() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getDefaultArrivalDateTime() {
  const d = new Date();
  d.setHours(d.getHours() + 2);
  d.setMinutes(0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatArrivalDisplay(isoString?: string | null) {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }) + " at " + d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

function PreRegisterContent() {
  const params = useParams<{ companyId: string }>();
  const searchParams = useSearchParams();
  const companyId = params?.companyId;
  const hostId = searchParams.get("hostId");

  const [company, setCompany] = useState<CompanyPublicData | null>(null);
  const [hosts, setHosts] = useState<HostData[]>([]);
  const [selectedHostId, setSelectedHostId] = useState<string>(hostId || "");
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Form inputs
  const [visitorName, setVisitorName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [expectedArrival, setExpectedArrival] = useState(getDefaultArrivalDateTime());
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Success state
  const [submitted, setSubmitted] = useState(false);
  const [passData, setPassData] = useState<{
    passUrl: string | null;
    passToken: string | null;
    visitorPass: SafeVisitorPass | null;
    arrivalDisplay: string;
  } | null>(null);

  useEffect(() => {
    if (!companyId) return;

    let active = true;
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        setPageError(null);

        // Fetch company
        const compRes = await fetch(`/api/public/company?company_id=${companyId}`);
        const compJson = await compRes.json();
        if (!compRes.ok || !compJson.data) {
          throw new Error("Organization not found or check-in is unavailable.");
        }
        if (active) setCompany(compJson.data);

        // Fetch hosts
        const hostsRes = await fetch(`/api/hosts?company_id=${companyId}`);
        if (hostsRes.ok) {
          const hostsJson = await hostsRes.json();
          if (active && Array.isArray(hostsJson.data)) {
            setHosts(hostsJson.data);
          }
        }
      } catch (err) {
        if (active) {
          setPageError(err instanceof Error ? err.message : "Failed to load pre-registration page.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchMetadata();

    return () => {
      active = false;
    };
  }, [companyId]);

  // Keep selectedHostId in sync with query param
  useEffect(() => {
    if (hostId) {
      setSelectedHostId(hostId);
    }
  }, [hostId]);

  const currentHost = useMemo(() => {
    return hosts.find((h) => h.id === selectedHostId) || null;
  }, [hosts, selectedHostId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !expectedArrival) {
      setFormError("Please provide your full name and expected arrival time.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const arrivalDate = new Date(expectedArrival);
      if (isNaN(arrivalDate.getTime())) {
        throw new Error("Invalid arrival date/time selected.");
      }

      const res = await fetch("/api/visitors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          name: visitorName.trim(),
          phone: phone.trim() || null,
          purpose: purpose.trim() || null,
          expected_arrival: arrivalDate.toISOString(),
          status: "pre_registered",
          is_pre_registered: true,
          pre_registered_by: currentHost?.id || hostId || null,
          host_id: currentHost?.id || hostId || null,
          host_name: currentHost?.name || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to submit pre-registration.");
      }

      const registered = json.data;
      const passUrl = registered.passUrl || null;
      const passToken = registered.passToken || null;

      const safePass: SafeVisitorPass = {
        visitorName: visitorName.trim(),
        hostName: currentHost?.name || null,
        companyName: company?.name || "Karibu VMS",
        companyLogoUrl: company?.logo_url || null,
        status: "pre_registered",
        date: arrivalDate.toISOString(),
        expectedArrival: arrivalDate.toISOString(),
        passCode: registered.pass_code || null,
      };

      setPassData({
        passUrl,
        passToken,
        visitorPass: safePass,
        arrivalDisplay: formatArrivalDisplay(arrivalDate.toISOString()),
      });

      setSubmitted(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to submit pre-registration.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-3xl border border-zinc-100 bg-white p-10 text-center shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 font-bold text-zinc-900">Loading pre-registration...</p>
        <p className="mt-1 text-sm text-zinc-500">Preparing visit schedule details.</p>
      </div>
    );
  }

  if (pageError || !company) {
    return (
      <div className="mx-auto w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <CalendarClock className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-black text-zinc-900">Pre-Registration Unavailable</h1>
        <p className="mt-2 text-sm text-zinc-600">{pageError || "Organization not found."}</p>
      </div>
    );
  }

  // Success Confirmation State
  if (submitted && passData) {
    return (
      <div className="mx-auto w-full max-w-lg space-y-6">
        {/* Success Card */}
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-2xl font-black text-emerald-950">Pre-Registration Confirmed!</h2>
          <p className="mt-1.5 text-sm font-medium text-emerald-800">
            You are scheduled to visit <strong className="font-bold text-emerald-950">{company.name}</strong>.
          </p>

          <div className="mt-4 rounded-2xl border border-emerald-200/80 bg-white p-4 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold text-zinc-500">Visitor:</span>
              <span className="font-extrabold text-zinc-900">{visitorName}</span>
            </div>
            {currentHost && (
              <div className="flex justify-between">
                <span className="font-semibold text-zinc-500">Host:</span>
                <span className="font-extrabold text-zinc-900">{currentHost.name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-semibold text-zinc-500">Expected Arrival:</span>
              <span className="font-extrabold text-indigo-700">{passData.arrivalDisplay}</span>
            </div>
          </div>

          <p className="mt-4 text-xs font-semibold text-emerald-700 leading-relaxed">
            Please show the QR code pass below to security when you arrive at the gate.
          </p>
        </div>

        {/* Embedded Visitor Pass Card */}
        {passData.visitorPass && (
          <div className="rounded-3xl shadow-xl overflow-hidden">
            <VisitorPassCard
              pass={passData.visitorPass}
              passUrl={passData.passUrl}
            />
          </div>
        )}

        {passData.passUrl && (
          <div className="text-center">
            <Link
              href={passData.passUrl}
              className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Open pass directly
              <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Pre-Registration Form
  return (
    <div className="mx-auto w-full max-w-lg rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-xl sm:p-8">
      {/* Company Branding */}
      <div className="text-center">
        {company.logo_url ? (
          <div className="mx-auto mb-4 flex justify-center">
            <Image
              src={company.logo_url}
              alt={`${company.name} logo`}
              width={160}
              height={48}
              unoptimized
              className="h-12 w-auto max-w-[180px] object-contain"
              priority
            />
          </div>
        ) : (
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-black text-white shadow-md">
            {company.name.charAt(0).toUpperCase()}
          </div>
        )}

        <h1 className="text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">Visitor Pre-Registration</h1>
        <p className="mt-1 text-sm font-semibold text-zinc-500">{company.name}</p>

        {/* Host Attribution Banner */}
        {currentHost && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-1.5 text-xs font-bold text-blue-800">
            <User className="h-3.5 w-3.5 text-blue-600" />
            <span>Scheduled visit with <strong>{currentHost.name}</strong></span>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {formError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-bold text-red-700">
            {formError}
          </div>
        )}

        <div>
          <Label htmlFor="vName" className="text-xs font-bold uppercase tracking-wider text-zinc-600">
            Full Name *
          </Label>
          <Input
            id="vName"
            required
            placeholder="Jane Doe"
            value={visitorName}
            onChange={(e) => setVisitorName(e.target.value)}
            className="mt-1.5 h-11 rounded-xl text-sm"
          />
        </div>

        <div>
          <Label htmlFor="vPhone" className="text-xs font-bold uppercase tracking-wider text-zinc-600">
            Phone Number
          </Label>
          <Input
            id="vPhone"
            type="tel"
            placeholder="+254 700 000 000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1.5 h-11 rounded-xl text-sm"
          />
        </div>

        <div>
          <Label htmlFor="vArrival" className="text-xs font-bold uppercase tracking-wider text-zinc-600">
            Expected Arrival Date & Time *
          </Label>
          <Input
            id="vArrival"
            type="datetime-local"
            required
            min={getMinDateTimeString()}
            value={expectedArrival}
            onChange={(e) => setExpectedArrival(e.target.value)}
            className="mt-1.5 h-11 rounded-xl text-sm font-semibold"
          />
        </div>

        <div>
          <Label htmlFor="vPurpose" className="text-xs font-bold uppercase tracking-wider text-zinc-600">
            Purpose of Visit
          </Label>
          <Input
            id="vPurpose"
            placeholder="e.g. Business Meeting, Interview, Consultation"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="mt-1.5 h-11 rounded-xl text-sm"
          />
        </div>

        {/* Host selection fallback if no host specified in URL */}
        {!hostId && hosts.length > 0 && (
          <div>
            <Label htmlFor="vHost" className="text-xs font-bold uppercase tracking-wider text-zinc-600">
              Host / Person to Meet
            </Label>
            <select
              id="vHost"
              value={selectedHostId}
              onChange={(e) => setSelectedHostId(e.target.value)}
              className="mt-1.5 flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select a host (optional)</option>
              {hosts.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            disabled={submitting}
            className="h-12 w-full rounded-xl bg-blue-600 text-base font-extrabold text-white shadow-md hover:bg-blue-700 transition-all"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Scheduling Visit...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Complete Pre-Registration
              </>
            )}
          </Button>
        </div>

        <p className="text-center text-[11px] text-zinc-400">
          Your visitor entry pass with a security QR code will be generated immediately after submitting.
        </p>
      </form>
    </div>
  );
}

export default function VisitorPreRegisterPage() {
  return (
    <PublicGatePageShell>
      <PreRegisterContent />
    </PublicGatePageShell>
  );
}

