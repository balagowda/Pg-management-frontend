import { apiClient } from '../client';
import type { PaymentDto } from '../types';

export interface ListPaymentsParams {
  month?: string;
  pgId?: string;
  guestId?: string;
}

export function listPayments(params: ListPaymentsParams = {}) {
  return apiClient.get<PaymentDto[]>('/payments', { params }).then((res) => res.data);
}

export function createPayment(payment: PaymentDto) {
  return apiClient.post<PaymentDto>('/payments', payment).then((res) => res.data);
}

export function updatePayment(payment: PaymentDto) {
  return apiClient.put<PaymentDto>(`/payments/${payment.id}`, payment).then((res) => res.data);
}

export function deletePayment(id: string) {
  return apiClient.delete(`/payments/${id}`);
}
