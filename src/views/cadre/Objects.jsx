import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon, Topbar, Modal, FilterChip, AREAS, areaName } from './shell'

/* Loại đối tượng → tổ chức hay hộ GĐ + màu tag */
const TYPES = ['Hộ GĐ', 'Hộ KD', 'Doanh nghiệp', 'Cơ quan']
const TYPE_TAG = { 'Hộ GĐ': '', 'Hộ KD': 'accent', 'Doanh nghiệp': 'amber', 'Cơ quan': 'ok' }
const isOrgType = (t) => t !== 'Hộ GĐ'
const PERIOD_START = '2026-07-01'          // đầu kỳ hiện tại (T7/2026)
const KG_PRICE = '1.300 ₫/kg'              // đơn giá Nhóm 2 theo biểu giá thời kỳ (readonly)
const HH_PRICE = '66.000 ₫/tháng'          // đơn giá Nhóm 1 (hộ GĐ)

/* Dữ liệu minh hoạ (mockup) — nguồn dùng chung cho danh sách & chi tiết */
export const OBJECTS = [
  { id: 'DT-00001', name: 'Nguyễn Văn A', type: 'Hộ GĐ', area: 'DT', group: 'Nhóm 1', contract: 'Tự động', auto: true, debt: 0, eff: PERIOD_START },
  { id: 'DT-00002', name: 'Tạp hóa Bảy Hồng', type: 'Hộ KD', area: 'DT', group: 'Nhóm 2 · kg', contract: 'HĐ-2025-018', debt: 240000, volume: '120', unit: KG_PRICE, eff: '2025-01-01' },
  { id: 'DT-00003', name: 'Cty TNHH Minh Phát', type: 'Doanh nghiệp', area: 'TTT', group: 'Nhóm 2 · kg', contract: 'HĐ-2025-102', debt: 1850000, volume: '900', unit: KG_PRICE, eff: '2025-01-01' },
  { id: 'DT-00004', name: 'Trường TH Đông Thạnh', type: 'Cơ quan', area: 'NB', group: 'Nhóm 2 · kg', contract: 'HĐ-2025-045', debt: 0, volume: '300', unit: KG_PRICE, eff: '2025-01-01' },
  { id: 'DT-00005', name: 'Trần Thị B', type: 'Hộ GĐ', area: 'DT', group: 'Nhóm 1', contract: 'Tự động', auto: true, debt: 66000, eff: PERIOD_START },
]
const fmt = (n) => n === 0 ? '—' : n.toLocaleString('vi-VN') + ' ₫'
const nextId = () => 'DT-' + String(OBJECTS.length + 1).padStart(5, '0')
const suggestContract = () => 'HĐ-2026-' + String(103 + OBJECTS.filter((o) => !o.auto && o.id > 'DT-00005').length).padStart(3, '0')

/* ---------------- DANH SÁCH ---------------- */
export function CadreObjects() {
  const nav = useNavigate()
  const [rows, setRows] = useState(() => [...OBJECTS])
  const [add, setAdd] = useState(false)

  const onSave = (obj) => {
    OBJECTS.push(obj)                 // để trang chi tiết cũng tìm được
    setRows((r) => [...r, obj])
    setAdd(false)
  }

  return (
    <>
      <Topbar
        title="Đối tượng & hợp đồng"
        search={<div className="cb-search"><Icon name="search" size={16} /><input placeholder="Tìm mã/tên…" /></div>}
        extraFilters={<FilterChip label="Loại: Tất cả" />}
        actions={<button className="cb-btn primary" onClick={() => setAdd(true)}><Icon name="add" size={16} />Thêm đối tượng</button>}
      />

      <div className="cb-content">
        <div className="cb-card pad0">
          <div className="cb-table-wrap">
            <table className="cb-table">
              <thead>
                <tr><th>Mã</th><th>Tên</th><th>Loại</th><th>Nhóm giá</th><th>Hợp đồng</th><th className="num">Công nợ</th><th></th></tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={o.id} className="click" onClick={() => nav(`/objects/${o.id}`)}>
                    <td className="mono">{o.id}</td>
                    <td style={{ fontWeight: 600 }}>{o.name}</td>
                    <td><span className={`cb-tag ${TYPE_TAG[o.type]}`}>{o.type}</span></td>
                    <td>{o.group}</td>
                    <td>{o.auto ? <span className="cb-sub">Tự động</span> : <span className="mono">{o.contract}</span>}</td>
                    <td className="num" style={{ fontWeight: 700, color: o.debt ? 'var(--c-warn)' : 'inherit' }}>{fmt(o.debt)}</td>
                    <td className="actions" onClick={(e) => e.stopPropagation()}>
                      <button className="cb-mini" onClick={() => nav(`/objects/${o.id}`)}>Xem</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="cb-tablefoot">
            <span><b>15.240</b> đối tượng</span>
            <div className="cb-pager">
              <button disabled>‹</button><button className="on">1</button><button>2</button><button>3</button>
              <span style={{ padding: '0 6px' }}>…</span><button>610</button><button>›</button>
            </div>
          </div>
        </div>
      </div>

      {add && <AddObjectModal onClose={() => setAdd(false)} onSave={onSave} />}
    </>
  )
}

