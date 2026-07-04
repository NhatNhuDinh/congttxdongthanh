// ===== Dữ liệu giả lập cho demo đa vai trò (không có backend) =====
// Hệ thống số hóa thu giá DV vệ sinh môi trường — Xã Đông Thạnh (theo Tài liệu thiết kế v2.0)
// 5 vai trò: Quản trị (QT) · Cán bộ xã (CB) · Người thu hộ (NTH) · Kế toán (KT) · Lãnh đạo (LĐ)

export const AREAS = [
  { id: 'TTT', name: 'Thới Tam Thôn' },
  { id: 'NB', name: 'Nhị Bình' },
  { id: 'DT', name: 'Đông Thạnh' },
]

export const CURRENT_PERIOD = {
  id: '2026Q3',
  name: 'Quý 3/2026',
  monthlyRate: 66000, // đ/tháng theo bảng giá QĐ 67/2025 (giả lập)
  months: 3,
}

// TH-01: lãnh đạo cấu hình phân công theo tuyến/địa bàn; hệ thống tự sinh danh sách mỗi kỳ
export const ROUTE = {
  id: 'TUYEN-07',
  name: 'Tuyến 07 — Đặng Thúc Vịnh & lân cận',
  note: 'Phân công đổi được theo tháng/quý',
}

export const BATCH = {
  id: 'DOT-2026Q3-01',
  name: 'Đợt 1 — Quý 3/2026',
  assignedBy: 'Chủ tịch UBND xã',
  assignedDate: '01/07/2026',
  dueDate: '31/07/2026',
}

// Người thu hộ đang đăng nhập ở bản demo vai NTH
export const COLLECTOR = {
  username: 'thuho',
  name: 'Trần Văn Tổ',
  code: 'NTH-007',
  role: 'Người thu hộ — Tổ trưởng TDP',
  phone: '0903 123 456',
}

// Danh sách người thu hộ (DM-09) — lãnh đạo phân công theo tuyến
export const COLLECTORS = [
  { code: 'NTH-007', name: 'Trần Văn Tổ', kind: 'Tổ trưởng TDP', route: 'TUYEN-07', area: 'DT', phone: '0903 123 456' },
  { code: 'NTH-004', name: 'Lê Thị Bưởi', kind: 'Cộng tác viên', route: 'TUYEN-04', area: 'NB', phone: '0907 456 789' },
  { code: 'NTH-011', name: 'Phan Văn Rớt', kind: 'NV đơn vị thu gom', route: 'TUYEN-11', area: 'TTT', phone: '0902 789 456' },
]

export const CASH_DEADLINE = 'trước 17:00 cùng ngày'
export const CASH_DEADLINE_SHORT = '17:00 hôm nay'

// ---- Che dữ liệu cá nhân khi hiển thị (mục 9 — NĐ 13/2023) ----
export const maskCccd = (c) => {
  if (!c) return ''
  const d = c.replace(/\s/g, '')
  return d.slice(0, 3) + '•'.repeat(Math.max(0, d.length - 5)) + d.slice(-2)
}
export const maskPhone = (p) => {
  if (!p) return ''
  const d = p.replace(/\s/g, '')
  return d.slice(0, 4) + '•••' + d.slice(-3)
}

