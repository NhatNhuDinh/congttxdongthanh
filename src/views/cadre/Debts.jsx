import React, { useState } from 'react'
import { Icon, Topbar, Modal, FilterChip } from './shell'

const DEBTS = [
  { id: 'DT-00002', name: 'Tạp hóa Bảy Hồng', due: 240000, left: 240000, age: 34 },
  { id: 'DT-00003', name: 'Cty TNHH Minh Phát', due: 1850000, left: 1850000, age: 96 },
  { id: 'DT-00005', name: 'Trần Thị B', due: 66000, left: 66000, age: 41 },
  { id: 'DT-00019', name: 'Hộ Nguyễn Văn Sáu', due: 132000, left: 66000, age: 63 },
  { id: 'DT-00027', name: 'Quán ăn Hương Quê', due: 480000, left: 480000, age: 95 },
]
const fmt = (n) => n.toLocaleString('vi-VN') + ' ₫'
const ageTag = (a) => a > 90 ? 'warn' : a >= 60 ? 'amber' : ''

const SUMMARY = [
  { k: 'Tổng nợ quá hạn', v: '223 tr ₫', sub: 'toàn xã', warn: true },
  { k: 'Quá hạn 30–60 ngày', v: '1.980', sub: 'hộ' },
  { k: 'Quá hạn >90 ngày', v: '760', sub: 'hộ', warn: true },
]

export default function CadreDebts() {
  const [sel, setSel] = useState(() => new Set())
  const [propose, setPropose] = useState(null) // đối tượng đang lập đề nghị

  const toggle = (id) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const allChecked = sel.size === DEBTS.length
  const toggleAll = () => setSel(allChecked ? new Set() : new Set(DEBTS.map((d) => d.id)))

  return (
    <>
      <Topbar
        title="Công nợ"
        extraFilters={<FilterChip label="Tuổi nợ: >30 ngày" />}
        actions={<>
          <button className="cb-btn ghost"><Icon name="bell" size={16} />Nhắc nợ</button>
          <button className="cb-btn ghost" onClick={() => setPropose(DEBTS[0])}><Icon name="percent" size={16} />Đề nghị miễn giảm</button>
        </>}
      />

      <div className="cb-content">
        <section className="cb-stats cols-3">
          {SUMMARY.map((s) => (
            <div key={s.k} className={`cb-stat${s.warn ? ' warn' : ''}`}>
              <div className="k">{s.k}</div><div className="v">{s.v}</div><div className="sub">{s.sub}</div>
            </div>
          ))}
        </section>

        {sel.size > 0 && (
          <div className="cb-bulkbar">
            <span>Đã chọn <b>{sel.size}</b> đối tượng</span>
            <div className="cb-spacer" />
            <button className="cb-btn ghost" onClick={() => setSel(new Set())}>Bỏ chọn</button>
            <button className="cb-btn primary"><Icon name="bell" size={15} />Nhắc nợ hàng loạt</button>
          </div>
        )}

        <div className="cb-card pad0">
          <div className="cb-table-wrap">
            <table className="cb-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}><input type="checkbox" className="cb-check" checked={allChecked} onChange={toggleAll} /></th>
                  <th>Đối tượng</th><th className="num">Phải thu</th><th className="num">Còn lại</th><th>Tuổi nợ</th><th></th>
                </tr>
              </thead>
              <tbody>
                {DEBTS.map((d) => (
                  <tr key={d.id}>
                    <td><input type="checkbox" className="cb-check" checked={sel.has(d.id)} onChange={() => toggle(d.id)} /></td>
                    <td><span style={{ fontWeight: 600 }}>{d.name}</span><div className="cb-sub mono">{d.id}</div></td>
                    <td className="num">{fmt(d.due)}</td>
                    <td className="num" style={{ fontWeight: 700, color: 'var(--c-warn)' }}>{fmt(d.left)}</td>
                    <td><span className={`cb-tag ${ageTag(d.age)}`}>{d.age} ngày</span></td>
                    <td className="actions">
                      <button className="cb-mini">Nhắc</button>
                      <button className="cb-mini" onClick={() => setPropose(d)}>Đề nghị</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {propose && (
        <Modal title="Đề nghị miễn giảm / hoàn" onClose={() => setPropose(null)}
          footer={<>
            <button className="cb-btn ghost" onClick={() => setPropose(null)}>Hủy</button>
            <button className="cb-btn primary" onClick={() => setPropose(null)}><Icon name="send" size={15} />Trình lãnh đạo</button>
          </>}>
          <div className="cb-field"><label>Đối tượng</label><input className="cb-input" value={`${propose.name} · ${propose.id}`} readOnly /></div>
          <div className="cb-formrow">
            <div className="cb-field"><label>Diện đề nghị *</label>
              <select className="cb-select"><option>Hộ nghèo</option><option>Hộ cận nghèo</option><option>Gia đình chính sách</option><option>Neo đơn</option></select>
            </div>
            <div className="cb-field"><label>Mức *</label>
              <select className="cb-select"><option>Giảm 50%</option><option>Miễn 100%</option><option>Hoàn tiền</option></select>
            </div>
          </div>
          <div className="cb-field"><label>Căn cứ / lý do *</label><textarea className="cb-textarea" placeholder="VD: Hộ nghèo 2026 theo QĐ số…; có xác nhận trưởng ấp…" /></div>
          <div className="cb-field"><label>Minh chứng đính kèm</label>
            <button className="cb-btn ghost" type="button"><Icon name="invoice" size={15} />Đính kèm tệp…</button>
          </div>
          <p className="cb-note" style={{ marginBottom: 0 }}>Cán bộ chỉ đề nghị; lãnh đạo duyệt.</p>
        </Modal>
      )}
    </>
  )
}
