import { axiosClient } from './axiosClient';
export const phoneApi = { search: (mode, q, signal) => axiosClient.get(`/${mode}/phones/search`, { params: { q }, signal }) };
