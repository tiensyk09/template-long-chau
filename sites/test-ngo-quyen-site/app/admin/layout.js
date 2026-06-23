import './admin.css';

export const metadata = {
  title: 'Trang quản trị — Trường TH Ngô Quyền',
  description: 'Hệ thống quản trị nội bộ Trường Tiểu học Ngô Quyền',
  robots: 'noindex,nofollow',
};

export default function AdminLayout({ children }) {
  return (
    <div className="admin-body">
      {children}
    </div>
  );
}
