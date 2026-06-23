#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Crawl images from budang.dongnai.gov.vn RSS feed and article pages
Then generate a mapping file to update news.js
"""

import urllib.request
import urllib.error
import json
import re
import xml.etree.ElementTree as ET

BASE_URL = "https://budang.dongnai.gov.vn"
RSS_URLS = [
    "https://budang.dongnai.gov.vn/vi/news/rss/",
    "https://budang.dongnai.gov.vn/vi/news/lich-lam-viec/rss/",
    "https://budang.dongnai.gov.vn/vi/news/hoat-dong-dang-uy/rss/",
    "https://budang.dongnai.gov.vn/vi/news/hoat-dong-chinh-quyen-nha-nuoc/rss/",
    "https://budang.dongnai.gov.vn/vi/news/cai-cach-hanh-chinh/rss/",
    "https://budang.dongnai.gov.vn/vi/news/cai-cach-hanh-chinh-95/rss/",
    "https://budang.dongnai.gov.vn/vi/news/van-hoa-xa-hoi/rss/",
    "https://budang.dongnai.gov.vn/vi/news/kinh-te-moi-truong/rss/",
    "https://budang.dongnai.gov.vn/vi/news/mat-tran-doan-the/rss/",
    "https://budang.dongnai.gov.vn/vi/news/an-ninh-quoc-phong/rss/",
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

def fetch_url(url):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"  [ERROR] {url}: {e}")
        return None

def extract_img_from_description(desc_text):
    """Extract image URL from RSS description CDATA"""
    m = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', desc_text, re.IGNORECASE)
    if m:
        url = m.group(1)
        if url.startswith("//"):
            url = "https:" + url
        elif not url.startswith("http"):
            url = BASE_URL + url
        return url
    return None

def extract_img_from_article(html):
    """Extract main article image from full article HTML"""
    patterns = [
        r'<div[^>]+class=["\'][^"\']*news[_-]?img[^"\']*["\'][^>]*>.*?<img[^>]+src=["\']([^"\']+)["\']',
        r'<div[^>]+class=["\'][^"\']*detail[^"\']*["\'][^>]*>.*?<img[^>]+src=["\']([^"\']+)["\']',
        r'<img[^>]+class=["\'][^"\']*homeimg[^"\']*["\'][^>]+src=["\']([^"\']+)["\']',
        r'<div[^>]+id=["\']news_detail["\'][^>]*>.*?<img[^>]+src=["\']([^"\']+)["\']',
        r'<img[^>]+src=["\']([^"\']+(?:jpg|jpeg|png|webp))["\']',
    ]
    for pat in patterns:
        m = re.search(pat, html, re.IGNORECASE | re.DOTALL)
        if m:
            url = m.group(1)
            if url.startswith("//"):
                url = "https:" + url
            elif not url.startswith("http"):
                url = BASE_URL + url
            # Skip tiny icons and logos
            if any(skip in url for skip in ["logo", "icon", "favicon", "avatar", "banner"]):
                continue
            return url
    return None

def parse_rss(content):
    """Parse RSS XML and return list of {title, link, image_url}"""
    items = []
    try:
        root = ET.fromstring(content)
        channel = root.find("channel")
        if channel is None:
            return items
        for item in channel.findall("item"):
            title_el = item.find("title")
            link_el = item.find("link")
            desc_el = item.find("description")

            title = title_el.text.strip() if title_el is not None and title_el.text else ""
            link = link_el.text.strip() if link_el is not None and link_el.text else ""
            image_url = ""

            if desc_el is not None and desc_el.text:
                image_url = extract_img_from_description(desc_el.text) or ""

            items.append({
                "title": title,
                "link": link,
                "image_url": image_url,
            })
    except Exception as e:
        print(f"  [PARSE ERROR] {e}")
    return items

def normalize_title(title):
    """Normalize title for fuzzy matching"""
    # Remove Vietnamese diacritics would be complex, do simple lowercase + strip
    return re.sub(r'\s+', ' ', title.strip().lower())

# ─── NEWS.JS articles (slug + title for matching) ──────────────────────────────
NEWS_JS_ARTICLES = [
    {"id": 1, "slug": "lich-lam-viec-tuan-25-dang-uy-hdnd-ubnd-tayttra",
     "title": "Lịch làm việc tuần 25 của Đảng ủy – HĐND – UBND – UBMTTQVN xã Tây Trà"},
    {"id": 2, "slug": "quan-tam-tao-dieu-kien-quang-ngai-phat-trien-dot-pha",
     "title": "Quan tâm, tạo điều kiện để Quảng Ngãi phát triển đột phá"},
    {"id": 3, "slug": "dai-bieu-hdnd-tinh-va-hdnd-xa-tiep-nhan-11-luot-y-kien",
     "title": "Tây Trà: Đại biểu HĐND tỉnh và HĐND xã tiếp nhận 11 lượt ý kiến tại buổi tiếp xúc cử tri"},
    {"id": 4, "slug": "to-dai-bieu-so-2-hdnd-xa-tiep-xuc-cu-tri-tai-thon-dong-ke",
     "title": "Tây Trà: Tổ đại biểu số 2 HĐND xã tiếp xúc cử tri tại thôn Đồng Kê"},
    {"id": 5, "slug": "so-ket-mot-nam-van-hanh-mo-hinh-chinh-quyen-2-cap",
     "title": "Tây Trà: Sơ kết một năm vận hành mô hình chính quyền địa phương 2 cấp"},
    {"id": 6, "slug": "thanh-nien-tay-tra-doi-mua-tiep-suc-mua-thi",
     "title": 'Thanh niên xã Tây Trà "Đội mưa tiếp sức mùa thi"'},
    {"id": 7, "slug": "tap-huan-su-dung-ai-cho-can-bo-cong-chuc",
     "title": "Tây Trà: Tổ chức tập huấn sử dụng AI cho cán bộ, công chức, viên chức và người lao động"},
    {"id": 8, "slug": "phat-dong-dot-thi-dua-500-ngay-dem",
     "title": 'Phát động đợt thi đua đặc biệt 500 ngày đêm "Đoàn kết – Kỷ cương – Hiệu quả – Bứt phá"'},
    {"id": 9, "slug": "ra-quan-bao-ve-moi-truong-viet-nam-xanh",
     "title": 'Tây Trà: Ra quân hưởng ứng phong trào "Toàn dân chung tay bảo vệ môi trường, vì một Việt Nam xanh – sạch – đẹp"'},
    {"id": 10, "slug": "ngan-hang-chinh-sach-kich-hoat-dong-von",
     "title": "Ngân hàng Chính sách xã hội Tây Trà: Kích hoạt dòng vốn Nghị định 338/2025/NĐ-CP, tiếp sức cho người lao động"},
    {"id": 11, "slug": "tham-hoi-chuc-tho-90-tuoi",
     "title": "Tây Trà: Thăm hỏi, chúc thọ các cụ tròn 90 tuổi"},
    {"id": 12, "slug": "day-manh-chuyen-doi-so-nang-cao-chat-luong-phuc-vu",
     "title": "Tây Trà: Đẩy mạnh chuyển đổi số nâng cao chất lượng phục vụ người dân"},
    {"id": 13, "slug": "le-ky-niem-115-nam-bac-ho",
     "title": "Tây Trà long trọng tổ chức Lễ kỷ niệm 115 năm ngày Bác Hồ ra đi tìm đường cứu nước"},
]

# Keywords per article for matching RSS titles
MATCH_KEYWORDS = {
    1: ["lịch làm việc tuần 25", "tuần 25"],
    2: ["quan tâm", "tạo điều kiện", "đột phá"],
    3: ["11 lượt ý kiến", "tiếp xúc cử tri", "hdnd", "tỉnh"],
    4: ["tổ đại biểu số 2", "đồng kê", "đoàn kết"],
    5: ["sơ kết", "2 cấp", "chính quyền"],
    6: ["thanh niên", "đội mưa", "tiếp sức mùa thi"],
    7: ["tập huấn", "ai", "trí tuệ nhân tạo"],
    8: ["500 ngày", "thi đua đặc biệt"],
    9: ["bảo vệ môi trường", "xanh sạch đẹp", "việt nam xanh"],
    10: ["ngân hàng chính sách", "338"],
    11: ["chúc thọ", "90 tuổi", "thăm hỏi"],
    12: ["chuyển đổi số", "nâng cao chất lượng"],
    13: ["115 năm", "bác hồ", "tìm đường cứu nước"],
}

def score_match(article_id, rss_title):
    """Score how well an RSS title matches a news.js article"""
    rss_norm = normalize_title(rss_title)
    keywords = MATCH_KEYWORDS.get(article_id, [])
    score = sum(1 for kw in keywords if kw in rss_norm)
    return score

def main():
    print("=" * 60)
    print("Crawling RSS feeds from budang.dongnai.gov.vn...")
    print("=" * 60)

    all_rss_items = []

    for rss_url in RSS_URLS:
        print(f"\nFetching: {rss_url}")
        content = fetch_url(rss_url)
        if content:
            items = parse_rss(content)
            print(f"  Found {len(items)} items")
            all_rss_items.extend(items)

    # Remove duplicates by link
    seen_links = set()
    unique_items = []
    for item in all_rss_items:
        if item["link"] not in seen_links:
            seen_links.add(item["link"])
            unique_items.append(item)
    all_rss_items = unique_items
    print(f"\nTotal unique RSS items: {len(all_rss_items)}")

    # ── Match each news.js article to best RSS item ──────────────────────────
    results = {}  # article_id -> {image_url, title, source_link}

    for article in NEWS_JS_ARTICLES:
        art_id = article["id"]
        best_score = 0
        best_item = None

        for rss_item in all_rss_items:
            score = score_match(art_id, rss_item["title"])
            if score > best_score:
                best_score = score
                best_item = rss_item

        if best_item and best_score > 0:
            image_url = best_item.get("image_url", "")

            # If no image in RSS description, try fetching full article
            if not image_url and best_item.get("link"):
                print(f"\nFetching full article for ID {art_id}: {best_item['link']}")
                html = fetch_url(best_item["link"])
                if html:
                    image_url = extract_img_from_article(html) or ""

            results[art_id] = {
                "article_title": article["title"],
                "rss_title": best_item["title"],
                "image_url": image_url,
                "source_link": best_item.get("link", ""),
                "match_score": best_score,
            }
            print(f"  [ID {art_id}] score={best_score} img={image_url[:80] if image_url else 'NOT FOUND'}")
        else:
            results[art_id] = {
                "article_title": article["title"],
                "rss_title": "",
                "image_url": "",
                "source_link": "",
                "match_score": 0,
            }
            print(f"  [ID {art_id}] NO MATCH FOUND")

    # ── Save mapping JSON ─────────────────────────────────────────────────────
    output_path = r"C:\taytra\bu-dang-portal\scripts\image_mapping.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*60}")
    print(f"Image mapping saved to: {output_path}")
    print("=" * 60)

    # ── Print summary ─────────────────────────────────────────────────────────
    found = sum(1 for v in results.values() if v["image_url"])
    print(f"Images found: {found}/{len(NEWS_JS_ARTICLES)}")
    print()
    for art_id, data in results.items():
        status = "✓" if data["image_url"] else "✗"
        print(f"  {status} ID {art_id}: {data['image_url'][:90] if data['image_url'] else 'MISSING'}")

if __name__ == "__main__":
    main()
