import { useEffect, useState } from 'react';
import { adminTransactionApi } from '../services/adminTransactionApi';

const typeColors = {
  income: 'bg-green-100 text-green-700',
  expense: 'bg-red-100 text-red-700',
};

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // create | edit | detail | delete
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [form, setForm] = useState({ user: '', type: 'income', category: '', amount: '', date: '', note: '' });
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line
  }, [search, typeFilter, categoryFilter]);

  const fetchTransactions = async () => {
    setLoading(true);
    const params = {
      search,
      type: typeFilter !== 'all' ? typeFilter : undefined,
      category: categoryFilter !== 'all' ? categoryFilter : undefined
    };
    const res = await adminTransactionApi.getAll(params, token);
    setTransactions(res.data || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    setLoading(true);
    await adminTransactionApi.create(form, token);
    setShowModal(false);
    fetchTransactions();
    setLoading(false);
  };
  const handleUpdate = async () => {
    setLoading(true);
    await adminTransactionApi.update(selectedTransaction._id, form, token);
    setShowModal(false);
    fetchTransactions();
    setLoading(false);
  };
  const handleDelete = async () => {
    setLoading(true);
    await adminTransactionApi.remove(selectedTransaction._id, token);
    setShowModal(false);
    fetchTransactions();
    setLoading(false);
  };

  const openModal = (type, tx = null) => {
    setModalType(type);
    setSelectedTransaction(tx);
    if (type === 'edit' && tx) setForm(tx);
    else if (type === 'create') setForm({ user: '', type: 'income', category: '', amount: '', date: '', note: '' });
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý thu chi</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors" onClick={() => openModal('create')}>+ Tạo mới</button>
      </div>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo người dùng, ghi chú..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 w-1/3"
        />
        <select className="px-3 py-2 border rounded-lg" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="all">Tất cả loại</option>
          <option value="income">Thu nhập</option>
          <option value="expense">Chi tiêu</option>
        </select>
        <select className="px-3 py-2 border rounded-lg" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="all">Tất cả danh mục</option>
          <option value="Lương">Lương</option>
          <option value="Ăn uống">Ăn uống</option>
          <option value="Đi lại">Đi lại</option>
        </select>
      </div>
      <div className="overflow-x-auto rounded-xl shadow border">
        <table className="min-w-full bg-white dark:bg-gray-900">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
              <th className="py-3 px-4 text-left">Người dùng</th>
              <th className="py-3 px-4 text-left">Loại</th>
              <th className="py-3 px-4 text-left">Danh mục</th>
              <th className="py-3 px-4 text-right">Số tiền</th>
              <th className="py-3 px-4 text-left">Ngày</th>
              <th className="py-3 px-4 text-left">Ghi chú</th>
              <th className="py-3 px-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {transactions.filter(tx =>
              (search === '' || tx.user.toLowerCase().includes(search.toLowerCase()) || tx.note.toLowerCase().includes(search.toLowerCase())) &&
              (typeFilter === 'all' || tx.type === typeFilter) &&
              (categoryFilter === 'all' || tx.category === categoryFilter)
            ).map(tx => (
              <tr key={tx.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="py-3 px-4 font-medium">{tx.user}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${typeColors[tx.type]}`}>{tx.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}</span>
                </td>
                <td className="py-3 px-4">{tx.category}</td>
                <td className="py-3 px-4 text-right">{tx.amount.toLocaleString('vi-VN')} ₫</td>
                <td className="py-3 px-4">{tx.date}</td>
                <td className="py-3 px-4">{tx.note}</td>
                <td className="py-3 px-4 flex gap-2 justify-center">
                  <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs" onClick={() => openModal('edit', tx)}>Sửa</button>
                  <button className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs" onClick={() => openModal('detail', tx)}>Chi tiết</button>
                  <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs" onClick={() => openModal('delete', tx)}>Xoá</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-blur flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            {modalType === 'create' && (
              <>
                <h2 className="text-xl font-bold mb-4">Tạo giao dịch mới</h2>
                <div className="space-y-3">
                  <input className="w-full px-3 py-2 border rounded" placeholder="Người dùng" value={form.user} onChange={e => setForm(f => ({...f, user: e.target.value}))} />
                  <select className="w-full px-3 py-2 border rounded" value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}>
                    <option value="income">Thu nhập</option>
                    <option value="expense">Chi tiêu</option>
                  </select>
                  <input className="w-full px-3 py-2 border rounded" placeholder="Danh mục" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} />
                  <input className="w-full px-3 py-2 border rounded" placeholder="Số tiền" type="number" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} />
                  <input className="w-full px-3 py-2 border rounded" placeholder="Ngày" type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} />
                  <input className="w-full px-3 py-2 border rounded" placeholder="Ghi chú" value={form.note} onChange={e => setForm(f => ({...f, note: e.target.value}))} />
                </div>
                <div className="flex gap-2 mt-6">
                  <button className="flex-1 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700" onClick={handleCreate} disabled={loading}>{loading ? 'Đang tạo...' : 'Lưu'}</button>
                  <button className="flex-1 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400" onClick={closeModal}>Huỷ</button>
                </div>
              </>
            )}
            {modalType === 'edit' && (
              <>
                <h2 className="text-xl font-bold mb-4">Sửa giao dịch</h2>
                <div className="space-y-3">
                  <input className="w-full px-3 py-2 border rounded" placeholder="Người dùng" value={form.user} onChange={e => setForm(f => ({...f, user: e.target.value}))} />
                  <select className="w-full px-3 py-2 border rounded" value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}>
                    <option value="income">Thu nhập</option>
                    <option value="expense">Chi tiêu</option>
                  </select>
                  <input className="w-full px-3 py-2 border rounded" placeholder="Danh mục" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} />
                  <input className="w-full px-3 py-2 border rounded" placeholder="Số tiền" type="number" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} />
                  <input className="w-full px-3 py-2 border rounded" placeholder="Ngày" type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} />
                  <input className="w-full px-3 py-2 border rounded" placeholder="Ghi chú" value={form.note} onChange={e => setForm(f => ({...f, note: e.target.value}))} />
                </div>
                <div className="flex gap-2 mt-6">
                  <button className="flex-1 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700" onClick={handleUpdate} disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu'}</button>
                  <button className="flex-1 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400" onClick={closeModal}>Huỷ</button>
                </div>
              </>
            )}
            {modalType === 'detail' && (
              <>
                <h2 className="text-xl font-bold mb-4">Chi tiết giao dịch</h2>
                <div className="space-y-2">
                  <div><b>Người dùng:</b> {selectedTransaction?.user}</div>
                  <div><b>Loại:</b> {selectedTransaction?.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}</div>
                  <div><b>Danh mục:</b> {selectedTransaction?.category}</div>
                  <div><b>Số tiền:</b> {selectedTransaction?.amount?.toLocaleString('vi-VN')} ₫</div>
                  <div><b>Ngày:</b> {selectedTransaction?.date}</div>
                  <div><b>Ghi chú:</b> {selectedTransaction?.note}</div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button className="flex-1 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400" onClick={closeModal}>Đóng</button>
                </div>
              </>
            )}
            {modalType === 'delete' && (
              <>
                <h2 className="text-xl font-bold mb-4 text-red-600">Xác nhận xoá giao dịch</h2>
                <p className="mb-6">Bạn có chắc chắn muốn xoá giao dịch này? Hành động này không thể hoàn tác.</p>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-red-500 text-white rounded hover:bg-red-600" onClick={handleDelete} disabled={loading}>{loading ? 'Đang xoá...' : 'Xoá'}</button>
                  <button className="flex-1 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400" onClick={closeModal}>Huỷ</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 