import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, Topbar, publishLabel } from './shell'

const STATS = [
  { k: 'Đối tượng', v: '15.240', sub: 'hộ · KD · cơ quan', link: 'Quản lý', to: '/cadre/objects' },
  { k: 'Đã phát hành', v: '15.240', sub: 'hóa đơn' },
  { k: 'Đã thu', v: '68%', bar: 68, link: 'Xem theo tuyến', to: '/cadre/routes' },
  { k: 'Quá hạn', v: '1.120', sub: 'đối tượng', warn: true, link: 'Xem 1.120 quá hạn', to: '/cadre/debts' },
]

const QUICK = [
  { icon: 'add', label: 'Thêm đối tượng', to: '/cadre/objects' },
  { icon: 'edit', label: 'Tạo/sửa hợp đồng', to: '/cadre/objects' },
  { icon: 'route', label: 'Gán tuyến', to: '/cadre/routes' },
  { icon: 'percent', label: 'Đề nghị miễn giảm', to: '/cadre/debts' },
]

const ROUTES = [
  { name: 'Tuyến 1 · TDP 3', pct: 82 },
  { name: 'Tuyến 2 · TDP 5', pct: 61 },
  { name: 'Tuyến 3 · CTV', pct: 47 },
]

export default function Overview() {
  const nav = useNavigate()
  const minPct = Math.min(...ROUTES.map((r) => r.pct))
  return (
    <>
      <Topbar
        title="Tổng quan"
        actions={<>
          <button className="cb-btn ghost"><Icon name="invoice" size={16} />Sinh đợt hóa đơn</button>
          <button className="cb-btn primary"><Icon name="add" size={16} />{publishLabel()}</button>
        </>}
      />

      <div className="cb-content">
        {/* 4 thẻ KPI */}
        <section className="cb-stats">
          {STATS.map((s) => (
            <div key={s.k} className={`cb-stat${s.warn ? ' warn' : ''}`}>
              <div className="k">{s.k}</div>
              <div className="v">{s.v}</div>
              {typeof s.bar === 'number'
                ? <div className="cb-bar"><span style={{ width: `${s.bar}%` }} /></div>
                : <div className="sub">{s.sub}</div>}
              {s.link && <button className="cb-arrow" onClick={() => s.to && nav(s.to)}>{s.link} ›</button>}
            </div>
          ))}
        </section>

        <div className="cb-grid">
          {/* ---- CỘT TRÁI ---- */}
          <div className="cb-col">
            <section className="cb-card">
              <div className="cb-card-head">
                <h2>Đợt thu hiện tại · T7/2026</h2>
                <span className="cb-status ok">Đã phát hành</span>
              </div>
              <p className="cb-line">Đã sinh <b>15.240</b> khoản từ hợp đồng · đúng biểu giá · đã auto-check</p>
              <p className="cb-note">Cấu hình: cán bộ tự phát hành đợt (có log). Bước lãnh đạo duyệt đang tắt.</p>
              <div className="cb-card-actions">
                <button className="cb-btn ghost" onClick={() => nav('/cadre/invoices')}><Icon name="invoice" size={15} />Xem danh sách hóa đơn</button>
                <button className="cb-btn warn" onClick={() => nav('/cadre/invoices')}><span className="cb-numbadge">2</span>Xử lý lỗi auto-check</button>
                <button className="cb-btn ghost" onClick={() => nav('/cadre/debts')}><Icon name="bell" size={15} />Nhắc nợ hàng loạt</button>
              </div>
            </section>

            <section className="cb-card">
              <div className="cb-card-head"><h2>Thao tác nhanh</h2></div>
              <div className="cb-quick">
                {QUICK.map((q) => (
                  <button key={q.label} className="cb-quick-btn" onClick={() => nav(q.to)}>
                    <Icon name={q.icon} size={18} /><span>{q.label}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* ---- CỘT PHẢI ---- */}
          <div className="cb-col">
            <section className="cb-card cb-routes">
              <div className="cb-card-head">
                <h2>Tiến độ theo tuyến</h2>
                <button className="cb-arrow" onClick={() => nav('/cadre/routes')}>Gán tuyến ›</button>
              </div>
              {ROUTES.map((r) => {
                const warn = r.pct === minPct
                return (
                  <div key={r.name} className="cb-route">
                    <div className="cb-route-top">
                      <span>{r.name}</span>
                      <span className="cb-route-right">
                        <b className={warn ? 'warn' : ''}>{r.pct}%</b>
                        <button className="cb-mini">Nhắc</button>
                      </span>
                    </div>
                    <div className="cb-bar"><span className={warn ? 'warn' : ''} style={{ width: `${r.pct}%` }} /></div>
                  </div>
                )
              })}
            </section>

            <section className="cb-card cb-todo">
              <div className="cb-card-head"><h2>Cần xử lý</h2></div>
              <div className="cb-todo-row"><span><b className="warn">2</b> lỗi auto-check</span><button className="cb-mini warn" onClick={() => nav('/cadre/invoices')}>Xử lý</button></div>
              <div className="cb-todo-row"><span><b>12</b> dòng treo</span><button className="cb-mini" onClick={() => nav('/cadre/invoices')}>Xử lý</button></div>
              <div className="cb-todo-row"><span><b>5</b> đề nghị chờ lãnh đạo</span><button className="cb-mini" onClick={() => nav('/cadre/debts')}>Xem</button></div>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}
