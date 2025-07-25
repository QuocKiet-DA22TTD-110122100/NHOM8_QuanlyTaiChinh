import { useState } from 'react';

const mockUsers = [
  { id: 1, name: 'Nguyễn Văn A', email: 'a@example.com', role: 'user', status: 'active' },
  { id: 2, name: 'Trần Thị B', email: 'b@example.com', role: 'admin', status: 'active' },
  { id: 3, name: 'Lê Văn C', email: 'c@example.com', role: 'ketoan', status: 'locked' },
];

const roleColors = {
  user: 'bg-blue-100 text-blue-700',
  admin: 'bg-green-100 text-green-700',
  ketoan: 'bg-yellow-100 text-yellow-700',
};

const roles = [
  { value: 'user', label: 'Người dùng' },
  { value: 'admin', label: 'Quản trị viên' },
  { value: 'ketoan', label: 'Kế toán' },
];

export default function AdminUsers() {
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // create | edit | role | lock | delete
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'user', status: 'active' });

  const openModal = (type, user = null) => {
    setModalType(type);
    setSelectedUser(user);
    if (type === 'edit' && user) setForm(user);
    else if (type === 'create') setForm({ name: '', email: '', role: 'user', status: 'active' });
    else if (type === 'role' && user) setForm({ ...user });
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors" onClick={() => openModal('create')}>+ Tạo mới</button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="overflow-x-auto rounded-xl shadow border">
        <table className="min-w-full bg-white dark:bg-gray-900">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
              <th className="py-3 px-4 text-left">Họ tên</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Quyền</th>
              <th className="py-3 px-4 text-left">Trạng thái</th>
              <th className="py-3 px-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())).map(user => (
              <tr key={user.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="py-3 px-4 font-medium">{user.name}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${roleColors[user.role]}`}>{user.role}</span>
                </td>
                <td className="py-3 px-4">
                  {user.status === 'active' ? (
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">Hoạt động</span>
                  ) : (
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">Đã khoá</span>
                  )}
                </td>
                <td className="py-3 px-4 flex gap-2 justify-center">
                  <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs" onClick={() => openModal('edit', user)}>Sửa</button>
                  <button className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs" onClick={() => openModal('role', user)}>Phân quyền</button>
                  {user.status === 'active' ? (
                    <button className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs" onClick={() => openModal('lock', user)}>Khoá</button>
                  ) : (
                    <button className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs" onClick={() => openModal('lock', user)}>Mở khoá</button>
                  )}
                  <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs" onClick={() => openModal('delete', user)}>Xoá</button>
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
            {/* Modal content by type */}
            {modalType === 'create' && (
              <>
                <h2 className="text-xl font-bold mb-4">Tạo người dùng mới</h2>
                <div className="space-y-3">
                  <input className="w-full px-3 py-2 border rounded" placeholder="Họ tên" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
                  <input className="w-full px-3 py-2 border rounded" placeholder="Email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
                  <select className="w-full px-3 py-2 border rounded" value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}>
                    {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div className="flex gap-2 mt-6">
                  <button className="flex-1 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Lưu</button>
                  <button className="flex-1 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400" onClick={closeModal}>Huỷ</button>
                </div>
              </>
            )}
            {modalType === 'edit' && (
              <>
                <h2 className="text-xl font-bold mb-4">Sửa thông tin người dùng</h2>
                <div className="space-y-3">
                  <input className="w-full px-3 py-2 border rounded" placeholder="Họ tên" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
                  <input className="w-full px-3 py-2 border rounded" placeholder="Email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
                  <select className="w-full px-3 py-2 border rounded" value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}>
                    {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div className="flex gap-2 mt-6">
                  <button className="flex-1 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Lưu</button>
                  <button className="flex-1 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400" onClick={closeModal}>Huỷ</button>
                </div>
              </>
            )}
            {modalType === 'role' && (
              <>
                <h2 className="text-xl font-bold mb-4">Phân quyền người dùng</h2>
                <div className="space-y-3">
                  <select className="w-full px-3 py-2 border rounded" value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}>
                    {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div className="flex gap-2 mt-6">
                  <button className="flex-1 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Cập nhật</button>
                  <button className="flex-1 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400" onClick={closeModal}>Huỷ</button>
                </div>
              </>
            )}
            {modalType === 'lock' && (
              <>
                <h2 className="text-xl font-bold mb-4">{selectedUser?.status === 'active' ? 'Khoá tài khoản' : 'Mở khoá tài khoản'}</h2>
                <p className="mb-6">Bạn có chắc chắn muốn {selectedUser?.status === 'active' ? 'khoá' : 'mở khoá'} tài khoản <b>{selectedUser?.name}</b>?</p>
                <div className="flex gap-2">
                  <button className={`flex-1 py-2 ${selectedUser?.status === 'active' ? 'bg-gray-500 hover:bg-gray-600' : 'bg-green-500 hover:bg-green-600'} text-white rounded`}>{selectedUser?.status === 'active' ? 'Khoá' : 'Mở khoá'}</button>
                  <button className="flex-1 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400" onClick={closeModal}>Huỷ</button>
                </div>
              </>
            )}
            {modalType === 'delete' && (
              <>
                <h2 className="text-xl font-bold mb-4 text-red-600">Xác nhận xoá người dùng</h2>
                <p className="mb-6">Bạn có chắc chắn muốn xoá tài khoản <b>{selectedUser?.name}</b>? Hành động này không thể hoàn tác.</p>
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