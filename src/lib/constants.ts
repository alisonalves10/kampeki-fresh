// Order Status Labels in Portuguese
export const ORDER_STATUS_LABELS = {
  pending: 'Pendente',
  accepted: 'Aceito',
  preparing: 'Preparando',
  sent: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
} as const;

export type OrderStatus = keyof typeof ORDER_STATUS_LABELS;

export const getOrderStatusLabel = (status: string): string => {
  return ORDER_STATUS_LABELS[status as OrderStatus] || status;
};

export const ORDER_STATUS_COLORS = {
  pending: 'bg-yellow-500/10 text-yellow-500',
  accepted: 'bg-blue-500/10 text-blue-500',
  preparing: 'bg-purple-500/10 text-purple-500',
  sent: 'bg-cyan-500/10 text-cyan-500',
  delivered: 'bg-green-500/10 text-green-500',
  cancelled: 'bg-red-500/10 text-red-500',
} as const;

export const getOrderStatusColor = (status: string): string => {
  return ORDER_STATUS_COLORS[status as OrderStatus] || 'bg-gray-500/10 text-gray-500';
};
