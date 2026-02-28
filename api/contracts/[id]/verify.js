import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { id } = req.query;
  const { otp, signature_image } = req.body;

  const { data: contract } = await supabase
    .from("contracts")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (!contract) return res.status(404).json({ error: "Contract not found" });
  if (contract.otp !== otp) return res.status(400).json({ error: "Mã OTP không chính xác" });

  const { error } = await supabase
    .from("contracts")
    .update({
      status: "Đã xác nhận",
      confirmation_time: new Date().toISOString(),
      signature_image
    })
    .eq("id", Number(id));

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ success: true, message: "Xác nhận hợp đồng thành công!" });
}