// ---- Hộ dân ----
// assignedTo: người thu hộ được phân công (NTH-007 = tuyến demo). null = chưa vào tuyến nào.
export const HOUSEHOLDS = [
  { id: 'HO-DT-00125', name: 'Nguyễn Văn Hòa', cccd: '079068001234', phone: '0903 555 111', address: '12/3 Ấp 5, Đông Thạnh', oldAddress: '12/3 Ấp 5, xã Đông Thạnh, H. Hóc Môn (cũ)', area: 'DT', members: 4 },
  { id: 'HO-DT-00126', name: 'Trần Thị Mai', cccd: '079172009876', phone: '0918 222 333', address: '45 Đặng Thúc Vịnh, Đông Thạnh', oldAddress: '45 Đặng Thúc Vịnh, xã Đông Thạnh, H. Hóc Môn (cũ)', area: 'DT', members: 3 },
  { id: 'HO-TTT-00087', name: 'Lê Minh Tuấn', cccd: '079085004567', phone: '0977 888 999', address: '78/2 Ấp Tam Đông, Thới Tam Thôn', oldAddress: '78/2 Ấp Tam Đông, xã Thới Tam Thôn, H. Hóc Môn (cũ)', area: 'TTT', members: 5 },
  { id: 'HO-TTT-00088', name: 'Phạm Thị Lan', cccd: '079190002345', phone: '0938 444 555', address: '23 Tô Ký, Thới Tam Thôn', oldAddress: '23 Tô Ký, xã Thới Tam Thôn, H. Hóc Môn (cũ)', area: 'TTT', members: 2 },
  { id: 'HO-TTT-00090', name: 'Võ Văn Chín', cccd: '079075006789', phone: '0909 666 777', address: '156 Nguyễn Ảnh Thủ, Thới Tam Thôn', oldAddress: '156 Nguyễn Ảnh Thủ, xã Thới Tam Thôn, H. Hóc Môn (cũ)', area: 'TTT', members: 6 },
  { id: 'HO-NB-00031', name: 'Đỗ Thị Hồng', cccd: '079160001111', phone: '0912 333 444', address: '8/1 Ấp 2, Nhị Bình', oldAddress: '8/1 Ấp 2, xã Nhị Bình, H. Hóc Môn (cũ)', area: 'NB', members: 2, exemption: { type: 'Hộ cận nghèo', percent: 50 } },
  { id: 'HO-NB-00032', name: 'Bùi Văn Sáu', cccd: '079055008888', phone: '0987 111 222', address: '34 Bùi Công Trừng, Nhị Bình', oldAddress: '34 Bùi Công Trừng, xã Nhị Bình, H. Hóc Môn (cũ)', area: 'NB', members: 4 },
  { id: 'HO-NB-00033', name: 'Ngô Thị Tư', cccd: '079148003333', phone: '0965 777 888', address: '90/5 Ấp 4, Nhị Bình', oldAddress: '90/5 Ấp 4, xã Nhị Bình, H. Hóc Môn (cũ)', area: 'NB', members: 3 },
  { id: 'HO-DT-00127', name: 'Hoàng Văn Nam', cccd: '079082005555', phone: '0933 999 000', address: '67 Lê Văn Khương, Đông Thạnh', oldAddress: '67 Lê Văn Khương, xã Đông Thạnh, H. Hóc Môn (cũ)', area: 'DT', members: 4 },
  { id: 'HO-TTT-00091', name: 'Đinh Thị Chi', cccd: '079195007777', phone: '0908 121 314', address: '11 Trung Đông, Thới Tam Thôn', oldAddress: '11 Trung Đông, xã Thới Tam Thôn, H. Hóc Môn (cũ)', area: 'TTT', members: 2 },
  // Hộ ngoài tuyến NTH-007 — phục vụ CB (tra cứu toàn xã) và vai khác
  { id: 'HO-DT-00200', name: 'Lý Văn Bảy', cccd: '079070009999', phone: '0917 654 321', address: '5/9 Ấp 7, Đông Thạnh', oldAddress: '5/9 Ấp 7, xã Đông Thạnh, H. Hóc Môn (cũ)', area: 'DT', members: 5 },
  { id: 'HO-NB-00050', name: 'Mai Thị Hai', cccd: '079158002222', phone: '0902 468 135', address: '120 Đường Nhị Bình 15, Nhị Bình', oldAddress: '120 Hương lộ 80B, xã Nhị Bình, H. Hóc Môn (cũ)', area: 'NB', members: 3 },
  // Hộ mới đăng ký — CB dùng để tạo khoản thu lẻ (HD-03)
  { id: 'HO-TTT-00120', name: 'Trương Văn Chức', cccd: '079088006666', phone: '0939 246 810', address: '200 Tô Ký, Thới Tam Thôn', oldAddress: '(Hộ mới đăng ký 06/2026 — chưa có khoản thu)', area: 'TTT', members: 4, isNew: true },
  // Hộ nghi trùng khi hợp nhất 3 xã (DM-04) — CB xử lý chống trùng
  { id: 'HO-DT-00128', name: 'Nguyễn Văn Hoà', cccd: '079068001234', phone: '0903 555 111', address: '12/3 Ấp 5, Đông Thạnh', oldAddress: 'Bản ghi từ sổ giấy xã Đông Thạnh (cũ)', area: 'DT', members: 4, dupOf: 'HO-DT-00125' },
]

