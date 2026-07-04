import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { Icon, Banner } from '../components/ui'
import { fmt, areaName, AREAS, COLLECTORS, CLOSED_STATUSES } from '../data'

const areaAgg = (state) => AREAS.map((a) => {
  const hhs = state.households.filter((h) => h.area === a.id)
  const paid = state.receipts.filter((r) => hhs.some((h) => h.id === r.householdId)).reduce((s, r) => s + r.amount, 0)
  const debt = hhs.reduce((s, h) => s + state.receivables.filter((r) => r.householdId === h.id && !CLOSED_STATUSES.includes(r.status)).reduce((x, r) => x + (r.amountDue - r.amountPaid), 0), 0)
  return { a, paid, debt }
})

export function LeaderDashboard() {
  const { state } = useStore()
  const nav = useNavigate()
  const agg = areaAgg(state)
  const totalPaid = agg.reduce((s, x) => s + x.paid, 0)
  const totalDebt = agg.reduce((s, x) => s + x.debt, 0)
  const rate = totalPaid + totalDebt ? Math.round((totalPaid / (totalPaid + totalDebt)) * 100) : 0
  const pendingExempt = state.exemptions.filter((e) => e.status === 'pending').length
  const pendingBatch = state.batches.filter((b) => b.status === 'pending').length
  return (
    <>
      <Banner tone="success" icon="shield">
        <b>Dashboard điều hành (BC-01).</b> Lãnh đạo là quyền nghiệp vụ cao nhất — phân công đi thu, duyệt miễn giảm/hoàn/xóa nợ,
        ký duyệt đợt và chốt kỳ. Mọi quyết định về tiền đều qua đây.
      </Banner>
      <div className="stat-grid">
        <div className="stat"><div className="k">Tỷ lệ nộp toàn xã</div><div className="v success">{rate}%</div><div className="sub">chống thất thu là mục tiêu #1</div></div>
        <div className="stat"><div className="k">Đã thu</div><div className="v primary" style={{ fontSize: '1.05rem' }}>{fmt(totalPaid)}</div></div>
        <div className="stat"><div className="k">Còn phải thu</div><div className="v warning" style={{ fontSize: '1.05rem' }}>{fmt(totalDebt)}</div></div>
        <div className="stat" style={{ cursor: 'pointer' }} onClick={() => nav('/approvals')}><div className="k">Chờ tôi duyệt</div><div className="v" style={{ color: (pendingExempt + pendingBatch) ? 'var(--lumo-error,#d0342c)' : 'inherit' }}>{pendingExempt + pendingBatch}</div><div className="sub">miễn giảm & đợt</div></div>
      </div>
      <div className="card">
        <div className="card-title"><Icon name="chart" />Tỷ lệ nộp theo địa bàn</div>
        {agg.map(({ a, paid, debt }) => {
          const r = paid + debt ? Math.round((paid / (paid + debt)) * 100) : 0
          return (
            <div key={a.id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                <span>{a.name}</span><span style={{ fontWeight: 700 }}>{r}% · thu {fmt(paid)}</span>
              </div>
              <div className="progress"><div style={{ width: `${r}%` }} /></div>
            </div>
          )
        })}
      </div>
      <div className="card">
        <div className="card-title"><Icon name="checkCircle" />Cần quyết định</div>
        <div className="kv" style={{ cursor: 'pointer' }} onClick={() => nav('/approvals')}><span className="k">Đề nghị miễn giảm chờ duyệt</span><span className="v"><span className="badge warning">{pendingExempt}</span></span></div>
        <div className="kv" style={{ cursor: 'pointer' }} onClick={() => nav('/batches')}><span className="k">Đợt hóa đơn chờ ký</span><span className="v"><span className="badge warning">{pendingBatch}</span></span></div>
        <div className="kv" style={{ cursor: 'pointer' }} onClick={() => nav('/assignments')}><span className="k">Phân công đi thu theo tuyến</span><span className="v"><Icon name="chevron" size={15} /></span></div>
      </div>
    </>
  )
}

export function LeaderAssignments() {
  const { state, toast } = useStore()
  return (
    <>
      <Banner tone="info" icon="users">
        <b>TH-01 — Phân công đi thu.</b> Lãnh đạo cấu hình người thu hộ phụ trách tuyến/địa bàn (đổi được theo tháng/quý);
        hệ thống tự sinh danh sách mỗi kỳ. Người thu chỉ thấy hộ trong tuyến của mình.
      </Banner>
      <div className="card" style={{ padding: 0 }}>
        <div className="grid-wrap">
          <table className="grid">
            <thead><tr><th>Người thu hộ</th><th>Loại</th><th>Tuyến</th><th>Địa bàn</th><th className="num">Số hộ</th><th></th></tr></thead>
            <tbody>
              {COLLECTORS.map((c) => {
                const count = [...new Set(state.receivables.filter((r) => r.assignedTo === c.code).map((r) => r.householdId))].length
                return (
                  <tr key={c.code}>
                    <td>{c.name}<div style={{ fontSize: '0.72rem', color: 'var(--lumo-shade-60)' }}>{c.code}</div></td>
                    <td style={{ fontSize: '0.82rem' }}>{c.kind}</td>
                    <td style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '0.78rem' }}>{c.route}</td>
                    <td>{areaName(c.area)}</td>
                    <td className="num" style={{ fontWeight: 700 }}>{count}</td>
                    <td><button className="btn tertiary sm" onClick={() => toast(`Mở phân công lại tuyến ${c.route} (demo)`, 'info')}><Icon name="settings" size={14} /> Đổi</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export function LeaderApprovals() {
  const { state, decideExemption, toast } = useStore()
  const pending = state.exemptions.filter((e) => e.status === 'pending')
  const decided = state.exemptions.filter((e) => e.status !== 'pending')
  const decide = (id, d) => { decideExemption(id, d); toast(d === 'approved' ? 'Đã duyệt miễn giảm' : 'Đã từ chối', d === 'approved' ? 'success' : 'info') }
  return (
    <>
      <Banner tone="warning" icon="shield">
        <b>Quyết định về tiền bắt buộc lãnh đạo duyệt</b> (mục 8.6): miễn giảm, hoàn tiền, xóa nợ —
        đây là quyết định chứ không phải kiểm tra đúng/sai, máy không tự quyết.
      </Banner>
      <div className="card-title" style={{ margin: '4px 2px' }}><Icon name="clock" />Chờ duyệt ({pending.length})</div>
      {pending.length === 0 && <div className="empty"><Icon name="checkCircle" size={28} />Không có đề nghị chờ duyệt.</div>}
      {pending.map((e) => {
        const hh = state.households.find((h) => h.id === e.householdId)
        return (
          <div className="card" key={e.id}>
            <div className="kv"><span className="k">{e.id} · lập bởi {e.createdBy} · {e.createdAt}</span><span className="v"><span className="badge warning">{e.percent === 100 ? 'Miễn 100%' : `Giảm ${e.percent}%`}</span></span></div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{hh?.name} ({e.householdId}) — {e.type}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--lumo-shade-60)', margin: '4px 0 10px' }}>Căn cứ: {e.reason}</div>
            <div className="actions-row">
              <button className="btn success" onClick={() => decide(e.id, 'approved')}><Icon name="check" /> Duyệt</button>
              <button className="btn danger" onClick={() => decide(e.id, 'rejected')}><Icon name="x" /> Từ chối</button>
            </div>
          </div>
        )
      })}
      {decided.length > 0 && (
        <>
          <div className="card-title" style={{ margin: '14px 2px 4px' }}><Icon name="checkCircle" />Đã quyết định</div>
          <div className="card" style={{ padding: 0 }}>
            <div className="grid-wrap">
              <table className="grid">
                <thead><tr><th>Mã</th><th>Hộ</th><th className="num">Mức</th><th>Kết quả</th></tr></thead>
                <tbody>
                  {decided.map((e) => {
                    const hh = state.households.find((h) => h.id === e.householdId)
                    return (
                      <tr key={e.id}>
                        <td style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '0.78rem' }}>{e.id}</td>
                        <td>{hh?.name}</td>
                        <td className="num">{e.percent === 100 ? 'Miễn' : `Giảm ${e.percent}%`}</td>
                        <td>{e.status === 'approved' ? <span className="badge success">Đã duyệt</span> : <span className="badge error">Từ chối</span>}<div style={{ fontSize: '0.7rem', color: 'var(--lumo-shade-60)' }}>{e.decidedBy} · {e.decidedAt}</div></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export function LeaderBatches() {
  const { state, signBatch, toast } = useStore()
  const sign = (id) => { signBatch(id); toast(`Đã ký duyệt đợt ${id}`, 'success') }
  return (
    <>
      <Banner tone="info" icon="doc">
        Cả một đợt hóa đơn hàng loạt cần <b>một cú ký duyệt</b> của lãnh đạo cho cả đợt — một lần, không ký từng hóa đơn (mục 8.6).
      </Banner>
      {state.batches.map((b) => (
        <div className="card" key={b.id}>
          <div className="kv"><span className="k">{b.id} · lập {b.createdAt}</span>
            <span className="v">{b.status === 'signed' ? <span className="badge success">Đã ký</span> : <span className="badge warning">Chờ ký</span>}</span></div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{b.name}</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--lumo-shade-60)', margin: '4px 0 10px' }}>{b.count} khoản · tổng {fmt(b.total)}{b.signedBy ? ` · đã ký bởi ${b.signedBy} (${b.signedAt})` : ''}</div>
          {b.status === 'pending' && (
            <div className="actions-row">
              <button className="btn success" onClick={() => sign(b.id)}><Icon name="check" /> Ký duyệt cả đợt</button>
              <button className="btn tertiary" onClick={() => toast('Xem trước danh sách khoản (demo)', 'info')}><Icon name="search" /> Xem trước</button>
            </div>
          )}
        </div>
      ))}
    </>
  )
}

export function LeaderReports() {
  const { state, toast } = useStore()
  const agg = areaAgg(state)
  return (
    <>
      <Banner tone="info" icon="chart">
        Báo cáo điều hành: thu/nợ theo địa bàn, tiến độ đợt thu, tỷ lệ nộp. Xuất Excel/PDF cho báo cáo định kỳ (BC-10).
      </Banner>
      <div className="card">
        <div className="card-title"><Icon name="chart" />Thu / nợ theo địa bàn</div>
        <div className="grid-wrap">
          <table className="grid">
            <thead><tr><th>Địa bàn</th><th className="num">Đã thu</th><th className="num">Còn nợ</th><th className="num">Tỷ lệ nộp</th></tr></thead>
            <tbody>
              {agg.map(({ a, paid, debt }) => {
                const r = paid + debt ? Math.round((paid / (paid + debt)) * 100) : 0
                return (
                  <tr key={a.id}>
                    <td>{a.name}</td>
                    <td className="num" style={{ color: 'var(--lumo-success)' }}>{fmt(paid)}</td>
                    <td className="num" style={{ color: 'var(--lumo-primary)' }}>{fmt(debt)}</td>
                    <td className="num" style={{ fontWeight: 700 }}>{r}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="actions-row">
        <button className="btn neutral" onClick={() => toast('Đã xuất báo cáo PDF (demo)', 'success')}><Icon name="doc" /> Xuất PDF</button>
        <button className="btn neutral" onClick={() => toast('Đã xuất Excel (demo)', 'success')}><Icon name="doc" /> Xuất Excel</button>
      </div>
    </>
  )
}
