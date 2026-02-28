import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" });

  const { id } = req.query;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Chưa đăng nhập!" });

  // Xác thực token của user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: "Token không hợp lệ!" });

  // ĐÃ THÊM 3 EMAIL ADMIN VÀO ĐÂY
  const ADMIN_EMAILS = [
    "luat.marstudioo@gmail.com", 
    "kaistudio@gmail.com", 
    "vietphuoctran11@gmail.com"
  ];

  if (!ADMIN_EMAILS.includes(user.email)) {
    return res.status(403).json({ error: "Bạn không có quyền xóa dữ liệu!" });
  }

  // Nếu là admin thì tiến hành xóa
  const { error } = await supabase.from("contracts").delete().eq("id", Number(id));

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ success: true, message: "Đã xóa hợp đồng thành công" });
}
