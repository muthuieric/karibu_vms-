"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Printer, Copy, CheckCircle2, BadgeCheck, LogOut, SquareCode } from "lucide-react";
import { PageContainer } from "@/components/dashboard/shared/AppShell";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { QRDisplayCard } from "@/components/dashboard/shared/QRDisplayCard";
import { ErrorState, LoadingState } from "@/components/dashboard/shared/StateBlocks";

export default function QRCodeGenerator() {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedGate, setCopiedGate] = useState(false);
  const [copiedCheckout, setCopiedCheckout] = useState(false);
  
  const [gateUrl, setGateUrl] = useState<string>("");
  const [checkoutUrl, setCheckoutUrl] = useState<string>("");

  useEffect(() => {
    const fetchCompanyId = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("company_id")
          .eq("id", authData.user.id)
          .single();

        if (profileData?.company_id) {
          setCompanyId(profileData.company_id);
          const baseUrl = window.location.origin;
          setGateUrl(`${baseUrl}/${profileData.company_id}/gate`);
          setCheckoutUrl(`${baseUrl}/${profileData.company_id}/checkout`);
        }
      }
      setLoading(false);
    };
    
    fetchCompanyId();
  }, []);

  const handlePrint = () => window.print();

  // Bulletproof copy function (works in all browsers and secure iframes)
  const handleCopy = (text: string, setCopiedState: (val: boolean) => void) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  if (loading) {
    return (
      <div className="h-full p-4 flex flex-col items-center justify-center">
        <LoadingState label="Generating your secure QR codes..." />
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="h-full p-4 flex flex-col items-center justify-center">
        <ErrorState
          title="Profile Error"
          description="Could not verify your building assignment. Please try logging in again."
        />
      </div>
    );
  }

  const gateQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=20&data=${encodeURIComponent(gateUrl)}`;
  const checkoutQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=20&data=${encodeURIComponent(checkoutUrl)}`;

  return (
    <PageContainer className="max-w-6xl">
      {/* Print CSS to make them print on separate pages beautifully */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { background-color: white !important; -webkit-print-color-adjust: exact; }
          .hide-on-print { display: none !important; }
          .print-poster-container { 
            max-width: 100% !important; 
            box-shadow: none !important; 
            border: none !important; 
            break-inside: avoid; 
            page-break-after: always;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .print-poster-container:last-child { page-break-after: auto; }
        }
      `}} />

        <PageHeader
          title="Gate QR Code"
          eyebrow="Entrance and exit posters"
          description="Create secure visitor check-in and checkout posters for your entry points."
          icon={SquareCode}
          className="hide-on-print"
        >
          <Button onClick={handlePrint} className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 font-bold rounded-xl h-11 px-6">
            <Printer className="h-4 w-4 mr-2" /> Print poster
          </Button>
        </PageHeader>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-3">
            <QRDisplayCard
              title="Visitor check-in"
              description="Secure rotating link for guests arriving at your building."
              qrUrl={gateQrCodeUrl}
              icon={BadgeCheck}
              printClassName="print-poster-container"
              footer={
                <div className="w-full max-w-xs space-y-2 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-blue-900 print:max-w-xs print:p-6">
                  <p><span className="mr-2 rounded-full bg-blue-600 px-2 py-1 text-xs text-white">1</span> Open camera</p>
                  <p><span className="mr-2 rounded-full bg-blue-600 px-2 py-1 text-xs text-white">2</span> Enter details</p>
                  <p><span className="mr-2 rounded-full bg-blue-600 px-2 py-1 text-xs text-white">3</span> Show approval screen</p>
                </div>
              }
            />

            <div className="hide-on-print rounded-[1.25rem] border border-slate-100 bg-white p-4 shadow-sm flex flex-col gap-2">
              <p className="text-xs font-bold text-slate-500">Check-in link</p>
              <div className="flex gap-2">
                <Input value={gateUrl} readOnly className="font-mono text-xs h-10 bg-slate-50 border-slate-200 rounded-lg focus-visible:ring-0" />
                <Button 
                  variant="outline" 
                  className={`h-10 px-4 font-bold rounded-lg border-blue-200 text-blue-700 hover:bg-blue-50 ${copiedGate ? "bg-blue-50 border-blue-300" : ""}`}
                  onClick={() => handleCopy(gateUrl, setCopiedGate)}
                >
                  {copiedGate ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copiedGate ? "Copied" : "Copy link"}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <QRDisplayCard
              title="Visitor checkout"
              description="Scan to check out securely using the SMS exit PIN."
              qrUrl={checkoutQrCodeUrl}
              icon={LogOut}
              tone="warning"
              printClassName="print-poster-container"
              footer={
                <div className="w-full max-w-xs space-y-2 rounded-2xl border border-orange-100 bg-orange-50 p-4 text-sm font-semibold text-orange-900 print:max-w-xs print:p-6">
                  <p><span className="mr-2 rounded-full bg-orange-500 px-2 py-1 text-xs text-white">1</span> Open camera</p>
                  <p><span className="mr-2 rounded-full bg-orange-500 px-2 py-1 text-xs text-white">2</span> Enter SMS OTP</p>
                  <p><span className="mr-2 rounded-full bg-orange-500 px-2 py-1 text-xs text-white">3</span> Exit securely</p>
                </div>
              }
            />

            <div className="hide-on-print rounded-[1.25rem] border border-slate-100 bg-white p-4 shadow-sm flex flex-col gap-2">
              <p className="text-xs font-bold text-slate-500">Checkout link</p>
              <div className="flex gap-2">
                <Input value={checkoutUrl} readOnly className="font-mono text-xs h-10 bg-slate-50 border-slate-200 rounded-lg focus-visible:ring-0" />
                <Button 
                  variant="outline" 
                  className={`h-10 px-4 font-bold rounded-lg border-blue-200 text-blue-700 hover:bg-blue-50 ${copiedCheckout ? "bg-blue-50 border-blue-300" : ""}`}
                  onClick={() => handleCopy(checkoutUrl, setCopiedCheckout)}
                >
                  {copiedCheckout ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copiedCheckout ? "Copied" : "Copy link"}
                </Button>
              </div>
            </div>
          </div>
          
        </div>
    </PageContainer>
  );
}
