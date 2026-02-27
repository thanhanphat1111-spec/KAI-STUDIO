import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { otp, signature_image } = req.body;

  const { data: contract } = await supabase
    .from("contracts")
    .select("*")
    .eq("id", id)
    .single();

  if (!contract) {
    return res.status(404).json({ error: "Contract not found" });
  }

  if (contract.otp !== otp) {
    return res.status(400).json({ error: "OTP không đúng" });
  }

  const { error } = await supabase
    .from("contracts")
    .update({
      status: "Đã xác nhận",
      confirmation_time: new Date(),
      signature_image
    })
    .eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}
