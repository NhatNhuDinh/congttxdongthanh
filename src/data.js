// ===== Dữ liệu giả lập cho demo đa vai trò (không có backend) =====
// Hệ thống số hóa thu giá DV vệ sinh môi trường — Xã Đông Thạnh (Tài liệu thiết kế v2.0)
// Mô hình thu: đến kỳ dân tự nộp QR (Zalo/SMS) → quá hạn mới đi thu. Tính số ngày quá hạn.

export const TODAY_ISO = '2026-07-04' // mốc "hôm nay" cố định để số liệu demo ổn định

export const AREAS = [
  { id: 'DT', name: 'Đông Thạnh (cũ)' },
  { id: 'NB', name: 'Nhị Bình (cũ)' },
  { id: 'TTT', name: 'Thới Tam Thôn (cũ)' },
]
// Lựa chọn "tất cả" dùng cho dropdown lọc địa bàn (vai Cán bộ xã)
export const AREA_ALL = { id: 'all', name: 'Tất cả địa bàn' }

// Hai chu kỳ thu — màn Danh sách đi thu cho chọn Tháng / Quý
export const PERIODS = {
  month: { id: '2026M07', kind: 'month', name: 'Tháng 07/2026', due: '10/07/2026', dueISO: '2026-07-10', months: 1, rate: 83000 },
  quarter: { id: '2026Q3', kind: 'quarter', name: 'Quý 3/2026', due: '15/07/2026', dueISO: '2026-07-15', months: 3, rate: 83000 },
}
export const CURRENT_PERIOD = { id: '2026M07', name: 'Tháng 07/2026', monthlyRate: 83000, months: 1 }

// Đợt thu hiện tại (app mobile) — có ngày bắt đầu/kết thúc & số ngày còn lại
export const DRIVE = { name: 'Tháng 07/2026', from: '01/07/2026', to: '31/07/2026', toISO: '2026-07-31' }
export const daysLeft = () => Math.max(0, Math.round((new Date(DRIVE.toISO) - new Date(TODAY_ISO)) / 86400000))

export const ROUTE = { id: 'TUYEN-07', name: 'Tuyến 07 — Đông Thạnh (ấp 5, 6, 7) & lân cận', note: 'Phân công đổi được theo tháng/quý' }
export const BATCH = { id: 'DOT-2026M06', name: 'Kỳ Tháng 6/2026', assignedBy: 'Chủ tịch UBND xã', assignedDate: '01/06/2026', dueDate: '10/06/2026' }

export const COLLECTOR = { username: 'thuho', name: 'Trần Văn Tổ', code: 'NTH-007', role: 'Người thu hộ — Tổ trưởng TDP', phone: '0903 123 456' }
export const COLLECTORS = [
  { code: 'NTH-007', name: 'Trần Văn Tổ', kind: 'Tổ trưởng TDP', route: 'TUYEN-07', area: 'DT', phone: '0903 123 456' },
  { code: 'NTH-004', name: 'Lê Thị Bưởi', kind: 'Cộng tác viên', route: 'TUYEN-04', area: 'NB', phone: '0907 456 789' },
  { code: 'NTH-011', name: 'Phan Văn Rớt', kind: 'NV đơn vị thu gom', route: 'TUYEN-11', area: 'TTT', phone: '0902 789 456' },
]

export const CASH_DEADLINE = 'trước 17:00 cùng ngày'
export const CASH_DEADLINE_SHORT = '17:00 hôm nay'

// ---- Che dữ liệu cá nhân (NĐ 13/2023) ----
export const maskCccd = (c) => { if (!c) return ''; const d = c.replace(/\s/g, ''); return d.slice(0, 3) + '•'.repeat(Math.max(0, d.length - 5)) + d.slice(-2) }
export const maskPhone = (p) => { if (!p) return ''; const d = p.replace(/\s/g, ''); return d.slice(0, 4) + '•••' + d.slice(-3) }