// ---- Khoản phải thu ----
// status: pending | paid_qr | paid_transfer | cash_wait | partial | absent
export const RECEIVABLES = [
  { id: 'KT-2026Q3-DT-0125', householdId: 'HO-DT-00125', period: '2026Q3', kind: 'current', label: 'Giá DV thu gom, vận chuyển CTRSH — Quý 3/2026', baseAmount: 198000, amountDue: 198000, amountPaid: 0, status: 'pending', assignedTo: 'NTH-007' },
  { id: 'KT-LEGACY-DT-0125', householdId: 'HO-DT-00125', period: '2025', kind: 'legacy', label: 'Nợ kế thừa từ xã Đông Thạnh (cũ) — năm 2025', baseAmount: 132000, amountDue: 132000, amountPaid: 0, status: 'pending', assignedTo: 'NTH-007' },
  { id: 'KT-2026Q3-DT-0126', householdId: 'HO-DT-00126', period: '2026Q3', kind: 'current', label: 'Giá DV thu gom, vận chuyển CTRSH — Quý 3/2026', baseAmount: 198000, amountDue: 198000, amountPaid: 0, status: 'pending', assignedTo: 'NTH-007' },
  { id: 'KT-2026Q3-TTT-0087', householdId: 'HO-TTT-00087', period: '2026Q3', kind: 'current', label: 'Giá DV thu gom, vận chuyển CTRSH — Quý 3/2026', baseAmount: 198000, amountDue: 198000, amountPaid: 198000, status: 'paid_qr', assignedTo: 'NTH-007', paidAt: '09:12 hôm nay', paidRef: 'BL-000118' },
  { id: 'KT-2026Q3-TTT-0088', householdId: 'HO-TTT-00088', period: '2026Q3', kind: 'current', label: 'Giá DV thu gom, vận chuyển CTRSH — Quý 3/2026', baseAmount: 198000, amountDue: 198000, amountPaid: 0, status: 'pending', assignedTo: 'NTH-007' },
  { id: 'KT-2026Q3-TTT-0090', householdId: 'HO-TTT-00090', period: '2026Q3', kind: 'current', label: 'Giá DV thu gom, vận chuyển CTRSH — Quý 3/2026', baseAmount: 198000, amountDue: 198000, amountPaid: 100000, status: 'partial', assignedTo: 'NTH-007', paidAt: '28/06/2026 (chuyển khoản)', paidRef: 'BL-000102' },
  { id: 'KT-2026Q3-NB-0031', householdId: 'HO-NB-00031', period: '2026Q3', kind: 'current', label: 'Giá DV thu gom, vận chuyển CTRSH — Quý 3/2026', baseAmount: 198000, exemptionPercent: 50, amountDue: 99000, amountPaid: 0, status: 'pending', assignedTo: 'NTH-007' },
  { id: 'KT-2026Q3-NB-0032', householdId: 'HO-NB-00032', period: '2026Q3', kind: 'current', label: 'Giá DV thu gom, vận chuyển CTRSH — Quý 3/2026', baseAmount: 198000, amountDue: 198000, amountPaid: 0, status: 'absent', assignedTo: 'NTH-007', noticeLeftAt: '02/07/2026' },
  { id: 'KT-2026Q3-NB-0033', householdId: 'HO-NB-00033', period: '2026Q3', kind: 'current', label: 'Giá DV thu gom, vận chuyển CTRSH — Quý 3/2026', baseAmount: 198000, amountDue: 198000, amountPaid: 0, status: 'pending', assignedTo: 'NTH-007' },
  { id: 'KT-LEGACY-NB-0033', householdId: 'HO-NB-00033', period: '2025', kind: 'legacy', label: 'Nợ kế thừa từ xã Nhị Bình (cũ) — Quý 4/2025', baseAmount: 66000, amountDue: 66000, amountPaid: 0, status: 'pending', assignedTo: 'NTH-007' },
  { id: 'KT-2026Q3-DT-0127', householdId: 'HO-DT-00127', period: '2026Q3', kind: 'current', label: 'Giá DV thu gom, vận chuyển CTRSH — Quý 3/2026', baseAmount: 198000, amountDue: 198000, amountPaid: 0, status: 'pending', assignedTo: 'NTH-007' },
  { id: 'KT-2026Q3-TTT-0091', householdId: 'HO-TTT-00091', period: '2026Q3', kind: 'current', label: 'Giá DV thu gom, vận chuyển CTRSH — Quý 3/2026', baseAmount: 198000, amountDue: 198000, amountPaid: 0, status: 'cash_wait', assignedTo: 'NTH-007', cashAt: '08:45 hôm nay' },
  // Hộ tuyến khác (NTH-004)
  { id: 'KT-2026Q3-DT-0200', householdId: 'HO-DT-00200', period: '2026Q3', kind: 'current', label: 'Giá DV thu gom, vận chuyển CTRSH — Quý 3/2026', baseAmount: 198000, amountDue: 198000, amountPaid: 0, status: 'pending', assignedTo: 'NTH-004' },
  { id: 'KT-2026Q3-NB-0050', householdId: 'HO-NB-00050', period: '2026Q3', kind: 'current', label: 'Giá DV thu gom, vận chuyển CTRSH — Quý 3/2026', baseAmount: 198000, amountDue: 198000, amountPaid: 198000, status: 'paid_qr', assignedTo: 'NTH-004', paidAt: '25/06/2026', paidRef: 'BL-000097' },
]

