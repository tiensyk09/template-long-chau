// News data cho Trường Tiểu học Ngô Quyền
const CDN = 'https://budang.dongnai.gov.vn'; // Cục bộ/Online asset CDN fallback

export const categories = [
  { id: 'hoat-dong-dang-uy', name: 'Tin tức - Sự kiện', slug: 'hoat-dong-dang-uy' },
  { id: 'chi-dao-dieu-hanh', name: 'Thông báo nhà trường', slug: 'chi-dao-dieu-hanh' },
  { id: 'chinh-quyen-nha-nuoc', name: 'Hoạt động chuyên môn', slug: 'chinh-quyen-nha-nuoc' },
  { id: 'mat-tran-doan-the', name: 'Phong trào Đoàn - Đội', slug: 'mat-tran-doan-the' },
  { id: 'cai-cach-hanh-chinh', name: 'Tuyển sinh đầu cấp', slug: 'cai-cach-hanh-chinh' },
  { id: 'chuyen-doi-so', name: 'Ứng dụng CNTT - Chuyển đổi số', slug: 'chuyen-doi-so' },
  { id: 'kinh-te-moi-truong', name: 'Tài nguyên học tập', slug: 'kinh-te-moi-truong' },
  { id: 'van-hoa-xa-hoi', name: 'Góc Phụ huynh', slug: 'van-hoa-xa-hoi' },
  { id: 'an-ninh-quoc-phong', name: 'Gương sáng học sinh', slug: 'an-ninh-quoc-phong' },
  { id: 'lich-lam-viec', name: 'Lịch công tác tuần', slug: 'lich-lam-viec' },
  { id: 'thong-bao', name: 'Thông báo chung', slug: 'thong-bao' },
];