// ---- Số ngày quá hạn & mức độ ----
export const overdueDays = (dueISO) => Math.round((new Date(TODAY_ISO) - new Date(dueISO)) / 86400000)
export const overdueTier = (d) => (d <= 0 ? 'grace' : d <= 14 ? 'soon' : d <= 30 ? 'mid' : 'high')
export const TIER_META = {
  grace: { label: 'Còn hạn', tone: 'success', color: '#1a7f37' },
  soon: { label: 'Quá hạn', tone: 'warning', color: '#b7791f' },
  mid: { label: 'Quá hạn', tone: 'warning', color: '#c05621' },
  high: { label: 'Quá hạn', tone: 'error', color: '#c0392b' },
}

// ============ GENERATOR: ~150 hộ trong tuyến NTH-007 ============
function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = rng(20260704)
const pick = (arr) => arr[Math.floor(rand() * arr.length)]
const randint = (a, b) => a + Math.floor(rand() * (b - a + 1))

const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Mai', 'Trương', 'Cao']
const DEM = ['Văn', 'Thị', 'Hữu', 'Đức', 'Minh', 'Ngọc', 'Thanh', 'Quốc', 'Gia', 'Kim', 'Xuân', 'Bá', 'Tấn', 'Công']
const TEN = ['An', 'Bình', 'Cường', 'Dũng', 'Phúc', 'Giang', 'Hà', 'Hải', 'Hoa', 'Hùng', 'Khoa', 'Lan', 'Lâm', 'Mai', 'Nam', 'Nga', 'Nhung', 'Phong', 'Quân', 'Sơn', 'Tâm', 'Tú', 'Uyên', 'Vân', 'Yến', 'Trang', 'Thảo', 'Hạnh', 'Kiên', 'Lộc', 'Thành', 'Tiến', 'Bảy', 'Chín', 'Tư']
const STREETS = {
  DT: ['Đặng Thúc Vịnh', 'Lê Văn Khương', 'Nguyễn Văn Bứa', 'Ấp 5', 'Ấp 6', 'Ấp 7'],
  NB: ['Bùi Công Trừng', 'Đường Nhị Bình 15', 'Hương lộ 80B', 'Ấp 2', 'Ấp 3', 'Ấp 4'],
  TTT: ['Tô Ký', 'Nguyễn Ảnh Thủ', 'Trung Đông', 'Ấp Tam Đông', 'Ấp Đông Lân'],
}
const OLDNAME = { DT: 'xã Đông Thạnh', NB: 'xã Nhị Bình', TTT: 'xã Thới Tam Thôn' }

// buckets ngày tới hạn cho hộ CHƯA nộp (tạo dải quá hạn phong phú)
const DUE_BUCKETS = [
  { dueISO: '2026-07-10', due: '10/07/2026', months: 1 }, // còn hạn (chưa tới)
  { dueISO: '2026-07-01', due: '01/07/2026', months: 1 }, // quá hạn 3
  { dueISO: '2026-06-25', due: '25/06/2026', months: 1 }, // 9
  { dueISO: '2026-06-10', due: '10/06/2026', months: 1 }, // 24
  { dueISO: '2026-05-20', due: '20/05/2026', months: 2 }, // 45
  { dueISO: '2026-05-05', due: '05/05/2026', months: 2 }, // 60
  { dueISO: '2026-04-10', due: '10/04/2026', months: 3 }, // 85
]

const RATE = 83000
const pad = (n, w) => String(n).padStart(w, '0')

const _households = []
const _receivables = []
const _receipts = []
const _cashBag = []
let receiptSeq = 200
let cashSeq = 0

// vài hộ "mỏ neo" có tên cố định để kể chuyện demo (đứng đầu, quá hạn nặng)
const ANCHORS = [
  { name: 'Nguyễn Văn Hòa', area: 'DT', force: 'overdue', bucket: 6 },   // 85 ngày, nợ 3 tháng
  { name: 'Trần Thị Mai', area: 'DT', force: 'overdue', bucket: 4 },      // 45 ngày
  { name: 'Võ Văn Chín', area: 'DT', force: 'partial', bucket: 3 },       // nộp một phần
  { name: 'Bùi Văn Sáu', area: 'DT', force: 'absent', bucket: 3 },        // vắng nhà
  { name: 'Đinh Thị Chi', area: 'DT', force: 'cash', bucket: 3 },         // tiền mặt chờ nộp
  { name: 'Lê Minh Tuấn', area: 'DT', force: 'paidqr', bucket: 3 },       // dân tự nộp QR
]

