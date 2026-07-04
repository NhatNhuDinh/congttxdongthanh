import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { Icon, Banner } from '../components/ui'
import { fmt, areaName, METHOD_LABEL } from '../data'

export function ReceiptList() {
  const { state } = useStore()
  const nav = useNavigate()
  const [q, setQ] = useState('')

  const rows = state.receipts.filter((r) => {
    const hh = state.households.find((h) => h.id === r.householdId)
    const s = q.trim().toLowerCase()
    if (!s) return true
    return r.id.toLowerCase().includes(s) || hh?.name.toLowerCase().includes(s) || r.householdId.toLowerCase().includes(s)
  })

  return (
    <>
      <Banner tone="info" icon="info">
        Biên lai/HĐĐT do <b>hệ thống phát hành khi tiền về khớp mã</b> trên sao kê — người thu hộ chỉ
        <b> in và gửi lại</b> cho hộ (Zalo/SMS/máy in Bluetooth), không tự phát hành hay hủy.
      </Banner>
      <div className="toolbar">
        <div className="search">
          <Icon name="search" size={16} />
          <input placeholder="Tìm theo số biên lai, tên hộ, mã hộ…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div className="grid-wrap">
          <table className="grid">
            <thead>
              <tr><th>Số biên lai</th><th>Hộ</th><th>Hình thức</th><th>Thời điểm</th><th className="num">Số tiền</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const hh = state.households.find((h) => h.id === r.householdId)
                return (
                  <tr key={r.id} className="row" onClick={() => nav(`/receipts/${r.id}`)}>
                    <td style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontWeight: 700, fontSize: '0.8rem' }}>{r.id}</td>
                    <td>{hh?.name}<div style={{ fontSize: '0.72rem', color: 'var(--lumo-shade-60)' }}>{r.householdId}</div></td>
                    <td><span className={`badge ${r.method === 'qr_self' ? 'info' : 'success'}`}>{METHOD_LABEL[r.method] || r.method}</span></td>
                    <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{r.time}</td>
                    <td className="num" style={{ fontWeight: 700 }}>{fmt(r.amount)}{r.partial && <div className="badge warning">một phần</div>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!rows.length && <div className="empty">Không có biên lai nào.</div>}
      </div>
    </>
  )
}

export function ReceiptDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { state, toast } = useStore()
  const r = state.receipts.find((x) => x.id === id)
  if (!r) return <div className="empty">Không tìm thấy biên lai.</div>
  const hh = state.households.find((h) => h.id === r.householdId)
  const rec = state.receivables.find((x) => x.id === r.receivableId)

  return (
    <>
      <button className="btn tertiary sm" onClick={() => nav(-1)} style={{ marginBottom: 10 }}>
        <Icon name="back" size={15} /> Quay lại
      </button>

      <div className="card">
        <div className="receipt-paper">
          <div className="rp-head">
            <img src="/logo.png" alt="" />
            <div className="rp-sub">UBND XÃ ĐÔNG THẠNH — TP. HỒ CHÍ MINH</div>
            <div className="rp-title">BIÊN LAI THU GIÁ DỊCH VỤ THU GOM, VẬN CHUYỂN,<br />XỬ LÝ CHẤT THẢI RẮN SINH HOẠT</div>
            <div className="rp-sub">Số: <b>{r.id}</b> · {r.einvoice}</div>
          </div>
          <div className="rp-line"><span className="l">Hộ nộp</span><span className="r">{hh?.name} ({r.householdId})</span></div>
          <div className="rp-line"><span className="l">Địa chỉ</span><span className="r">{hh?.address} — {areaName(hh?.area)}</span></div>
          <div className="rp-line"><span className="l">Khoản thu</span><span className="r">{rec?.label || r.receivableId}</span></div>
          <div className="rp-line"><span className="l">Mã khoản</span><span className="r" style={{ fontFamily: 'ui-monospace, Consolas, monospace' }}>{r.receivableId}</span></div>
          <div className="rp-line"><span className="l">Hình thức</span><span className="r">{METHOD_LABEL[r.method] || r.method}</span></div>
          {r.payer && (
            <div className="rp-line"><span className="l">Người đóng thay</span>
              <span className="r">{r.payer.name} — {r.payer.idOrPhone}</span></div>
          )}
          <div className="rp-line"><span className="l">Phát hành</span><span className="r">{r.collectedBy}</span></div>
          <div className="rp-line"><span className="l">Thời điểm</span><span className="r">{r.time}</span></div>
          <div className="rp-line rp-total"><span className="l">SỐ TIỀN</span><span className="r">{fmt(r.amount)}</span></div>
          {r.partial && <div style={{ textAlign: 'center', marginTop: 6 }}><span className="badge warning">Nộp một phần — số còn lại theo dõi công nợ</span></div>}
        </div>

        <div className="actions-row" style={{ marginTop: 14 }}>
          <button className="btn primary" onClick={() => toast('Đang kết nối máy in nhiệt Bluetooth… Đã in (demo)', 'info')}>
            <Icon name="print" /> In biên lai
          </button>
          <button className="btn" onClick={() => toast('Đã gửi biên lai qua Zalo tới hộ (demo)', 'success')}>
            <Icon name="send" /> Gửi Zalo
          </button>
          <button className="btn" onClick={() => toast('Đã gửi SMS tới hộ (demo)', 'success')}>
            <Icon name="phone" /> Gửi SMS
          </button>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--lumo-shade-40)', marginTop: 10 }}>
          Biên lai ký số, <b>không sửa được sau phát hành</b>. Hủy/điều chỉnh do <b>kế toán</b> thực hiện — ngoài quyền người thu hộ.
        </div>
      </div>
    </>
  )
}