// ---- Túi tiền mặt: đã thu, chờ nộp (TH-06 / BC-11) ----
export const CASH_BAG = [
  { id: 'TM-0001', householdId: 'HO-TTT-00091', receivableIds: ['KT-2026Q3-TTT-0091'], amount: 198000, collectedAt: '08:45 hôm nay', deadline: CASH_DEADLINE },
]

// ---- Biên lai — hệ thống phát hành khi tiền về khớp mã (TH-09) ----
export const RECEIPTS = [
  { id: 'BL-000118', receivableId: 'KT-2026Q3-TTT-0087', householdId: 'HO-TTT-00087', amount: 198000, method: 'qr_self', collectedBy: 'Hệ thống — khớp sao kê tự động', time: '09:12 03/07/2026', einvoice: 'HĐĐT 1C26TDT-00000118' },
  { id: 'BL-000102', receivableId: 'KT-2026Q3-TTT-0090', householdId: 'HO-TTT-00090', amount: 100000, method: 'qr_self', collectedBy: 'Hệ thống — khớp sao kê tự động', partial: true, time: '10:02 28/06/2026', einvoice: 'HĐĐT 1C26TDT-00000102' },
  { id: 'BL-000097', receivableId: 'KT-2026Q3-NB-0050', householdId: 'HO-NB-00050', amount: 198000, method: 'qr_self', collectedBy: 'Hệ thống — khớp sao kê tự động', time: '14:20 25/06/2026', einvoice: 'HĐĐT 1C26TDT-00000097' },
]

// ---- Sao kê ngân hàng (TH-07): dòng khớp mã → chứng từ; dòng không khớp → treo (TH-08) ----
// status: matched | unmatched(suspense) | pending_match (khớp mã với 1 khoản pending, KT bấm khớp)
export const BANK_LINES = [
  { id: 'SK-0001', time: '09:12 03/07/2026', amount: 198000, content: 'KT-2026Q3-TTT-0087 LE MINH TUAN', matchCode: 'KT-2026Q3-TTT-0087', status: 'matched', receiptId: 'BL-000118' },
  { id: 'SK-0002', time: '08:50 03/07/2026', amount: 198000, content: 'KT2026Q3TTT0088 chuyen tien rac', matchCode: 'KT-2026Q3-TTT-0088', status: 'pending_match' },
  { id: 'SK-0003', time: '10:31 03/07/2026', amount: 200000, content: 'Nguyen Van A chuyen tien', matchCode: null, status: 'unmatched' },
  { id: 'SK-0004', time: '11:05 03/07/2026', amount: 99000, content: 'KT-2026Q3-NB-0031 tien rac quy 3', matchCode: 'KT-2026Q3-NB-0031', status: 'pending_match' },
  { id: 'SK-0005', time: '07:40 03/07/2026', amount: 150000, content: ' CK tu 09xx khong noi dung', matchCode: null, status: 'unmatched' },
]