export const news = [
  {
    id: 1,
    slug: 'lich-cong-tac-tuan-truong-tieu-hoc-ngo-quyen',
    title: 'Lịch công tác tuần của Ban Giám hiệu Trường Tiểu học Ngô Quyền',
    summary: 'Ban Giám hiệu Trường Tiểu học Ngô Quyền thông báo chi tiết lịch công tác, lịch giảng dạy và hoạt động ngoại khóa tuần này.',
    content: `<p>Ban Giám hiệu Trường Tiểu học Ngô Quyền thông báo lịch công tác tuần (từ ngày 16/6/2026 đến ngày 21/6/2026):</p>
<p><strong>Thứ Hai, 16/6:</strong> Sáng: Chào cờ đầu tuần, sinh hoạt chủ đề "Mùa hè an toàn". Chiều: Họp hội đồng sư phạm nhà trường.</p>
<p><strong>Thứ Ba, 17/6:</strong> Sáng: Kiểm tra chuyên môn các khối lớp 4 và 5. Chiều: Sinh hoạt chuyên môn tổ khối.</p>
<p><strong>Thứ Tư, 18/6:</strong> Tổ chức các lớp bồi dưỡng năng khiếu nghệ thuật, thể thao và tin học cho học sinh.</p>
<p><strong>Thứ Năm, 19/6:</strong> Giao lưu chuyên môn với các trường tiểu học trên địa bàn quận.</p>
<p><strong>Thứ Sáu, 20/6:</strong> Sáng: Tổng kết tuần và xếp loại thi đua Đội Sao đỏ. Chiều: Họp Ban đại diện cha mẹ học sinh.</p>`,
    category: 'lich-lam-viec',
    categoryName: 'Lịch công tác tuần',
    image: `${CDN}/assets/budang/news/lichlamviec/llv.jpg`,
    date: '2026-06-16',
    dateDisplay: 'Thứ hai - 16/06/2026',
    author: 'Trường TH Ngô Quyền',
    featured: true,
    views: 254,
  },
  {
    id: 2,
    slug: 'truong-tieu-hoc-ngo-quyen-to-chuc-hoi-thi-giao-vien-day-gioi',
    title: 'Trường Tiểu học Ngô Quyền tổ chức Hội thi Giáo viên dạy giỏi cấp Trường',
    summary: 'Hội thi giáo viên dạy giỏi cấp Trường là dịp để các thầy cô giáo thể hiện năng lực sư phạm, trao đổi giảng dạy tích cực.',
    content: `<p>Thực hiện nhiệm vụ năm học, Trường Tiểu học Ngô Quyền long trọng tổ chức Hội thi Giáo viên dạy giỏi cấp Trường nhằm nâng cao chất lượng dạy học và phát triển chuyên môn giáo viên.</p>
<p>Hội thi thu hút sự tham gia nhiệt tình của đông đảo giáo viên các khối lớp. Các tiết dạy đều có sự đầu tư chu đáo về bài giảng điện tử, đồ dùng dạy học sáng tạo và phương pháp tích cực hóa người học.</p>`,
    category: 'hoat-dong-dang-uy',
    categoryName: 'Tin tức - Sự kiện',
    image: `${CDN}/assets/budang/news/2026_06/z7932909957349_2103e4c5015d497bfbd1ac4ec3e93745_20260613191642_20260613193150.jpg`,
    date: '2026-06-15',
    dateDisplay: 'Chủ nhật - 15/06/2026',
    author: 'Ban Giám Hiệu',
    featured: true,
    views: 98,
  },
  {
    id: 3,
    slug: 'dai-hoi-lien-doi-truong-tieu-hoc-ngo-quyen',
    title: 'Đại hội Liên đội Trường Tiểu học Ngô Quyền nhiệm kỳ mới',
    summary: 'Liên đội đã tổ chức thành công Đại hội nhằm tổng kết hoạt động năm học trước và đề ra phương hướng hoạt động Đội cho năm học mới.',
    content: `<p>Sáng ngày 12/6/2026, Liên đội Trường Tiểu học Ngô Quyền đã long trọng tổ chức Đại hội Liên đội nhiệm kỳ mới nhằm kiện toàn Ban chỉ huy Liên đội và định hướng phong trào rèn luyện.</p>
<p>Đại hội đã biểu quyết thông qua các mục tiêu lớn về học tập tốt, rèn luyện chăm và xây dựng phong trào Đội vững mạnh xuất sắc.</p>`,
    category: 'hoat-dong-dang-uy',
    categoryName: 'Tin tức - Sự kiện',
    image: `${CDN}/assets/budang/news/2026_06/z7913512508502_b13887c87703c40004c0339f7250aa5f.jpg`,
    date: '2026-06-12',
    dateDisplay: 'Thứ sáu - 12/06/2026',
    author: 'Tổng phụ trách Đội',
    featured: false,
    views: 121,
  },
  {
    id: 4,
    slug: 'chuyen-de-day-hoc-tich-hop-stem',
    title: 'Chuyên đề dạy học tích hợp STEM tại các khối lớp Trường Tiểu học Ngô Quyền',
    summary: 'Nhà trường đã tổ chức thành công chuyên đề giảng dạy tích hợp giáo dục STEM, thu hút sự tham gia tích cực và hào hứng của học sinh.',
    content: `<p>Nhằm trang bị kiến thức thực tiễn cho học sinh, tổ chuyên môn Trường Tiểu học Ngô Quyền đã thực hiện tiết dạy mẫu tích hợp giáo dục STEM.</p>
<p>Thông qua hoạt động thực hành, học sinh được tự tay thiết kế sản phẩm khoa học độc đáo từ phế liệu, phát huy tư duy logic và sáng tạo.</p>`,
    category: 'chinh-quyen-nha-nuoc',
    categoryName: 'Hoạt động chuyên môn',
    image: `${CDN}/assets/budang/news/2026_06/z7924599577570_98ffcaa2bd47559a50a28c10b30c7f29.jpg`,
    date: '2026-06-12',
    dateDisplay: 'Thứ sáu - 12/06/2026',
    author: 'Tổ chuyên môn',
    featured: false,
    views: 89,
  },
  {
    id: 5,
    slug: 'trien-khai-ke-hoach-on-tap-va-kiem-tra-cuoi-ky',
    title: 'Triển khai kế hoạch ôn tập và kiểm tra định kỳ cuối học kỳ II',
    summary: 'Ban Giám hiệu Trường Tiểu học Ngô Quyền triển khai hướng dẫn ôn tập và tổ chức kiểm tra định kỳ cuối kỳ cho các em học sinh.',
    content: `<p>Để chuẩn bị tốt nhất cho kỳ thi cuối học kỳ II, Ban Giám hiệu nhà trường đã phổ biến đề cương ôn tập đến toàn thể phụ huynh và học sinh.</p>
<p>Kỳ kiểm tra sẽ được tổ chức nghiêm túc, đúng quy chế nhằm đánh giá khách quan kết quả học tập của các em học sinh trong cả năm học.</p>`,
    category: 'chi-dao-dieu-hanh',
    categoryName: 'Thông báo nhà trường',
    image: `${CDN}/assets/budang/news/2026_05/3_5.jpg`,
    date: '2026-05-29',
    dateDisplay: 'Thứ sáu - 29/05/2026',
    author: 'Ban Giám Hiệu',
    featured: true,
    views: 316,
  },
  {
    id: 6,
    slug: 'huong-dan-dang-ky-tuyen-sinh-lop-1-truc-tuyen',
    title: 'Hướng dẫn đăng ký tuyển sinh lớp 1 trực tuyến năm học mới',
    summary: 'Nhằm tạo điều kiện thuận lợi cho phụ huynh, nhà trường hướng dẫn quy trình chi tiết đăng ký hồ sơ tuyển sinh trực tuyến vào lớp 1.',
    content: `<p>Trường Tiểu học Ngô Quyền xin gửi tới Quý phụ huynh hướng dẫn các bước đăng ký tuyển sinh trực tuyến vào lớp 1 cho trẻ sinh năm 2019 cư trú tại địa bàn tuyển sinh của trường.</p>
<p>Hồ sơ bao gồm: Giấy khai sinh, mã số tuyển sinh trực tuyến và thông tin liên hệ của phụ huynh học sinh.</p>`,
    category: 'cai-cach-hanh-chinh',
    categoryName: 'Tuyển sinh đầu cấp',
    image: `${CDN}/assets/budang/news/2026_06/z7923860853839_08df59b4bda4b88b0302c201d399b802.jpg`,
    date: '2026-06-12',
    dateDisplay: 'Thứ sáu - 12/06/2026',
    author: 'Hội đồng Tuyển sinh',
    featured: true,
    views: 152,
  },
  {
    id: 7,
    slug: 'day-manh-chuyen-doi-so-va-ung-dung-bai-giang-tu-e-learning',
    title: 'Đẩy mạnh chuyển đổi số và ứng dụng bài giảng điện tử E-learning trong giảng dạy',
    summary: '100% lớp học tại Trường Tiểu học Ngô Quyền đã áp dụng giảng dạy tương tác thông minh và số hóa học bạ điện tử.',
    content: `<p>Chào mừng năm học mới, nhà trường đã đầu tư nâng cấp cơ sở vật chất phòng máy tính, lắp đặt máy chiếu hiện đại phục vụ Chuyển đổi số học tập.</p>
<p>Các thầy cô tích cực soạn bài giảng tương tác E-learning chất lượng cao, giúp học sinh hứng thú học tập và tiếp thu kiến thức trực quan hơn.</p>`,
    category: 'chuyen-doi-so',
    categoryName: 'Ứng dụng CNTT - Chuyển đổi số',
    image: `${CDN}/assets/budang/news/2026_06/z7912842377403_08b65d810baaa9da57fb5f5846c2f854.jpg`,
    date: '2026-06-08',
    dateDisplay: 'Chủ nhật - 08/06/2026',
    author: 'Tổ Tin học',
    featured: false,
    views: 444,
  },
  {
    id: 8,
    slug: 'phong-trao-xay-dung-truong-hoc-than-thien-hoc-sinh-tich-cuc',
    title: 'Phát động phong trào "Xây dựng trường học thân thiện, học sinh tích cực"',
    summary: 'Nhà trường phát động phong trào thi đua tạo dựng môi trường học tập xanh, sạch, đẹp, an toàn và thân thiện cho các em học sinh.',
    content: `<p>Nhà trường triển khai phong trào xây dựng lớp học thân thiện, tổ chức trồng và chăm sóc bồn hoa cây cảnh trong khuôn viên trường học.</p>
<p>Phong trào giúp học sinh rèn luyện tinh thần tập thể, tình yêu lao động và giữ gìn môi trường học đường luôn sạch đẹp.</p>`,
    category: 'chi-dao-dieu-hanh',
    categoryName: 'Thông báo nhà trường',
    image: `${CDN}/assets/budang/news/2026_05/2_20260526141636.jpg`,
    date: '2026-05-30',
    dateDisplay: 'Thứ bảy - 30/05/2026',
    author: 'Hiệu trưởng',
    featured: false,
    views: 201,
  },
  {
    id: 9,
    slug: 'ra-quan-ngay-chu-nhat-xanh-lam-sach-khu-on-vien-truong',
    title: 'Chi đoàn Giáo viên và Đội viên ra quân làm sạch khuôn viên trường học',
    summary: 'Hưởng ứng phong trào bảo vệ môi trường, chi đoàn cùng liên đội trường tổ chức lao động dọn vệ sinh xanh - sạch - đẹp học đường.',
    content: `<p>Nhằm giáo dục ý thức bảo vệ môi trường, Liên đội phối hợp Chi đoàn Giáo viên Trường Tiểu học Ngô Quyền đã tổ chức buổi ra quân quét dọn, thu gom rác thải trong và ngoài cổng trường.</p>`,
    category: 'mat-tran-doan-the',
    categoryName: 'Phong trào Đoàn - Đội',
    image: `${CDN}/assets/budang/news/2026_06/z7912794472572_dbe9b68c4c67b8daa498e741c3d87933.jpg`,
    date: '2026-06-07',
    dateDisplay: 'Chủ nhật - 07/06/2026',
    author: 'Đoàn Thanh Niên',
    featured: false,
    views: 178,
  },
  {
    id: 10,
    slug: 'gioi-thieu-tu-sach-hoc-tap-va-tham-khao-moi-tai-thu-vien',
    title: 'Giới thiệu tủ sách học tập và tham khảo mới tại Thư viện trường',
    summary: 'Thư viện Trường Tiểu học Ngô Quyền vừa tiếp nhận và giới thiệu hàng trăm đầu sách tham khảo học tập chất lượng cao.',
    content: `<p>Nhằm thúc đẩy văn hóa đọc trong trường học, Thư viện trường đã trang bị thêm tủ sách mới với nhiều truyện tranh giáo dục, sách khám phá khoa học và sách tham khảo ôn tập hữu ích.</p>`,
    category: 'kinh-te-moi-truong',
    categoryName: 'Tài nguyên học tập',
    image: `${CDN}/assets/budang/news/2026_05/1_5.jpg`,
    date: '2026-05-30',
    dateDisplay: 'Thứ bảy - 30/05/2026',
    author: 'Cán bộ Thư viện',
    featured: false,
    views: 136,
  },
  {
    id: 11,
    slug: 'to-chuc-chuong-trinh-ngoai-khoa-giao-duc-ky-nang-song',
    title: 'Tổ chức chương trình ngoại khóa giáo dục kỹ năng sống cho học sinh',
    summary: 'Chương trình ngoại khóa thiết thực trang bị kỹ năng phòng tránh tai nạn thương tích và tự vệ cơ bản cho học sinh.',
    content: `<p>Nhà trường phối hợp cùng Trung tâm Kỹ năng sống tổ chức buổi ngoại khóa hướng dẫn học sinh cách xử lý tình huống khẩn cấp, bảo vệ bản thân và ứng xử văn minh học đường.</p>`,
    category: 'chinh-quyen-nha-nuoc',
    categoryName: 'Hoạt động chuyên môn',
    image: `${CDN}/assets/budang/news/2026_06/6_1.jpg`,
    date: '2026-06-07',
    dateDisplay: 'Chủ nhật - 07/06/2026',
    author: 'Ban Giám Hiệu',
    featured: false,
    views: 93,
  },
  {
    id: 12,
    slug: 'su-dung-phan-mem-quan-ly-truong-hoc-va-so-lien-lac-dien-tu',
    title: 'Đẩy mạnh kết nối gia đình qua hệ thống sổ liên lạc điện tử',
    summary: 'Sổ liên lạc điện tử giúp phụ huynh dễ dàng cập nhật thông tin học tập, rèn luyện của học sinh từ giáo viên chủ nhiệm.',
    content: `<p>Trường Tiểu học Ngô Quyền đã áp dụng 100% hệ thống tin nhắn điện tử và học bạ số, giúp kết nối thông tin đa chiều và nhanh chóng giữa nhà trường với phụ huynh.</p>`,
    category: 'chuyen-doi-so',
    categoryName: 'Ứng dụng CNTT - Chuyển đổi số',
    image: `${CDN}/assets/budang/news/2026_05/bia-chuyen-doi-so.jpg`,
    date: '2026-05-27',
    dateDisplay: 'Thứ tư - 27/05/2026',
    author: 'Ban Biên Tập',
    featured: false,
    views: 267,
  },
  {
    id: 13,
    slug: 'le-be-giang-va-tuyen-duong-hoc-sinh-xuat-sac-nam-hoc-vua-qua',
    title: 'Trường Tiểu học Ngô Quyền long trọng tổ chức Lễ bế giảng năm học',
    summary: 'Lễ bế giảng năm học diễn ra trong không khí trang trọng, ấm áp ghi nhận những nỗ lực học tập xuất sắc của thầy và trò nhà trường.',
    content: `<p>Sáng ngày 05/6/2026, Trường Tiểu học Ngô Quyền tổ chức Lễ bế giảng và tuyên dương khen thưởng giáo viên, học sinh có thành tích xuất sắc trong năm học vừa qua.</p>`,
    category: 'van-hoa-xa-hoi',
    categoryName: 'Góc Phụ huynh',
    image: `${CDN}/assets/budang/news/2026_06/bac-ho-115.jpg`,
    date: '2026-06-05',
    dateDisplay: 'Thứ sáu - 05/06/2026',
    author: 'Ban Biên Tập',
    featured: false,
    views: 312,
  },
];

