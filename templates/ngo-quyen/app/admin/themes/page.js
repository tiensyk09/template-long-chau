'use client';
import { useState, useEffect } from 'react';
import AdminShell from '@/components/admin/AdminShell';

// --- Client-side WebP Compression Helpers ---
function convertToWebP(file, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = ev => resolve(ev.target.result);
      reader.onerror = err => reject(err);
      reader.readAsDataURL(file);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 1920;
        let width = img.width;
        let height = img.height;
        if (width > maxW) {
          height = Math.round((height * maxW) / width);
          width = maxW;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const webpDataUrl = canvas.toDataURL('image/webp', quality);
        resolve(webpDataUrl);
      };
      img.onerror = (err) => reject(err);
      img.src = event.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

function renameToWebp(filename) {
  if (filename.toLowerCase().endsWith('.svg')) return filename;
  const dotIdx = filename.lastIndexOf('.');
  const baseName = dotIdx !== -1 ? filename.substring(0, dotIdx) : filename;
  return baseName + '.webp';
}

const defaultBannersList = [
  {
    big_text: 'Trường Tiểu học Ngô Quyền',
    caption: 'Chào mừng quý phụ huynh và các em học sinh đến với Cổng thông tin Trường Tiểu học Ngô Quyền',
    image_url: '',
    bg_color: 'linear-gradient(135deg, #1a6bb5, #003380)',
    link: '#'
  },
  {
    big_text: 'Xây dựng trường học thân thiện',
    caption: 'Đẩy mạnh thi đua dạy tốt - học tốt, xây dựng môi trường giáo dục an toàn, thân thiện',
    image_url: '',
    bg_color: 'linear-gradient(135deg, #059669, #22c55e)',
    link: '#'
  }
];

const defaultShortcutsList = [
  { label: 'Thời khóa biểu học tập', img: 'https://cdn.dongnai.gov.vn/uploads/budang/menu/ic.png', href: '/news?cat=lich-lam-viec', color: '#0077b6', target: '_self' },
  { label: 'Sở Giáo dục và Đào tạo Đà Nẵng', img: 'https://cdn.dongnai.gov.vn/uploads/budang/menu/ic.png', href: 'https://danang.edu.vn', target: '_blank', color: '#0077b6' },
  { label: 'Đóng góp ý kiến xây dựng trường', img: 'https://cdn.dongnai.gov.vn/uploads/budang/menu/ic1.png', href: '#', color: '#00897b', target: '_self' },
  { label: 'Tuyển sinh trực tuyến lớp 1', img: 'https://cdn.dongnai.gov.vn/uploads/budang/menu/ic.png', href: '/news?cat=cai-cach-hanh-chinh', color: '#0077b6', target: '_self' },
  { label: 'Phòng Giáo dục và Đào tạo', img: 'https://cdn.dongnai.gov.vn/uploads/budang/menu/ic2.png', href: '#', color: '#1565c0', target: '_self' },
  { label: 'Học liệu & Bài giảng E-learning', img: 'https://cdn.dongnai.gov.vn/uploads/budang/menu/ic1.png', href: '/news?cat=kinh-te-moi-truong', color: '#00897b', target: '_self' },
  { label: 'Phong trào Đoàn - Đội', img: 'https://cdn.dongnai.gov.vn/uploads/budang/menu/icon-co-dang2.png', href: '/news?cat=mat-tran-doan-the', color: '#c62828', target: '_self' },
  { label: 'Cổng thông tin phụ huynh', img: 'https://cdn.dongnai.gov.vn/uploads/budang/menu/logo-hcc-bu-dang-moi.png', href: '/news?cat=van-hoa-xa-hoi', color: '#1565c0', target: '_self' }
];

const defaultMainMenu = [
  { label: 'Trang chủ', href: '/' },
  {
    label: 'Giới thiệu', href: '/gioi-thieu',
    children: [
      { label: 'Tổng quan nhà trường', href: '/gioi-thieu' },
      { label: 'Ban Giám Hiệu', href: '/gioi-thieu' },
      { label: 'Hội đồng Sư phạm', href: '/gioi-thieu' },
      { label: 'Thành tích nổi bật', href: '/gioi-thieu' }
    ]
  },
  {
    label: 'Tin tức - Sự kiện', href: '/news',
    children: [
      { label: 'Tin tức - Sự kiện trường', href: '/news?cat=hoat-dong-dang-uy' },
      { label: 'Thông báo nhà trường', href: '/news?cat=chi-dao-dieu-hanh' },
      { label: 'Hoạt động chuyên môn', href: '/news?cat=chinh-quyen-nha-nuoc' },
      { label: 'Phong trào Đoàn - Đội', href: '/news?cat=mat-tran-doan-the' }
    ]
  },
  {
    label: 'Hoạt động giáo dục', href: '#',
    children: [
      { label: 'Tuyển sinh lớp 1', href: '/news?cat=cai-cach-hanh-chinh' },
      { label: 'Chuyển đổi số học đường', href: '/news?cat=chuyen-doi-so' },
      { label: 'Tài nguyên & Góc học tập', href: '/news?cat=kinh-te-moi-truong' },
      { label: 'Góc phụ huynh học sinh', href: '/news?cat=van-hoa-xa-hoi' }
    ]
  },
  {
    label: 'Lịch công tác', href: '/news?cat=lich-lam-viec',
    children: [
      { label: 'Lịch công tác tuần', href: '/news?cat=lich-lam-viec' },
      { label: 'Lịch thi & Kiểm tra', href: '/news?cat=chi-dao-dieu-hanh' }
    ]
  },
  {
    label: 'Ảnh đẹp học đường', href: '#',
    children: [
      { label: 'Khuôn viên nhà trường', href: '#' },
      { label: 'Hoạt động ngoại khóa', href: '#' }
    ]
  }
];

export default function ThemesPage() {
  const [activeTab, setActiveTab] = useState('colors'); // 'colors' | 'layout' | 'menu'
  const [columnTab, setColumnTab] = useState('left'); // 'left' | 'right'
  
  // Theme Color States
  const [preset, setPreset] = useState('cyan');
  const [customColors, setCustomColors] = useState({
    primary: '#0056b3',
    accent: '#00aeef',
    bg: '#f3f6fa',
    nav_bg: '#0056b3'
  });
  
  // Homepage Layout Blocks States
  const [leftBlocks, setLeftBlocks] = useState([]);
  const [rightBlocks, setRightBlocks] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  // Trạng thái Thu gọn/Mở rộng của từng block
  const [expandedBlocks, setExpandedBlocks] = useState({});
  // Trạng thái upload
  const [uploadingIds, setUploadingIds] = useState({});
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  
  // Drag and Drop States
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [draggedCol, setDraggedCol] = useState(null);

  // Main Menu States
  const [mainMenu, setMainMenu] = useState([]);
  const [expandedMenuItems, setExpandedMenuItems] = useState({});
  const [draggedMenuIdx, setDraggedMenuIdx] = useState(null);
  const [draggedChildIdx, setDraggedChildIdx] = useState(null);
  const [draggedChildParentIdx, setDraggedChildParentIdx] = useState(null);

  useEffect(() => {
    loadSettings();
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategoriesList(data.categories || []);
      }
    } catch (err) {
      console.error('Lỗi tải danh mục:', err);
    }
  }

  async function loadSettings() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/theme-layout');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setPreset(data.config.theme_preset || 'cyan');
          setCustomColors({
            primary: data.config.theme_custom_colors?.primary || '#0056b3',
            accent: data.config.theme_custom_colors?.accent || '#00aeef',
            bg: data.config.theme_custom_colors?.bg || '#f3f6fa',
            nav_bg: data.config.theme_custom_colors?.nav_bg || '#0056b3'
          });
          
          const layout = data.config.homepage_layout;
          if (layout && typeof layout === 'object' && !Array.isArray(layout)) {
            setLeftBlocks(layout.left || []);
            setRightBlocks(layout.right || []);
          } else if (Array.isArray(layout)) {
            setLeftBlocks(layout);
            setRightBlocks([]);
          }

          setMainMenu(data.config.main_menu || defaultMainMenu);
        }
      } else {
        const err = await res.json();
        setMsg({ type: 'error', text: 'Lỗi tải thiết lập: ' + err.error });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Lỗi kết nối: ' + err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSettings() {
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await fetch('/api/admin/theme-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme_preset: preset,
          theme_custom_colors: customColors,
          homepage_layout: {
            left: leftBlocks,
            right: rightBlocks
          },
          main_menu: mainMenu
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: 'Đã cập nhật cấu hình giao diện & bố cục thành công! Vui lòng tải lại trang chủ để xem thay đổi.' });
      } else {
        setMsg({ type: 'error', text: 'Lỗi lưu: ' + data.error });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Lỗi kết nối: ' + err.message });
    } finally {
      setSaving(false);
    }
  }

  // --- HTML5 Drag and Drop Handlers ---
  function handleDragStart(e, index, col) {
    setDraggedIdx(index);
    setDraggedCol(col);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('dragging');
  }

  function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    setDraggedIdx(null);
    setDraggedCol(null);
  }

  function handleDragOver(e, index, col) {
    e.preventDefault();
    if (draggedIdx === null || draggedCol !== col || draggedIdx === index) return;
    
    const items = col === 'left' ? [...leftBlocks] : [...rightBlocks];
    const draggedItem = items[draggedIdx];
    
    items.splice(draggedIdx, 1);
    items.splice(index, 0, draggedItem);
    
    setDraggedIdx(index);
    if (col === 'left') {
      setLeftBlocks(items);
    } else {
      setRightBlocks(items);
    }
  }

  // Fallback: Di chuyển bằng nút nhấn
  function moveBlock(index, direction, col) {
    const list = col === 'left' ? [...leftBlocks] : [...rightBlocks];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    if (col === 'left') setLeftBlocks(list); else setRightBlocks(list);
  }

  // Bật tắt ẩn hiện block
  function toggleBlockVisibility(index, col) {
    const list = col === 'left' ? [...leftBlocks] : [...rightBlocks];
    list[index].visible = !list[index].visible;
    if (col === 'left') setLeftBlocks(list); else setRightBlocks(list);
  }

  // Thu gọn / Mở rộng cấu hình block
  function toggleBlockExpansion(blockId) {
    setExpandedBlocks(prev => ({
      ...prev,
      [blockId]: !prev[blockId]
    }));
  }

  // Cập nhật cấu hình HTML/Văn bản tùy chỉnh
  function handleHtmlContentChange(blockIdx, value, col = 'left') {
    const items = col === 'left' ? [...leftBlocks] : [...rightBlocks];
    if (!items[blockIdx].configs) {
      items[blockIdx].configs = {};
    }
    items[blockIdx].configs.html = value;
    if (col === 'left') setLeftBlocks(items); else setRightBlocks(items);
  }

  // Cập nhật chiều cao Slider
  function handleSliderHeightChange(blockIdx, heightValue, col = 'left') {
    const items = col === 'left' ? [...leftBlocks] : [...rightBlocks];
    if (!items[blockIdx].configs) {
      items[blockIdx].configs = { height: '260', fitMode: 'cover', source: 'database', banners: JSON.parse(JSON.stringify(defaultBannersList)) };
    }
    items[blockIdx].configs.height = heightValue;
    if (col === 'left') setLeftBlocks(items); else setRightBlocks(items);
  }

  // Cập nhật kiểu hiển thị ảnh Slider
  function handleSliderFitModeChange(blockIdx, fitModeValue, col = 'left') {
    const items = col === 'left' ? [...leftBlocks] : [...rightBlocks];
    if (!items[blockIdx].configs) {
      items[blockIdx].configs = { height: '260', fitMode: 'cover', source: 'database', banners: JSON.parse(JSON.stringify(defaultBannersList)) };
    }
    items[blockIdx].configs.fitMode = fitModeValue;
    if (col === 'left') setLeftBlocks(items); else setRightBlocks(items);
  }

  // Cập nhật nguồn dữ liệu Slider
  function handleSliderSourceChange(blockIdx, sourceValue, col = 'left') {
    const items = col === 'left' ? [...leftBlocks] : [...rightBlocks];
    if (!items[blockIdx].configs) {
      items[blockIdx].configs = { height: '260', fitMode: 'cover', source: 'database', banners: JSON.parse(JSON.stringify(defaultBannersList)) };
    }
    items[blockIdx].configs.source = sourceValue;
    if (col === 'left') setLeftBlocks(items); else setRightBlocks(items);
  }

  // Cập nhật thông số banner trong slider
  function handleSliderBannerChange(blockIdx, slideIdx, field, value, col = 'left') {
    const items = col === 'left' ? [...leftBlocks] : [...rightBlocks];
    if (!items[blockIdx].configs) {
      items[blockIdx].configs = { height: '260', fitMode: 'cover', source: 'database', banners: JSON.parse(JSON.stringify(defaultBannersList)) };
    }
    if (!items[blockIdx].configs.banners) {
      items[blockIdx].configs.banners = JSON.parse(JSON.stringify(defaultBannersList));
    }
    items[blockIdx].configs.banners[slideIdx][field] = value;
    if (col === 'left') setLeftBlocks(items); else setRightBlocks(items);
  }

  // Thêm slide ảnh mới
  function addSliderBanner(blockIdx, col = 'left') {
    const items = col === 'left' ? [...leftBlocks] : [...rightBlocks];
    if (!items[blockIdx].configs) {
      items[blockIdx].configs = { height: '260', fitMode: 'cover', source: 'database', banners: [] };
    }
    if (!items[blockIdx].configs.banners) {
      items[blockIdx].configs.banners = [];
    }
    items[blockIdx].configs.banners.push({
      big_text: 'Tiêu đề slide mới',
      caption: 'Mô tả slide mới',
      image_url: '',
      bg_color: 'linear-gradient(135deg, #1a6bb5, #003380)',
      link: '#'
    });
    if (col === 'left') setLeftBlocks(items); else setRightBlocks(items);
  }

  // Xóa slide ảnh
  function removeSliderBanner(blockIdx, slideIdx, col = 'left') {
    const items = col === 'left' ? [...leftBlocks] : [...rightBlocks];
    if (items[blockIdx].configs && items[blockIdx].configs.banners) {
      items[blockIdx].configs.banners = items[blockIdx].configs.banners.filter((_, idx) => idx !== slideIdx);
      if (col === 'left') setLeftBlocks(items); else setRightBlocks(items);
    }
  }

  // Di chuyển slide lên xuống
  function moveSliderBanner(blockIdx, slideIdx, direction, col = 'left') {
    const items = col === 'left' ? [...leftBlocks] : [...rightBlocks];
    if (items[blockIdx].configs && items[blockIdx].configs.banners) {
      const list = [...items[blockIdx].configs.banners];
      const targetIdx = slideIdx + direction;
      if (targetIdx < 0 || targetIdx >= list.length) return;
      const temp = list[slideIdx];
      list[slideIdx] = list[targetIdx];
      list[targetIdx] = temp;
      items[blockIdx].configs.banners = list;
      if (col === 'left') setLeftBlocks(items); else setRightBlocks(items);
    }
  }

  // Tải lên ảnh nền cho Slide
  async function handleUploadSliderBannerImage(blockIdx, slideIdx, e, col = 'left') {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa là 10MB.');
      return;
    }

    const key = `slider-${blockIdx}-${slideIdx}`;
    setUploadingIds(prev => ({ ...prev, [key]: true }));

    try {
      const dataUrl = await convertToWebP(file);
      const filename = renameToWebp(file.name);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl, filename }),
      });
      const data = await res.json();
      if (res.ok) {
        handleSliderBannerChange(blockIdx, slideIdx, 'image_url', data.url, col);
      } else {
        handleSliderBannerChange(blockIdx, slideIdx, 'image_url', dataUrl, col);
      }
    } catch (err) {
      console.error('Lỗi tải ảnh:', err);
      alert('Không thể tải ảnh lên.');
    } finally {
      setUploadingIds(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  }

  // Cập nhật cấu hình shortcut
  function handleShortcutConfigChange(blockIdx, configIdx, field, value, col = 'left') {
    const items = col === 'left' ? [...leftBlocks] : [...rightBlocks];
    if (!items[blockIdx].configs) {
      items[blockIdx].configs = JSON.parse(JSON.stringify(defaultShortcutsList));
    }
    items[blockIdx].configs[configIdx][field] = value;
    if (col === 'left') setLeftBlocks(items); else setRightBlocks(items);
  }

  // Thêm shortcut mới
  function addShortcutToBlock(blockIdx, col = 'left') {
    const items = col === 'left' ? [...leftBlocks] : [...rightBlocks];
    if (!items[blockIdx].configs) {
      items[blockIdx].configs = [];
    }
    items[blockIdx].configs.push({
      label: 'Liên kết mới',
      img: 'https://cdn.dongnai.gov.vn/uploads/budang/menu/ic.png',
      href: '#',
      color: '#0077b6',
      target: '_self'
    });
    if (col === 'left') setLeftBlocks(items); else setRightBlocks(items);
  }

  // Xóa một Liên kết nhanh khỏi block shortcuts
  function removeShortcutFromBlock(blockIdx, configIdx, col = 'left') {
    const items = col === 'left' ? [...leftBlocks] : [...rightBlocks];
    if (items[blockIdx].configs) {
      items[blockIdx].configs = items[blockIdx].configs.filter((_, idx) => idx !== configIdx);
      if (col === 'left') setLeftBlocks(items); else setRightBlocks(items);
    }
  }

  // Di chuyển Liên kết nhanh lên/xuống
  function moveShortcutInBlock(blockIdx, configIdx, direction, col = 'left') {
    const items = col === 'left' ? [...leftBlocks] : [...rightBlocks];
    if (items[blockIdx].configs) {
      const list = [...items[blockIdx].configs];
      const targetIdx = configIdx + direction;
      if (targetIdx < 0 || targetIdx >= list.length) return;
      const temp = list[configIdx];
      list[configIdx] = list[targetIdx];
      list[targetIdx] = temp;
      items[blockIdx].configs = list;
      if (col === 'left') setLeftBlocks(items); else setRightBlocks(items);
    }
  }

  // Tải lên ảnh Icon cho Liên kết nhanh
  async function handleUploadShortcutIcon(blockIdx, configIdx, e, col = 'left') {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa là 10MB.');
      return;
    }

    const key = `shortcut-${blockIdx}-${configIdx}`;
    setUploadingIds(prev => ({ ...prev, [key]: true }));

    try {
      const dataUrl = await convertToWebP(file);
      const filename = renameToWebp(file.name);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl, filename }),
      });
      const data = await res.json();
      if (res.ok) {
        handleShortcutConfigChange(blockIdx, configIdx, 'img', data.url, col);
      } else {
        handleShortcutConfigChange(blockIdx, configIdx, 'img', dataUrl, col);
      }
    } catch (err) {
      console.error('Lỗi tải ảnh:', err);
      alert('Không thể tải ảnh lên.');
    } finally {
      setUploadingIds(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  }

  // Tải lên ảnh cho Sidebar Banner
  async function handleUploadSidebarBannerImage(blockIdx, configIdx, e, col = 'right') {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa là 10MB.');
      return;
    }

    const key = `sidebar-banner-${blockIdx}-${configIdx}`;
    setUploadingIds(prev => ({ ...prev, [key]: true }));

    try {
      const dataUrl = await convertToWebP(file);
      const filename = renameToWebp(file.name);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl, filename }),
      });
      const data = await res.json();
      if (res.ok) {
        handleBannerConfigChange(blockIdx, configIdx, 'imageUrl', data.url, col);
      } else {
        handleBannerConfigChange(blockIdx, configIdx, 'imageUrl', dataUrl, col);
      }
    } catch (err) {
      console.error('Lỗi tải ảnh:', err);
      alert('Không thể tải ảnh lên.');
    } finally {
      setUploadingIds(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  }

  // --- MENU CONFIG OPERATIONS ---
  function handleMenuChange(index, field, value) {
    const list = [...mainMenu];
    list[index][field] = value;
    setMainMenu(list);
  }

  function addMainMenuItem() {
    setMainMenu([
      ...mainMenu,
      { label: 'Menu mới', href: '#', children: [] }
    ]);
  }

  function removeMainMenuItem(index) {
    if (confirm('Bạn có chắc chắn muốn xóa mục Menu chính này và tất cả các Menu con của nó?')) {
      setMainMenu(mainMenu.filter((_, idx) => idx !== index));
    }
  }

  function moveMainMenuItem(index, direction) {
    const list = [...mainMenu];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    setMainMenu(list);
  }

  function handleChildMenuChange(mainIdx, childIdx, field, value) {
    const list = [...mainMenu];
    list[mainIdx].children[childIdx][field] = value;
    setMainMenu(list);
  }

  function addChildMenuItem(mainIdx) {
    const list = [...mainMenu];
    if (!list[mainIdx].children) {
      list[mainIdx].children = [];
    }
    list[mainIdx].children.push({ label: 'Menu con mới', href: '#' });
    setMainMenu(list);
    // Tự động mở rộng menu cha khi thêm con
    setExpandedMenuItems(prev => ({ ...prev, [mainIdx]: true }));
  }

  function removeChildMenuItem(mainIdx, childIdx) {
    const list = [...mainMenu];
    list[mainIdx].children = list[mainIdx].children.filter((_, idx) => idx !== childIdx);
    setMainMenu(list);
  }

  function moveChildMenuItem(mainIdx, childIdx, direction) {
    const list = [...mainMenu];
    const children = [...list[mainIdx].children];
    const targetIdx = childIdx + direction;
    if (targetIdx < 0 || targetIdx >= children.length) return;
    const temp = children[childIdx];
    children[childIdx] = children[targetIdx];
    children[targetIdx] = temp;
    list[mainIdx].children = children;
    setMainMenu(list);
  }

  // --- MENU HTML5 DRAG & DROP HANDLERS ---
  function handleMenuDragStart(e, index) {
    setDraggedMenuIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleMenuDragOver(e, index) {
    e.preventDefault();
    if (draggedMenuIdx === null || draggedMenuIdx === index) return;
    const list = [...mainMenu];
    const draggedItem = list[draggedMenuIdx];
    list.splice(draggedMenuIdx, 1);
    list.splice(index, 0, draggedItem);
    setDraggedMenuIdx(index);
    setMainMenu(list);
  }

  function handleMenuDragEnd() {
    setDraggedMenuIdx(null);
  }

  function handleChildDragStart(e, parentIdx, childIdx) {
    setDraggedChildParentIdx(parentIdx);
    setDraggedChildIdx(childIdx);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleChildDragOver(e, parentIdx, childIdx) {
    e.preventDefault();
    if (draggedChildParentIdx !== parentIdx) return;
    if (draggedChildIdx === null || draggedChildIdx === childIdx) return;
    
    const list = [...mainMenu];
    const children = [...list[parentIdx].children];
    const draggedItem = children[draggedChildIdx];
    children.splice(draggedChildIdx, 1);
    children.splice(childIdx, 0, draggedItem);
    list[parentIdx].children = children;
    
    setDraggedChildIdx(childIdx);
    setMainMenu(list);
  }

  function handleChildDragEnd() {
    setDraggedChildParentIdx(null);
    setDraggedChildIdx(null);
  }

  function toggleMenuExpansion(index) {
    setExpandedMenuItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  }

  // Thay đổi tiêu đề block
  function handleBlockTitleChange(index, title, col) {
    const list = col === 'left' ? [...leftBlocks] : [...rightBlocks];
    list[index].title = title;
    if (col === 'left') setLeftBlocks(list); else setRightBlocks(list);
  }

  // Xoá block
  function deleteBlock(index, col) {
    if (confirm('Bạn có chắc chắn muốn xoá block này khỏi trang chủ?')) {
      const list = col === 'left' ? leftBlocks : rightBlocks;
      const items = list.filter((_, idx) => idx !== index);
      if (col === 'left') setLeftBlocks(items); else setRightBlocks(items);
    }
  }

  // Thêm block mới
  function addBlock(type, col) {
    const newBlock = {
      id: 'block_' + Date.now(),
      type,
      title: type === 'tabbed_news' ? 'Tin tức nổi bật' :
             type === 'shortcuts' ? 'Liên kết nhanh' :
             type === 'banner_slider' ? 'Banner giới thiệu' :
             type === 'html' ? 'Khối văn bản / HTML' :
             type === 'search' ? 'Tìm kiếm' :
             type === 'quick_links' ? 'Liên kết nhanh' :
             type === 'schedule' ? 'Lịch công tác' :
             type === 'notices' ? 'Thông báo mới' :
             type === 'sidebar_banners' ? 'Banner liên kết' :
             type === 'survey' ? 'Khảo sát ý kiến' :
             type === 'stats' ? 'Thống kê truy cập' : 'Danh mục tin tức',
      visible: true
    };
    
    if (type === 'categories') {
      newBlock.configs = [
        { title: 'TIN TỨC - SỰ KIỆN', cat: 'hoat-dong-dang-uy', color: 'red' },
        { title: 'THÔNG BÁO NHÀ TRƯỜNG', cat: 'chi-dao-dieu-hanh', color: 'blue' }
      ];
    } else if (type === 'sidebar_banners') {
      newBlock.configs = [
        { label: 'Liên kết mới', icon: '🏛️', href: '#', bg: 'linear-gradient(135deg,#0d5bb5,#1a7ddb)', imageUrl: '' }
      ];
    }
    
    if (col === 'left') {
      setLeftBlocks([...leftBlocks, newBlock]);
    } else {
      setRightBlocks([...rightBlocks, newBlock]);
    }
    // Tự động mở rộng block mới tạo để cấu hình
    setExpandedBlocks(prev => ({ ...prev, [newBlock.id]: true }));
  }

  // Cập nhật cấu hình danh mục của block categories (Cột trái)
  function handleCategoryConfigChange(blockIdx, configIdx, field, value, col = 'left') {
    const items = col === 'left' ? [...leftBlocks] : [...rightBlocks];
    items[blockIdx].configs[configIdx][field] = value;
    if (col === 'left') setLeftBlocks(items); else setRightBlocks(items);
  }

  // Thêm một danh mục con vào trong block categories
  function addCategoryToBlock(blockIdx, col = 'left') {
    const items = col === 'left' ? [...leftBlocks] : [...rightBlocks];
    if (!items[blockIdx].configs) {
      items[blockIdx].configs = [];
    }
    const defaultCat = categoriesList[0]?.id || 'hoat-dong-dang-uy';
    items[blockIdx].configs.push({
      title: 'Danh mục mới',
      cat: defaultCat,
      color: 'red'
    });
    if (col === 'left') setLeftBlocks(items); else setRightBlocks(items);
  }

  // Xóa danh mục con khỏi block categories
  function removeCategoryFromBlock(blockIdx, configIdx, col = 'left') {
    const items = col === 'left' ? [...leftBlocks] : [...rightBlocks];
    items[blockIdx].configs = items[blockIdx].configs.filter((_, idx) => idx !== configIdx);
    if (col === 'left') setLeftBlocks(items); else setRightBlocks(items);
  }

  // Cập nhật cấu hình Banner/Ads (Cột phải)
  function handleBannerConfigChange(blockIdx, configIdx, field, value, col = 'right') {
    const items = col === 'left' ? [...leftBlocks] : [...rightBlocks];
    items[blockIdx].configs[configIdx][field] = value;
    if (col === 'left') setLeftBlocks(items); else setRightBlocks(items);
  }

  // Thêm một Banner/Ads vào trong block sidebar_banners
  function addBannerToBlock(blockIdx, col = 'right') {
    const items = col === 'left' ? [...leftBlocks] : [...rightBlocks];
    if (!items[blockIdx].configs) {
      items[blockIdx].configs = [];
    }
    items[blockIdx].configs.push({
      label: 'Liên kết/Banner mới',
      icon: '🏛️',
      href: '#',
      bg: 'linear-gradient(135deg,#0d5bb5,#1a7ddb)',
      imageUrl: ''
    });
    if (col === 'left') setLeftBlocks(items); else setRightBlocks(items);
  }

  // Xóa Banner/Ads khỏi block sidebar_banners
  function removeBannerFromBlock(blockIdx, configIdx, col = 'right') {
    const items = col === 'left' ? [...leftBlocks] : [...rightBlocks];
    items[blockIdx].configs = items[blockIdx].configs.filter((_, idx) => idx !== configIdx);
    if (col === 'left') setLeftBlocks(items); else setRightBlocks(items);
  }

  const blockTypeLabels = {
    // Cột bên trái
    tabbed_news: '📰 Tin tức nổi bật (Hero + Side-list)',
    shortcuts: '⚡ Lưới liên kết nhanh (Shortcuts)',
    banner_slider: '🖼️ Banner Slider chuyển ảnh',
    categories: '🗂️ Lưới cặp danh mục tin tức song song',
    html: '📝 Khối HTML / Văn bản tùy chỉnh',
    // Cột bên phải
    search: '🔍 Khung Tìm kiếm',
    quick_links: '🔗 Menu Liên kết nhanh',
    schedule: '📅 Widget Lịch công tác',
    notices: '🔔 Widget Thông báo mới',
    sidebar_banners: '🖼️ Khối Banners / Ads Quảng cáo',
    survey: '📊 Widget Thăm dò ý kiến',
    stats: '📈 Widget Thống kê truy cập'
  };

  return (
    <AdminShell title="Thiết lập Giao diện">
      
      {/* Tabs navigation */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--adm-border)', paddingBottom: 12 }}>
        <button 
          className={`btn ${activeTab === 'colors' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('colors')}
        >
          🎨 Màu sắc & Preset Theme
        </button>
        <button 
          className={`btn ${activeTab === 'layout' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('layout')}
        >
          🗂️ Bố cục Blocks Trang chủ
        </button>
        <button 
          className={`btn ${activeTab === 'menu' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('menu')}
        >
          🌐 Cấu hình Menu chính
        </button>
      </div>

      {msg.text && (
        <div className={`adm-alert adm-alert-${msg.type}`} style={{ marginBottom: 20 }}>
          {msg.type === 'success' ? '✅' : '⚠️'} {msg.text}
        </div>
      )}

      {loading ? (
        <div>
          <div className="skeleton" style={{ height: 180, marginBottom: 20 }} />
          <div className="skeleton" style={{ height: 260 }} />
        </div>
      ) : (
        <>
          {/* TAB 1: COLORS CONFIG */}
          {activeTab === 'colors' && (
            <div className="adm-card">
              <div className="adm-card-header">
                <div className="adm-card-title">🎨 Thiết lập bảng màu và Preset chính</div>
              </div>
              <div className="adm-card-body">
                
                {/* PRESET CHOOSE */}
                <div className="adm-form-group">
                  <label className="adm-label">Lựa chọn Preset màu sắc:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                    
                    <div 
                      onClick={() => setPreset('cyan')}
                      style={{ 
                        padding: 16, border: `2px solid ${preset === 'cyan' ? 'var(--adm-primary)' : '#e2e8f0'}`,
                        borderRadius: 8, cursor: 'pointer', background: '#fff', textAlign: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
                        <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#0056b3' }} />
                        <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#00aeef' }} />
                        <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#f3f6fa' }} />
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>Ngô Quyền Cyan-Blue</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Màu xanh dương/cyan hiện đại</div>
                    </div>

                    <div 
                      onClick={() => setPreset('red')}
                      style={{ 
                        padding: 16, border: `2px solid ${preset === 'red' ? 'var(--adm-primary)' : '#e2e8f0'}`,
                        borderRadius: 8, cursor: 'pointer', background: '#fff', textAlign: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
                        <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#c0392b' }} />
                        <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#d4a017' }} />
                        <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#faf8f5' }} />
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>Bù Đăng Red-Gold</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Đỏ & Vàng Chính phủ cổ điển</div>
                    </div>

                    <div 
                      onClick={() => setPreset('blue')}
                      style={{ 
                        padding: 16, border: `2px solid ${preset === 'blue' ? 'var(--adm-primary)' : '#e2e8f0'}`,
                        borderRadius: 8, cursor: 'pointer', background: '#fff', textAlign: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
                        <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#0d5bb5' }} />
                        <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#0ea5e9' }} />
                        <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#e0f2fe' }} />
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>Ocean Blue</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Màu xanh dương biển sâu</div>
                    </div>

                    <div 
                      onClick={() => setPreset('green')}
                      style={{ 
                        padding: 16, border: `2px solid ${preset === 'green' ? 'var(--adm-primary)' : '#e2e8f0'}`,
                        borderRadius: 8, cursor: 'pointer', background: '#fff', textAlign: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
                        <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#16a34a' }} />
                        <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#84cc16' }} />
                        <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#f0fdf4' }} />
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>Nature Green</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Màu xanh lá tươi mát</div>
                    </div>

                    <div 
                      onClick={() => setPreset('custom')}
                      style={{ 
                        padding: 16, border: `2px solid ${preset === 'custom' ? 'var(--adm-primary)' : '#e2e8f0'}`,
                        borderRadius: 8, cursor: 'pointer', background: '#fff', textAlign: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
                        <span style={{ width: 16, height: 16, borderRadius: '50%', background: customColors.primary }} />
                        <span style={{ width: 16, height: 16, borderRadius: '50%', background: customColors.accent }} />
                        <span style={{ width: 16, height: 16, borderRadius: '50%', background: customColors.bg }} />
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>Màu tự chọn (Custom)</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Tùy chỉnh bảng mã màu tùy ý</div>
                    </div>

                  </div>
                </div>

                {/* CUSTOM COLOR PICKERS */}
                {preset === 'custom' && (
                  <div style={{ background: '#f8fafc', padding: 20, borderRadius: 8, border: '1px solid #e2e8f0', marginTop: 20 }}>
                    <h4 style={{ marginBottom: 16, fontSize: 13.5, fontWeight: 700 }}>🎨 Tùy chọn bảng màu tùy chọn của bạn:</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                      
                      <div className="adm-form-group">
                        <label className="adm-label">Màu chủ đạo (Primary Color)</label>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input 
                            type="color" 
                            value={customColors.primary} 
                            onChange={e => setCustomColors({ ...customColors, primary: e.target.value })}
                            style={{ width: 44, height: 38, border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }}
                          />
                          <input 
                            type="text" 
                            className="adm-input" 
                            value={customColors.primary}
                            onChange={e => setCustomColors({ ...customColors, primary: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="adm-form-group">
                        <label className="adm-label">Màu nhấn (Accent Color)</label>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input 
                            type="color" 
                            value={customColors.accent} 
                            onChange={e => setCustomColors({ ...customColors, accent: e.target.value })}
                            style={{ width: 44, height: 38, border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }}
                          />
                          <input 
                            type="text" 
                            className="adm-input" 
                            value={customColors.accent}
                            onChange={e => setCustomColors({ ...customColors, accent: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="adm-form-group">
                        <label className="adm-label">Màu nền web (Background Color)</label>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input 
                            type="color" 
                            value={customColors.bg} 
                            onChange={e => setCustomColors({ ...customColors, bg: e.target.value })}
                            style={{ width: 44, height: 38, border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }}
                          />
                          <input 
                            type="text" 
                            className="adm-input" 
                            value={customColors.bg}
                            onChange={e => setCustomColors({ ...customColors, bg: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="adm-form-group">
                        <label className="adm-label">Nền Navigation Menu (Nav Background)</label>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input 
                            type="color" 
                            value={customColors.nav_bg} 
                            onChange={e => setCustomColors({ ...customColors, nav_bg: e.target.value })}
                            style={{ width: 44, height: 38, border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }}
                          />
                          <input 
                            type="text" 
                            className="adm-input" 
                            value={customColors.nav_bg}
                            onChange={e => setCustomColors({ ...customColors, nav_bg: e.target.value })}
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                <div style={{ marginTop: 24 }}>
                  <button onClick={handleSaveSettings} className="btn btn-primary" disabled={saving}>
                    {saving ? 'Đang lưu...' : '💾 Lưu màu giao diện'}
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: LAYOUT CONFIG - HTML5 DRAG & DROP BUILDER */}
          {activeTab === 'layout' && (
            <div className="adm-card">
              <div className="adm-card-header">
                <div className="adm-card-title">🗂️ Quản lý & Kéo thả Blocks Trang chủ</div>
              </div>
              <div className="adm-card-body">
                
                {/* Column tabs */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: '1px solid #cbd5e1', paddingBottom: 10 }}>
                  <button 
                    type="button"
                    className={`btn btn-sm ${columnTab === 'left' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '8px 16px', fontWeight: 600 }}
                    onClick={() => setColumnTab('left')}
                  >
                    ⬅️ Cột Nội dung chính (Bên trái)
                  </button>
                  <button 
                    type="button"
                    className={`btn btn-sm ${columnTab === 'right' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '8px 16px', fontWeight: 600 }}
                    onClick={() => setColumnTab('right')}
                  >
                    ➡️ Cột Sidebar bên phải (Banner, Ads, Widget...)
                  </button>
                </div>

                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, marginBottom: 20, border: '1px solid #e2e8f0', fontSize: 13, lineHeight: 1.6 }}>
                  💡 <strong>Hướng dẫn kéo thả:</strong> Bạn có thể dùng chuột <strong>bấm giữ và kéo</strong> các khối (blocks) dưới đây để sắp xếp lại bố cục hiển thị của <strong>{columnTab === 'left' ? 'Cột bên trái' : 'Cột bên phải (Sidebar)'}</strong> ngoài trang chủ.
                  Hoặc sử dụng các nút mũi tên 🔼 / 🔽 ở góc phải để dịch chuyển nhanh.
                </div>

                {/* BLOCKS BUILDER */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                  {(columnTab === 'left' ? leftBlocks : rightBlocks).map((block, idx) => (
                    <div 
                      key={block.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx, columnTab)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, idx, columnTab)}
                      style={{ 
                        background: '#ffffff',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: 10,
                        padding: '16px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                        cursor: 'grab',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                      }}
                      className="block-builder-item"
                    >
                      {/* Block header summary */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 20, cursor: 'grab', color: '#94a3b8' }}>☰</span>
                          <span className={`badge ${block.visible ? 'badge-blue' : 'badge-gray'}`} style={{ fontSize: 10.5 }}>
                            {block.visible ? 'Đang hiển thị' : 'Đang ẩn'}
                          </span>
                          <strong style={{ fontSize: 14, color: '#334155' }}>
                            {blockTypeLabels[block.type] || block.type}
                          </strong>
                        </div>
                        
                        {/* Control buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button 
                            type="button" className="btn btn-secondary btn-sm" 
                            style={{ padding: 4 }}
                            onClick={() => moveBlock(idx, -1, columnTab)}
                            disabled={idx === 0}
                            title="Di chuyển lên"
                          >
                            🔼
                          </button>
                          <button 
                            type="button" className="btn btn-secondary btn-sm" 
                            style={{ padding: 4 }}
                            onClick={() => moveBlock(idx, 1, columnTab)}
                            disabled={idx === (columnTab === 'left' ? leftBlocks : rightBlocks).length - 1}
                            title="Di chuyển xuống"
                          >
                            🔽
                          </button>
                          <button 
                            type="button" 
                            className={`btn btn-sm ${block.visible ? 'btn-secondary' : 'btn-success'}`}
                            onClick={() => toggleBlockVisibility(idx, columnTab)}
                          >
                            {block.visible ? '👁️ Ẩn block' : '👁️ Bật hiển thị'}
                          </button>
                          <button 
                            type="button" 
                            className={`btn btn-sm ${expandedBlocks[block.id] ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ fontSize: 11, padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}
                            onClick={() => toggleBlockExpansion(block.id)}
                          >
                            {expandedBlocks[block.id] ? '🔼 Thu gọn' : '⚙️ Cấu hình'}
                          </button>
                          <button 
                            type="button" className="btn btn-danger btn-sm"
                            onClick={() => deleteBlock(idx, columnTab)}
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      </div>

                      {/* Config fields for the block */}
                      {expandedBlocks[block.id] && (
                        <div style={{ background: '#f8fafc', padding: 20, borderRadius: 12, border: '1px solid var(--adm-border)', marginLeft: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
                          <div className="adm-form-group" style={{ margin: 0 }}>
                            <label className="adm-label" style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                              🏷️ Tiêu đề hiển thị của Block:
                            </label>
                            <input 
                              type="text" 
                              className="adm-input" 
                              style={{ padding: '8px 14px', fontSize: 13, borderRadius: 8, border: '1.5px solid var(--adm-border)', outline: 'none' }}
                              value={block.title || ''}
                              onChange={(e) => handleBlockTitleChange(idx, e.target.value, columnTab)}
                              placeholder="Nhập tiêu đề hiển thị ngoài trang chủ..."
                            />
                          </div>

                          {/* Special settings for banner slider block */}
                          {block.type === 'banner_slider' && (
                            <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 16 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', borderBottom: '1px dashed #cbd5e1', paddingBottom: 6 }}>
                                ⚙️ Cấu hình Banner Slider:
                              </div>
                              
                              {/* Height & Fit Mode selection */}
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                                <div className="adm-form-group" style={{ margin: 0 }}>
                                  <label style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Chiều cao Slider:</label>
                                  <select 
                                    className="adm-input adm-select" 
                                    style={{ padding: '6px 12px', fontSize: 12, height: 36, borderRadius: 8, border: '1.5px solid var(--adm-border)' }}
                                    value={block.configs?.height || '260'}
                                    onChange={(e) => handleSliderHeightChange(idx, e.target.value, columnTab)}
                                  >
                                    <option value="180">Nhỏ (180px)</option>
                                    <option value="220">Vừa phải (220px)</option>
                                    <option value="260">Mặc định (260px)</option>
                                    <option value="300">Lớn (300px)</option>
                                    <option value="350">Rất lớn (350px)</option>
                                    <option value="400">Khổng lồ (400px)</option>
                                  </select>
                                </div>

                                <div className="adm-form-group" style={{ margin: 0 }}>
                                  <label style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Hiển thị ảnh (Fit):</label>
                                  <select 
                                    className="adm-input adm-select" 
                                    style={{ padding: '6px 12px', fontSize: 12, height: 36, borderRadius: 8, border: '1.5px solid var(--adm-border)' }}
                                    value={block.configs?.fitMode || 'cover'}
                                    onChange={(e) => handleSliderFitModeChange(idx, e.target.value, columnTab)}
                                  >
                                    <option value="cover">Cover (Cắt ảnh vừa khung)</option>
                                    <option value="contain">Contain (Giữ nguyên tỉ lệ)</option>
                                    <option value="100% 100%">Stretch (Kéo giãn khít khung)</option>
                                  </select>
                                </div>

                                <div className="adm-form-group" style={{ margin: 0 }}>
                                  <label style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Nguồn dữ liệu:</label>
                                  <select 
                                    className="adm-input adm-select" 
                                    style={{ padding: '6px 12px', fontSize: 12, height: 36, borderRadius: 8, border: '1.5px solid var(--adm-border)' }}
                                    value={block.configs?.source || 'database'}
                                    onChange={(e) => handleSliderSourceChange(idx, e.target.value, columnTab)}
                                  >
                                    <option value="database">Trang quản lý Banner (Database)</option>
                                    <option value="custom">Nhập tùy biến (Page Builder)</option>
                                  </select>
                                </div>
                              </div>

                              {block.configs?.source === 'custom' && (
                                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 14 }}>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Danh sách các Slide ảnh:</div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {(block.configs?.banners || defaultBannersList).map((slide, slideIdx) => (
                                      <div key={slideIdx} style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                                        
                                        {/* Slide Header */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#eff6ff', padding: '6px 12px', borderRadius: 8 }}>
                                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-primary)' }}>Slide #{slideIdx + 1}</span>
                                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                            <button 
                                              type="button" className="btn btn-secondary btn-sm" 
                                              style={{ padding: '4px 8px', fontSize: 10, height: 24, display: 'flex', alignItems: 'center' }}
                                              onClick={() => moveSliderBanner(idx, slideIdx, -1, columnTab)}
                                              disabled={slideIdx === 0}
                                            >
                                              🔼
                                            </button>
                                            <button 
                                              type="button" className="btn btn-secondary btn-sm" 
                                              style={{ padding: '4px 8px', fontSize: 10, height: 24, display: 'flex', alignItems: 'center' }}
                                              onClick={() => moveSliderBanner(idx, slideIdx, 1, columnTab)}
                                              disabled={slideIdx === (block.configs?.banners || defaultBannersList).length - 1}
                                            >
                                              🔽
                                            </button>
                                            <button 
                                              type="button" 
                                              style={{ padding: '4px 10px', fontSize: 11, height: 24, background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center' }}
                                              onClick={() => removeSliderBanner(idx, slideIdx, columnTab)}
                                            >
                                              Xóa slide
                                            </button>
                                          </div>
                                        </div>

                                        {/* Slide Fields */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                          <div className="adm-form-group" style={{ margin: 0 }}>
                                            <label style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Chữ lớn hiển thị</label>
                                            <input 
                                              type="text" className="adm-input" style={{ padding: '6px 10px', fontSize: 12, height: 34, borderRadius: 8, border: '1.5px solid var(--adm-border)' }}
                                              value={slide.big_text || ''}
                                              onChange={(e) => handleSliderBannerChange(idx, slideIdx, 'big_text', e.target.value, columnTab)}
                                              placeholder="Tiêu đề slide..."
                                            />
                                          </div>
                                          <div className="adm-form-group" style={{ margin: 0 }}>
                                            <label style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Chú thích nhỏ</label>
                                            <input 
                                              type="text" className="adm-input" style={{ padding: '6px 10px', fontSize: 12, height: 34, borderRadius: 8, border: '1.5px solid var(--adm-border)' }}
                                              value={slide.caption || ''}
                                              onChange={(e) => handleSliderBannerChange(idx, slideIdx, 'caption', e.target.value, columnTab)}
                                              placeholder="Mô tả ngắn gọn..."
                                            />
                                          </div>
                                        </div>

                                        <div className="adm-form-group" style={{ margin: 0 }}>
                                          <label style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Ảnh nền slide (image_url)</label>
                                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            {slide.image_url && (
                                              <div style={{ width: 50, height: 34, borderRadius: 6, overflow: 'hidden', border: '1px solid #cbd5e1', flexShrink: 0, background: '#f1f5f9' }}>
                                                <img src={slide.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                              </div>
                                            )}
                                            <input 
                                              type="text" className="adm-input" style={{ padding: '6px 10px', fontSize: 12, height: 34, flex: 1, borderRadius: 8, border: '1.5px solid var(--adm-border)' }}
                                              placeholder="Đường dẫn ảnh slide hoặc tải lên..."
                                              value={slide.image_url || ''}
                                              onChange={(e) => handleSliderBannerChange(idx, slideIdx, 'image_url', e.target.value, columnTab)}
                                            />
                                            <label style={{ 
                                              padding: '0 12px', background: 'var(--adm-primary-light)', color: 'var(--adm-primary)', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--adm-primary)', whiteSpace: 'nowrap', height: 34, boxSizing: 'border-box', transition: 'all 0.15s'
                                            }}>
                                              {uploadingIds[`slider-${idx}-${slideIdx}`] ? '⏳ Tải...' : '📤 Tải lên'}
                                              <input 
                                                type="file" accept="image/*" style={{ display: 'none' }}
                                                onChange={(e) => handleUploadSliderBannerImage(idx, slideIdx, e, columnTab)}
                                                disabled={uploadingIds[`slider-${idx}-${slideIdx}`]}
                                              />
                                            </label>
                                          </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                          <div className="adm-form-group" style={{ margin: 0 }}>
                                            <label style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Màu nền / CSS Gradient (nếu không dùng ảnh)</label>
                                            <input 
                                              type="text" className="adm-input" style={{ padding: '6px 10px', fontSize: 12, height: 34, borderRadius: 8, border: '1.5px solid var(--adm-border)' }}
                                              value={slide.bg_color || ''}
                                              onChange={(e) => handleSliderBannerChange(idx, slideIdx, 'bg_color', e.target.value, columnTab)}
                                              placeholder="Ví dụ: linear-gradient(135deg, #1a6bb5, #003380)"
                                            />
                                          </div>
                                          <div className="adm-form-group" style={{ margin: 0 }}>
                                            <label style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Đường dẫn liên kết khi click (Link)</label>
                                            <input 
                                              type="text" className="adm-input" style={{ padding: '6px 10px', fontSize: 12, height: 34, borderRadius: 8, border: '1.5px solid var(--adm-border)' }}
                                              value={slide.link || ''}
                                              onChange={(e) => handleSliderBannerChange(idx, slideIdx, 'link', e.target.value, columnTab)}
                                              placeholder="Ví dụ: /gioi-thieu"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <div style={{ marginTop: 4 }}>
                                    <button 
                                      type="button" className="btn btn-secondary btn-sm"
                                      style={{ padding: '8px 14px', fontSize: 12, borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                                      onClick={() => addSliderBanner(idx, columnTab)}
                                    >
                                      ➕ Thêm slide ảnh mới
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Special settings for shortcuts block */}
                          {block.type === 'shortcuts' && (
                            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', borderBottom: '1px dashed #cbd5e1', paddingBottom: 6 }}>
                                ⚙️ Cấu hình Lưới liên kết nhanh (Shortcuts):
                              </div>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {(block.configs || defaultShortcutsList).map((cfg, cfgIdx) => (
                                  <div key={cfgIdx} style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#eff6ff', padding: '6px 12px', borderRadius: 8 }}>
                                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-primary)' }}>🔗 Liên kết #{cfgIdx + 1}</span>
                                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                        <button 
                                          type="button" className="btn btn-secondary btn-sm"
                                          style={{ padding: '4px 8px', fontSize: 10, height: 24, display: 'flex', alignItems: 'center' }}
                                          onClick={() => moveShortcutInBlock(idx, cfgIdx, -1, columnTab)}
                                          disabled={cfgIdx === 0}
                                        >
                                          🔼
                                        </button>
                                        <button 
                                          type="button" className="btn btn-secondary btn-sm"
                                          style={{ padding: '4px 8px', fontSize: 10, height: 24, display: 'flex', alignItems: 'center' }}
                                          onClick={() => moveShortcutInBlock(idx, cfgIdx, 1, columnTab)}
                                          disabled={cfgIdx === (block.configs || defaultShortcutsList).length - 1}
                                        >
                                          🔽
                                        </button>
                                        <button 
                                          type="button" 
                                          style={{ padding: '4px 10px', fontSize: 11, height: 24, background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center' }}
                                          onClick={() => removeShortcutFromBlock(idx, cfgIdx, columnTab)}
                                        >
                                          Xóa liên kết
                                        </button>
                                      </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                      <div className="adm-form-group" style={{ margin: 0 }}>
                                        <label style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Tên hiển thị</label>
                                        <input 
                                          type="text" className="adm-input" style={{ padding: '6px 10px', fontSize: 12, height: 34, borderRadius: 8, border: '1.5px solid var(--adm-border)' }}
                                          value={cfg.label || ''}
                                          onChange={(e) => handleShortcutConfigChange(idx, cfgIdx, 'label', e.target.value, columnTab)}
                                          placeholder="Ví dụ: Thời khóa biểu..."
                                        />
                                      </div>
                                      <div className="adm-form-group" style={{ margin: 0 }}>
                                        <label style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Đường dẫn (Href)</label>
                                        <input 
                                          type="text" className="adm-input" style={{ padding: '6px 10px', fontSize: 12, height: 34, borderRadius: 8, border: '1.5px solid var(--adm-border)' }}
                                          value={cfg.href || ''}
                                          onChange={(e) => handleShortcutConfigChange(idx, cfgIdx, 'href', e.target.value, columnTab)}
                                          placeholder="Ví dụ: /news?cat=lich-hoc"
                                        />
                                      </div>
                                    </div>

                                    <div className="adm-form-group" style={{ margin: 0 }}>
                                      <label style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Ảnh Icon (img)</label>
                                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        {cfg.img && (
                                          <div style={{ width: 50, height: 34, borderRadius: 6, overflow: 'hidden', border: '1px solid #cbd5e1', flexShrink: 0, background: '#f1f5f9' }}>
                                            <img src={cfg.img} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                          </div>
                                        )}
                                        <input 
                                          type="text" className="adm-input" style={{ padding: '6px 10px', fontSize: 12, height: 34, flex: 1, borderRadius: 8, border: '1.5px solid var(--adm-border)' }}
                                          value={cfg.img || ''}
                                          onChange={(e) => handleShortcutConfigChange(idx, cfgIdx, 'img', e.target.value, columnTab)}
                                          placeholder="Đường dẫn ảnh icon..."
                                        />
                                        <label style={{ 
                                          padding: '0 12px', background: 'var(--adm-primary-light)', color: 'var(--adm-primary)', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--adm-primary)', whiteSpace: 'nowrap', height: 34, boxSizing: 'border-box', transition: 'all 0.15s'
                                        }}>
                                          {uploadingIds[`shortcut-${idx}-${cfgIdx}`] ? '⏳ Tải...' : '📤 Tải lên'}
                                          <input 
                                            type="file" accept="image/*" style={{ display: 'none' }}
                                            onChange={(e) => handleUploadShortcutIcon(idx, cfgIdx, e, columnTab)}
                                            disabled={uploadingIds[`shortcut-${idx}-${cfgIdx}`]}
                                          />
                                        </label>
                                      </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                      <div className="adm-form-group" style={{ margin: 0 }}>
                                        <label style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Màu nền hover/viền</label>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                          <input 
                                            type="color" style={{ width: 34, height: 34, padding: 0, border: '1.5px solid var(--adm-border)', borderRadius: 8, cursor: 'pointer', flexShrink: 0 }}
                                            value={cfg.color || '#0077b6'}
                                            onChange={(e) => handleShortcutConfigChange(idx, cfgIdx, 'color', e.target.value, columnTab)}
                                          />
                                          <input 
                                            type="text" className="adm-input" style={{ padding: '6px 10px', fontSize: 12, height: 34, flex: 1, borderRadius: 8, border: '1.5px solid var(--adm-border)' }}
                                            value={cfg.color || '#0077b6'}
                                            onChange={(e) => handleShortcutConfigChange(idx, cfgIdx, 'color', e.target.value, columnTab)}
                                            placeholder="#0077b6"
                                          />
                                        </div>
                                      </div>
                                      <div className="adm-form-group" style={{ margin: 0 }}>
                                        <label style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Mở trong tab</label>
                                        <select 
                                          className="adm-input adm-select" style={{ padding: '6px 12px', fontSize: 12, height: 34, borderRadius: 8, border: '1.5px solid var(--adm-border)' }}
                                          value={cfg.target || '_self'}
                                          onChange={(e) => handleShortcutConfigChange(idx, cfgIdx, 'target', e.target.value, columnTab)}
                                        >
                                          <option value="_self">Trang hiện tại (_self)</option>
                                          <option value="_blank">Mở tab mới (_blank)</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div style={{ marginTop: 4 }}>
                                <button 
                                  type="button" className="btn btn-secondary btn-sm"
                                  style={{ padding: '8px 14px', fontSize: 12, borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                                  onClick={() => addShortcutToBlock(idx, columnTab)}
                                >
                                  ➕ Thêm liên kết mới
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Special settings for HTML block */}
                          {block.type === 'html' && (
                            <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 10 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', borderBottom: '1px dashed #cbd5e1', paddingBottom: 6 }}>
                                📝 Biên tập mã HTML / Văn bản tùy chỉnh:
                              </div>
                              <div style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                                <div className="adm-form-group" style={{ margin: 0 }}>
                                  <textarea 
                                    className="adm-input adm-textarea" 
                                    style={{ width: '100%', minHeight: 200, fontFamily: 'Fira Code, Consolas, Monaco, monospace', fontSize: 13, padding: 12, border: '1.5px solid var(--adm-border)', borderRadius: 8, background: '#f8fafc', lineHeight: 1.5 }}
                                    value={block.configs?.html || ''}
                                    onChange={(e) => handleHtmlContentChange(idx, e.target.value, columnTab)}
                                    placeholder="Nhập mã HTML hoặc văn bản tại đây..."
                                  />
                                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
                                    💡 Hỗ trợ mã HTML hoàn chỉnh, CSS inline và các thẻ iframe nhúng (bản đồ, video, v.v.).
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Special settings for category list widgets (Left column) */}
                          {block.type === 'categories' && (
                            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', borderBottom: '1px dashed #cbd5e1', paddingBottom: 6 }}>
                                ⚙️ Cấu hình Các danh mục tin tức (Hiển thị song song):
                              </div>
                              
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                                {(block.configs || []).map((cfg, cfgIdx) => (
                                  <div key={cfgIdx} style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', position: 'relative' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#eff6ff', padding: '6px 12px', borderRadius: 8 }}>
                                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-primary)' }}>🗂️ Danh mục #{cfgIdx + 1}</span>
                                      <button 
                                        type="button" 
                                        onClick={() => removeCategoryFromBlock(idx, cfgIdx, 'left')}
                                        style={{ padding: '4px 10px', fontSize: 11, height: 24, background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center' }}
                                        title="Xóa mục này"
                                      >
                                        Xóa danh mục
                                      </button>
                                    </div>
                                    
                                    <div className="adm-form-group" style={{ margin: 0 }}>
                                      <label style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Tiêu đề hiển thị</label>
                                      <input 
                                        type="text" className="adm-input" style={{ padding: '6px 10px', fontSize: 12, height: 34, borderRadius: 8, border: '1.5px solid var(--adm-border)' }}
                                        value={cfg.title || ''}
                                        onChange={(e) => handleCategoryConfigChange(idx, cfgIdx, 'title', e.target.value, 'left')}
                                        placeholder="Ví dụ: Hoạt động dạy học..."
                                      />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                      <div className="adm-form-group" style={{ margin: 0 }}>
                                        <label style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Chọn danh mục</label>
                                        <select 
                                          className="adm-input adm-select" style={{ padding: '6px 12px', fontSize: 12, height: 34, borderRadius: 8, border: '1.5px solid var(--adm-border)' }}
                                          value={cfg.cat || ''}
                                          onChange={(e) => handleCategoryConfigChange(idx, cfgIdx, 'cat', e.target.value, 'left')}
                                        >
                                          <option value="">-- Chọn danh mục --</option>
                                          {categoriesList.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                          ))}
                                        </select>
                                      </div>
                                      <div className="adm-form-group" style={{ margin: 0 }}>
                                        <label style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Tông màu thẻ</label>
                                        <select 
                                          className="adm-input adm-select" style={{ padding: '6px 12px', fontSize: 12, height: 34, borderRadius: 8, border: '1.5px solid var(--adm-border)' }}
                                          value={cfg.color || 'red'}
                                          onChange={(e) => handleCategoryConfigChange(idx, cfgIdx, 'color', e.target.value, 'left')}
                                        >
                                          <option value="red">🔴 Màu đỏ (Red)</option>
                                          <option value="blue">🔵 Màu xanh (Blue)</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div style={{ marginTop: 4 }}>
                                <button 
                                  type="button" 
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '8px 14px', fontSize: 12, borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                                  onClick={() => addCategoryToBlock(idx, 'left')}
                                >
                                  ➕ Thêm danh mục mới
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Special settings for sidebar banners & ads (Right column) */}
                          {block.type === 'sidebar_banners' && (
                            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', borderBottom: '1px dashed #cbd5e1', paddingBottom: 6 }}>
                                ⚙️ Cấu hình Banner quảng cáo & Liên kết Sidebar:
                              </div>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {(block.configs || []).map((cfg, cfgIdx) => (
                                  <div key={cfgIdx} style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#eff6ff', padding: '6px 12px', borderRadius: 8 }}>
                                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-primary)' }}>🖼️ Banner/Ad #{cfgIdx + 1}</span>
                                      <button 
                                        type="button" 
                                        onClick={() => removeBannerFromBlock(idx, cfgIdx, 'right')}
                                        style={{ padding: '4px 10px', fontSize: 11, height: 24, background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center' }}
                                      >
                                        Xóa banner
                                      </button>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                      <div className="adm-form-group" style={{ margin: 0 }}>
                                        <label style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Tiêu đề hiển thị (Label)</label>
                                        <input 
                                          type="text" className="adm-input" style={{ padding: '6px 10px', fontSize: 12, height: 34, borderRadius: 8, border: '1.5px solid var(--adm-border)' }}
                                          value={cfg.label || ''}
                                          onChange={(e) => handleBannerConfigChange(idx, cfgIdx, 'label', e.target.value, 'right')}
                                          placeholder="Ví dụ: Đăng ký tuyển sinh..."
                                        />
                                      </div>
                                      <div className="adm-form-group" style={{ margin: 0 }}>
                                        <label style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Đường dẫn liên kết (Href URL)</label>
                                        <input 
                                          type="text" className="adm-input" style={{ padding: '6px 10px', fontSize: 12, height: 34, borderRadius: 8, border: '1.5px solid var(--adm-border)' }}
                                          value={cfg.href || ''}
                                          onChange={(e) => handleBannerConfigChange(idx, cfgIdx, 'href', e.target.value, 'right')}
                                          placeholder="Ví dụ: /tuyen-sinh"
                                        />
                                      </div>
                                    </div>

                                    <div className="adm-form-group" style={{ margin: 0 }}>
                                      <label style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Đường dẫn hình ảnh quảng cáo (imageUrl) - <em>Để trống nếu chỉ dùng thẻ màu chữ</em></label>
                                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        {cfg.imageUrl && (
                                          <div style={{ width: 50, height: 34, borderRadius: 6, overflow: 'hidden', border: '1px solid #cbd5e1', flexShrink: 0, background: '#f1f5f9' }}>
                                            <img src={cfg.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                          </div>
                                        )}
                                        <input 
                                          type="text" className="adm-input" style={{ padding: '6px 10px', fontSize: 12, height: 34, flex: 1, borderRadius: 8, border: '1.5px solid var(--adm-border)' }}
                                          placeholder="Ví dụ: /banners/ads1.png hoặc đường link online..."
                                          value={cfg.imageUrl || ''}
                                          onChange={(e) => handleBannerConfigChange(idx, cfgIdx, 'imageUrl', e.target.value, 'right')}
                                        />
                                        <label style={{ 
                                          padding: '0 12px', background: 'var(--adm-primary-light)', color: 'var(--adm-primary)', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--adm-primary)', whiteSpace: 'nowrap', height: 34, boxSizing: 'border-box', transition: 'all 0.15s'
                                        }}>
                                          {uploadingIds[`sidebar-banner-${idx}-${cfgIdx}`] ? '⏳ Tải...' : '📤 Tải lên'}
                                          <input 
                                            type="file" accept="image/*" style={{ display: 'none' }}
                                            onChange={(e) => handleUploadSidebarBannerImage(idx, cfgIdx, e, 'right')}
                                            disabled={uploadingIds[`sidebar-banner-${idx}-${cfgIdx}`]}
                                          />
                                        </label>
                                      </div>
                                    </div>

                                    {!cfg.imageUrl && (
                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                        <div className="adm-form-group" style={{ margin: 0 }}>
                                          <label style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Emoji Icon</label>
                                          <input 
                                            type="text" className="adm-input" style={{ padding: '6px 10px', fontSize: 12, height: 34, borderRadius: 8, border: '1.5px solid var(--adm-border)' }}
                                            value={cfg.icon || '🏛️'}
                                            onChange={(e) => handleBannerConfigChange(idx, cfgIdx, 'icon', e.target.value, 'right')}
                                            placeholder="Ví dụ: 🏛️, 🔔, 📞"
                                          />
                                        </div>
                                        <div className="adm-form-group" style={{ margin: 0 }}>
                                          <label style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Màu nền thẻ (CSS Gradient/Hex)</label>
                                          <input 
                                            type="text" className="adm-input" style={{ padding: '6px 10px', fontSize: 12, height: 34, borderRadius: 8, border: '1.5px solid var(--adm-border)' }}
                                            value={cfg.bg || ''}
                                            onChange={(e) => handleBannerConfigChange(idx, cfgIdx, 'bg', e.target.value, 'right')}
                                            placeholder="Ví dụ: linear-gradient(135deg,#0d5bb5,#1a7ddb)"
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              <div style={{ marginTop: 4 }}>
                                <button 
                                  type="button" 
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '8px 14px', fontSize: 12, borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                                  onClick={() => addBannerToBlock(idx, 'right')}
                                >
                                  ➕ Thêm banner quảng cáo mới
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* ADD WIDGET BLOCK BOX */}
                <div style={{ background: '#f1f5f9', padding: 20, borderRadius: 10, border: '1.5px dashed #cbd5e1', marginBottom: 24 }}>
                  <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#475569', marginBottom: 12 }}>
                    ➕ Thêm Block (phần tử) mới vào {columnTab === 'left' ? 'Cột Trái' : 'Cột Phải (Sidebar)'}:
                  </h4>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {columnTab === 'left' ? (
                      <>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => addBlock('tabbed_news', 'left')}>📰 Tin tức nổi bật (Hero)</button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => addBlock('shortcuts', 'left')}>⚡ Lưới Liên kết nhanh</button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => addBlock('banner_slider', 'left')}>🖼️ Banner Slider</button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => addBlock('categories', 'left')}>🗂️ Khối cặp danh mục tin tức</button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => addBlock('html', 'left')}>📝 Khối HTML / Văn bản</button>
                      </>
                    ) : (
                      <>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => addBlock('search', 'right')}>🔍 Khung Tìm kiếm</button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => addBlock('quick_links', 'right')}>🔗 Menu Liên kết nhanh</button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => addBlock('schedule', 'right')}>📅 Widget Lịch công tác</button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => addBlock('notices', 'right')}>🔔 Widget Thông báo mới</button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => addBlock('sidebar_banners', 'right')}>🖼️ Khối Banners / Ads Quảng cáo</button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => addBlock('survey', 'right')}>📊 Widget Thăm dò ý kiến</button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => addBlock('stats', 'right')}>📈 Widget Thống kê truy cập</button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => addBlock('html', 'right')}>📝 Khối HTML / Văn bản</button>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={handleSaveSettings} className="btn btn-primary" disabled={saving}>
                    {saving ? 'Đang lưu...' : '💾 Lưu bố cục trang chủ'}
                  </button>
                  <button onClick={loadSettings} className="btn btn-secondary">
                    🔄 Tải lại bố cục mặc định
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: MENU CONFIG */}
          {activeTab === 'menu' && (
            <div className="adm-card">
              <div className="adm-card-header">
                <div className="adm-card-title">🌐 Cấu hình Menu chính (Navigation Bar)</div>
              </div>
              <div className="adm-card-body">
                
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, marginBottom: 20, border: '1px solid #e2e8f0', fontSize: 13, lineHeight: 1.6 }}>
                  💡 <strong>Hướng dẫn kéo thả:</strong> Bạn có thể dùng chuột <strong>bấm giữ biểu tượng ☰ và kéo</strong> các mục Menu chính (hoặc các mục Menu con trong cùng một nhóm) dưới đây để thay đổi thứ tự hiển thị. 
                  Hoặc sử dụng các nút mũi tên 🔼 / 🔽 để điều chỉnh. Nhớ bấm nút <strong>Lưu cấu hình Menu</strong> sau khi chỉnh sửa.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                  {mainMenu.map((item, idx) => (
                    <div 
                      key={idx}
                      draggable
                      onDragStart={(e) => handleMenuDragStart(e, idx)}
                      onDragOver={(e) => handleMenuDragOver(e, idx)}
                      onDragEnd={handleMenuDragEnd}
                      className={`block-builder-item ${draggedMenuIdx === idx ? 'dragging' : ''}`}
                      style={{ 
                        background: '#ffffff',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: 12,
                        padding: '16px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                      }}
                    >
                      {/* Menu Item Header Summary */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#eff6ff', padding: '6px 12px', borderRadius: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 18, cursor: 'grab', color: '#94a3b8' }}>☰</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-primary)' }}>Menu cấp 1 #{idx + 1}</span>
                          <strong style={{ fontSize: 14, color: '#334155' }}>
                            {item.label || '(Chưa nhập tên)'}
                          </strong>
                        </div>
                        
                        {/* Control buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button 
                            type="button" className="btn btn-secondary btn-sm" 
                            style={{ padding: '4px 8px', fontSize: 10, height: 24, display: 'flex', alignItems: 'center' }}
                            onClick={() => moveMainMenuItem(idx, -1)}
                            disabled={idx === 0}
                            title="Di chuyển lên"
                          >
                            🔼
                          </button>
                          <button 
                            type="button" className="btn btn-secondary btn-sm" 
                            style={{ padding: '4px 8px', fontSize: 10, height: 24, display: 'flex', alignItems: 'center' }}
                            onClick={() => moveMainMenuItem(idx, 1)}
                            disabled={idx === mainMenu.length - 1}
                            title="Di chuyển xuống"
                          >
                            🔽
                          </button>
                          <button 
                            type="button" 
                            className={`btn btn-sm ${expandedMenuItems[idx] ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ padding: '4px 8px', fontSize: 11, height: 24, fontWeight: 600, display: 'flex', alignItems: 'center' }}
                            onClick={() => toggleMenuExpansion(idx)}
                          >
                            {expandedMenuItems[idx] ? '🔼 Thu gọn con' : `⚙️ Menu con (${item.children?.length || 0})`}
                          </button>
                          <button 
                            type="button" 
                            style={{ padding: '4px 10px', fontSize: 11, height: 24, background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center' }}
                            onClick={() => removeMainMenuItem(idx)}
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      </div>

                      {/* Main fields */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div className="adm-form-group" style={{ margin: 0 }}>
                          <label style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Tên hiển thị Menu chính</label>
                          <input 
                            type="text" className="adm-input" style={{ padding: '6px 10px', fontSize: 12, height: 34, borderRadius: 8, border: '1.5px solid var(--adm-border)' }}
                            value={item.label || ''}
                            onChange={(e) => handleMenuChange(idx, 'label', e.target.value)}
                            placeholder="Ví dụ: Giới thiệu, Tin tức..."
                          />
                        </div>
                        <div className="adm-form-group" style={{ margin: 0 }}>
                          <label style={{ display: 'block', fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Đường dẫn liên kết (Href)</label>
                          <input 
                            type="text" className="adm-input" style={{ padding: '6px 10px', fontSize: 12, height: 34, borderRadius: 8, border: '1.5px solid var(--adm-border)' }}
                            value={item.href || ''}
                            onChange={(e) => handleMenuChange(idx, 'href', e.target.value)}
                            placeholder="Ví dụ: /, /news, /gioi-thieu..."
                          />
                        </div>
                      </div>

                      {/* Children list */}
                      {expandedMenuItems[idx] && (
                        <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', borderBottom: '1px dashed #cbd5e1', paddingBottom: 6 }}>
                            Danh mục con thả xuống (Sub-menu items):
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {(item.children || []).map((child, childIdx) => (
                              <div 
                                key={childIdx}
                                draggable
                                onDragStart={(e) => handleChildDragStart(e, idx, childIdx)}
                                onDragOver={(e) => handleChildDragOver(e, idx, childIdx)}
                                onDragEnd={handleChildDragEnd}
                                className={`block-builder-item ${draggedChildIdx === childIdx && draggedChildParentIdx === idx ? 'dragging' : ''}`}
                                style={{ background: '#fff', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.01)' }}
                              >
                                <span style={{ fontSize: 16, cursor: 'grab', color: '#94a3b8', padding: '0 4px' }}>☰</span>
                                
                                <input 
                                  type="text" className="adm-input" 
                                  style={{ padding: '4px 8px', fontSize: 12, height: 30, flex: 1, borderRadius: 6, border: '1.5px solid var(--adm-border)' }}
                                  value={child.label || ''}
                                  onChange={(e) => handleChildMenuChange(idx, childIdx, 'label', e.target.value)}
                                  placeholder="Tên menu con..."
                                />
                                
                                <input 
                                  type="text" className="adm-input" 
                                  style={{ padding: '4px 8px', fontSize: 12, height: 30, flex: 1.5, borderRadius: 6, border: '1.5px solid var(--adm-border)' }}
                                  value={child.href || ''}
                                  onChange={(e) => handleChildMenuChange(idx, childIdx, 'href', e.target.value)}
                                  placeholder="Đường dẫn (href)..."
                                />

                                <div style={{ display: 'flex', gap: 2 }}>
                                  <button 
                                    type="button" className="btn btn-secondary btn-sm"
                                    style={{ padding: '2px 4px', fontSize: 8, height: 22, display: 'flex', alignItems: 'center' }}
                                    onClick={() => moveChildMenuItem(idx, childIdx, -1)}
                                    disabled={childIdx === 0}
                                  >
                                    🔼
                                  </button>
                                  <button 
                                    type="button" className="btn btn-secondary btn-sm"
                                    style={{ padding: '2px 4px', fontSize: 8, height: 22, display: 'flex', alignItems: 'center' }}
                                    onClick={() => moveChildMenuItem(idx, childIdx, 1)}
                                    disabled={childIdx === item.children.length - 1}
                                  >
                                    🔽
                                  </button>
                                  <button 
                                    type="button" 
                                    style={{ padding: '2px 6px', fontSize: 10, height: 22, background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center' }}
                                    onClick={() => removeChildMenuItem(idx, childIdx)}
                                  >
                                    Xóa con
                                  </button>
                                </div>
                              </div>
                            ))}

                            {(item.children || []).length === 0 && (
                              <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>
                                Chưa có menu con. Nhấp &quot;Thêm menu con&quot; bên dưới để khởi tạo.
                              </div>
                            )}
                          </div>

                          <div style={{ marginTop: 4 }}>
                            <button 
                              type="button" className="btn btn-secondary btn-sm"
                              style={{ padding: '6px 12px', fontSize: 11, borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                              onClick={() => addChildMenuItem(idx)}
                            >
                              ➕ Thêm Menu con mới
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                  <button 
                    type="button" className="btn btn-secondary"
                    style={{ padding: '10px 18px', fontSize: 13, borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    onClick={addMainMenuItem}
                  >
                    ➕ Thêm mục Menu chính mới
                  </button>
                  <button onClick={handleSaveSettings} className="btn btn-primary" disabled={saving}>
                    {saving ? 'Đang lưu...' : '💾 Lưu cấu hình Menu'}
                  </button>
                  <button onClick={loadSettings} className="btn btn-secondary">
                    🔄 Tải lại dữ liệu gốc
                  </button>
                </div>

              </div>
            </div>
          )}
        </>
      )}

      {/* Styled JSX for HTML5 Drag Over states */}
      <style dangerouslySetInnerHTML={{ __html: `
        .block-builder-item.dragging {
          opacity: 0.4;
          border-style: dashed !important;
          border-color: var(--adm-primary) !important;
          background: #f8fafc !important;
        }
      ` }} />

    </AdminShell>
  );
}
