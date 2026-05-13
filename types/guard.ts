export type Visitor = {
  id: string;
  name: string;
  phone: string;
  status: "pending" | "checked_in" | "checked_out" | "auto_checked_out";
  created_at: string;
  checked_in_at?: string;
  document_type: string;
  id_number?: string;
  otp_code?: string;
  company_id: string;
  photo_url?: string;
  host_id?: string | null;
  host_name?: string;
  host_confirmed?: boolean;
  purpose?: string;
  vehicle_reg?: string;
  custom_data?: Record<string, string>;
  gate_id?: string | null;
};

export type CustomField = {
  id: string;
  label: string;
};
