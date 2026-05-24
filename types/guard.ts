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
  pass_token?: string | null;
  pass_code?: string | null;
  pass_expired_at?: string | null;
  verification_method?: string | null;
  company_id: string;
  photo_url?: string;
  host_id?: string | null;
  host_name?: string;
  host_confirmed?: boolean;
  host_confirmed_at?: string | null;
  purpose?: string;
  vehicle_reg?: string;
  custom_data?: Record<string, string>;
  gate_id?: string | null;
};

export type CustomField = {
  id: string;
  label: string;
};
