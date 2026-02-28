import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import SignatureCanvas from "react-signature-canvas"

export default function Confirm() {
  const { id } = useParams()
  const [contract, setContract] = useState<any>(null)
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(true)
  const [sigRef, setSigRef] = useState<any>(null)

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const res = await fetch(`/api/contracts/${id}`)
        
        if (!res.ok) {
          setContract(null)
          return
        }

        const data = await res.json()
        setContract(data)
      } catch (err) {
        console.error(err)
        setContract(null)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchContract()
  }, [id])

  const handleVerify = async () => {
    const signature = sigRef?.toDataURL()

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          otp,
          signature
        })
      })

      const data = await res.json()
      alert(data.message)
    } catch (err) {
      alert("Lỗi xác nhận hợp đồng")
    }
  }

  if (loading) return <div className="text-center mt-10">Đang tải...</div>
  if (!contract) return <div className="text-center mt-10">Hợp đồng không tồn tại</div>

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-6 p-4">
      <h1 className="text-2xl font-bold text-center">Xác Nhận Hợp Đồng</h1>

      <div className="space-y-2">
        <p><b>Khách hàng:</b> {contract.customer_name}</p>
        <p><b>Giá trị:</b> {contract.contract_value} đ</p>
      </div>

      <a
        href={contract.contract_link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
      >
        Xem hợp đồng trên Google Drive
      </a>

      <input
        type="text"
        placeholder="Nhập OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="border p-2 w-full"
      />

      <div className="border">
        <SignatureCanvas
          penColor="black"
          canvasProps={{ width: 500, height: 200 }}
          ref={(ref) => setSigRef(ref)}
        />
      </div>

      <button
        onClick={handleVerify}
        className="bg-blue-600 text-white p-3 w-full rounded"
      >
        Xác nhận & Ký
      </button>
    </div>
  )
}
