import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon, Topbar } from './shell'

const HH = [
  { id: 'DT-00002', name: 'Tạp hóa Bảy Hồng', addr: 'Ấp 2, Đông Thạnh', amount: 240000, overdue: true, phone: '0903****21', cccd: '079•••••234' },
  { id: 'DT-00005', name: 'Trần Thị B', addr: 'Ấp 3, Đông Thạnh', amount: 66000, overdue: false, phone: '0912****88', cccd: '079•••••771' },
  { id: 'DT-00019', name: 'Hộ Nguyễn Văn Sáu', addr: 'Ấp 5, Đông Thạnh', amount: 66000, overdue: true, phone: '0977****40', cccd: '079•••••905' },
  { id: 'DT-00027', name: 'Quán ăn Hương Quê', addr: 'Ấp 2, Đông Thạnh', amount: 480000, overdue: true, phone: '0938****12', cccd: '079•••••118' },
]
const fmt = (n) => n.toLocaleString('vi-VN') + ' ₫'

/* ---------------- DANH SÁCH HỘ ---------------- */
export function CadreCollect() {
  const nav = useNavigate()
  const [seg, setSeg] = useState('chua')
  const rows = HH.filter((h) => seg === 'chua' ? true : h.overdue)
  return (
    <>
      <Topbar title="Thu tiền (hỗ trợ)" />
      <div className="cb-content">
        <div style={{ marginBottom: 14 }}>
          <div className="cb-seg">
            <button className={seg === 'chua' ? 'on' : ''} onClick={() => setSeg('chua')}>Chưa thu</button>
            <button className={seg === 'qh' ? 'on' : ''} onClick={() => setSeg('qh')}>Quá hạn</button>
          </div>
        </div>

        <div className="cb-card pad0">
          {rows.map((h) => (
            <div key={h.id} className="cb-hh" onClick={() => nav(`/cadre/collect/${h.id}`)}>
              <div className="avatar">{h.name.split(' ').slice(-1)[0][0]}</div>
              <div className="info">
                <div className="nm">{h.name} {h.overdue && <span className="cb-tag warn" style={{ marginLeft: 4 }}>Quá hạn</span>}</div>
                <div className="cb-sub">{h.id} · {h.addr}</div>
              </div>
              <div style={{ fontWeight: 700 }}>{fmt(h.amount)}</div>
              <Icon name="caret" size={16} />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

/* ---------------- CHI TIẾT THU (trường khóa) ---------------- */
export function CadreCollectDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const h = HH.find((x) => x.id === id) || HH[0]
  const [proxy, setProxy] = useState(false)
  return (
    <>
      <Topbar title="Thu tiền · chi tiết hộ" />
      <div className="cb-content">
        <button className="cb-backlink" onClick={() => nav('/cadre/collect')}><Icon name="caret" size={14} />Danh sách đi thu</button>

        <div className="cb-detail">
          {/* trái: thông tin KHÓA */}
          <div>
            <section className="cb-card">
              <div className="cb-card-head">
                <h2>{h.name}</h2>
                {h.overdue ? <span className="cb-status warn">Quá hạn</span> : <span className="cb-status amber">Chưa thu</span>}
              </div>
              <div className="cb-kv-grid">
                <div className="cb-kv cb-locked"><div className="k">Mã đối tượng</div><div className="v mono">{h.id} <Icon name="edit" size={13} /></div></div>
                <div className="cb-kv cb-locked"><div className="k">Số phải thu</div><div className="v">{fmt(h.amount)} <Icon name="edit" size={13} /></div></div>
                <div className="cb-kv cb-locked"><div className="k">CCCD (che)</div><div className="v mono">{h.cccd} <Icon name="edit" size={13} /></div></div>
                <div className="cb-kv cb-locked"><div className="k">SĐT (che)</div><div className="v mono">{h.phone} <Icon name="edit" size={13} /></div></div>
                <div className="cb-kv cb-locked full"><div className="k">Địa chỉ</div><div className="v">{h.addr} <Icon name="edit" size={13} /></div></div>
              </div>
              <p className="cb-note" style={{ marginTop: 12 }}>Các trường trên bị <b>khóa</b> — cán bộ hỗ trợ thu không được sửa thông tin hộ/số tiền.</p>
            </section>

            <section className="cb-card">
              <div className="cb-card-head"><h2>Người đóng thay (nếu không phải chủ hộ)</h2></div>
              {!proxy ? (
                <button className="cb-btn ghost" onClick={() => setProxy(true)}><Icon name="user" size={15} />Thêm người đóng thay</button>
              ) : (
                <div className="cb-formrow">
                  <div className="cb-field"><label>Họ tên người nộp</label><input className="cb-input" placeholder="VD: Nguyễn Thị C" /></div>
                  <div className="cb-field"><label>SĐT / CCCD</label><input className="cb-input" placeholder="SĐT hoặc số CCCD" /></div>
                </div>
              )}
            </section>
          </div>

          {/* phải: hành động — 1 CTA chính */}
          <section className="cb-card">
            <div className="cb-card-head"><h2>Thu tiền</h2></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="cb-btn primary lg"><Icon name="qr" size={16} />Thu qua QR</button>
              <button className="cb-btn ghost"><Icon name="qr" size={15} />Đưa QR cho dân</button>
              <button className="cb-btn ghost"><Icon name="bank" size={15} />Tiền mặt → chuyển khoản</button>
              <button className="cb-btn ghost"><Icon name="check" size={15} />Đánh dấu đã thu · chờ nộp</button>
              <button className="cb-btn ghost"><Icon name="printer" size={15} />In giấy báo (hộ vắng)</button>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
