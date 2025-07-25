import { useState } from 'react';

const defaultSettings = {
  logo: '',
  siteName: 'Quản lý Tài chính',
  language: 'vi',
  timezone: 'Asia/Ho_Chi_Minh',
  currency: 'VND',
  email: 'admin@example.com',
  notifications: true,
};

const languages = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'English' },
];
const timezones = [
  { value: 'Asia/Ho_Chi_Minh', label: 'GMT+7 (Việt Nam)' },
  { value: 'Asia/Bangkok', label: 'GMT+7 (Bangkok)' },
  { value: 'Asia/Tokyo', label: 'GMT+9 (Tokyo)' },
];
const currencies = [
  { value: 'VND', label: 'VNĐ' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
];

export default function AdminSystemSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [logoPreview, setLogoPreview] = useState('');

  const handleChange = (key, value) => setSettings(s => ({ ...s, [key]: value }));
  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
      handleChange('logo', file.name);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Cấu hình hệ thống</h1>
      <div className="space-y-6 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow border">
        <div>
          <label className="block font-medium mb-2">Logo website</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border">
              {logoPreview ? (
                <img src={logoPreview} alt="logo preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">🌐</span>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleLogo} className="block" />
          </div>
        </div>
        <div>
          <label className="block font-medium mb-2">Tên website</label>
          <input className="w-full px-3 py-2 border rounded" value={settings.siteName} onChange={e => handleChange('siteName', e.target.value)} />
        </div>
        <div>
          <label className="block font-medium mb-2">Ngôn ngữ</label>
          <select className="w-full px-3 py-2 border rounded" value={settings.language} onChange={e => handleChange('language', e.target.value)}>
            {languages.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-2">Múi giờ</label>
          <select className="w-full px-3 py-2 border rounded" value={settings.timezone} onChange={e => handleChange('timezone', e.target.value)}>
            {timezones.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-2">Đơn vị tiền tệ</label>
          <select className="w-full px-3 py-2 border rounded" value={settings.currency} onChange={e => handleChange('currency', e.target.value)}>
            {currencies.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-2">Email quản trị</label>
          <input className="w-full px-3 py-2 border rounded" value={settings.email} onChange={e => handleChange('email', e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={settings.notifications} onChange={e => handleChange('notifications', e.target.checked)} id="notif" />
          <label htmlFor="notif" className="font-medium">Bật thông báo hệ thống</label>
        </div>
        <div className="flex gap-2 mt-6">
          <button className="flex-1 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Lưu thay đổi</button>
          <button className="flex-1 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">Huỷ</button>
        </div>
      </div>
    </div>
  );
} 