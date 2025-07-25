import { useState } from 'react';

const mockCategories = [
  { id: 1, name: 'Ăn uống', type: 'expense', color: '#f87171', icon: '🍔' },
  { id: 2, name: 'Lương', type: 'income', color: '#34d399', icon: '💰' },
  { id: 3, name: 'Đi lại', type: 'expense', color: '#60a5fa', icon: '🚗' },
];

const typeColors = {
  income: 'bg-green-100 text-green-700',
  expense: 'bg-red-100 text-red-700',
};

export default function AdminCategories() {
  const [categories, setCategories] = useState(mockCategories);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // create | edit | merge | delete
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'expense', color: '#f87171', icon: '🍔' });

  const openModal = (type, cat = null) => {
    setModalType(type);
    setSelectedCategory(cat);
    if (type === 'edit' && cat) setForm(cat);
    else if (type === 'create') setForm({ name: '', type: 'expense', color: '#f87171', icon: '🍔' });
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý danh mục tài chính</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors" onClick={() => openModal('create')}>+ Tạo mới</button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm danh mục..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="overflow-x-auto rounded-xl shadow border">
        <table className="min-w-full bg-white dark:bg-gray-900">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
              <th className="py-3 px-4 text-left">Tên danh mục</th>
              <th className="py-3 px-4 text-left">Loại</th>
              <th className="py-3 px-4 text-left">Màu sắc</th>
              <th className="py-3 px-4 text-left">Biểu tượng</th>
              <th className="py-3 px-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map(cat => (
              <tr key={cat.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="py-3 px-4 font-medium">{cat.name}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${typeColors[cat.type]}`}>{cat.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-block w-6 h-6 rounded-full border" style={{ background: cat.color }}></span>
                </td>
                <td className="py-3 px-4 text-2xl">{cat.icon}</td>
                <td className="py-3 px-4 flex gap-2 justify-center">
                  <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs" onClick={() => openModal('edit', cat)}>Sửa</button>
                  <button className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs" onClick={() => openModal('merge', cat)}>Gộp</button>
                  <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs" onClick={() => openModal('delete', cat)}>Xoá</button>
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
                <h2 className="text-xl font-bold mb-4">Tạo danh mục mới</h2>
                <div className="space-y-3">
                  <input className="w-full px-3 py-2 border rounded" placeholder="Tên danh mục" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
                  <select className="w-full px-3 py-2 border rounded" value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}>
                    <option value="income">Thu nhập</option>
                    <option value="expense">Chi tiêu</option>
                  </select>
                  <input className="w-full px-3 py-2 border rounded" type="color" value={form.color} onChange={e => setForm(f => ({...f, color: e.target.value}))} />
                  <input className="w-full px-3 py-2 border rounded" placeholder="Biểu tượng (emoji)" value={form.icon} onChange={e => setForm(f => ({...f, icon: e.target.value}))} />
                </div>
                <div className="flex gap-2 mt-6">
                  <button className="flex-1 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Lưu</button>
                  <button className="flex-1 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400" onClick={closeModal}>Huỷ</button>
                </div>
              </>
            )}
            {modalType === 'edit' && (
              <>
                <h2 className="text-xl font-bold mb-4">Sửa danh mục</h2>
                <div className="space-y-3">
                  <input className="w-full px-3 py-2 border rounded" placeholder="Tên danh mục" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
                  <select className="w-full px-3 py-2 border rounded" value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}>
                    <option value="income">Thu nhập</option>
                    <option value="expense">Chi tiêu</option>
                  </select>
                  <input className="w-full px-3 py-2 border rounded" type="color" value={form.color} onChange={e => setForm(f => ({...f, color: e.target.value}))} />
                  <input className="w-full px-3 py-2 border rounded" placeholder="Biểu tượng (emoji)" value={form.icon} onChange={e => setForm(f => ({...f, icon: e.target.value}))} />
                </div>
                <div className="flex gap-2 mt-6">
                  <button className="flex-1 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Lưu</button>
                  <button className="flex-1 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400" onClick={closeModal}>Huỷ</button>
                </div>
              </>
            )}
            {modalType === 'merge' && (
              <>
                <h2 className="text-xl font-bold mb-4">Gộp danh mục</h2>
                <div className="space-y-3">
                  <p>Chọn danh mục muốn gộp vào <b>{selectedCategory?.name}</b>:</p>
                  <select className="w-full px-3 py-2 border rounded">
                    {categories.filter(c => c.id !== selectedCategory?.id).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 mt-6">
                  <button className="flex-1 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Gộp</button>
                  <button className="flex-1 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400" onClick={closeModal}>Huỷ</button>
                </div>
              </>
            )}
            {modalType === 'delete' && (
              <>
                <h2 className="text-xl font-bold mb-4 text-red-600">Xác nhận xoá danh mục</h2>
                <p className="mb-6">Bạn có chắc chắn muốn xoá danh mục <b>{selectedCategory?.name}</b>? Hành động này không thể hoàn tác.</p>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-red-500 text-white rounded hover:bg-red-600">Xoá</button>
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