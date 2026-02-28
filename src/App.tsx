import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { Plus, FileText, CheckCircle, Clock, ExternalLink, Send, Trash2, LayoutDashboard, Database as DatabaseIcon } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { format } from 'date-fns';
import { cn } from './lib/utils';
import { Contract } from './types';

// --- Components ---

const AdminDashboard = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'data'>('create');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    phone_number: '',
    contract_type: 'Hợp đồng thiết kế kiến trúc',
    contract_value: '',
    contract_link: ''
  });

  const formatNumber = (val: string) => {
    if (!val) return '';
    const num = val.replace(/\D/g, '');
    return new Intl.NumberFormat('vi-VN').format(parseInt(num));
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, contract_value: rawValue });
  };
  const [lastCreated, setLastCreated] = useState<{ otp: string; link: string } | null>(null);

  const fetchContracts = async () => {
    try {
      const res = await fetch('/api/contracts');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setContracts(data);
    } catch (error) {
      console.error('Failed to fetch contracts', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'data') {
      fetchContracts();
    }
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          contract_value: parseFloat(formData.contract_value)
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create contract');
      }
      
      const data = await res.json();
      setLastCreated({ otp: data.otp, link: data.confirmationLink });
      setFormData({
        customer_name: '',
        phone_number: '',
        contract_type: 'Hợp đồng dịch vụ',
        contract_value: '',
        contract_link: ''
      });
      alert('Hợp đồng đã được tạo thành công!');
    } catch (error: any) {
      console.error('Error creating contract:', error);
      alert('Có lỗi xảy ra: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM XỬ LÝ XÓA HỢP ĐỒNG ---
  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa hợp đồng này không? Dữ liệu không thể khôi phục.");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/delete-contract?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Lỗi khi xóa hợp đồng');
      }
      
      alert('Đã xóa hợp đồng thành công!');
      fetchContracts(); // Cập nhật lại danh sách ngay lập tức
    } catch (error: any) {
      alert('Có lỗi xảy ra: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <FileText className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight">ContractFlow</span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('create')}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  activeTab === 'create' ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <div className="flex items-center gap-2">
                  <Plus size={18} />
                  <span>Tạo Hợp Đồng</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  activeTab === 'data' ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <div className="flex items-center gap-2">
                  <DatabaseIcon size={18} />
                  <span>Dữ Liệu</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'create' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Plus className="text-indigo-600" />
                Lập Thông Tin Khách Hàng
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Tên Khách Hàng</label>
                  <input
                    required
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Số Điện Thoại</label>
                  <input
                    required
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="0901234567"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Loại Hợp Đồng</label>
                  <select
                    value={formData.contract_type}
                    onChange={(e) => setFormData({ ...formData, contract_type: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                  >
                    <option>Hợp đồng thiết kế kiến trúc</option>
                    <option>Hợp đồng thiết kế nội thất</option>
                    <option>Hợp đồng thiết kế thi công</option>
                    <option>Hợp đồng thi công xây dựng công trình</option>
                    <option>Hợp đồng dịch vụ</option>
                    <option>Hợp đồng mua bán</option>
                    <option>Hợp đồng lao động</option>
                    <option>Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Giá Trị Hợp Đồng (VNĐ)</label>
                  <input
                    required
                    type="text"
                    value={formatNumber(formData.contract_value)}
                    onChange={handleValueChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="100.000.000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Link Hợp Đồng (Google Drive)</label>
                  <input
                    required
                    type="url"
                    value={formData.contract_link}
                    onChange={(e) => setFormData({ ...formData, contract_link: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="https://drive.google.com/..."
                  />
                </div>
                <button
                  disabled={loading}
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"
                >
                  {loading ? 'Đang xử lý...' : (
                    <>
                      <Send size={20} />
                      Tạo & Gửi OTP
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="space-y-6">
              <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-xl">
                <h3 className="text-xl font-bold mb-4">Hướng dẫn</h3>
                <ul className="space-y-4 text-indigo-100">
                  <li className="flex gap-3">
                    <div className="bg-indigo-800 w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0">1</div>
                    <p>Nhập đầy đủ thông tin khách hàng và link hợp đồng.</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="bg-indigo-800 w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0">2</div>
                    <p>Bấm nút "Tạo & Gửi OTP" để hệ thống tạo mã xác nhận.</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="bg-indigo-800 w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0">3</div>
                    <p>Khách hàng sẽ nhận được link truy cập để nhập OTP và ký tên.</p>
                  </li>
                </ul>
              </div>

              {lastCreated && (
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h4 className="text-emerald-800 font-bold mb-2 flex items-center gap-2">
                    <CheckCircle size={18} />
                    Hợp đồng vừa tạo
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-emerald-100">
                      <span className="text-gray-500">Mã OTP:</span>
                      <span className="font-mono font-bold text-lg text-emerald-600 tracking-widest">{lastCreated.otp}</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-emerald-100">
                      <span className="text-gray-500 block mb-1">Link xác nhận:</span>
                      <a href={lastCreated.link} target="_blank" className="text-indigo-600 break-all hover:underline flex items-center gap-1">
                        {lastCreated.link}
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">Danh Sách Hợp Đồng</h2>
              <button onClick={fetchContracts} className="text-indigo-600 text-sm font-medium hover:underline">Làm mới</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Khách Hàng</th>
                    <th className="px-6 py-4">Loại / Giá Trị</th>
                    <th className="px-6 py-4">Trạng Thái</th>
                    <th className="px-6 py-4">Xác Nhận</th>
                    <th className="px-6 py-4">Chữ Ký</th>
                    <th className="px-6 py-4 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {contracts.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{c.customer_name}</div>
                        <div className="text-xs text-gray-500">{c.phone_number}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium">{c.contract_type}</div>
                        <div className="text-xs text-indigo-600 font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(c.contract_value)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold",
                          c.status === 'Đã xác nhận' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        )}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {c.confirmation_time ? (
                          <div className="text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock size={12} />
                              {format(new Date(c.confirmation_time), 'HH:mm dd/MM/yyyy')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Chưa xác nhận</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {c.signature_image ? (
                          <img src={c.signature_image} alt="Signature" className="h-10 w-auto border border-gray-200 rounded bg-white" />
                        ) : (
                          <div className="h-10 w-20 bg-gray-100 rounded flex items-center justify-center">
                            <span className="text-[10px] text-gray-400">N/A</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-all"
                          title="Xóa hợp đồng này"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {contracts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                        Chưa có dữ liệu hợp đồng nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const CustomerConfirmation = () => {
  const { id } = useParams();
  const [contract, setContract] = useState<Contract | null>(null);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const sigCanvas = useRef<SignatureCanvas>(null);

  useEffect(() => {
    const fetchContract = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/get-contract?id=${id}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Không tìm thấy hợp đồng');
        }
        const data = await res.json();
        setContract(data);
      } catch (error: any) {
        console.error('Failed to fetch contract:', error);
        alert('Lỗi: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchContract();
  }, [id]);

  const handleConfirm = async () => {
    if (!otp) return alert('Vui lòng nhập mã OTP');
    if (sigCanvas.current?.isEmpty()) return alert('Vui lòng ký tên xác nhận');

    setSubmitting(true);
    try {
      const signatureImage = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
      const res = await fetch(`/api/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, otp, signature_image: signatureImage })
      });
      
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        alert(data.error || 'Xác nhận thất bại');
      }
    } catch (error) {
      alert('Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!contract) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Lỗi!</h2>
        <p className="text-gray-600">Hợp đồng không tồn tại hoặc đã bị xóa.</p>
      </div>
    </div>
  );

  if (success || contract.status === 'Đã xác nhận') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center animate-in zoom-in duration-500">
        <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-emerald-600 w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thành Công!</h2>
        <p className="text-gray-600 mb-6">Hợp đồng của bạn đã được xác nhận và ký điện tử thành công.</p>
        <div className="text-sm text-gray-400">Bạn có thể đóng cửa sổ này.</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Xác Nhận Hợp Đồng</h1>
              <p className="text-gray-500">Vui lòng kiểm tra thông tin và ký xác nhận</p>
            </div>
            <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {contract.contract_type}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 bg-gray-50 p-4 rounded-2xl">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Khách hàng</span>
              <p className="font-bold text-gray-800">{contract.customer_name}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Giá trị</span>
              <p className="font-bold text-indigo-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(contract.contract_value)}</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FileText size={16} className="text-indigo-600" />
              Tài liệu hợp đồng
            </h3>
            <a 
              href={contract.contract_link} 
              target="_blank" 
              className="flex items-center justify-between p-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-red-50 p-2 rounded-lg group-hover:bg-red-100 transition-colors">
                  <FileText className="text-red-500" size={20} />
                </div>
                <span className="text-sm font-medium text-gray-700">Xem chi tiết hợp đồng trên Google Drive</span>
              </div>
              <ExternalLink size={16} className="text-gray-400" />
            </a>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Nhập mã OTP</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full text-center text-3xl font-mono font-bold tracking-[0.5em] py-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-500 outline-none transition-all"
                placeholder="000000"
              />
              <p className="text-xs text-gray-400 mt-2 text-center italic">Mã OTP đã được gửi tới số điện thoại của bạn</p>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-sm font-bold text-gray-900">Chữ ký khách hàng</label>
                <button 
                  onClick={() => sigCanvas.current?.clear()} 
                  className="text-xs text-indigo-600 font-medium hover:underline"
                >
                  Xóa chữ ký
                </button>
              </div>
              <div className="border-2 border-gray-100 rounded-2xl bg-gray-50 overflow-hidden h-48">
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor="black"
                  canvasProps={{ className: 'w-full h-full' }}
                />
              </div>
            </div>

            <button
              disabled={submitting}
              onClick={handleConfirm}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              {submitting ? 'Đang xác nhận...' : 'Xác Nhận & Ký Hợp Đồng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- App ---

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/confirm/:id" element={<CustomerConfirmation />} />
      </Routes>
    </Router>
  );
}
