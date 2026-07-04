import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { Icon, Banner } from '../components/ui'
import { USERS, ORG_UNITS, AREAS, PRICE_BOOK, INTEGRATIONS, ROLES, CURRENT_PERIOD, fmt, areaName } from '../data'

const roleTone = { QT: 'neutral', CB: 'info', NTH: 'info', KT: 'warning', LD: 'success' }

export function AdminOverview() {
  const nav = useNavigate()
  return (
    <>
      <Banner tone="warning" icon="shield">
        Vai <b>Quản trị</b> chỉ nắm <b>quyền kỹ thuật</b> (cấu hình, phân quyền, tích hợp, nhật ký).
        <b> Không quyết định nghiệp vụ, không duyệt tiền</b> — kể cả sau khi bàn giao cho xã.
      </Banner>
      <div className="stat-grid">
        <div className="stat" style={{ cursor: 'pointer' }} onClick={() => nav('/users')}><div className="k">Người dùng</div><div className="v">{USERS.length}</div><div className="sub">{USERS.filter((u) => u.twoFA).length} bật 2FA</div></div>
        <div className="stat" style={{ cursor: 'pointer' }} onClick={() => nav('/areas')}><div className="k">Địa bàn</div><div className="v">{AREAS.length}</div><div className="sub">hợp nhất 3 xã cũ</div></div>
        <div className="stat" style={{ cursor: 'pointer' }} onClick={() => nav('/pricing')}><div className="k">Kỳ hiện hành</div><div className="v" style={{ fontSize: '1.05rem' }}>{CURRENT_PERIOD.name}</div><div className="sub">biểu giá QĐ 67/2025</div></div>
        <div className="stat" style={{ cursor: 'pointer' }} onClick={() => nav('/integrations')}><div className="k">Tích hợp</div><div className="v success">{INTEGRATIONS.filter((i) => i.status === 'connected').length}/{INTEGRATIONS.length}</div><div className="sub">đang kết nối</div></div>
      </div>
      <div className="card">
        <div className="card-title"><Icon name="settings" />Nhóm chức năng quản trị (QT-01…QT-10)</div>
        <div className="kv" style={{ cursor: 'pointer' }} onClick={() => nav('/users')}><span className="k">Người dùng & phân quyền (RBAC)</span><span className="v"><Icon name="chevron" size={15} /></span></div>
        <div className="kv" style={{ cursor: 'pointer' }} onClick={() => nav('/areas')}><span className="k">Địa bàn & ánh xạ địa giới cũ→mới</span><span className="v"><Icon name="chevron" size={15} /></span></div>
        <div className="kv" style={{ cursor: 'pointer' }} onClick={() => nav('/pricing')}><span className="k">Biểu giá theo thời kỳ (giữ lịch sử)</span><span className="v"><Icon name="chevron" size={15} /></span></div>
        <div className="kv" style={{ cursor: 'pointer' }} onClick={() => nav('/integrations')}><span className="k">Kết nối VietQR / HĐĐT / KBNN</span><span className="v"><Icon name="chevron" size={15} /></span></div>
        <div className="kv" style={{ cursor: 'pointer' }} onClick={() => nav('/audit')}><span className="k">Nhật ký & audit trail</span><span className="v"><Icon name="chevron" size={15} /></span></div>
      </div>
    </>
  )
}

export function AdminUsers() {
  const { toast } = useStore()
  return (
    <>
      <Banner tone="info" icon="lock">
        Phân quyền tối thiểu (RBAC) tới từng trang/chức năng. Mỗi vai chỉ thấy phần của mình;
        vai nhạy cảm (quản trị, lãnh đạo, kế toán) bắt buộc <b>2FA</b>.
      </Banner>
      <div className="toolbar"><div style={{ flex: 1 }} />
        <button className="btn primary" onClick={() => toast('Mở form tạo người dùng (demo)', 'info')}><Icon name="plus" /> Thêm người dùng</button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div className="grid-wrap">
          <table className="grid">
            <thead><tr><th>Mã</th><th>Họ tên</th><th>Tài khoản</th><th>Vai trò</th><th>2FA</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {USERS.map((u) => (
                <tr key={u.code}>
                  <td style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '0.78rem' }}>{u.code}</td>
                  <td>{u.name}</td>
                  <td style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '0.78rem' }}>{u.account}</td>
                  <td><span className={`badge ${roleTone[u.roleKey] || 'neutral'}`}>{u.roleLabel}</span></td>
                  <td>{u.twoFA ? <span className="badge success">Bật</span> : <span className="badge neutral">Tắt</span>}</td>
                  <td><span className="badge success">Hoạt động</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ fontSize: '0.74rem', color: 'var(--lumo-shade-40)', marginTop: 10 }}>
        Quản trị bàn giao dần cho CNTT/CĐS xã; thu hồi quyền ngay khi thay đổi nhân sự (mục 9).
      </div>
    </>
  )
}