const AREA_SEQ = { DT: 100, NB: 100, TTT: 100 }
function makeHousehold(area, name) {
  const seq = ++AREA_SEQ[area]
  const street = pick(STREETS[area])
  const houseNo = `${randint(1, 320)}${rand() < 0.3 ? '/' + randint(1, 40) : ''}`
  const addr = `${houseNo} ${street}, ${AREAS.find((a) => a.id === area).name}`
  return {
    id: `HO-${area}-${pad(seq, 5)}`,
    name: name || `${pick(HO)} ${pick(DEM)} ${pick(TEN)}`,
    cccd: '079' + pad(randint(0, 999999999), 9),
    phone: '09' + pad(randint(0, 99999999), 8),
    address: addr,
    oldAddress: `${houseNo} ${street}, ${OLDNAME[area]}, H. Hóc Môn (cũ)`,
    area, members: randint(1, 7),
  }
}

function addReceivable(hh, kind) {
  // kind: paidqr | collected | cash | partial | absent | overdue
  let bucket
  if (kind === 'paidqr' || kind === 'collected') bucket = DUE_BUCKETS[randint(0, 3)]
  else if (kind === 'cash') bucket = DUE_BUCKETS[randint(2, 3)]
  else bucket = DUE_BUCKETS[randint(1, 6)] // overdue/partial/absent → có thể quá hạn nặng
  return bucket
}

function buildOne(hh, kind, bucketOverride) {
  const bucket = bucketOverride != null ? DUE_BUCKETS[bucketOverride] : addReceivable(hh, kind)
  const months = bucket.months
  const amount = RATE * months
  const base = { id: `KT-2026-${hh.area}-${hh.id.slice(-5)}`, householdId: hh.id, period: '2026M06', kind: 'current',
    label: `Giá DV thu gom, vận chuyển CTRSH — ${months > 1 ? `nợ ${months} tháng đến T6/2026` : 'Tháng 6/2026'}`,
    baseAmount: amount, amountDue: amount, amountPaid: 0, status: 'pending', assignedTo: 'NTH-007',
    dueISO: bucket.dueISO, due: bucket.due, monthsOwed: months, remindersSent: 0, lastReminderAt: null }

  if (kind === 'paidqr') {
    receiptSeq++
    const rid = `BL-${pad(receiptSeq, 6)}`
    _receipts.push({ id: rid, receivableId: base.id, householdId: hh.id, amount, method: 'qr_self', collectedBy: 'Hệ thống — khớp sao kê tự động', time: `${randint(1, 9)}/06/2026`, einvoice: `HĐĐT 1C26TDT-${pad(receiptSeq, 8)}` })
    return { ...base, status: 'paid_qr', paidVia: 'qr_self', amountPaid: amount, paidAt: `${randint(1, 9)}/06/2026`, paidRef: rid }
  }
  if (kind === 'collected') {
    receiptSeq++
    const rid = `BL-${pad(receiptSeq, 6)}`
    _receipts.push({ id: rid, receivableId: base.id, householdId: hh.id, amount, method: 'transfer_deposit', collectedBy: 'Hệ thống — khớp sao kê (nộp bởi NTH-007)', time: 'hôm nay', einvoice: `HĐĐT 1C26TDT-${pad(receiptSeq, 8)}` })
    return { ...base, status: 'paid_transfer', paidVia: 'onsite', amountPaid: amount, paidAt: 'hôm nay', paidRef: rid }
  }
  if (kind === 'cash') {
    cashSeq++
    _cashBag.push({ id: `TM-${pad(cashSeq, 4)}`, householdId: hh.id, receivableIds: [base.id], amount, collectedAt: `${randint(8, 15)}:${pad(randint(0, 59), 2)} hôm nay`, deadline: CASH_DEADLINE })
    return { ...base, status: 'cash_wait', cashAt: 'hôm nay' }
  }
  if (kind === 'partial') {
    const paid = Math.round(amount * 0.4 / 1000) * 1000
    return { ...base, status: 'partial', amountPaid: paid, paidAt: `${bucket.due} (chuyển khoản)`, remindersSent: randint(2, 4), lastReminderAt: '01/07/2026' }
  }
  if (kind === 'absent') {
    return { ...base, status: 'absent', noticeLeftAt: '02/07/2026', remindersSent: randint(1, 3), lastReminderAt: '30/06/2026' }
  }
  if (kind === 'exempt') {
    return { ...base, status: 'exempt', exemptReason: pick(['Hộ nghèo', 'Gia đình chính sách', 'Người cao tuổi neo đơn']) }
  }
  // overdue pending
  const od = overdueDays(bucket.dueISO)
  return { ...base, status: 'pending', remindersSent: od > 0 ? randint(1, 4) : 0, lastReminderAt: od > 0 ? '01/07/2026' : null }
}

