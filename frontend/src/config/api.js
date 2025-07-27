const isDevelopment = process.env.NODE_ENV === 'development';

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000'  // Development - kết nối trực tiếp
  : '';  // Production - dùng đường dẫn tương đối, proxy /api/ đã được nginx chuyển

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    VERIFY: '/api/v1/auth/verify'
  },
  HEALTH: '/api/v1/health'
};