/* ---------------- MODAL: THÊM ĐỐI TƯỢNG + HỢP ĐỒNG ---------------- */
function AddObjectModal({ onClose, onSave }) {
  const [f, setF] = useState({
    name: '', type: 'Hộ GĐ', area: '', address: '', contact: '',
    eff: PERIOD_START,                 // hộ GĐ: ngày hiệu lực
    contractNo: '', effOrg: PERIOD_START, volume: '',  // tổ chức
  })
  const [touched, setTouched] = useState({})
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }))
  const blur = (k) => setTouched((t) => ({ ...t, [k]: true }))

  const org = isOrgType(f.type)
  const errs = {
    name: !f.name.trim(),
    area: !f.area,
    contractNo: org && !f.contractNo.trim(),
    effOrg: org && !f.effOrg,
    volume: org && !String(f.volume).trim(),
  }
  const valid = !Object.values(errs).some(Boolean)
  const showErr = (k) => errs[k] && touched[k]

  const onType = (t) => setF((s) => ({
    ...s, type: t,
    contractNo: isOrgType(t) && !s.contractNo ? suggestContract() : s.contractNo,
  }))

  const save = () => {
    if (!valid) { setTouched({ name: true, area: true, contractNo: true, effOrg: true, volume: true }); return }
    onSave({
      id: nextId(), name: f.name.trim(), type: f.type, area: f.area,
      address: f.address.trim(), contact: f.contact.trim(),
      group: org ? 'Nhóm 2 · kg' : 'Nhóm 1',
      contract: org ? f.contractNo.trim() : 'Tự động', auto: !org,
      eff: org ? f.effOrg : f.eff,
      volume: org ? f.volume : null,
      unit: org ? KG_PRICE : HH_PRICE,
      debt: 0,
    })
  }

  return (
    <Modal title="Thêm đối tượng" onClose={onClose}
      footer={<>
        <button className="cb-btn ghost" onClick={onClose}>Hủy</button>
        <button className="cb-btn primary" disabled={!valid} onClick={save}><Icon name="check" size={15} />Lưu đối tượng &amp; hợp đồng</button>
      </>}>

      {/* ----- Nhóm 1: Thông tin đối tượng ----- */}
      <div className="cb-formsec-title" style={{ marginTop: 0 }}><span className="cb-tag accent">Bước 1</span> Thông tin đối tượng</div>
      <div className="cb-field">
        <label>Tên đối tượng *</label>
        <input className={`cb-input${showErr('name') ? ' bad' : ''}`} placeholder="VD: Nguyễn Văn A / Cty…"
          value={f.name} onChange={(e) => set('name', e.target.value)} onBlur={() => blur('name')} />
        {showErr('name') && <div className="cb-err">Vui lòng nhập tên đối tượng.</div>}
      </div>
      <div className="cb-formrow">
        <div className="cb-field"><label>Loại *</label>
          <select className="cb-select" value={f.type} onChange={(e) => onType(e.target.value)}>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="cb-field"><label>Địa bàn *</label>
          <select className={`cb-select${showErr('area') ? ' bad' : ''}`} value={f.area}
            onChange={(e) => set('area', e.target.value)} onBlur={() => blur('area')}>
            <option value="">— Chọn địa bàn —</option>
            {AREAS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          {showErr('area') && <div className="cb-err">Chọn địa bàn.</div>}
        </div>
      </div>
      <div className="cb-field"><label>Địa chỉ</label>
        <input className="cb-input" placeholder="Ấp/Tổ, Đông Thạnh" value={f.address} onChange={(e) => set('address', e.target.value)} />
      </div>
      <div className="cb-field"><label>SĐT / CCCD (tùy chọn)</label>
        <input className="cb-input" placeholder="SĐT hoặc số CCCD" value={f.contact} onChange={(e) => set('contact', e.target.value)} />
      </div>
      <p className="cb-hint">Mã đối tượng do hệ thống cấp tự động khi lưu — sẽ là <b>{nextId()}</b>.</p>

      {/* ----- Nhóm 2: Hợp đồng (rẽ nhánh theo Loại) ----- */}
      <div className="cb-formsec">
        <div className="cb-formsec-title"><span className="cb-tag accent">Bước 2</span> Hợp đồng {org ? '(tổ chức)' : '(hộ gia đình)'}</div>

        {!org ? (
          <>
            <p className="cb-line" style={{ fontWeight: 600 }}>Hợp đồng: Đăng ký dịch vụ mặc định (tự sinh theo mức khu vực)</p>
            <div className="cb-formrow">
              <div className="cb-field"><label>Nhóm giá</label><div className="cb-readonly">Nhóm 1</div></div>
              <div className="cb-field"><label>Ngày hiệu lực</label>
                <input type="date" className="cb-input" value={f.eff} onChange={(e) => set('eff', e.target.value)} />
              </div>
            </div>
            <p className="cb-note" style={{ marginBottom: 0 }}>Hộ gia đình dùng đăng ký dịch vụ mặc định, không cần hợp đồng riêng.</p>
          </>
        ) : (
          <>
            <div className="cb-formrow">
              <div className="cb-field"><label>Số hợp đồng *</label>
                <input className={`cb-input${showErr('contractNo') ? ' bad' : ''}`} value={f.contractNo}
                  onChange={(e) => set('contractNo', e.target.value)} onBlur={() => blur('contractNo')} placeholder="HĐ-2026-xxx" />
                {showErr('contractNo') && <div className="cb-err">Nhập số hợp đồng.</div>}
              </div>
              <div className="cb-field"><label>Ngày hiệu lực *</label>
                <input type="date" className={`cb-input${showErr('effOrg') ? ' bad' : ''}`} value={f.effOrg}
                  onChange={(e) => set('effOrg', e.target.value)} onBlur={() => blur('effOrg')} />
                {showErr('effOrg') && <div className="cb-err">Chọn ngày hiệu lực.</div>}
              </div>
            </div>
            <div className="cb-formrow">
              <div className="cb-field"><label>Nhóm giá</label><div className="cb-readonly">Nhóm 2 · theo khối lượng (kg)</div></div>
              <div className="cb-field"><label>Định mức ước tính (kg/kỳ) *</label>
                <input type="number" min="0" className={`cb-input${showErr('volume') ? ' bad' : ''}`} value={f.volume}
                  onChange={(e) => set('volume', e.target.value)} onBlur={() => blur('volume')} placeholder="VD: 300" />
                {showErr('volume') && <div className="cb-err">Nhập định mức khối lượng.</div>}
              </div>
            </div>
            <div className="cb-field"><label>Đơn giá (theo biểu giá thời kỳ)</label><div className="cb-readonly">{KG_PRICE} · biểu giá T7/2026</div></div>
            <div className="cb-field"><label>Đính kèm file hợp đồng (tùy chọn)</label>
              <button className="cb-btn ghost" type="button"><Icon name="invoice" size={15} />Đính kèm tệp…</button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

/* ---------------- CHI TIẾT ---------------- */
export function CadreObjectDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const o = OBJECTS.find((x) => x.id === id) || OBJECTS[0]
  const org = !o.auto
  return (
    <>
      <Topbar title="Chi tiết đối tượng" period={false} />
      <div className="cb-content">
        <button className="cb-backlink" onClick={() => nav('/objects')}><Icon name="caret" size={14} />Danh sách đối tượng</button>

        <div className="cb-detail">
          <div>
            <section className="cb-card">
              <div className="cb-card-head">
                <h2>{o.name}</h2>
                <span className={`cb-tag ${TYPE_TAG[o.type]}`}>{o.type}</span>
              </div>
              <div className="cb-kv-grid">
                <div className="cb-kv"><div className="k">Mã đối tượng</div><div className="v mono">{o.id}</div></div>
                <div className="cb-kv"><div className="k">Nhóm giá</div><div className="v">{o.group}</div></div>
                <div className="cb-kv"><div className="k">Địa bàn</div><div className="v">{areaName(o.area)}</div></div>
                <div className="cb-kv"><div className="k">Tuyến</div><div className="v">Tuyến 1 · TDP 3</div></div>
                <div className="cb-kv full"><div className="k">Địa chỉ (địa giới mới)</div><div className="v">{o.address || 'Ấp 3, Đông Thạnh, TP.HCM'}</div></div>
              </div>
            </section>

            {/* ---- Khu Hợp đồng ---- */}
            <section className="cb-card">
              <div className="cb-card-head">
                <h2>Hợp đồng</h2>
                <button className="cb-mini"><Icon name="edit" size={13} /> Sửa hợp đồng</button>
              </div>
              {!org ? (
                <>
                  <p className="cb-line" style={{ fontWeight: 600 }}>Đăng ký dịch vụ mặc định (tự sinh)</p>
                  <div className="cb-kv-grid">
                    <div className="cb-kv"><div className="k">Biểu giá áp dụng</div><div className="v">QĐ 67/2025 · Nhóm 1</div></div>
                    <div className="cb-kv"><div className="k">Đơn giá</div><div className="v">{o.unit || HH_PRICE}</div></div>
                    <div className="cb-kv"><div className="k">Ngày hiệu lực</div><div className="v">{o.eff || '2025-01-01'}</div></div>
                    <div className="cb-kv"><div className="k">Chu kỳ</div><div className="v">Hàng tháng</div></div>
                  </div>
                  <p className="cb-note" style={{ marginTop: 12, marginBottom: 0 }}>Hộ gia đình dùng đăng ký dịch vụ mặc định, không cần hợp đồng riêng.</p>
                </>
              ) : (
                <div className="cb-kv-grid">
                  <div className="cb-kv"><div className="k">Số hợp đồng</div><div className="v mono">{o.contract}</div></div>
                  <div className="cb-kv"><div className="k">Biểu giá áp dụng</div><div className="v">QĐ 67/2025 · Nhóm 2 · kg</div></div>
                  <div className="cb-kv"><div className="k">Định mức ước tính</div><div className="v">{o.volume ? `${o.volume} kg/kỳ` : '—'}</div></div>
                  <div className="cb-kv"><div className="k">Đơn giá</div><div className="v">{o.unit || KG_PRICE}</div></div>
                  <div className="cb-kv"><div className="k">Ngày hiệu lực</div><div className="v">{o.eff || '2025-01-01'}</div></div>
                  <div className="cb-kv"><div className="k">Chu kỳ</div><div className="v">Hàng tháng</div></div>
                </div>
              )}
            </section>

            <section className="cb-card pad0">
              <div style={{ padding: '16px 18px 8px' }}><h2 style={{ fontSize: '14.5px' }}>Lịch sử thu</h2></div>
              <div className="cb-table-wrap">
                <table className="cb-table">
                  <thead><tr><th>Kỳ</th><th>Nội dung</th><th className="num">Số tiền</th><th>Trạng thái</th></tr></thead>
                  <tbody>
                    <tr><td>T6/2026</td><td>Phí VSMT tháng 6</td><td className="num">66.000 ₫</td><td><span className="cb-dot ok">Đã thu</span></td></tr>
                    <tr><td>T7/2026</td><td>Phí VSMT tháng 7</td><td className="num">66.000 ₫</td><td><span className="cb-dot warn">Chưa thu</span></td></tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <section className="cb-card">
            <div className="cb-card-head"><h2>Thao tác</h2></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="cb-btn primary lg"><Icon name="add" size={16} />Tạo khoản thu lẻ</button>
              <button className="cb-btn ghost"><Icon name="percent" size={15} />Đề nghị miễn giảm</button>
              <button className="cb-btn ghost"><Icon name="edit" size={15} />Sửa</button>
            </div>
            <p className="cb-note" style={{ marginTop: 12 }}>Cán bộ chỉ lập đề nghị miễn giảm; lãnh đạo duyệt.</p>
          </section>
        </div>
      </div>
    </>
  )
}