// tạo hộ mỏ neo trước
ANCHORS.forEach((a) => {
  const hh = makeHousehold(a.area, a.name)
  _households.push(hh)
  _receivables.push(buildOne(hh, a.force, a.bucket))
})

// sinh phần còn lại (bản demo mô phỏng một tuyến đông dân — thực tế toàn xã ~50.000 hộ)
const TOTAL = 600
const areaCycle = ['DT', 'DT', 'DT', 'NB', 'NB', 'TTT'] // tuyến 07 chủ yếu Đông Thạnh
for (let i = _households.length; i < TOTAL; i++) {
  const area = areaCycle[i % areaCycle.length]
  const hh = makeHousehold(area)
  _households.push(hh)
  const r = rand()
  let kind
  if (r < 0.46) kind = 'paidqr'
  else if (r < 0.54) kind = 'collected'
  else if (r < 0.58) kind = 'cash'
  else if (r < 0.62) kind = 'partial'
  else if (r < 0.65) kind = 'absent'
  else if (r < 0.71) kind = 'exempt'
  else kind = 'overdue'
  _receivables.push(buildOne(hh, kind))
}

// hộ Nguyễn Văn Hòa thêm 1 khoản nợ kế thừa (demo nợ cũ)
_receivables.push({ id: 'KT-LEGACY-DT-HOA', householdId: _households[0].id, period: '2025', kind: 'legacy',
  label: 'Nợ kế thừa từ xã Đông Thạnh (cũ) — năm 2025', baseAmount: 132000, amountDue: 132000, amountPaid: 0,
  status: 'pending', assignedTo: 'NTH-007', dueISO: '2026-01-15', due: '15/01/2026', monthsOwed: 2, remindersSent: 4, lastReminderAt: '01/07/2026' })

// Hộ mới đăng ký chưa có khoản (CB dùng tạo khoản lẻ HD-03)
_households.push({ id: 'HO-TTT-00120', name: 'Trương Văn Chức', cccd: '079088006666', phone: '0939246810', address: '200 Tô Ký, Thới Tam Thôn', oldAddress: '(Hộ mới đăng ký 06/2026 — chưa có khoản thu)', area: 'TTT', members: 4, isNew: true })
// Bản ghi nghi trùng với hộ mỏ neo đầu tiên (CB xử lý chống trùng DM-04)
_households.push({ id: 'HO-DT-00128', name: _households[0].name, cccd: _households[0].cccd, phone: _households[0].phone, address: _households[0].address, oldAddress: 'Bản ghi từ sổ giấy xã Đông Thạnh (cũ)', area: 'DT', members: _households[0].members, dupOf: _households[0].id })

export const HOUSEHOLDS = _households
export const RECEIVABLES = _receivables
export const RECEIPTS = _receipts
export const CASH_BAG = _cashBag
export const SEQ = { receipt: receiptSeq, cash: cashSeq, adhoc: 300, exempt: 21, audit: 6 }

