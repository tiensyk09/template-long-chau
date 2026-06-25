import OrdersPageClient from '@/components/OrdersPageClient';

export const metadata = {
  title: 'Tra cứu & Lịch sử đơn hàng | FPT Long Châu',
  description: 'Nhập mã đơn hàng hoặc số điện thoại của bạn để tra cứu thông tin vận chuyển, trạng thái giao hàng.'
};

export default function OrdersPage() {
  return <OrdersPageClient />;
}
