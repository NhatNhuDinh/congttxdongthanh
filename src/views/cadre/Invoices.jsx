import React, { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon, Topbar, areaName } from './shell'
import { OBJECTS } from './Objects'
import { useStore } from '../../store'

/* =========================================================================
   HÓA ĐƠN / ĐỢT THU (Cán bộ xã)
   Dữ liệu hóa đơn SUY RA từ OBJECTS (màn "Đối tượng & hợp đồng") → cùng
   mã / loại / nhóm giá / số tiền, nên bấm từ hai nơi ra cùng một hóa đơn.

   Trạng thái hóa đơn PHỤ THUỘC trạng thái ĐỢT:
   - Đợt 'chưa phát hành'  → mọi hóa đơn = "Nháp" (chưa QR, chưa gửi dân).
   - Đợt 'đã phát hành'    → hóa đơn có trạng thái thật (Chưa thu/Đã thu/Quá hạn) + QR.
   BATCH giữ trong bộ nhớ, dùng chung giữa danh sách và chi tiết; reset khi tải lại trang.
   ========================================================================= */
export const BATCH = { published: false }

export const INV_PERIOD = 'T7/2026'
const HH_RATE = 66000     // Nhóm 1 — hộ GĐ, ₫/tháng (mức cố định theo khu vực)
const KG_RATE = 1300      // Nhóm 2 — ₫/kg
const TYPE_TAG = { 'Hộ GĐ': '', 'Hộ KD': 'accent', 'Doanh nghiệp': 'amber', 'Cơ quan': 'ok' }

const fmt = (n) => (n ?? 0).toLocaleString('vi-VN') + ' ₫'

// Mã hóa đơn suy ổn định từ mã đối tượng: DT-00002 → HD-072602
const invNo = (o) => 'HD-0726' + o.id.slice(-2)
// Số tiền kỳ này (deterministic): hộ GĐ = định mức tháng; nhóm 2 = khối lượng × đơn giá
const amountOf = (o) => o.auto ? HH_RATE : Number(o.volume || 0) * KG_RATE

// Trạng thái SAU PHÁT HÀNH (minh hoạ, cố định theo mã — vài dòng mẫu Đã thu để demo)
const PAID_IDS = ['DT-00001', 'DT-00004']
const OVERDUE_IDS = ['DT-00003']
const issuedStatus = (o) => PAID_IDS.includes(o.id) ? 'paid' : (OVERDUE_IDS.includes(o.id) ? 'overdue' : 'unpaid')

const STATUS_META = {
  draft: { label: 'Nháp', tag: '' },        // badge trung tính (xám)
  paid: { label: 'Đã thu', tag: 'ok' },
  unpaid: { label: 'Chưa thu', tag: 'amber' },
  overdue: { label: 'Quá hạn', tag: 'warn' },
}

// Mô hình hóa đơn của một đối tượng, phụ thuộc trạng thái đợt (published)
export function buildInvoice(o, published) {
  const org = !o.auto
  const amount = amountOf(o)
  const status = published ? issuedStatus(o) : 'draft'
  const lines = org
    ? [{ desc: `Khối lượng CTRSH kỳ ${INV_PERIOD} (Nhóm 2)`, qty: `${o.volume || 0} kg`, rate: `${KG_RATE.toLocaleString('vi-VN')} ₫/kg`, amount }]
    : [{ desc: `Giá DV thu gom, vận chuyển CTRSH — kỳ ${INV_PERIOD} (Nhóm 1)`, qty: '1 kỳ', rate: `${HH_RATE.toLocaleString('vi-VN')} ₫/tháng`, amount }]
  return {
    id: invNo(o), objId: o.id, name: o.name, type: o.type, area: o.area,
    group: o.group, org, volume: o.volume, contract: o.contract, eff: o.eff,
    amount, status, lines,
    qr: published ? `VSMT.${o.id}.T72026` : null,          // chỉ sinh QR sau khi phát hành
    receipt: (published && status === 'paid')
      ? { no: 'BL-0726' + o.id.slice(-2), date: '05/07/2026', method: 'Chuyển khoản QR', amount }
      : null,
  }
}
export const allInvoices = (published) => OBJECTS.map((o) => buildInvoice(o, published))
// Tra hóa đơn theo mã đối tượng (DT-...) hoặc mã hóa đơn (HD-...)
export function invoiceOf(id, published) {
  const o = OBJECTS.find((x) => x.id === id) || OBJECTS.find((x) => invNo(x) === id)
  return o ? buildInvoice(o, published) : null
}

