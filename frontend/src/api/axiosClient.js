import axios from 'axios';

export const axiosClient = axios.create({ baseURL: '/api', withCredentials: true, timeout: 15000 });
export function apiError(error) {
  return error.response?.data?.error || (error.code === 'ECONNABORTED'
    ? 'MySQL phản hồi quá lâu. Kiểm tra kết nối backend và Aiven.'
    : 'Không kết nối được backend. Hãy kiểm tra backend/.env và khởi động API.');
}
