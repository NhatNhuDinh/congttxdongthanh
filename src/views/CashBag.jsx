import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, cashBagTotal } from '../store'
import { Icon, Banner, Modal, FakeQR } from '../components/ui'
import { fmt, CASH_DEADLINE } from '../data'

// TH-06 / BC-11: túi tiền mặt của người thu — đã thu vs đã nộp, cảnh báo chênh/quá hạn
export default function CashBag() {
  const { state, depositCashBag, toast } = useStore()
  const nav = useNavigate()
  const [confirm, setConfirm] = useState(false)

  const total = cashBagTotal(state)
  const bag = state.cashBag
  const depositedToday = state.depositedLog.reduce((s, l) => s + l.total, 0)

  const doDeposit = () => {
    const log = depositCashBag()
    setConfirm(false)
    toast(`Đã nộp ${fmt(log.total)} — tiền về khớp mã, phát hành ${log.receiptIds.length} biên lai`, 'success')
  }

  return (
    <>
      <Banner tone="info" icon="info">
        Tiền mặt bạn đang giữ được hệ thống <b>đối soát «đã thu vs đã nộp»</b> và tự động
        <b> cảnh báo kế toán/lãnh đạo nếu chênh lệch hoặc quá hạn</b> — bảo đảm truy vết, chống thất thoát.
        Cách nộp: quét QR của <b>từng khoản</b> để chuyển khoản — tiền về khớp mã thì biên lai phát hành.
      </Banner>

      <div className="stat-grid">
        <div className="stat"><div className="k">Đang giữ (chờ nộp)</div><div className="v warning">{fmt(total)}</div><div className="sub">{bag.length} hộ</div></div>
        <div className="stat"><div className="k">Đã nộp về tài khoản</div><div className="v success">{fmt(depositedToday)}</div><div className="sub">{state.depositedLog.length} lần nộp</div></div>
        <div className="stat"><div className="k">Chênh lệch</div><div className="v primary">0 đ</div><div className="sub">đã thu = đã ghi nhận</div></div>
        <div className="stat"><div className="k">Hạn nộp</div><div className="v" style={{ fontSize: '0.95rem' }}>{CASH_DEADLINE}</div><div className="sub">quá hạn → cảnh báo</div></div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="grid-wrap">
          <table className="grid">
            <thead>
              <tr><th>Mã ghi nhận</th><th>Hộ</th><th>Khoản</th><th>Thu lúc</th><th className="num">Số tiền</th></tr>
            </thead>
            <tbody>
              {bag.map((e) => {
                const hh = state.households.find((h) => h.id === e.householdId)
                return (
                  <tr key={e.id}>
                    <td style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '0.78rem' }}>{e.id}</td>
                    <td>{hh?.name}<div style={{ fontSize: '0.72rem', color: 'var(--lumo-shade-60)' }}>{e.householdId}{e.payer ? ` · đóng thay: ${e.payer.name}` : ''}</div></td>
                    <td style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '0.74rem' }}>{e.receivableIds.join(', ')}</td>
                    <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{e.collectedAt}</td>
                    <td className="num" style={{ fontWeight: 700 }}>{fmt(e.amount)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!bag.length && <div className="empty"><Icon name="checkCircle" size={28} />Không giữ tiền mặt nào — đã thu là đã nộp ✓</div>}
      </div>

      {bag.length > 0 && (
        <div className="actions-row" style={{ marginTop: 14 }}>
          <button className="btn primary lg" onClick={() => setConfirm(true)}>
            <Icon name="send" /> Chuyển khoản nộp toàn bộ · {fmt(total)}
          </button>
          <button className="btn neutral lg" onClick={() => nav('/collect-list')}>Tiếp tục đi thu</button>
        </div>
      )}

      {state.depositedLog.length > 0 && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="card-title"><Icon name="checkCircle" />Lịch sử nộp tiền</div>
          {state.depositedLog.map((l, i) => (
            <div key={i} className="kv">
              <span className="k">{l.time} · {l.entries.length} hộ · {l.receiptIds.length} biên lai phát hành</span>
              <span className="v" style={{ fontWeight: 700 }}>{fmt(l.total)}</span>
            </div>
          ))}
        </div>
      )}

      {confirm && (
        <Modal title="Nộp tiền mặt — chuyển khoản theo QR từng khoản" onClose={() => setConfirm(false)}
          footer={<>
            <button className="btn neutral" onClick={() => setConfirm(false)}>Hủy</button>
            <button className="btn success" onClick={doDeposit}><Icon name="check" /> Đã chuyển đủ — xác nhận</button>
          </>}>
          <Banner tone="info" icon="qr">
            Quét QR của từng khoản để chuyển đúng <b>mã định danh</b> — tiền về khớp sao kê thì hệ thống
            phát hành biên lai cho từng hộ và gửi Zalo/SMS.
          </Banner>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
            <FakeQR value={bag.map((e) => e.id).join('|') || 'NOP'} />
          </div>
          {bag.map((e) => {
            const hh = state.households.find((h) => h.id === e.householdId)
            return <div className="kv" key={e.id}><span className="k">{hh?.name} · {e.receivableIds.length} khoản</span><span className="v">{fmt(e.amount)}</span></div>
          })}
          <div className="kv"><span className="k" style={{ fontWeight: 700 }}>Tổng nộp</span>
            <span className="v" style={{ fontSize: '1.2rem', color: 'var(--lumo-primary)' }}>{fmt(total)}</span></div>
          <div style={{ fontSize: '0.76rem', color: 'var(--lumo-shade-60)', marginTop: 8 }}>
            (Demo: bấm xác nhận để giả lập tiền về khớp mã.)
          </div>
        </Modal>
      )}
    </>
  )
}