// ---- Đề nghị miễn giảm (CN-04): cán bộ lập, lãnh đạo duyệt ----
export const EXEMPTIONS = [
  { id: 'MG-2026-014', householdId: 'HO-NB-00031', type: 'Hộ cận nghèo', percent: 50, reason: 'Hộ thuộc danh sách cận nghèo năm 2026 của xã (QĐ số 45/QĐ-UBND).', status: 'approved', createdBy: 'CB-012', createdAt: '15/06/2026', decidedBy: 'Chủ tịch UBND xã', decidedAt: '18/06/2026' },
  { id: 'MG-2026-021', householdId: 'HO-NB-00033', type: 'Người cao tuổi neo đơn', percent: 100, reason: 'Bà Tư 82 tuổi, sống một mình, không nơi nương tựa. Có xác nhận của trưởng ấp.', status: 'pending', createdBy: 'CB-012', createdAt: '01/07/2026' },
]

// ---- Đợt hóa đơn chờ lãnh đạo ký duyệt (mục 8.6) ----
export const BATCHES = [
  { id: 'DOT-2026Q3-01', name: 'Đợt 1 — Quý 3/2026 (địa bàn Đông Thạnh)', count: 128, total: 25344000, createdBy: 'CB-012', createdAt: '01/07/2026', status: 'signed', signedBy: 'Chủ tịch UBND xã', signedAt: '01/07/2026' },
  { id: 'DOT-2026Q3-02', name: 'Đợt 2 — Quý 3/2026 (địa bàn Nhị Bình)', count: 96, total: 19008000, createdBy: 'CB-012', createdAt: '03/07/2026', status: 'pending' },
  { id: 'DOT-2026Q3-03', name: 'Đợt 3 — Quý 3/2026 (địa bàn Thới Tam Thôn)', count: 142, total: 28116000, createdBy: 'CB-012', createdAt: '03/07/2026', status: 'pending' },
]

// ---- Nhật ký & audit trail (QT-09) ----
export const AUDIT_LOG = [
  { id: 1, time: '09:12 03/07/2026', actor: 'Hệ thống', role: 'Tự động', action: 'Khớp sao kê SK-0001 → phát hành biên lai BL-000118 (hộ HO-TTT-00087)' },
  { id: 2, time: '08:45 03/07/2026', actor: 'NTH-007 Trần Văn Tổ', role: 'Người thu hộ', action: 'Ghi nhận thu tiền mặt hộ HO-TTT-00091 — 198.000đ (chờ nộp)' },
  { id: 3, time: '01/07/2026', actor: 'Chủ tịch UBND xã', role: 'Lãnh đạo', action: 'Ký duyệt đợt hóa đơn DOT-2026Q3-01 (128 khoản)' },
  { id: 4, time: '01/07/2026', actor: 'CB-012 Nguyễn Thị Kế', role: 'Cán bộ xã', action: 'Lập đề nghị miễn giảm MG-2026-021 (hộ HO-NB-00033)' },
  { id: 5, time: '18/06/2026', actor: 'Chủ tịch UBND xã', role: 'Lãnh đạo', action: 'Duyệt miễn giảm MG-2026-014 — giảm 50% (hộ HO-NB-00031)' },
  { id: 6, time: '15/06/2026', actor: 'QT-01 Đơn vị triển khai', role: 'Quản trị', action: 'Cấu hình biểu giá QĐ 67/2025 cho kỳ 2026Q3' },
]

// ---- Biểu giá theo thời kỳ (BG / QĐ 67/2025) ----
export const PRICE_BOOK = [
  { id: 'BG-2026', period: 'Từ 01/2026', group: 'Nhóm 1 — hộ gia đình', collect: 57000, transport: 23000, treat: '420,45đ/kg (chưa VAT)', monthly: 66000, status: 'active' },
  { id: 'BG-2025', period: '2025', group: 'Nhóm 1 — hộ gia đình', collect: 48000, transport: 18000, treat: '—', monthly: 55000, status: 'archived' },
]

