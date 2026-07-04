import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, householdStatus, remainingOf } from '../store'
import { Icon, StatusBadge } from '../components/ui'
import { AREAS, areaName, fmt, BATCH, ROUTE, PAID_STATUSES } from '../data'

// Ba nhóm trạng thái người thu cần phân biệt rõ:
//  - Chưa thu:  pending / absent / partial (chưa lấy được đủ tiền)
//  - Đã đóng:   tiền đã vào hệ thống, có biên lai (paid_qr / paid_transfer)
//  - Chờ nộp:   hộ đã đưa tiền mặt cho người thu, người thu chưa nộp lại hệ thống (cash_wait)
const GROUP = (status) => {
  if (PAID_STATUSES.includes(status)) return 'paid'
  if (status === 'cash_wait') return 'waiting'
  return 'todo'
}
const FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'todo', label: 'Chưa thu' },
  { id: 'paid', label: 'Đã đóng' },
  { id: 'waiting', label: 'Chờ nộp hệ thống' },
]

export default function CollectionList() {
  const { state } = useStore()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [area, setArea] = useState('all')

  const assignedIds = [...new Set(state.receivables.filter((r) => r.assignedTo === 'NTH-007').map((r) => r.householdId))]
  const base = assignedIds.map((id) => {
    const hh = state.households.find((h) => h.id === id)
    const status = householdStatus(state, id)
    return { hh, status, group: GROUP(status), remaining: remainingOf(state, id) }
  })

  const counts = base.reduce((m, r) => { m[r.group] = (m[r.group] || 0) + 1; return m }, {})
  const countOf = (id) => (id === 'all' ? base.length : counts[id] || 0)

  const rows = base
    .filter(({ hh }) => area === 'all' || hh.area === area)
    .filter(({ hh }) => {
      const s = q.trim().toLowerCase()
      if (!s) return true
      return hh.name.toLowerCase().includes(s) || hh.id.toLowerCase().includes(s) || hh.address.toLowerCase().includes(s)
    })
    .filter(({ group }) => filter === 'all' || group === filter)
    // Chưa thu lên đầu, rồi chờ nộp, cuối cùng đã đóng
    .sort((a, b) => {
      const order = { todo: 0, waiting: 1, paid: 2 }
      return order[a.group] - order[b.group]
    })

  return (
    <>
      <div className="banner info" style={{ marginBottom: 14 }}>
        <Icon name="info" size={19} />
        <div>
          Danh sách do <b>{BATCH.assignedBy}</b> phân công theo tuyến (<b>{ROUTE.name}</b>) — hệ thống tự sinh,
          người thu không tự thêm/bớt hộ và <b>chỉ thấy hộ trong tuyến của mình</b>.
          Hộ đã nộp qua QR được cập nhật tự động và <b>chặn thu trùng</b>.
        </div>
      </div>

      <div className="toolbar">
        <div className="search">
          <Icon name="search" size={16} />
          <input placeholder="Tìm trong tuyến: tên, mã hộ, địa chỉ…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="seg">
          {FILTERS.map((f) => (
            <button key={f.id} className={filter === f.id ? 'on' : ''} onClick={() => setFilter(f.id)}>
              {f.label} <span className="seg-count">{countOf(f.id)}</span>
            </button>
          ))}
        </div>
        <div className="seg">
          <button className={area === 'all' ? 'on' : ''} onClick={() => setArea('all')}>Mọi khu vực</button>
          {AREAS.map((a) => (
            <button key={a.id} className={area === a.id ? 'on' : ''} onClick={() => setArea(a.id)}>{a.name}</button>
          ))}
        </div>
      </div>

      {rows.map(({ hh, status, remaining }) => (
        <div key={hh.id} className="hh-row" onClick={() => nav(`/collect/${hh.id}`)}>
          <div className="avatar" style={{ background: remaining > 0 ? 'var(--lumo-primary)' : status === 'cash_wait' ? 'var(--lumo-warning, #b45309)' : 'var(--lumo-success)' }}>
            {hh.name.split(' ').slice(-1)[0][0]}
          </div>
          <div className="info">
            <div className="name">{hh.name}</div>
            <div className="meta">{hh.id} · {hh.address} · {areaName(hh.area)}</div>
            <div style={{ marginTop: 5 }}><StatusBadge status={status} /></div>
          </div>
          <div className="right">
            <div className={`amount ${remaining === 0 ? 'zero' : ''}`}>
              {remaining === 0 ? (status === 'cash_wait' ? 'Chờ nộp' : 'Đã đủ') : fmt(remaining)}
            </div>
            <Icon name="chevron" size={16} style={{ color: 'var(--lumo-shade-40)', marginTop: 4 }} />
          </div>
        </div>
      ))}

      {!rows.length && (
        <div className="empty"><Icon name="search" size={28} />Không có hộ nào khớp bộ lọc.</div>
      )}
    </>
  )
}
