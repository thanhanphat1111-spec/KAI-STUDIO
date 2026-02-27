import { useState } from "react"

export default function Home() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.target)

    const res = await fetch("/api/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: form.get("customer_name"),
        phone_number: form.get("phone_number"),
        contract_type: form.get("contract_type"),
        contract_value: form.get("contract_value"),
        contract_link: form.get("contract_link"),
      }),
    })

    const data = await res.json()
    alert("Hợp đồng đã được tạo thành công!")
    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Tạo Hợp Đồng</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="customer_name" placeholder="Tên khách hàng" className="border p-2 w-full" />
        <input name="phone_number" placeholder="Số điện thoại" className="border p-2 w-full" />
        <input name="contract_type" placeholder="Loại hợp đồng" className="border p-2 w-full" />
        <input name="contract_value" placeholder="Giá trị hợp đồng" className="border p-2 w-full" />
        <input name="contract_link" placeholder="Link Google Drive" className="border p-2 w-full" />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white p-3 w-full rounded"
        >
          {loading ? "Đang xử lý..." : "Tạo & Gửi OTP"}
        </button>
      </form>
    </div>
  )
}
