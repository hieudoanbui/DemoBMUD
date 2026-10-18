import { axiosClient } from './axiosClient';
export const authApi = {
  me: () => axiosClient.get('/auth/me'),
  login: (mode, credentials) => axiosClient.post(`/${mode}/login`, credentials),
  logout: () => axiosClient.post('/auth/logout'),
};
