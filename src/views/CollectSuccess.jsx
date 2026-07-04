import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { Icon, Banner } from '../components/ui'
import { fmt, CASH_DEADLINE } from '../data'

export default function CollectSuccess() {
  const { hhId } = useParams()
  const nav = useNavigate()
  const { state, toast } = useStore()

  const hh = state.households.find((h) => h.id === hhId)
  const last = state.lastCollection && state.lastCollection.householdId === hhId ? state.lastCollection : null
  const isCashWait = last?.type === 'cash_wait'
  const receipts = last && !isCashWait
    ? state.receipts.filter((r) => last.receiptIds.includes(r.id))
    : []
  const total = last?.amount ?? receipts.reduce((s, r) => s + r.amount, 0)
  const proxy = last?.payer

  if (!last) {
    return (
      <>
        <Banner tone="info" icon="info">Không có ghi nhận thu nào gần đây cho hộ này.</Banner>
        <button className="btn neutral lg" onClick={() => nav('/collect-list')}>Về danh sách đi thu</button>
      </>
    )
  }

  return (
    <>
      {isCashWait ? (
        <Banner tone="warning" icon="cash">
          <b>Đã ghi nhận «đã thu tiền mặt, chờ nộp» — {fmt(total)}.</b><br />
          <b>Chưa phát hành biên lai.</b> Biên lai sẽ phát hành khi bạn chuyển khoản nộp theo QR của từng khoản
          và tiền về khớp mã. Hạn nộp: <b>{CASH_DEADLINE}</b>. Hệ thống đối soát đã thu vs đã nộp và cảnh báo nếu chênh/quá hạn.
        </Banner>
      ) : (
        <Banner tone="success" icon="checkCircle">
          <b>Tiền đã về khớp mã — {fmt(total)}.</b> Hệ thống phát hành {receipts.length} biên lai điện tử
          (mỗi khoản một biên lai) và cập nhật công nợ của hộ.
        </Banner>
      )}

      {!isCashWait && (
        <div className="card">
          <div className="card-title"><Icon name="receipt" />Biên lai hệ thống đã phát hành</div>
          {receipts.map((r) => (
            <div key={r.id} className="hh-row" style={{ boxShadow: 'none', border: '1px solid var(--lumo-shade-10)' }}
              onClick={() => nav(`/receipts/${r.id}`)}>
              <div className="avatar" style={{ background: 'var(--lumo-success)' }}><Icon name="check" size={16} /></div>
              <div className="info">
                <div className="name">{r.id}</div>
                <div className="meta">{r.einvoice} · {r.time}</div>
              </div>
              <div className="right"><div className="amount">{fmt(r.amount)}</div></div>
            </div>
          ))}
          {proxy && (
            <div className="kv">
              <span className="k">Người đóng thay (ghi để truy vết)</span>
              <span className="v">{proxy.name} — {proxy.idOrPhone}</span>
            </div>
          )}
          <div className="kv">
            <span className="k">Hộ</span><span className="v">{hh?.name} ({hh?.id})</span>
          </div>
        </div>
      )}

      {isCashWait && (
        <div className="card">
          <div className="card-title"><Icon name="cash" />Đã ghi vào Túi tiền — chờ nộp</div>
          <div className="kv"><span className="k">Hộ</span><span className="v">{hh?.name} ({hh?.id})</span></div>
          <div className="kv"><span className="k">Số tiền giữ</span><span className="v" style={{ fontWeight: 700 }}>{fmt(total)}</span></div>
          {proxy && (
            <div className="kv"><span className="k">Người đóng thay</span><span className="v">{proxy.name} — {proxy.idOrPhone}</span></div>
          )}
          <div className="kv"><span className="k">Hạn nộp</span><span className="v" style={{ color: 'var(--lumo-error, #d0342c)' }}>{CASH_DEADLINE}</span></div>
          <div className="actions-row" style={{ marginTop: 12 }}>
            <button className="btn primary" onClick={() => nav('/cashbag')}>
              <Icon name="send" /> Nộp ngay — mở Túi tiền
            </button>
          </div>
        </div>
      )}

      {!isCashWait && (
        <div className="card">
          <div className="card-title"><Icon name="send" />In &amp; gửi biên lai (TH-10)</div>
          <div className="actions-row">
            <button className="btn primary" onClick={() => toast('Đang kết nối máy in nhiệt Bluetooth… Đã in biên lai (demo)', 'info')}>
              <Icon name="print" /> In biên lai
            </button>
            <button className="btn" onClick={() => toast('Đã gửi biên lai qua Zalo tới hộ (demo)', 'success')}>
              <Icon name="send" /> Gửi Zalo
            </button>
            <button className="btn" onClick={() => toast('Đã gửi SMS tới hộ (demo)', 'success')}>
              <Icon name="phone" /> Gửi SMS
            </button>
          </div>
        </div>
      )}

      <div className="actions-row">
        <button className="btn success lg" onClick={() => nav('/collect-list')}>
          <Icon name="chevron" /> Tiếp tục hộ kế tiếp
        </button>
        <button className="btn neutral lg" onClick={() => nav('/')}>Về trang chủ</button>
      </div>
    </>
  )
}
