import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, cashBagTotal } from '../store'
import { Icon, Banner } from '../components/ui'
import { fmt, areaName, AREAS, METHOD_LABEL, CLOSED_STATUSES, PAID_STATUSES, CASH_DEADLINE, COLLECTORS } from '../data'

export function AcctOverview() {
  const { state } = useStore()
  const nav = useNavigate()
  const pendingMatch = state.bankLines.filter((l) => l.status === 'pending_match').length
  const suspense = state.bankLines.filter((l) => l.status === 'unmatched').length
  const bag = cashBagTotal(state)
  const collectedToday = state.receipts.reduce((s, r) => s + r.amount, 0)
  return (
    <>
      <Banner tone="info" icon="bank">
        Kế toán xã: khớp sao kê ngân hàng, xử lý dòng treo, đối soát tiền mặt người thu và báo cáo.
        <b> Tách bạch trách nhiệm: người đi thu không đồng thời là người đối soát/chốt sổ.</b>
      </Banner>
      <div className="stat-grid">
        <div className="stat" style={{ cursor: 'pointer' }} onClick={() => nav('/reconcile')}><div className="k">Sao kê chờ khớp</div><div className="v warning">{pendingMatch}</div><div className="sub">khớp mã, chờ xác nhận</div></div>
        <div className="stat" style={{ cursor: 'pointer' }} onClick={() => nav('/suspense')}><div className="k">Dòng treo</div><div className="v" style={{ color: suspense ? 'var(--lumo-error,#d0342c)' : 'inherit' }}>{suspense}</div><div className="sub">không khớp mã</div></div>
        <div className="stat" style={{ cursor: 'pointer' }} onClick={() => nav('/cash-reconcile')}><div className="k">Tiền mặt người thu giữ</div><div className="v warning">{fmt(bag)}</div><div className="sub">chờ nộp về</div></div>
        <div className="stat"><div className="k">Đã thu (có biên lai)</div><div className="v success" style={{ fontSize: '1.05rem' }}>{fmt(collectedToday)}</div><div className="sub">{state.receipts.length} biên lai</div></div>
      </div>
      <div className="card">
        <div className="card-title"><Icon name="list" />Việc cần xử lý</div>
        <div className="kv" style={{ cursor: 'pointer' }} onClick={() => nav('/reconcile')}><span className="k">Khớp {pendingMatch} dòng sao kê → phát hành biên lai</span><span className="v"><Icon name="chevron" size={15} /></span></div>
        <div className="kv" style={{ cursor: 'pointer' }} onClick={() => nav('/suspense')}><span className="k">Xử lý {suspense} dòng treo (gán tay/hoàn/xác minh)</span><span className="v"><Icon name="chevron" size={15} /></span></div>
        <div className="kv" style={{ cursor: 'pointer' }} onClick={() => nav('/cash-reconcile')}><span className="k">Đối soát tiền mặt người thu (đã thu vs đã nộp)</span><span className="v"><Icon name="chevron" size={15} /></span></div>
      </div>
    </>
  )
}

