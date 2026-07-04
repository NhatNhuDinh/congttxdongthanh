import React, { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useStore, householdStatus, cashBagTotal } from '../store'
import { Icon, Toasts } from './ui'
import { ROLES, CLOSED_STATUSES } from '../data'

export default function Layout() {
  const { state, logout, resetDemo } = useStore()
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const nav = useNavigate()

  const roleKey = state.user?.roleKey
  const role = ROLES[roleKey]
  if (!role) return null

  // ----- badges tính theo vai -----
  const badges = {}
  if (roleKey === 'NTH') {
    const ids = [...new Set(state.receivables.filter((r) => r.assignedTo === 'NTH-007').map((r) => r.householdId))]
    badges.remaining = ids.filter((id) => !CLOSED_STATUSES.includes(householdStatus(state, id))).length
    badges.cash = state.cashBag.length
  }
  if (roleKey === 'KT') {
    badges.bank = state.bankLines.filter((l) => l.status === 'pending_match').length
    badges.suspense = state.bankLines.filter((l) => l.status === 'unmatched').length
  }
  if (roleKey === 'LD') {
    badges.approvals = state.exemptions.filter((e) => e.status === 'pending').length
    badges.batches = state.batches.filter((b) => b.status === 'pending').length
  }

  // tiêu đề header = nhãn menu khớp path dài nhất
  const items = role.nav.filter((n) => !n.section)
  const active = items
    .filter((n) => n.end ? loc.pathname === n.to : loc.pathname.startsWith(n.to))
    .sort((a, b) => b.to.length - a.to.length)[0]
  const title = active?.label || role.roleLabel

  const initials = state.user?.name.split(' ').slice(-1)[0].slice(0, 1) || '?'

  return (
    <div className="app">
      {open && <div className="drawer-scrim" onClick={() => setOpen(false)} />}
      <aside className={`drawer ${open ? 'open' : ''}`}>
        <div className="drawer-brand">
          <img src="/logo.png" alt="Logo xã Đông Thạnh" />
          <div>
            <div className="t1">XÃ ĐÔNG THẠNH</div>
            <div className="t2">Thu giá DV vệ sinh môi trường</div>
          </div>
        </div>
        <div className="role-chip"><Icon name="user" size={13} /> {role.roleLabel}</div>
        <nav className="nav">
          {role.nav.map((item, i) =>
            item.section ? (
              <div key={i} className="nav-section">{item.section}</div>
            ) : (
              <NavLink key={item.to} to={item.to} end={item.end}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setOpen(false)}>
                <Icon name={item.icon} />
                {item.label}
                {item.badge && badges[item.badge] > 0 && <span className="count">{badges[item.badge]}</span>}
              </NavLink>
            )
          )}
        </nav>
        <div className="drawer-user">
          <div className="avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="u1">{state.user?.name}</div>
            <div className="u2">{state.user?.code}</div>
          </div>
          <button className="icon-btn" title="Khôi phục dữ liệu demo" onClick={resetDemo}><Icon name="refresh" size={16} /></button>
          <button className="icon-btn" title="Đổi vai / Đăng xuất" onClick={() => { logout(); nav('/login') }}><Icon name="logout" size={16} /></button>
        </div>
      </aside>

      <div className="main">
        <header className="header">
          <button className="icon-btn burger" onClick={() => setOpen(true)} aria-label="Mở menu"><Icon name="menu" /></button>
          <div className="title">{title}</div>
          <div className="spacer" />
          <span className="chip">{role.roleLabel.split(' — ')[0]}</span>
        </header>
        <div className="content">
          <div className="content-inner">
            <Outlet />
          </div>
        </div>
      </div>
      <Toasts />
    </div>
  )
}
