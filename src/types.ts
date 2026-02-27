export interface Contract {
  id: number;
  customer_name: string;
  phone_number: string;
  contract_type: string;
  contract_value: number;
  contract_link: string;
  otp: string;
  status: 'Chờ xác nhận' | 'Đã xác nhận';
  confirmation_time?: string;
  signature_image?: string;
  created_at: string;
}