// ---- Sao kê ngân hàng (KT) — dựng từ dữ liệu thật ----
const _pendingForBank = _receivables.filter((r) => r.status === 'pending' && r.kind === 'current').slice(0, 2)
export const BANK_LINES = [
  ..._pendingForBank.map((r, i) => ({ id: `SK-000${i + 1}`, time: `0${8 + i}:${10 + i * 5} hôm nay`, amount: r.amountDue, content: `${r.id} tien rac`, matchCode: r.id, status: 'pending_match' })),
  { id: 'SK-0003', time: '10:31 hôm nay', amount: 200000, content: 'Nguyen Van A chuyen tien', matchCode: null, status: 'unmatched' },
  { id: 'SK-0004', time: '07:40 hôm nay', amount: 150000, content: 'CK tu 09xx khong noi dung', matchCode: null, status: 'unmatched' },
]

// ---- Miễn giảm (CN-04) ----
export const EXEMPTIONS = [
  { id: 'MG-2026-014', householdId: HOUSEHOLDS[0].id, type: 'Hộ cận nghèo', percent: 50, reason: 'Hộ thuộc danh sách cận nghèo 2026 (QĐ 45/QĐ-UBND).', status: 'approved', createdBy: 'CB-012', createdAt: '15/06/2026', decidedBy: 'Chủ tịch UBND xã', decidedAt: '18/06/2026' },
  { id: 'MG-2026-021', householdId: HOUSEHOLDS[3].id, type: 'Người cao tuổi neo đơn', percent: 100, reason: 'Cụ 82 tuổi, sống một mình. Có xác nhận trưởng ấp.', status: 'pending', createdBy: 'CB-012', createdAt: '01/07/2026' },
]

// ---- Đợt hóa đơn chờ ký (mục 8.6) ----
export const BATCHES = [
  { id: 'DOT-2026M06', name: 'Kỳ Tháng 6/2026 — toàn tuyến', count: 600, total: 600 * 83000, createdBy: 'CB-012', createdAt: '01/06/2026', status: 'signed', signedBy: 'Chủ tịch UBND xã', signedAt: '01/06/2026' },
  { id: 'DOT-2026M07', name: 'Kỳ Tháng 7/2026 — địa bàn Đông Thạnh', count: 620, total: 620 * 83000, createdBy: 'CB-012', createdAt: '01/07/2026', status: 'pending' },
  { id: 'DOT-2026M07-NB', name: 'Kỳ Tháng 7/2026 — địa bàn Nhị Bình', count: 410, total: 410 * 83000, createdBy: 'CB-012', createdAt: '01/07/2026', status: 'pending' },
]

export const AUDIT_LOG = [
  { id: 1, time: '09:12 hôm nay', actor: 'Hệ thống', role: 'Tự động', action: 'Khớp sao kê → phát hành biên lai (dân tự nộp QR)' },
  { id: 2, time: '08:45 hôm nay', actor: 'NTH-007 Trần Văn Tổ', role: 'Người thu hộ', action: 'Ghi nhận thu tiền mặt — chờ nộp' },
  { id: 3, time: '01/06/2026', actor: 'Chủ tịch UBND xã', role: 'Lãnh đạo', action: 'Ký duyệt đợt hóa đơn Kỳ Tháng 6/2026' },
  { id: 4, time: '01/07/2026', actor: 'CB-012 Nguyễn Thị Kế', role: 'Cán bộ xã', action: 'Lập đề nghị miễn giảm MG-2026-021' },
  { id: 5, time: '18/06/2026', actor: 'Chủ tịch UBND xã', role: 'Lãnh đạo', action: 'Duyệt miễn giảm MG-2026-014 — giảm 50%' },
  { id: 6, time: '15/05/2026', actor: 'QT-01 Đơn vị triển khai', role: 'Quản trị', action: 'Cấu hình biểu giá QĐ 67/2025' },
]