const FILTERS = [
  { v: 'all', label: 'Tất cả' },
  { v: 'unpaid', label: 'Chưa thu' },
  { v: 'paid', label: 'Đã thu' },
  { v: 'overdue', label: 'Quá hạn' },
]

/* ---------------- DANH SÁCH HÓA ĐƠN CỦA ĐỢT ---------------- */
export default function CadreInvoices() {
  const nav = useNavigate()
  const { toast } = useStore()
  const [published, setPublished] = useState(BATCH.published)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')

  const invoices = useMemo(() => allInvoices(published), [published])
  const total = invoices.reduce((s, v) => s + v.amount, 0)

  // Sinh lại đợt hóa đơn hàng loạt → đợt về NHÁP, ở lại danh sách
  const regenerate = () => {
    BATCH.published = false
    setPublished(false)
    toast('Sinh hóa đơn hàng loạt thành công · 15.240 hóa đơn kỳ T7/2026', 'success')
    nav('/invoices')
  }

  // Phát hành đợt → hóa đơn có trạng thái thật + sinh QR
  const publish = () => {
    BATCH.published = true
    setPublished(true)
    toast(`Đã phát hành ${invoices.length} hóa đơn`, 'success')
  }

  const rows = invoices.filter((v) => {
    if (filter !== 'all' && v.status !== filter) return false
    const kw = q.trim().toLowerCase()
    if (kw && !(`${v.id} ${v.objId} ${v.name}`.toLowerCase().includes(kw))) return false
    return true
  })

  return (
    <>
      <Topbar
        period={false}
        search={<div className="cb-search"><Icon name="search" size={16} /><input placeholder="Tìm mã HĐ / mã đối tượng / tên…" value={q} onChange={(e) => setQ(e.target.value)} /></div>}
        extraFilters={
          <span className="cb-selchip">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              {FILTERS.map((f) => <option key={f.v} value={f.v}>Trạng thái: {f.label}</option>)}
            </select>
            <Icon name="caret" size={14} />
          </span>
        }
        actions={<button className="cb-btn primary" onClick={regenerate}><Icon name="invoice" size={16} />Sinh đợt hóa đơn</button>}
      />

      <div className="cb-content">
        {/* Thẻ tóm tắt đợt */}
        <section className="cb-card">
          <div className="cb-card-head">
            <h2>Đợt thu · Kỳ {INV_PERIOD} · Đông Thạnh</h2>
            <span className={`cb-status ${published ? 'ok' : 'amber'}`}>{published ? 'Đã phát hành' : 'Chưa phát hành'}</span>
          </div>
          <div className="cb-kv-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="cb-kv"><div className="k">Kỳ</div><div className="v">{INV_PERIOD}</div></div>
            <div className="cb-kv"><div className="k">Số hóa đơn</div><div className="v">{invoices.length.toLocaleString('vi-VN')}</div></div>
            <div className="cb-kv"><div className="k">Tổng phải thu</div><div className="v">{fmt(total)}</div></div>
            <div className="cb-kv"><div className="k">Trạng thái đợt</div><div className="v">{published ? 'Đã phát hành' : 'Chưa phát hành (bản nháp)'}</div></div>
          </div>
          {published ? (
            <p className="cb-note" style={{ marginTop: 12 }}>Đợt đã phát hành · đã sinh QR cho từng hóa đơn · có thể gửi thông báo tới dân.</p>
          ) : (
            <div className="cb-card-actions">
              <button className="cb-btn primary" onClick={publish}><Icon name="check" size={15} />Phát hành đợt</button>
            </div>
          )}
        </section>

        {/* Bảng hóa đơn */}
        <div className="cb-card pad0" style={{ marginTop: 14 }}>
          <div className="cb-table-wrap">
            <table className="cb-table">
              <thead>
                <tr><th>Mã HĐ</th><th>Đối tượng</th><th>Loại</th><th>Tuyến / Địa bàn</th><th className="num">Số tiền</th><th>Trạng thái</th><th></th></tr>
              </thead>
              <tbody>
                {rows.map((v) => {
                  const m = STATUS_META[v.status]
                  return (
                    <tr key={v.id} className="click" onClick={() => nav(`/invoices/${v.objId}`)}>
                      <td className="mono">{v.id}</td>
                      <td style={{ fontWeight: 600 }}>{v.name} <span className="cb-sub mono">· {v.objId}</span></td>
                      <td><span className={`cb-tag ${TYPE_TAG[v.type]}`}>{v.type}</span></td>
                      <td>Tuyến 1 · {areaName(v.area)}</td>
                      <td className="num" style={{ fontWeight: 700 }}>{fmt(v.amount)}</td>
                      <td><span className={`cb-tag ${m.tag}`}>{m.label}</span></td>
                      <td className="actions" onClick={(e) => e.stopPropagation()}>
                        <button className="cb-mini" onClick={() => nav(`/invoices/${v.objId}`)}>Xem</button>
                      </td>
                    </tr>
                  )
                })}
                {!rows.length && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--c-ink-60)' }}>Không có hóa đơn khớp bộ lọc.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="cb-tablefoot">
            <span><b>{rows.length}</b> / {invoices.length} hóa đơn hiển thị</span>
          </div>
        </div>
        <p className="cb-note" style={{ marginTop: 10 }}>Hiển thị dữ liệu mẫu; đợt thực tế gồm 15.240 hóa đơn.</p>
      </div>
    </>
  )
}

