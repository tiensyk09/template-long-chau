import Link from 'next/link';

export default function Breadcrumb() {
  return (
    <div className="breadcrumb-bar">
      <div className="container">
        <ol className="breadcrumb" aria-label="Đường dẫn trang">
          <li>
            <Link href="/" aria-label="Trang nhất">Trang nhất</Link>
          </li>
          <li>
            <span className="arrow"> &rsaquo; </span>
            <Link href="#" aria-label="Tin Tức">Tin Tức</Link>
          </li>
          <li>
            <span className="arrow"> &rsaquo; </span>
            <span className="active">
              Trung tâm phục vụ hành chính công
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
}