export function AcctReconcile() {
  const { state, matchBankLine, toast } = useStore()
  const doMatch = (id) => {
    const r = matchBankLine(id)
    toast(r ? `Đã khớp & phát hành biên lai ${r.id}` : 'Không khớp được (khoản đã đóng?)', r ? 'success' : 'error')
  }
  return (
    <>
      <Banner tone="info" icon="bank">
        Mỗi dòng báo Có khớp theo <b>mã định danh</b> thành một chứng từ thu độc lập gắn một hóa đơn (TH-07).
        Dòng khớp mã → bấm khớp để phát hành biên lai; dòng không khớp chuyển sang <b>Dòng treo</b>.
      </Banner>
      <div className="card" style={{ padding: 0 }}>
        <div className="grid-wrap">
          <table className="grid">
            <thead><tr><th>Dòng SK</th><th>Thời điểm</th><th className="num">Số tiền</th><th>Nội dung / mã</th><th>Trạng thái</th><th></th></tr></thead>
            <tbody>
              {state.bankLines.map((l) => (
                <tr key={l.id}>
                  <td style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '0.78rem' }}>{l.id}</td>
                  <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{l.time}</td>
                  <td className="num" style={{ fontWeight: 700 }}>{fmt(l.amount)}</td>
                  <td style={{ fontSize: '0.78rem' }}>{l.content}{l.matchCode && <div style={{ fontFamily: 'ui-monospace, Consolas, monospace', color: 'var(--lumo-primary)' }}>↳ {l.matchCode}</div>}</td>
                  <td>
                    {l.status === 'matched' && <span className="badge success">Đã khớp → {l.receiptId}</span>}
                    {l.status === 'pending_match' && <span className="badge warning">Khớp mã — chờ xác nhận</span>}
                    {l.status === 'unmatched' && <span className="badge error">Treo — không khớp</span>}
                    {l.status === 'resolved' && <span className="badge neutral">Đã xử lý: {l.resolution}</span>}
                  </td>
                  <td>{l.status === 'pending_match' && <button className="btn success sm" onClick={() => doMatch(l.id)}><Icon name="check" size={14} /> Khớp</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export function AcctSuspense() {
  const { state, resolveSuspense, toast } = useStore()
  const lines = state.bankLines.filter((l) => l.status === 'unmatched' || l.status === 'resolved')
  const act = (id, a, label) => { resolveSuspense(id, a); toast(`Dòng ${id}: ${label}`, 'info') }
  return (
    <>
      <Banner tone="warning" icon="warning">
        Dòng tiền <b>không khớp mã</b> bị treo, xử lý tay (TH-08): gán tay vào khoản, lập phiếu hoàn (chuyển nhầm),
        hoặc đánh dấu đang xác minh. Không tự phát hành biên lai cho tới khi rõ khoản.
      </Banner>
      {lines.length === 0 && <div className="empty"><Icon name="checkCircle" size={28} />Không còn dòng treo.</div>}
      {lines.map((l) => (
        <div className="card" key={l.id}>
          <div className="kv"><span className="k">Dòng {l.id} · {l.time}</span><span className="v" style={{ fontWeight: 700 }}>{fmt(l.amount)}</span></div>
          <div style={{ fontSize: '0.82rem', color: 'var(--lumo-shade-60)', marginBottom: 8 }}>Nội dung: “{l.content}”</div>
          {l.status === 'resolved'
            ? <span className="badge neutral">Đã xử lý: {l.resolution}</span>
            : (
              <div className="actions-row">
                <button className="btn primary sm" onClick={() => act(l.id, 'assign', 'đã gán tay vào khoản')}><Icon name="check" size={14} /> Gán tay vào khoản</button>
                <button className="btn neutral sm" onClick={() => act(l.id, 'refund', 'lập phiếu hoàn')}><Icon name="refresh" size={14} /> Hoàn (chuyển nhầm)</button>
                <button className="btn tertiary sm" onClick={() => act(l.id, 'verify', 'đánh dấu xác minh')}><Icon name="search" size={14} /> Xác minh</button>
              </div>
            )}
        </div>
      ))}
    </>
  )
}

export function AcctCashReconcile() {
  const { state } = useStore()
  const bag = state.cashBag
  const held = bag.reduce((s, e) => s + e.amount, 0)
  const deposited = state.depositedLog.reduce((s, l) => s + l.total, 0)
  // Quy về người thu demo (NTH-007)
  const collector = COLLECTORS[0]
  return (
    <>
      <Banner tone="info" icon="cash">
        <b>BC-11 — Đối soát tiền mặt người thu:</b> so <b>đã thu</b> với <b>đã nộp về tài khoản</b>, cảnh báo chênh lệch/quá hạn.
        Đây là đầu đối soát cho “túi tiền” mà người thu hộ đang giữ. Hạn nộp {CASH_DEADLINE}.
      </Banner>
      <div className="stat-grid">
        <div className="stat"><div className="k">Người thu</div><div className="v" style={{ fontSize: '1rem' }}>{collector.name}</div><div className="sub">{collector.code} · {collector.route}</div></div>
        <div className="stat"><div className="k">Đang giữ (chưa nộp)</div><div className="v warning">{fmt(held)}</div><div className="sub">{bag.length} khoản</div></div>
        <div className="stat"><div className="k">Đã nộp về</div><div className="v success">{fmt(deposited)}</div><div className="sub">{state.depositedLog.length} lần nộp</div></div>
        <div className="stat"><div className="k">Chênh lệch</div><div className="v primary">0 đ</div><div className="sub">đã thu = đã ghi nhận</div></div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div className="grid-wrap">
          <table className="grid">
            <thead><tr><th>Mã ghi nhận</th><th>Hộ</th><th>Thu lúc</th><th className="num">Số tiền</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {bag.map((e) => {
                const hh = state.households.find((h) => h.id === e.householdId)
                return (
                  <tr key={e.id}>
                    <td style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '0.78rem' }}>{e.id}</td>
                    <td>{hh?.name}<div style={{ fontSize: '0.72rem', color: 'var(--lumo-shade-60)' }}>{e.householdId}</div></td>
                    <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{e.collectedAt}</td>
                    <td className="num" style={{ fontWeight: 700 }}>{fmt(e.amount)}</td>
                    <td><span className="badge warning">Chờ nộp</span></td>
                  </tr>
                )
              })}
              {state.depositedLog.flatMap((l) => l.entries).map((e) => {
                const hh = state.households.find((h) => h.id === e.householdId)
                return (
                  <tr key={`d-${e.id}`}>
                    <td style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '0.78rem' }}>{e.id}</td>
                    <td>{hh?.name}<div style={{ fontSize: '0.72rem', color: 'var(--lumo-shade-60)' }}>{e.householdId}</div></td>
                    <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{e.collectedAt}</td>
                    <td className="num" style={{ fontWeight: 700 }}>{fmt(e.amount)}</td>
                    <td><span className="badge success">Đã nộp</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!bag.length && !state.depositedLog.length && <div className="empty">Chưa có giao dịch tiền mặt.</div>}
      </div>
    </>
  )
}

export function AcctLedger() {
  const { state, toast } = useStore()
  return (
    <>
      <Banner tone="info" icon="receipt">
        Sổ thu — bảng kê biên lai/HĐĐT đã phát hành (BC-04). Biên lai ký số, <b>không sửa sau phát hành</b>;
        việc hủy/điều chỉnh có kiểm soát thuộc kế toán (TH-09).
      </Banner>
      <div className="toolbar">
        <div style={{ fontSize: '0.8rem', color: 'var(--lumo-shade-60)', alignSelf: 'center' }}>Tổng <b>{state.receipts.length}</b> biên lai đã phát hành{state.receipts.length > 150 ? ' · hiển thị 150 mới nhất' : ''}</div>
        <div style={{ flex: 1 }} />
        <button className="btn neutral" onClick={() => toast('Đã xuất sổ thu ra Excel (demo)', 'success')}><Icon name="doc" /> Xuất Excel</button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div className="grid-wrap">
          <table className="grid">
            <thead><tr><th>Số biên lai</th><th>HĐĐT</th><th>Hộ</th><th>Hình thức</th><th>Thời điểm</th><th className="num">Số tiền</th></tr></thead>
            <tbody>
              {state.receipts.slice(0, 150).map((r) => {
                const hh = state.households.find((h) => h.id === r.householdId)
                return (
                  <tr key={r.id}>
                    <td style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontWeight: 700, fontSize: '0.8rem' }}>{r.id}</td>
                    <td style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '0.74rem' }}>{r.einvoice}</td>
                    <td>{hh?.name}<div style={{ fontSize: '0.72rem', color: 'var(--lumo-shade-60)' }}>{r.householdId}</div></td>
                    <td><span className={`badge ${r.method === 'qr_self' ? 'info' : 'success'}`}>{METHOD_LABEL[r.method] || r.method}</span></td>
                    <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{r.time}</td>
                    <td className="num" style={{ fontWeight: 700 }}>{fmt(r.amount)}{r.partial && <div className="badge warning">một phần</div>}</td>
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

export function AcctReports() {
  const { state, toast } = useStore()
  // Thu theo địa bàn (đã có biên lai)
  const byArea = AREAS.map((a) => {
    const paid = state.receipts.filter((r) => {
      const hh = state.households.find((h) => h.id === r.householdId)
      return hh?.area === a.id
    }).reduce((s, r) => s + r.amount, 0)
    const debt = state.households.filter((h) => h.area === a.id).reduce((s, h) =>
      s + state.receivables.filter((r) => r.householdId === h.id && !CLOSED_STATUSES.includes(r.status)).reduce((x, r) => x + (r.amountDue - r.amountPaid), 0), 0)
    return { a, paid, debt }
  })
  const totalPaid = byArea.reduce((s, x) => s + x.paid, 0)
  const totalDebt = byArea.reduce((s, x) => s + x.debt, 0)
  const rate = totalPaid + totalDebt ? Math.round((totalPaid / (totalPaid + totalDebt)) * 100) : 0
  return (
    <>
      <Banner tone="info" icon="chart">
        Báo cáo thu/nợ theo kỳ/địa bàn/hình thức (BC-02), công nợ theo tuổi nợ (BC-03), đối soát đơn vị thu gom (BC-07).
      </Banner>
      <div className="stat-grid">
        <div className="stat"><div className="k">Đã thu (có biên lai)</div><div className="v success" style={{ fontSize: '1.05rem' }}>{fmt(totalPaid)}</div></div>
        <div className="stat"><div className="k">Còn phải thu</div><div className="v warning" style={{ fontSize: '1.05rem' }}>{fmt(totalDebt)}</div></div>
        <div className="stat"><div className="k">Tỷ lệ nộp</div><div className="v primary">{rate}%</div></div>
        <div className="stat"><div className="k">Nợ kế thừa còn lại</div><div className="v">{state.receivables.filter((r) => r.kind === 'legacy' && !CLOSED_STATUSES.includes(r.status)).length}</div><div className="sub">từ xã cũ</div></div>
      </div>
      <div className="card">
        <div className="card-title"><Icon name="chart" />Thu / nợ theo địa bàn</div>
        <div className="grid-wrap">
          <table className="grid">
            <thead><tr><th>Địa bàn</th><th className="num">Đã thu</th><th className="num">Còn nợ</th><th className="num">Tỷ lệ</th></tr></thead>
            <tbody>
              {byArea.map(({ a, paid, debt }) => {
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
