import CartPageClient from '@/components/CartPageClient';

export const metadata = {
  title: 'Giỏ hàng của tôi | FPT Long Châu',
  description: 'Xem lại các sản phẩm thuốc, thực phẩm chức năng, mỹ phẩm đã chọn và tiến hành đặt hàng.'
};

export default function CartPage() {
  return <CartPageClient />;
}
