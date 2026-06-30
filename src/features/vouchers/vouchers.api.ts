import axios from 'axios';
import type { CreateVoucherDto, Voucher, VouchersResponse } from './vouchers.types';

export const getVouchers = async (params?: { skip?: number; take?: number; search?: string; status?: string }) => {
  const { data } = await axios.get<VouchersResponse>('/api/v1/vouchers/admin', { params });
  return data;
};

export const createVoucher = async (dto: CreateVoucherDto) => {
  const { data } = await axios.post<Voucher>('/api/v1/vouchers/admin', dto);
  return data;
};

export const approveVoucher = async (id: string) => {
  const { data } = await axios.post<Voucher>(`/api/v1/vouchers/admin/${id}/approve`);
  return data;
};

export const rejectVoucher = async (id: string) => {
  const { data } = await axios.post<Voucher>(`/api/v1/vouchers/admin/${id}/reject`);
  return data;
};
