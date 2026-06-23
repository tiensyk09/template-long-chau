'use client';
import { useEffect, useState } from 'react';

export default function MarqueeBar() {
  const [now, setNow] = useState('');
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    const update = () => {
      const d = new Date();
      const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
      setNow(`${days[d.getDay()]} - ${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (data.notifications) {
          const activeNotifs = data.notifications.filter(n => n.active);
          setNotifs(activeNotifs);
        }
      })
      .catch(err => console.error('Error fetching notifications:', err));
  }, []);

  return (
    <>
      <div className="timebar">
        <div className="container">
          <span>{now}</span>
          <div className="color-switcher">
            <span>⚙️ Thay đổi màu sắc</span>
            <span className="color-dot" style={{ background: '#c8001a' }} title="Đỏ" />
            <span className="color-dot" style={{ background: '#0d5bb5' }} title="Xanh" />
            <span className="color-dot" style={{ background: '#22c55e' }} title="Xanh lá" />
          </div>
        </div>
      </div>
      <div className="marquee-bar">
        <div className="container">
          <span className="marquee-label">🔴 THÔNG BÁO</span>
          <div className="marquee-text-wrap">
            <span className="marquee-text">
              {notifs.length > 0 ? (
                notifs.map((n, idx) => (
                  <span key={n.id}>
                    {n.text_content}
                    {idx < notifs.length - 1 && ' \u00a0|\u00a0 '}
                  </span>
                ))
              ) : (
                <>
                  Chào mừng quý phụ huynh và các em học sinh đến với website chính thức của Trường Tiểu học Ngô Quyền &nbsp;|&nbsp;
                  Thông báo kế hoạch tuyển sinh trực tuyến vào lớp 1 năm học mới &nbsp;|&nbsp;
                  Nhiệt liệt chúc mừng thầy và trò nhà trường hoàn thành xuất sắc nhiệm vụ năm học vừa qua
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
