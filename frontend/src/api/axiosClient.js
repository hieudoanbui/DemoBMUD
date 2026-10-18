import axios from 'axios';

export const axiosClient = axios.create({
  baseURL: '/api', withCredentials: true, timeout: 15000,
  headers: { 'X-Lab-Trace': 'omit' },
});
export function apiError(error) {
  if (error.response?.data?.code === 'INVALID_CREDENTIALS') return 'Tên đăng nhập hoặc mật khẩu không đúng';
  return 'Có lỗi xảy ra, vui lòng thử lại';
}