export function AdminAreas() {
  return (
    <>
      <Banner tone="info" icon="map">
        Thiết kế <b>đa địa bàn</b>: một kho dùng chung, tách theo địa bàn để thí điểm rồi nhân rộng.
        Ánh xạ địa giới <b>cũ → mới</b> giữ để tra cứu lịch sử sau sáp nhập 01/7/2025.
      </Banner>
      <div className="card" style={{ padding: 0 }}>
        <div className="grid-wrap">
          <table className="grid">
            <thead><tr><th>Mã</th><th>Đơn vị cũ (H. Hóc Môn)</th><th>Địa bàn hiện nay</th></tr></thead>
            <tbody>
              {ORG_UNITS.map((o) => (
                <tr key={o.code}>
                  <td style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '0.78rem' }}>{o.code}</td>
                  <td>{o.old}</td>
                  <td>{o.now}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export function AdminPricing() {
  return (
    <>
      <Banner tone="info" icon="percent">
        Biểu giá theo <b>QĐ 67/2025/QĐ-UBND</b>, áp theo thời kỳ: kỳ mới dùng giá mới, kỳ cũ giữ giá cũ
        để đối soát lịch sử không sai (BG-03).
      </Banner>
      <div className="card" style={{ padding: 0 }}>
        <div className="grid-wrap">
          <table className="grid">
            <thead><tr><th>Kỳ hiệu lực</th><th>Nhóm</th><th className="num">Thu gom</th><th className="num">Vận chuyển</th><th>Xử lý</th><th className="num">Tạm tính/tháng</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {PRICE_BOOK.map((p) => (
                <tr key={p.id}>
                  <td>{p.period}</td>
                  <td style={{ fontSize: '0.82rem' }}>{p.group}</td>
                  <td className="num">{fmt(p.collect)}</td>
                  <td className="num">{fmt(p.transport)}</td>
                  <td style={{ fontSize: '0.8rem' }}>{p.treat}</td>
                  <td className="num" style={{ fontWeight: 700 }}>{fmt(p.monthly)}</td>
                  <td>{p.status === 'active' ? <span className="badge success">Đang áp dụng</span> : <span className="badge neutral">Lưu trữ</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ fontSize: '0.74rem', color: 'var(--lumo-shade-40)', marginTop: 10 }}>
        BG-04: chuẩn bị sẵn trường khối lượng/thể tích cho lộ trình “xả nhiều trả nhiều” khi triển khai phân loại rác tại nguồn.
      </div>
    </>
  )
}

export function AdminIntegrations() {
  const { toast } = useStore()
  return (
    <>
      <Banner tone="info" icon="link">
        Cấu hình kết nối bên ngoài (QT-06) và mẫu biên lai/HĐĐT & thông báo (QT-07).
      </Banner>
      {INTEGRATIONS.map((it) => (
        <div className="card" key={it.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 38, height: 38, borderRadius: 9, display: 'grid', placeItems: 'center', background: 'var(--lumo-primary-10, #eaf1fd)', color: 'var(--lumo-primary)' }}>
            <Icon name={it.status === 'connected' ? 'link' : 'clock'} size={18} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{it.name}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--lumo-shade-60)' }}>{it.detail}</div>
          </div>
          {it.status === 'connected'
            ? <span className="badge success">Đã kết nối</span>
            : <span className="badge neutral">Giai đoạn mở rộng</span>}
        </div>
      ))}
      <div className="actions-row" style={{ marginTop: 6 }}>
        <button className="btn neutral" onClick={() => toast('Gửi thử thông báo Zalo ZNS (demo)', 'info')}><Icon name="send" /> Test mẫu thông báo</button>
      </div>
    </>
  )
}

export function AdminAudit() {
  const { state } = useStore()
  return (
    <>
      <Banner tone="info" icon="doc">
        Nhật ký ghi <b>mọi thao tác động đến tiền &amp; dữ liệu nhạy cảm</b> (ai xem, sửa, thu, đề nghị, duyệt và thời điểm)
        để truy vết và thanh tra (QT-09).
      </Banner>
      <div className="card" style={{ padding: 0 }}>
        <div className="grid-wrap">
          <table className="grid">
            <thead><tr><th>Thời điểm</th><th>Người thực hiện</th><th>Vai trò</th><th>Hành động</th></tr></thead>
            <tbody>
              {state.auditLog.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{a.time}</td>
                  <td style={{ fontSize: '0.82rem' }}>{a.actor}</td>
                  <td><span className="badge neutral">{a.role}</span></td>
                  <td style={{ fontSize: '0.82rem' }}>{a.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
