import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { customer_name, phone_number, contract_type, contract_value, contract_link } = req.body

  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  const { data, error } = await supabase
    .from('contracts')
    .insert([{
      customer_name,
      phone_number,
      contract_type,
      contract_value,
      contract_link,
      otp,
      status: 'Chờ xác nhận'
    }])
    .select()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  const contractId = data[0].id

  return res.status(200).json({
    id: contractId,
    otp,
    confirmationLink: `${process.env.FRONTEND_URL}/confirm/${contractId}`
  })
}
