import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" });

  const { id } = req.query;

  // Xóa hợp đồng dựa vào ID
  const { error } = await supabase.from("contracts").delete().eq("id", Number(id));

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ success: true, message: "Đã xóa hợp đồng thành công" });
}