// ---- Đơn vị & ánh xạ địa giới (QT-03/04) ----
export const ORG_UNITS = [
  { old: 'Xã Thới Tam Thôn (H. Hóc Môn cũ)', now: 'Địa bàn Thới Tam Thôn — Xã Đông Thạnh', code: 'TTT' },
  { old: 'Xã Nhị Bình (H. Hóc Môn cũ)', now: 'Địa bàn Nhị Bình — Xã Đông Thạnh', code: 'NB' },
  { old: 'Xã Đông Thạnh (H. Hóc Môn cũ)', now: 'Địa bàn Đông Thạnh — Xã Đông Thạnh', code: 'DT' },
]

export const INTEGRATIONS = [
  { name: 'VietQR / Ngân hàng (khớp sao kê)', detail: 'Tài khoản định danh ảo theo từng khoản', status: 'connected' },
  { name: 'Hóa đơn điện tử (Viettel/VNPT)', detail: 'Ký hiệu HĐĐT 1C26TDT', status: 'connected' },
  { name: 'Thông báo Zalo ZNS / SMS', detail: 'Gửi biên lai & nhắc nợ', status: 'connected' },
  { name: 'KBNN / Ngân sách nhà nước', detail: 'Hạch toán — giai đoạn mở rộng', status: 'planned' },
]

// ---- Người dùng hệ thống (QT-01) ----
export const USERS = [
  { code: 'QT-01', name: 'Đơn vị triển khai', account: 'admin', roleKey: 'QT', roleLabel: 'Quản trị hệ thống', twoFA: true, status: 'active' },
  { code: 'CB-012', name: 'Nguyễn Thị Kế', account: 'canbo', roleKey: 'CB', roleLabel: 'Cán bộ xã — Phòng Kinh tế', twoFA: false, status: 'active' },
  { code: 'NTH-007', name: 'Trần Văn Tổ', account: 'thuho', roleKey: 'NTH', roleLabel: 'Người thu hộ — Tổ trưởng TDP', twoFA: false, status: 'active' },
  { code: 'NTH-004', name: 'Lê Thị Bưởi', account: 'thuho2', roleKey: 'NTH', roleLabel: 'Người thu hộ — CTV', twoFA: false, status: 'active' },
  { code: 'KT-003', name: 'Trần Thị Toán', account: 'ketoan', roleKey: 'KT', roleLabel: 'Kế toán — Phòng Kinh tế', twoFA: true, status: 'active' },
  { code: 'LD-001', name: 'Chủ tịch UBND xã', account: 'lanhdao', roleKey: 'LD', roleLabel: 'Lãnh đạo — Chủ tịch UBND xã', twoFA: true, status: 'active' },
]

