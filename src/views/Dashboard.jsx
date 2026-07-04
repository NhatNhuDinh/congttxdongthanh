import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, householdStatus, remainingOf, cashBagTotal } from '../store'
import { Icon, StatusBadge } from '../components/ui'
import { fmt, BATCH, ROUTE, areaName, CLOSED_STATUSES, CASH_DEADLINE } from '../data'

export default function Dashboard() {
  const { state } = useStore()
  const nav = useNavigate()

  const assignedIds = [...new Set(state.receivables.filter((r) => r.assignedTo === 'NTH-007').map((r) => r.householdId))]
  const done = assignedIds.filter((id) => CLOSED_STATUSES.includes(householdStatus(state, id)))
  const remaining = assignedIds.length - done.length
  const totalRemaining = assignedIds.reduce((s, id) => s + remainingOf(state, id), 0)
  const bagTotal = cashBagTotal(state)
  const pct = assignedIds.length ? Math.round((done.length / assignedIds.length) * 100) : 0

  return (
    <>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <img src="/logo.png" alt="" style={{ width: 52, height: 52, borderRadius: '50%' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: '1.02rem' }}>Chào {state.user?.name}!</h3>
          <div style={{ fontSize: '0.82rem', color: 'var(--lumo-shade-60)', marginTop: 3 }}>
            Bạn được <b>{BATCH.assignedBy}</b> phân công <b>{ROUTE.name}</b> gồm <b>{assignedIds.length} hộ</b>
            {' '}trong {BATCH.name} (hạn thu {BATCH.dueDate}). Hệ thống tự sinh danh sách — bạn chỉ thấy hộ trong tuyến của mình.
          </div>
        </div>
      </div>

      {bagTotal > 0 && (
        <div className="banner warning" style={{ marginBottom: 14, cursor: 'pointer' }} onClick={() => nav('/cashbag')}>
          <Icon name="warning" size={19} />
          <div>
            Bạn đang giữ <b>{fmt(bagTotal)}</b> tiền mặt của {state.cashBag.length} hộ — <b>chưa có biên lai</b>.
            Nộp chuyển khoản theo QR <b>{CASH_DEADLINE}</b> để hệ thống phát hành biên lai và không bị cảnh báo quá hạn. Bấm để mở Túi tiền →
          </div>
        </div>
      )}

      <div className="stat-grid">
        <div className="stat"><div className="k">Được phân công</div><div className="v">{assignedIds.length} hộ</div><div className="sub">{ROUTE.id} · {BATCH.name}</div></div>
        <div className="stat"><div className="k">Đã xong</div><div className="v success">{done.length} hộ</div><div className="sub">gồm hộ tự nộp QR</div></div>
        <div className="stat"><div className="k">Còn phải thu</div><div className="v warning">{remaining} hộ</div><div className="sub">{fmt(totalRemaining)}</div></div>
        <div className="stat" style={{ cursor: 'pointer' }} onClick={() => nav('/cashbag')}>
          <div className="k">Tiền mặt đang giữ</div>
          <div className={`v ${bagTotal > 0 ? 'warning' : 'success'}`}>{fmt(bagTotal)}</div>
          <div className="sub">{bagTotal > 0 ? `chờ nộp ${CASH_DEADLINE}` : 'đã thu = đã nộp ✓'}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title"><Icon name="list" />Tiến độ tuyến — {pct}%</div>
        <div className="progress"><div style={{ width: `${pct}%` }} /></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--lumo-shade-60)', marginTop: 6 }}>
          <span>{done.length}/{assignedIds.length} hộ hoàn tất</span>
          <span>hạn {BATCH.dueDate}</span>
        </div>
        <div className="actions-row" style={{ marginTop: 14 }}>
          <button className="btn primary lg" onClick={() => nav('/collect-list')}>
            <Icon name="cash" /> Bắt đầu đi thu ({remaining} hộ)
          </button>
          {bagTotal > 0 && (
            <button className="btn lg" onClick={() => nav('/cashbag')}>
              <Icon name="send" /> Nộp tiền mặt · {fmt(bagTotal)}
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-title"><Icon name="receipt" />Biên lai gần nhất (hệ thống phát hành)</div>
        {state.receipts.slice(0, 4).map((r) => {
          const hh = state.households.find((h) => h.id === r.householdId)
          return (
            <div key={r.id} className="kv" style={{ cursor: 'pointer' }} onClick={() => nav(`/receipts/${r.id}`)}>
              <span className="k">{r.id} · {r.time}</span>
              <span className="v">{hh?.name} — {fmt(r.amount)}</span>
            </div>
          )
        })}
        <button className="btn tertiary sm" style={{ marginTop: 8 }} onClick={() => nav('/receipts')}>
          Xem tất cả <Icon name="chevron" size={14} />
        </button>
      </div>

      <div className="card">
        <div className="card-title"><Icon name="warning" />Cần lưu ý</div>
        {assignedIds
          .map((id) => ({ id, st: householdStatus(state, id) }))
          .filter((x) => ['absent', 'partial'].includes(x.st))
          .map(({ id, st }) => {
            const hh = state.households.find((h) => h.id === id)
            return (
              <div key={id} className="kv" style={{ cursor: 'pointer' }} onClick={() => nav(`/collect/${id}`)}>
                <span className="k">{hh?.name} · {areaName(hh?.area)}</span>
                <span className="v"><StatusBadge status={st} /></span>
              </div>
            )
          })}
      </div>
    </>
  )
}
