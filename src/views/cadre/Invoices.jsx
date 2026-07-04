import React, { useState } from 'react'
import { Icon, Topbar, publishLabel } from './shell'

const INVOICES = [
  { id: 'HD-072601', name: 'Nguyễn Văn A', amount: 66000, paid: true },
  { id: 'HD-072602', name: 'Tạp hóa Bảy Hồng', amount: 240000, paid: false },
  { id: 'HD-072603', name: 'Cty TNHH Minh Phát', amount: 1850000, paid: false },
  { id: 'HD-072604', name: 'Trường TH Đông Thạnh', amount: 320000, paid: true },
  { id: 'HD-072605', name: 'Trần Thị B', amount: 66000, paid: false },
]
const fmt = (n) => n.toLocaleString('vi-VN') + ' ₫'

export default function CadreInvoices() {
  // đợt hiện tại đã phát hành hay chưa (mockup — bấm nút để chuyển)
  const [published, setPublished] = useState(false)

  const actions = published ? (
    <>
      <button className="cb-btn ghost"><Icon name="printer" size={16} />Xuất báo cáo đợt</button>
      <button className="cb-btn primary"><Icon name="eye" size={16} />Xem chi tiết đợt</button>
    </>
  ) : (
    <>
      <button className="cb-btn ghost"><Icon name="invoice" size={16} />Sinh đợt hóa đơn</button>
      <button className="cb-btn primary" onClick={() => setPublished(true)}><Icon name="check" size={16} />{publishLabel()}</button>
    </>
  )

  return (
    <>
      <Topbar title="Hóa đơn / đợt thu" actions={actions} />

      <div className="cb-content">
        {/* Tóm tắt đợt */}
        <section className="cb-card">
          <div className="cb-card-head">
            <h2>Đợt T7/2026 · Đông Thạnh cũ</h2>
            <span className={`cb-status ${published ? 'ok' : 'amber'}`}>{published ? 'Đã phát hành' : 'Nháp — chưa phát hành'}</span>
          </div>
          <p className="cb-line">
            Đã sinh <b>15.240</b> khoản · tổng phải thu <b>1,27 tỉ ₫</b> · đã auto-check <span style={{ color: 'var(--c-warn)', fontWeight: 600 }}>(2 lỗi)</span>
          </p>
          <div className="cb-card-actions">
            <button className="cb-btn warn"><span className="cb-numbadge">2</span>Xử lý lỗi</button>
          </div>
        </section>

        {/* Bảng hóa đơn */}
        <div className="cb-card pad0" style={{ marginTop: 14 }}>
          <div className="cb-table-wrap">
            <table className="cb-table">
              <thead>
                <tr><th>Mã HĐ</th><th>Đối tượng</th><th className="num">Số tiền</th><th>Trạng thái</th><th>QR</th><th></th></tr>
              </thead>
              <tbody>
                {INVOICES.map((v) => (
                  <tr key={v.id}>
                    <td className="mono">{v.id}</td>
                    <td style={{ fontWeight: 600 }}>{v.name}</td>
                    <td className="num" style={{ fontWeight: 700 }}>{fmt(v.amount)}</td>
                    <td><span className={`cb-dot ${v.paid ? 'ok' : 'warn'}`}>{v.paid ? 'Đã thu' : 'Chưa thu'}</span></td>
                    <td><button className="cb-icon-btn" title="Xem mã QR"><Icon name="qr" size={16} /></button></td>
                    <td className="actions">
                      <button className="cb-mini">Xem</button>
                      <button className="cb-mini">In</button>
                      <button className="cb-mini">Gửi lại QR</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="cb-tablefoot">
            <span><b>15.240</b> hóa đơn trong đợt</span>
            <div className="cb-pager">
              <button disabled>‹</button><button className="on">1</button><button>2</button><button>3</button>
              <span style={{ padding: '0 6px' }}>…</span><button>610</button><button>›</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