/* ---------------- CHI TIẾT HÓA ĐƠN CỦA MỘT HỘ ---------------- */
export function CadreInvoiceDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const inv = invoiceOf(id, BATCH.published)

  if (!inv) {
    return (
      <>
        <Topbar title="Chi tiết hóa đơn" period={false} />
        <div className="cb-content">
          <button className="cb-backlink" onClick={() => nav('/invoices')}><Icon name="caret" size={14} />Danh sách hóa đơn</button>
          <section className="cb-card"><p className="cb-line">Không tìm thấy hóa đơn cho mã <b>{id}</b>.</p></section>
        </div>
      </>
    )
  }

  const m = STATUS_META[inv.status]
  const draft = inv.status === 'draft'

  return (
    <>
      <Topbar title="Chi tiết hóa đơn" period={false} />
      <div className="cb-content">
        <button className="cb-backlink" onClick={() => nav('/invoices')}><Icon name="caret" size={14} />Danh sách hóa đơn</button>

        <div className="cb-detail">
          {/* ---- TRÁI: hóa đơn ---- */}
          <div>
            <section className="cb-card">
              <div className="cb-card-head">
                <h2>{draft ? 'Bản nháp hóa đơn' : `Hóa đơn ${inv.id}`} · Kỳ {INV_PERIOD}</h2>
                <span className={`cb-tag ${m.tag}`}>{m.label}</span>
              </div>
              <div className="cb-kv-grid">
                <div className="cb-kv"><div className="k">Đối tượng</div><div className="v">{inv.name}</div></div>
                <div className="cb-kv"><div className="k">Mã đối tượng</div><div className="v mono">{inv.objId}</div></div>
                <div className="cb-kv"><div className="k">Loại</div><div className="v"><span className={`cb-tag ${TYPE_TAG[inv.type]}`}>{inv.type}</span></div></div>
                <div className="cb-kv"><div className="k">Nhóm giá</div><div className="v">{inv.group}</div></div>
                <div className="cb-kv"><div className="k">Tuyến / Địa bàn</div><div className="v">Tuyến 1 · {areaName(inv.area)}</div></div>
                <div className="cb-kv"><div className="k">Hợp đồng</div><div className="v mono">{inv.org ? inv.contract : 'Tự động'}</div></div>
              </div>
            </section>

            {/* Các dòng tính tiền */}
            <section className="cb-card pad0">
              <div style={{ padding: '16px 18px 8px' }}><h2 style={{ fontSize: '14.5px' }}>Chi tiết tính tiền</h2></div>
              <div className="cb-table-wrap">
                <table className="cb-table">
                  <thead><tr><th>Nội dung</th><th>Khối lượng / kỳ</th><th>Đơn giá</th><th className="num">Thành tiền</th></tr></thead>
                  <tbody>
                    {inv.lines.map((l, i) => (
                      <tr key={i}>
                        <td>{l.desc}</td>
                        <td>{l.qty}</td>
                        <td>{l.rate}</td>
                        <td className="num" style={{ fontWeight: 700 }}>{fmt(l.amount)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={3} style={{ fontWeight: 700, textAlign: 'right' }}>Tổng cộng</td>
                      <td className="num" style={{ fontWeight: 800, color: 'var(--c-accent)' }}>{fmt(inv.amount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Biên lai (nếu đã thu) */}
            {inv.receipt && (
              <section className="cb-card">
                <div className="cb-card-head"><h2>Biên lai điện tử</h2><span className="cb-tag ok">Đã thu</span></div>
                <div className="cb-kv-grid">
                  <div className="cb-kv"><div className="k">Số biên lai</div><div className="v mono">{inv.receipt.no}</div></div>
                  <div className="cb-kv"><div className="k">Ngày thu</div><div className="v">{inv.receipt.date}</div></div>
                  <div className="cb-kv"><div className="k">Hình thức</div><div className="v">{inv.receipt.method}</div></div>
                  <div className="cb-kv"><div className="k">Số tiền</div><div className="v">{fmt(inv.receipt.amount)}</div></div>
                </div>
              </section>
            )}
          </div>

          {/* ---- PHẢI: QR + thao tác ---- */}
          <section className="cb-card">
            <div className="cb-card-head"><h2>Mã QR hóa đơn</h2></div>
            <div style={{ display: 'grid', placeItems: 'center', padding: '10px 0 14px' }}>
              <div style={{ width: 150, height: 150, display: 'grid', placeItems: 'center', border: '1px solid var(--c-line)', borderRadius: 'var(--r-m)', color: draft ? 'var(--c-ink-40)' : 'var(--c-ink-60)', background: draft ? 'var(--c-bg)' : 'transparent' }}>
                {draft ? <span style={{ fontSize: 12, textAlign: 'center', padding: 12 }}>Chưa phát hành —<br />chưa có QR</span> : <Icon name="qr" size={104} />}
              </div>
              {!draft && <div style={{ marginTop: 8, fontFamily: 'ui-monospace, Consolas, monospace', fontSize: 12 }}>{inv.qr}</div>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="cb-btn ghost" disabled={draft}><Icon name="printer" size={15} />In hóa đơn</button>
              <button className="cb-btn ghost" disabled={draft}><Icon name="send" size={15} />Gửi lại QR / thông báo</button>
            </div>
            <p className="cb-note" style={{ marginTop: 12 }}>
              {draft
                ? 'Bản nháp — hóa đơn chưa phát hành, chưa gửi dân. Phát hành đợt để sinh QR và cho phép gửi thông báo.'
                : inv.receipt
                  ? 'Đã thu — QR chỉ để tra cứu, in lại biên lai.'
                  : 'Khách quét QR chuyển khoản cho xã; hệ thống khớp mã và phát hành biên lai.'}
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