export const PRICE_BOOK = [
  { id: 'BG-2026', period: 'Từ 01/2026', group: 'Nhóm 1 — hộ gia đình', collect: 57000, transport: 23000, treat: '420,45đ/kg (chưa VAT)', monthly: 83000, status: 'active' },
  { id: 'BG-2025', period: '2025', group: 'Nhóm 1 — hộ gia đình', collect: 48000, transport: 18000, treat: '—', monthly: 70000, status: 'archived' },
]
export const ORG_UNITS = [
  { old: 'Xã Thới Tam Thôn (H. Hóc Môn cũ)', now: 'Địa bàn Thới Tam Thôn — Xã Đông Thạnh', code: 'TTT' },
  { old: 'Xã Nhị Bình (H. Hóc Môn cũ)', now: 'Địa bàn Nhị Bình — Xã Đông Thạnh', code: 'NB' },
  { old: 'Xã Đông Thạnh (H. Hóc Môn cũ)', now: 'Địa bàn Đông Thạnh — Xã Đông Thạnh', code: 'DT' },
]
export const INTEGRATIONS = [
  { name: 'VietQR / Ngân hàng (khớp sao kê)', detail: 'Tài khoản định danh ảo theo từng khoản', status: 'connected' },
  { name: 'Hóa đơn điện tử (Viettel/VNPT)', detail: 'Ký hiệu HĐĐT 1C26TDT', status: 'connected' },
  { name: 'Thông báo Zalo ZNS / SMS', detail: 'Gửi QR kèm mã, nhắc nợ', status: 'connected' },
  { name: 'KBNN / Ngân sách nhà nước', detail: 'Hạch toán — giai đoạn mở rộng', status: 'planned' },
]
export const USERS = [
  { code: 'QT-01', name: 'Đơn vị triển khai', account: 'admin', roleKey: 'QT', roleLabel: 'Quản trị hệ thống', twoFA: true, status: 'active' },
  { code: 'CB-012', name: 'Nguyễn Thị Kế', account: 'canbo', roleKey: 'CB', roleLabel: 'Cán bộ xã — Phòng Kinh tế', twoFA: false, status: 'active' },
  { code: 'NTH-007', name: 'Trần Văn Tổ', account: 'thuho', roleKey: 'NTH', roleLabel: 'Người thu hộ — Tổ trưởng TDP', twoFA: false, status: 'active' },
  { code: 'NTH-004', name: 'Lê Thị Bưởi', account: 'thuho2', roleKey: 'NTH', roleLabel: 'Người thu hộ — CTV', twoFA: false, status: 'active' },
  { code: 'KT-003', name: 'Trần Thị Toán', account: 'ketoan', roleKey: 'KT', roleLabel: 'Kế toán — Phòng Kinh tế', twoFA: true, status: 'active' },
  { code: 'LD-001', name: 'Chủ tịch UBND xã', account: 'lanhdao', roleKey: 'LD', roleLabel: 'Lãnh đạo — Chủ tịch UBND xã', twoFA: true, status: 'active' },
]

