import axios from 'axios';

const API_URL = '/api/payments';

export const getPayments = () => axios.get(API_URL);
export const getPayment = (id: string) => axios.get(`${API_URL}/${id}`);
export const createPayment = (data: any) => axios.post(API_URL, data);
export const updatePayment = (id: string, data: any) => axios.patch(`${API_URL}/${id}`, data);
export const deletePayment = (id: string) => axios.delete(`${API_URL}/${id}`);
