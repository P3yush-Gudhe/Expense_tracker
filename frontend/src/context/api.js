import axios from 'axios';

const API = axios.create({ baseURL: "expensetracker-production-fc51.up.railway.app"});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
