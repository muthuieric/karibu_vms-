import type { Visitor } from "@/types/guard";

export function filterGuardVisitors(
  visitors: Visitor[],
  searchTerm: string,
  statusFilter: "all" | "pending" | "checked_in",
) {
  return visitors.filter((visitor) => {
    const query = searchTerm.toLowerCase();
    let matchesSearch =
      visitor.name?.toLowerCase().includes(query) ||
      visitor.phone?.includes(searchTerm) ||
      visitor.id_number?.includes(searchTerm) ||
      visitor.host_name?.toLowerCase().includes(query) ||
      visitor.vehicle_reg?.toLowerCase().includes(query);

    if (!matchesSearch && visitor.custom_data) {
      matchesSearch = Object.values(visitor.custom_data).some((value) =>
        value && value.toLowerCase().includes(query)
      );
    }

    return matchesSearch && (statusFilter === "all" || visitor.status === statusFilter);
  });
}

export function getDynamicGateQrUrl(
  origin: string,
  companyId: string | null,
  guardGateId: string | null,
  qrTimestamp: number,
) {
  if (!companyId) return "";
  const queryParams = new URLSearchParams();
  if (guardGateId) queryParams.append("gateId", guardGateId);
  queryParams.append("t", qrTimestamp.toString());
  return `${origin}/${companyId}/gate?${queryParams.toString()}`;
}

export function printGateQrPoster(
  origin: string,
  companyId: string | null,
  guardGateId: string | null,
  guardGateName: string,
) {
  const url = `${origin}/${companyId}/gate${guardGateId ? `?gateId=${guardGateId}` : ""}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(url)}`;
  const printWindow = window.open("", "", "width=800,height=800");

  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Print Gate QR Code</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; color: #18181b; }
          .container { text-align: center; border: 2px dashed #e4e4e7; padding: 40px; border-radius: 24px; max-width: 500px; }
          h1 { margin-bottom: 8px; font-size: 36px; font-weight: 900; letter-spacing: -0.02em; }
          p { color: #71717a; margin-bottom: 32px; font-size: 18px; font-weight: 500; }
          img { width: 300px; height: 300px; display: block; margin: 0 auto; border-radius: 12px; }
          .footer { margin-top: 32px; font-size: 16px; color: #a1a1aa; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
          @media print { .container { border: none; padding: 0; } }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Scan to Check In</h1>
          <p>Point your smartphone camera at this code to register your visit.</p>
          <img src="${qrUrl}" onload="setTimeout(() => { window.print(); window.close(); }, 500);" />
          <div class="footer">${guardGateName}</div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
}
