import './globals.css';

export const metadata = {
  title: 'Nhà thuốc FPT Long Châu - Đủ thuốc giá tốt',
  description: 'FPT Long Châu là chuỗi nhà thuốc bán lẻ hàng đầu Việt Nam. Cung cấp thuốc kê đơn, dược mỹ phẩm, thực phẩm chức năng chính hãng.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
