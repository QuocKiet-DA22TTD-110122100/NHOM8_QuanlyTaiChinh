import { useState } from 'react';
import { toast } from 'react-toastify';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

function ensureUserFields(user, formData) {
  return {
    name: user?.name || formData?.name || 'User',
    email: user?.email || formData?.email || '',
    role: user?.role || 'user',
    ...user
  };
}

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? API_ENDPOINTS.AUTH.LOGIN : API_ENDPOINTS.AUTH.REGISTER;
      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      console.log('🔍 Debug - API URL:', `${API_BASE_URL}${endpoint}`);
      console.log('🔍 Debug - Request body:', body);
      console.log('🔍 Debug - API_BASE_URL:', API_BASE_URL);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      console.log('🔍 Debug - Response status:', response.status);
      const data = await response.json();
      console.log('🔍 Debug - Response data:', data);

      if (data.success) {
        if (isLogin) {
          localStorage.setItem('token', data.token);
          if (data.user) {
            const safeUser = ensureUserFields(data.user, formData);
            localStorage.setItem('user', JSON.stringify(safeUser));
          }
          toast.success('Đăng nhập thành công');
          onLogin(data.token);
        } else {
          // Đăng ký thành công, tự động đăng nhập
          try {
            const loginResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: formData.email, password: formData.password })
            });
            const loginData = await loginResponse.json();
            if (loginData.success) {
              localStorage.setItem('token', loginData.token);
              if (loginData.user) {
                const safeUser = ensureUserFields(loginData.user, formData);
                localStorage.setItem('user', JSON.stringify(safeUser));
              }
              toast.success('Đăng ký & đăng nhập thành công!');
              onLogin(loginData.token);
            } else {
              setError(loginData.message || 'Đăng ký thành công nhưng đăng nhập thất bại.');
              toast.error(loginData.message || 'Đăng ký thành công nhưng đăng nhập thất bại.');
              setIsLogin(true);
              setFormData({ email: formData.email, password: '', name: '' });
            }
          } catch (err) {
            setError('Đăng ký thành công nhưng lỗi đăng nhập: ' + err.message);
            toast.error('Đăng ký thành công nhưng lỗi đăng nhập: ' + err.message);
            setIsLogin(true);
            setFormData({ email: formData.email, password: '', name: '' });
          }
        }
      } else {
        setError(data.message || 'Có lỗi xảy ra');
        toast.error(data.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
      toast.error('Lỗi kết nối: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm handleRipple cho nút
  const handleRipple = (e) => {
    const button = e.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${e.clientY - button.getBoundingClientRect().top - radius}px`;
    circle.classList.add('ripple');
    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) ripple.remove();
    button.appendChild(circle);
  };

  const showCustomToast = (message, type = 'success') => {
    toast(
      <div className="custom-toast">
        <span className="icon">{type === 'success' ? '🎉' : '⚠️'}</span>
        {message}
      </div>,
      {
        position: 'top-right',
        autoClose: 3500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: 'custom-toast',
        bodyClassName: 'custom-toast',
        icon: false
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              {isLogin ? 'Đăng nhập' : 'Đăng ký'}
            </h2>
            <p className="text-gray-600 mt-2">
              {isLogin ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
            
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên</label>
                <input
                  type="text"
                  placeholder="Nhập họ tên"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                placeholder="Nhập email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              onClick={handleRipple}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center relative overflow-hidden"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                isLogin ? 'Đăng nhập' : 'Đăng ký'
              )}
            </button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setFormData({ email: '', password: '', name: '' });
                }}
                className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
              >
                {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;


