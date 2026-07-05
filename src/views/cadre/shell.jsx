import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import './cadre.css'

/* =========================================================================
   Khung dùng chung cho vai CÁN BỘ XÃ (mọi màn /cadre/*)
   ========================================================================= */

/* Cờ cấu hình quyền phát hành đợt.
   false = cán bộ tự phát hành (mặc định); true = phải trình lãnh đạo duyệt. */
export const CB_CONFIG = { requireLeaderApproval: false }
export const publishLabel = () =>
  CB_CONFIG.requireLeaderApproval ? 'Trình lãnh đạo duyệt phát hành' : 'Phát hành đợt'

/* ---- Nguồn địa bàn dùng chung cho mọi màn cán bộ (lưu theo MÃ) ----
   3 xã sáp nhập; giá trị lưu = id (TTT/NB/DT), không hardcode ở component. */
export const AREAS = [
  { id: 'TTT', name: 'Thới Tam Thôn (cũ)' },
  { id: 'NB', name: 'Nhị Bình (cũ)' },
  { id: 'DT', name: 'Đông Thạnh (cũ)' },
]
export const AREA_ALL = { id: 'all', name: 'Tất cả địa bàn' }
export const areaName = (id) => id === 'all' ? AREA_ALL.name : (AREAS.find((a) => a.id === id)?.name || id)

/* --- Bộ icon nét mảnh --- */
const P = {
  overview: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  contract: 'M9 3v18M4 7h16M4 12h16M4 17h16',
  invoice: 'M6 2h9l5 5v15H6zM15 2v5h5M9 13h7M9 17h7',
  route: 'M6 19a3 3 0 100-6 3 3 0 000 6zM18 11a3 3 0 100-6 3 3 0 000 6zM8 6h6a3 3 0 013 3M16 18h-6a3 3 0 01-3-3',
  debt: 'M3 6h18v12H3zM3 10h18M7 15h4',
  cash: 'M2 7h20v10H2zM12 12a2 2 0 100-0.01M6 7v10M18 7v10',
  add: 'M12 5v14M5 12h14',
  edit: 'M4 20h4L18 10l-4-4L4 16zM14 6l4 4',
  percent: 'M19 5L5 19M6.5 6.5a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0zM14.5 14.5a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0z',
  caret: 'M6 9l6 6 6-6',
  search: 'M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-4-4',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 9a3 3 0 100 6 3 3 0 000-6z',
  printer: 'M6 9V2h12v7M6 18H4v-6h16v6h-2M8 13h8v9H8z',
  qr: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM19 14h2M17 19v2M21 19v2',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  warning: 'M12 3l9 16H3zM12 10v4M12 17h.01',
  bell: 'M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0',
  swap: 'M7 4L3 8l4 4M3 8h13M17 20l4-4-4-4M21 16H8',
  user: 'M12 3a4 4 0 100 8 4 4 0 000-8zM4 21c0-4 4-6 8-6s8 2 8 6',
  bank: 'M3 10l9-6 9 6M5 10v9M19 10v9M9 10v9M15 10v9M3 21h18',
  refresh: 'M21 12a9 9 0 11-3-6.7M21 3v5h-5',
  check: 'M20 6L9 17l-5-5',
}
export function Icon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={P[name] || ''} />
    </svg>
  )
}

const NAV = [
  { to: '/cadre', icon: 'overview', label: 'Tổng quan', end: true },
  { to: '/cadre/objects', icon: 'contract', label: 'Đối tượng & hợp đồng' },
  { to: '/cadre/invoices', icon: 'invoice', label: 'Hóa đơn / đợt thu' },
  { to: '/cadre/routes', icon: 'route', label: 'Gán tuyến' },
  { to: '/cadre/debts', icon: 'debt', label: 'Công nợ' },
  { to: '/cadre/collect', icon: 'cash', label: 'Thu tiền' },
]

/* Khung: sidebar + vùng nội dung (Outlet cho từng màn) */
export function CadreShell() {
  return (
    <div className="cb">
      <aside className="cb-side">
        <div className="cb-brand">
          <div className="cb-logo">ĐT</div>
          <div className="cb-brand-t">
            <div className="t1">Thu giá DVMT</div>
            <div className="t2">Xã Đông Thạnh</div>
          </div>
        </div>
        <nav className="cb-nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) => `cb-nav-item${isActive ? ' active' : ''}`}>
              <Icon name={n.icon} size={17} />
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="cb-user">
          <div className="cb-avatar">M</div>
          <div className="cb-user-t">
            <div className="u1">Nguyễn Văn Minh</div>
            <div className="u2">Cán bộ xã</div>
          </div>
        </div>
      </aside>
      <main className="cb-main">
        <Outlet />
      </main>
    </div>
  )
}

/* Hộp thoại dùng chung */
export function Modal({ title, onClose, children, footer }) {
  return (
    <div className="cb-scrim" onClick={onClose}>
      <div className="cb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cb-modal-head">
          <h3>{title}</h3>
          <button className="cb-x" onClick={onClose}>×</button>
        </div>
        <div className="cb-modal-body">{children}</div>
        {footer && <div className="cb-modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

/* Chip lọc kiểu dropdown (mũi tên xuống) */
export function FilterChip({ label }) {
  return <button className="cb-filter"><span>{label}</span><Icon name="caret" size={14} /></button>
}

/* Dropdown lọc địa bàn (dùng nguồn AREAS chung; giá trị = mã) */
export function AreaFilter({ value, onChange }) {
  const [inner, setInner] = React.useState('all')
  const val = value ?? inner
  return (
    <span className="cb-selchip">
      <select value={val} onChange={(e) => { setInner(e.target.value); onChange && onChange(e.target.value) }}>
        <option value={AREA_ALL.id}>{AREA_ALL.name}</option>
        {AREAS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>
      <Icon name="caret" size={14} />
    </span>
  )
}

/* Thanh trên dùng chung: title + (search/extra) + 2 filter chuẩn + actions
   - period=false để ẩn 2 filter chuẩn khi màn có filter riêng
*/
export function Topbar({ title, search, extraFilters, actions, period = true }) {
  return (
    <header className="cb-top">
      <h1 className="cb-title">{title}</h1>
      {search}
      <div className="cb-spacer" />
      <div className="cb-filters">
        {extraFilters}
        {period && <><FilterChip label="Kỳ T7/2026" /><AreaFilter /></>}
      </div>
      {actions && <div className="cb-top-actions">{actions}</div>}
    </header>
  )
}
