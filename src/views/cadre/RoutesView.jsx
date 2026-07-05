import React, { useState } from 'react'
import { Icon, Topbar, Modal, FilterChip, AreaFilter } from './shell'

const COLLECTORS = [
  { id: 'NTH-003', name: 'Lê Văn Tâm', role: 'TDP 3' },
  { id: 'NTH-005', name: 'Phạm Thị Hoa', role: 'TDP 5' },
  { id: 'CTV-011', name: 'Võ Minh Cường', role: 'CTV' },
  { id: 'NTH-008', name: 'Huỳnh Văn Lộc', role: 'TDP 7' },
]

const INIT = [
  { id: 'T1', area: 'TDP 3 · Đông Thạnh cũ', hh: 5240, who: COLLECTORS[0] },
  { id: 'T2', area: 'TDP 5 · Đông Thạnh cũ', hh: 4980, who: COLLECTORS[1] },
  { id: 'T3', area: 'Ấp CTV · Đông Thạnh cũ', hh: 3120, who: COLLECTORS[2] },
  { id: 'T4', area: 'TDP 7 · Đông Thạnh cũ', hh: 1900, who: null },
]

export default function CadreRoutesView() {
  const [rows, setRows] = useState(INIT)
  const [pick, setPick] = useState(null) // route đang gán

  const assign = (person) => {
    setRows((rs) => rs.map((r) => r.id === pick.id ? { ...r, who: person } : r))
    setPick(null)
  }

  return (
    <>
      <Topbar
        title="Gán tuyến"
        period={false}
        extraFilters={<><FilterChip label="Áp dụng từ: Kỳ T7/2026" /><AreaFilter /></>}
        actions={<button className="cb-btn primary"><Icon name="add" size={16} />Thêm tuyến</button>}
      />

      <div className="cb-content">
        <p className="cb-note" style={{ marginBottom: 14 }}>
          Cấu hình cố định, chỉ đổi khi cần (tháng/quý); mỗi tuyến gán một người thu hộ; hệ thống tự lập danh sách hộ.
        </p>

        <div className="cb-card pad0">
          <div className="cb-table-wrap">
            <table className="cb-table">
              <thead>
                <tr><th>Tuyến</th><th>Địa bàn</th><th className="num">Số hộ</th><th>Người thu hộ</th><th></th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700 }}>{r.id}</td>
                    <td>{r.area}</td>
                    <td className="num">{r.hh.toLocaleString('vi-VN')}</td>
                    <td>
                      {r.who ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <span className="cb-avatar" style={{ width: 28, height: 28, fontSize: 12 }}>{r.who.name.split(' ').slice(-1)[0][0]}</span>
                          <span><span style={{ fontWeight: 600 }}>{r.who.name}</span> <span className="cb-tag" style={{ marginLeft: 4 }}>{r.who.role}</span></span>
                        </span>
                      ) : (
                        <span className="cb-tag warn">Chưa gán</span>
                      )}
                    </td>
                    <td className="actions">
                      {r.who
                        ? <button className="cb-mini" onClick={() => setPick(r)}>Đổi người</button>
                        : <button className="cb-btn primary" style={{ padding: '5px 12px' }} onClick={() => setPick(r)}><Icon name="user" size={14} />Gán người</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {pick && (
        <Modal title={`${pick.who ? 'Đổi' : 'Gán'} người thu hộ · ${pick.id}`} onClose={() => setPick(null)}>
          <p className="cb-hint" style={{ marginTop: 0, marginBottom: 12 }}>Chọn người thu hộ từ danh mục đại diện thu cho <b>{pick.area}</b>:</p>
          <div className="cb-people">
            {COLLECTORS.map((p) => (
              <button key={p.id} className="cb-person" onClick={() => assign(p)}>
                <span className="avatar">{p.name.split(' ').slice(-1)[0][0]}</span>
                <span style={{ flex: 1 }}><span className="nm">{p.name}</span> <span className="cb-tag" style={{ marginLeft: 4 }}>{p.role}</span><div className="cb-sub">{p.id}</div></span>
                {pick.who?.id === p.id && <Icon name="check" size={16} />}
              </button>
            ))}
          </div>
        </Modal>
      )}
    </>
  )
}