// ---- Định nghĩa vai trò: danh tính + menu điều hướng ----
// nav item: { to, icon, label, badge? }
export const ROLES = {
  QT: {
    key: 'QT', code: 'QT-01', name: 'Đơn vị triển khai', roleLabel: 'Quản trị hệ thống',
    tag: 'Quyền kỹ thuật — không duyệt tiền',
    nav: [
      { section: 'Quản trị hệ thống' },
      { to: '/', icon: 'home', label: 'Tổng quan hệ thống', end: true },
      { to: '/users', icon: 'users', label: 'Người dùng & phân quyền' },
      { to: '/areas', icon: 'map', label: 'Địa bàn & đơn vị thu' },
      { to: '/pricing', icon: 'percent', label: 'Biểu giá theo thời kỳ' },
      { to: '/integrations', icon: 'link', label: 'Kết nối tích hợp' },
      { to: '/audit', icon: 'doc', label: 'Nhật ký & audit' },
    ],
  },
  CB: {
    key: 'CB', code: 'CB-012', name: 'Nguyễn Thị Kế', roleLabel: 'Cán bộ xã — Phòng Kinh tế',
    tag: 'Danh mục hộ · hóa đơn · đề nghị miễn giảm',
    nav: [
      { section: 'Nghiệp vụ cán bộ' },
      { to: '/', icon: 'home', label: 'Tổng quan', end: true },
      { to: '/households', icon: 'search', label: 'Hộ dân (toàn xã)' },
      { to: '/invoices', icon: 'doc', label: 'Hóa đơn & đợt thu' },
      { to: '/adhoc', icon: 'plus', label: 'Tạo khoản thu lẻ' },
      { to: '/exemptions', icon: 'percent', label: 'Đề nghị miễn giảm' },
      { to: '/debts', icon: 'list', label: 'Công nợ' },
    ],
  },
  NTH: {
    key: 'NTH', code: 'NTH-007', name: 'Trần Văn Tổ', roleLabel: 'Người thu hộ — Tổ trưởng TDP',
    tag: 'Đi thu tại hộ theo tuyến được phân công',
    nav: [
      { section: 'Tác nghiệp' },
      { to: '/', icon: 'home', label: 'Trang chủ', end: true },
      { to: '/collect-list', icon: 'list', label: 'Danh sách đi thu', badge: 'remaining' },
      { to: '/cashbag', icon: 'cash', label: 'Túi tiền — chờ nộp', badge: 'cash' },
      { to: '/receipts', icon: 'receipt', label: 'Biên lai' },
    ],
  },
  KT: {
    key: 'KT', code: 'KT-003', name: 'Trần Thị Toán', roleLabel: 'Kế toán — Phòng Kinh tế',
    tag: 'Khớp sao kê · dòng treo · đối soát · báo cáo',
    nav: [
      { section: 'Kế toán & đối soát' },
      { to: '/', icon: 'home', label: 'Tổng quan', end: true },
      { to: '/reconcile', icon: 'bank', label: 'Khớp sao kê', badge: 'bank' },
      { to: '/suspense', icon: 'warning', label: 'Dòng treo', badge: 'suspense' },
      { to: '/cash-reconcile', icon: 'cash', label: 'Đối soát tiền mặt người thu' },
      { to: '/ledger', icon: 'receipt', label: 'Sổ biên lai & HĐĐT' },
      { to: '/reports', icon: 'chart', label: 'Báo cáo' },
    ],
  },
  LD: {
    key: 'LD', code: 'LD-001', name: 'Chủ tịch UBND xã', roleLabel: 'Lãnh đạo — Chủ tịch UBND xã',
    tag: 'Quyền nghiệp vụ cao nhất — quyết định về tiền',
    nav: [
      { section: 'Điều hành' },
      { to: '/', icon: 'home', label: 'Dashboard điều hành', end: true },
      { to: '/assignments', icon: 'users', label: 'Phân công đi thu' },
      { to: '/approvals', icon: 'checkCircle', label: 'Duyệt quyết định tiền', badge: 'approvals' },
      { to: '/batches', icon: 'doc', label: 'Ký duyệt đợt hóa đơn', badge: 'batches' },
      { to: '/reports', icon: 'chart', label: 'Báo cáo' },
    ],
  },
}

// Thứ tự hiển thị ở màn chọn vai
export const ROLE_ORDER = ['QT', 'CB', 'NTH', 'KT', 'LD']

export const areaName = (id) => AREAS.find((a) => a.id === id)?.name || id
export const fmt = (n) => (n ?? 0).toLocaleString('vi-VN') + ' đ'

export const PAID_STATUSES = ['paid_qr', 'paid_transfer']
export const CLOSED_STATUSES = ['paid_qr', 'paid_transfer', 'cash_wait']

export const STATUS_META = {
  pending: { label: 'Chưa thu', tone: 'neutral' },
  paid_qr: { label: 'Đã đóng (QR)', tone: 'info' },
  paid_transfer: { label: 'Đã đóng (đã nộp về)', tone: 'success' },
  cash_wait: { label: 'Hộ đã đóng — chờ nộp', tone: 'warning' },
  partial: { label: 'Nộp một phần', tone: 'warning' },
  absent: { label: 'Vắng nhà — đã để giấy báo', tone: 'warning' },
}

export const METHOD_LABEL = {
  qr_self: 'Dân tự quét QR',
  qr_onsite: 'Quét QR tại chỗ',
  transfer_deposit: 'Tiền mặt — người thu nộp CK',
}

export const EXEMPT_TYPES = ['Hộ nghèo', 'Hộ cận nghèo', 'Gia đình chính sách', 'Người cao tuổi neo đơn']
