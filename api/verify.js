import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id, otp, signature_image } = req.body

  const { data: contract, error: fetchError } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !contract) {
    return res.status(404).json({ error: 'Hợp đồng không tồn tại' })
  }

  if (contract.otp !== otp) {
    return res.status(400).json({ error: 'Mã OTP không chính xác' })
  }

  const { error: updateError } = await supabase
    .from('contracts')
    .update({
      status: 'Đã xác nhận',
      confirmation_time: new Date().toISOString(),
      signature_image
    })
    .eq('id', id)

  if (updateError) {
    return res.status(500).json({ error: updateError.message })
  }

  return res.status(200).json({ success: true })
}
