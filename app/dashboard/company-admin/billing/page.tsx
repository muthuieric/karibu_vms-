"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import BillingHeader from "@/components/dashboard/company-admin/billing/BillingHeader";
import BillingLoadingSkeleton from "@/components/dashboard/company-admin/billing/BillingLoadingSkeleton";
import CurrentStatementCard from "@/components/dashboard/company-admin/billing/CurrentStatementCard";
import PaymentHistoryCard from "@/components/dashboard/company-admin/billing/PaymentHistoryCard";

type Transaction = {
  id: string;
  created_at: string;
  amount: number;
  tracking_id: string;
  status: string;
};

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  
  // Synchronized Billing States
  const [visitorCount, setVisitorCount] = useState(0);
  const [amountDue, setAmountDue] = useState(0);
  const [periodStart, setPeriodStart] = useState<Date | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    const fetchBillingData = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", authData.user.id)
        .single();

      if (profile?.company_id) {
        setCompanyId(profile.company_id);

        // 1. Fetch All Transactions for History Table
        const { data: txData } = await supabase
          .from("transactions")
          .select("*")
          .eq("company_id", profile.company_id)
          .order("created_at", { ascending: false });

        setTransactions(txData || []);

        // 2. SYNCHRONIZED CALCULATION LOGIC
        const { data: company } = await supabase.from("companies").select("created_at").eq("id", profile.company_id).single();
        let countStartDate = company?.created_at || new Date(0).toISOString();
        let displayStartDate = new Date(countStartDate);

        if (txData && txData.length > 0) {
          // Find the latest successful payment
          const lastPaid = txData.find(tx => 
            tx.status && (tx.status.toUpperCase() === 'COMPLETED' || tx.status.toUpperCase() === 'SUCCESS' || tx.status.toUpperCase() === 'PAID')
          );

          if (lastPaid) {
            countStartDate = lastPaid.created_at;
            displayStartDate = new Date(lastPaid.created_at);
          }
        }
        
        setPeriodStart(displayStartDate);

        // 3. Count UNPAID visitors since the calculated reset date
        const { count } = await supabase
          .from("visitors")
          .select("*", { count: "exact", head: true })
          .eq("company_id", profile.company_id)
          .gte("created_at", countStartDate);

        const unpaidVisitors = count || 0;
        setVisitorCount(unpaidVisitors);
        
        // 4. Calculate Total Due
        setAmountDue(unpaidVisitors * 3); // 3 KES per visitor
      }
      setLoading(false);
    };

    fetchBillingData();
  }, []);

  const handlePayment = async () => {
    if (!companyId) return;
    setIsPaying(true);

    try {
      // NOTE ON SECURITY: 
      // Passing the amount from the frontend can be manipulated in DevTools. 
      // Your backend (/api/payments/pesapal/initiate) MUST replicate the visitor * 3 calculation 
      // securely and ignore the amount passed here to guarantee zero financial loss.
      const response = await fetch("/api/payments/pesapal/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, amount: amountDue }), 
      });

      const data = await response.json();
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        alert("Payment initialization failed.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred starting the payment.");
    } finally {
      setIsPaying(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    }).format(new Date(date));
  };

  return (
    <div className="min-h-full bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <BillingHeader />

        {loading ? (
          <BillingLoadingSkeleton />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <CurrentStatementCard
                amountDue={amountDue}
                visitorCount={visitorCount}
                periodStart={periodStart}
                isPaying={isPaying}
                formatDate={formatDate}
                onPayment={handlePayment}
              />
            </div>

            <div className="lg:col-span-2">
              <PaymentHistoryCard
                transactions={transactions}
                formatDate={formatDate}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
