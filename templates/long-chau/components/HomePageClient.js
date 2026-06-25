'use client';
import { useState } from 'react';
import BlockRenderer from '@/components/BlockRenderer';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HomePageClient({ initialLayout }) {
  const [indexLayout] = useState(initialLayout || null);

  const fallbackLayout = [
    {
      id: "b_hero_index",
      type: "hero",
      visible: true,
      configs: {
        title: "Nhà thuốc FPT Long Châu",
        description: "Chuyên thuốc theo đơn · Tư vấn dược sĩ 24/7 · Giao hàng nhanh 3h",
        searchPlaceholder: "Tìm tên thuốc, biệt dược, thực phẩm chức năng...",
        hotline: "1800 6928",
        shippingText: "Giao hàng hỏa tốc trong 3 giờ · Miễn phí giao đơn từ 150k"
      }
    },
    {
      id: "b_flashsale_index",
      type: "flashsale",
      visible: true,
      configs: {
        title: "FLASH SALE GIÁ TỐT",
        duration: 7200,
        items: [
          { name: "Sữa bột Abbott Grow 4 Hương Vani 900g", price: 380000, salePrice: 329000, discount: "-13%", sold: 45, total: 50, image: "https://nhathuoclongchau.com.vn/images/grow.png" },
          { name: "Viên uống Puritan's Pride Vitamin C 1000mg", price: 280000, salePrice: 199000, discount: "-29%", sold: 22, total: 30, image: "https://nhathuoclongchau.com.vn/images/vitaminc.png" },
          { name: "Nước nhỏ mắt Rohto Nhật Bản Cool 12ml", price: 65000, salePrice: 49000, discount: "-25%", sold: 80, total: 100, image: "https://nhathuoclongchau.com.vn/images/rohto.png" },
          { name: "Dầu cá Omega 3 Fish Oil 1000mg Kirkland", price: 450000, salePrice: 349000, discount: "-22%", sold: 15, total: 40, image: "https://nhathuoclongchau.com.vn/images/fishoil.png" }
        ]
      }
    },
    {
      id: "b_feat_index",
      type: "categories",
      visible: true,
      configs: {
        title: "DANH MỤC NỔI BẬT",
        items: [
          { title: "Thực phẩm chức năng", desc: "Hỗ trợ đề kháng, tim mạch, xương khớp", icon: "💊" },
          { title: "Dược phẩm kê đơn", desc: "Thuốc đặc trị theo đơn bác sĩ", icon: "🏥" },
          { title: "Thiết bị y tế", desc: "Máy đo huyết áp, tiểu đường, khẩu trang", icon: "🩺" },
          { title: "Chăm sóc cá nhân", desc: "Sữa tắm, dầu gội, kem đánh răng", icon: "🧴" },
          { title: "Dược mỹ phẩm", desc: "Trị mụn, chống nắng, phục hồi da", icon: "🧴" },
          { title: "Sản phẩm cho mẹ & bé", desc: "Sữa công thức, bỉm, vitamin cho bé", icon: "🍼" }
        ]
      }
    },
    {
      id: "b_healthchecks_index",
      type: "healthchecks",
      visible: true,
      configs: {
        title: "KIỂM TRA SỨC KHỎE",
        description: "Sàng lọc sức khỏe trực tuyến nhanh chóng với kết quả tức thì cùng khuyến nghị y khoa thích hợp.",
        items: [
          { title: "Sàng lọc tim mạch", desc: "Đánh giá nguy cơ xơ vữa động mạch & huyết áp", action: "Khảo sát ngay" },
          { title: "Đánh giá tiểu đường", desc: "Nhận biết sớm nguy cơ tiểu đường tuýp 2", action: "Kiểm tra ngay" },
          { title: "Khảo sát giấc ngủ", desc: "Đo lường mức độ rối loạn giấc ngủ & stress", action: "Bắt đầu" }
        ]
      }
    },
    {
      id: "b_audiences_index",
      type: "audiences",
      visible: true,
      configs: {
        title: "XEM THEO ĐỐI TƯỢNG",
        items: [
          { name: "Người cao tuổi", desc: "Tim mạch, trí nhớ, khớp xương", tag: "Xem thuốc ➔" },
          { name: "Trẻ em", desc: "Tăng đề kháng, phát triển chiều cao", tag: "Xem thuốc ➔" },
          { name: "Nam giới", desc: "Tăng cường sinh lực, bổ thận", tag: "Xem thuốc ➔" },
          { name: "Phụ nữ", desc: "Đẹp da, điều hòa nội tiết tố", tag: "Xem thuốc ➔" }
        ]
      }
    },
    {
      id: "b_brands_index",
      type: "brands",
      visible: true,
      configs: {
        title: "THƯƠNG HIỆU NỔI BẬT",
        items: [
          { name: "Abbott", logo: "" },
          { name: "Puritan's Pride", logo: "" },
          { name: "Rohto", logo: "" },
          { name: "Kirkland Signature", logo: "" },
          { name: "Sanofi", logo: "" },
          { name: "Dược Hậu Giang (DHG)", logo: "" }
        ]
      }
    },
    {
      id: "b_posts_index",
      type: "posts",
      visible: true,
      configs: {
        title: "GÓC SỨC KHỎE",
        description: "Kênh kiến thức y khoa chính thống từ dược sĩ & bác sĩ chuyên khoa FPT Long Châu."
      }
    }
  ];

  const displayLayout = indexLayout || fallbackLayout;

  return (
    <div className="lc-page-wrapper">
      <Header />
      <main>
        <BlockRenderer blocks={displayLayout} />
      </main>
      <Footer />
    </div>
  );
}