export const ROLES = {
  QT: { key: 'QT', code: 'QT-01', name: 'Đơn vị triển khai', roleLabel: 'Quản trị hệ thống', tag: 'Quyền kỹ thuật — không duyệt tiền',
    nav: [{ section: 'Quản trị hệ thống' }, { to: '/', icon: 'home', label: 'Tổng quan hệ thống', end: true }, { to: '/users', icon: 'users', label: 'Người dùng & phân quyền' }, { to: '/areas', icon: 'map', label: 'Địa bàn & đơn vị thu' }, { to: '/pricing', icon: 'percent', label: 'Biểu giá theo thời kỳ' }, { to: '/integrations', icon: 'link', label: 'Kết nối tích hợp' }, { to: '/audit', icon: 'doc', label: 'Nhật ký & audit' }] },
  CB: { key: 'CB', code: 'CB-012', name: 'Nguyễn Thị Kế', roleLabel: 'Cán bộ xã — Phòng Kinh tế', tag: 'Đối tượng · hợp đồng · hóa đơn · gán tuyến · công nợ',
    nav: [{ section: 'Nghiệp vụ cán bộ' }, { to: '/', icon: 'home', label: 'Tổng quan', end: true }, { to: '/objects', icon: 'list', label: 'Đối tượng & hợp đồng' }, { to: '/invoices', icon: 'doc', label: 'Hóa đơn / đợt thu' }, { to: '/routes', icon: 'map', label: 'Gán tuyến' }, { to: '/debts', icon: 'percent', label: 'Công nợ' }, { to: '/collect', icon: 'cash', label: 'Thu tiền' }] },
  NTH: { key: 'NTH', code: 'NTH-007', name: 'Trần Văn Tổ', roleLabel: 'Người thu hộ — Tổ trưởng TDP', tag: 'Đi thu tại hộ theo tuyến được phân công',
    nav: [{ section: 'Tác nghiệp' }, { to: '/', icon: 'home', label: 'Trang chủ', end: true }, { to: '/collect-list', icon: 'list', label: 'Danh sách đi thu', badge: 'remaining' }, { to: '/cashbag', icon: 'cash', label: 'Túi tiền — chờ nộp', badge: 'cash' }, { to: '/receipts', icon: 'receipt', label: 'Biên lai' }] },
  KT: { key: 'KT', code: 'KT-003', name: 'Trần Thị Toán', roleLabel: 'Kế toán — Phòng Kinh tế', tag: 'Khớp sao kê · dòng treo · đối soát · báo cáo',
    nav: [{ section: 'Kế toán & đối soát' }, { to: '/', icon: 'home', label: 'Tổng quan', end: true }, { to: '/reconcile', icon: 'bank', label: 'Khớp sao kê', badge: 'bank' }, { to: '/suspense', icon: 'warning', label: 'Dòng treo', badge: 'suspense' }, { to: '/cash-reconcile', icon: 'cash', label: 'Đối soát tiền mặt người thu' }, { to: '/ledger', icon: 'receipt', label: 'Sổ biên lai & HĐĐT' }, { to: '/reports', icon: 'chart', label: 'Báo cáo' }] },
  LD: { key: 'LD', code: 'LD-001', name: 'Chủ tịch UBND xã', roleLabel: 'Lãnh đạo — Chủ tịch UBND xã', tag: 'Quyền nghiệp vụ cao nhất — quyết định về tiền',
    nav: [{ section: 'Điều hành' }, { to: '/', icon: 'home', label: 'Dashboard điều hành', end: true }, { to: '/assignments', icon: 'users', label: 'Phân công đi thu' }, { to: '/approvals', icon: 'checkCircle', label: 'Duyệt quyết định tiền', badge: 'approvals' }, { to: '/batches', icon: 'doc', label: 'Ký duyệt đợt hóa đơn', badge: 'batches' }, { to: '/reports', icon: 'chart', label: 'Báo cáo' }] },
}
export const ROLE_ORDER = ['QT', 'CB', 'NTH', 'KT', 'LD']

export const areaName = (id) => id === 'all' ? AREA_ALL.name : (AREAS.find((a) => a.id === id)?.name || id)
export const fmt = (n) => (n ?? 0).toLocaleString('vi-VN') + ' đ'

export const PAID_STATUSES = ['paid_qr', 'paid_transfer']
export const CLOSED_STATUSES = ['paid_qr', 'paid_transfer', 'cash_wait', 'exempt']

export const STATUS_META = {
  pending: { label: 'Chưa thu', tone: 'neutral' },
  paid_qr: { label: 'Đã thu (QR)', tone: 'info' },
  paid_transfer: { label: 'Đã thu', tone: 'success' },
  cash_wait: { label: 'Đã thu — chờ nộp', tone: 'warning' },
  partial: { label: 'Nộp một phần', tone: 'warning' },
  absent: { label: 'Vắng nhà', tone: 'warning' },
  exempt: { label: 'Miễn/không thu', tone: 'neutral' },
}
export const METHOD_LABEL = { qr_self: 'Dân tự quét QR', qr_onsite: 'Quét QR tại chỗ', transfer_deposit: 'Tiền mặt — người thu nộp CK' }
export const EXEMPT_TYPES = ['Hộ nghèo', 'Hộ cận nghèo', 'Gia đình chính sách', 'Người cao tuổi neo đơn']