// Banner images
export const bannerImages = [
  {
    id: 1,
    src: '',
    alt: 'Trường Tiểu học Ngô Quyền - Giáo dục toàn diện, nâng cánh ước mơ',
    caption: 'Chào mừng quý phụ huynh và các em học sinh đến với Cổng thông tin Trường Tiểu học Ngô Quyền',
    bg: 'linear-gradient(135deg, #1a6bb5, #003380)',
  },
  {
    id: 2,
    src: '',
    alt: 'Xây dựng trường học xanh - sạch - đẹp - an toàn',
    caption: 'Đẩy mạnh thi đua dạy tốt - học tốt, xây dựng môi trường giáo dục an toàn, thân thiện',
    bg: 'linear-gradient(135deg, #059669, #1b4332)',
  },
  {
    id: 3,
    src: '',
    alt: 'Chuyển đổi số học đường - Ứng dụng công nghệ thông tin tương tác',
    caption: 'Ứng dụng hiệu quả công nghệ thông tin trong dạy học và quản lý giáo dục hiện đại',
    bg: 'linear-gradient(135deg, #d32f2f, #8B0000)',
  },
];

export function getNewsByCategory(categorySlug, limit = 5) {
  return news.filter(n => n.category === categorySlug).slice(0, limit);
}
export function getFeaturedNews(limit = 5) {
  return news.filter(n => n.featured).slice(0, limit);
}
export function getLatestNews(limit = 10) {
  return [...news].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
}
export function getNewsBySlug(slug) {
  return news.find(n => n.slug === slug);
}
