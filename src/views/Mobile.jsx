import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation, useParams } from 'react-router-dom'
import { useStore } from '../store'
import { Icon, Toasts, FakeQR } from '../components/ui'
import { fmt, DRIVE, daysLeft, CURRENT_PERIOD, CLOSED_STATUSES } from '../data'

// ===== helpers =====
const recsOf = (state, id) => state.receivables.filter((r) => r.householdId === id && r.assignedTo === 'NTH-007')
function mstatus(state, id) {
  const recs = recsOf(state, id)
  if (!recs.length) return 'unpaid'
  if (recs.every((r) => r.status === 'exempt')) return 'exempt'
  if (recs.every((r) => CLOSED_STATUSES.includes(r.status))) return 'paid'
  return 'unpaid'
}
const amountOf = (state, id) => recsOf(state, id).reduce((s, r) => s + r.amountDue, 0)
const dueOf = (state, id) => recsOf(state, id).filter((r) => !CLOSED_STATUSES.includes(r.status)).reduce((s, r) => s + (r.amountDue - r.amountPaid), 0)
const assigned = (state) => {
  const ids = [...new Set(state.receivables.filter((r) => r.assignedTo === 'NTH-007').map((r) => r.householdId))]
  return ids.map((id) => state.households.find((h) => h.id === id)).filter(Boolean)
}
const MST = { unpaid: { label: 'Chưa thu', cls: 'red' }, paid: { label: 'Đã thu', cls: 'green' }, exempt: { label: 'Miễn/không thu', cls: 'gray' } }
const shortNo = (id) => id.slice(-3)
const addrShort = (hh) => hh.address.split(',')[0]

// ===== Khung điện thoại: app bar + bottom nav =====
const TABS = [
  { to: '/', icon: 'home', label: 'Trang chủ' },
  { to: '/list', icon: 'list', label: 'Danh sách' },
  { to: '/report', icon: 'chart', label: 'Báo cáo' },
  { to: '/profile', icon: 'user', label: 'Cá nhân' },
]
function appBarFor(path) {
  if (path === '/') return { title: 'Trang chủ', bell: true }
  if (path === '/list') return { title: 'Danh sách hộ', filter: true }
  if (path === '/report') return { title: 'Báo cáo nhanh' }
  if (path === '/profile') return { title: 'Cá nhân' }
  if (/^\/hh\/[^/]+\/collect/.test(path)) return { title: 'Thu tiền', back: true }
  if (/^\/hh\/[^/]+\/success/.test(path)) return { title: 'Kết quả thu', back: true }
  if (/^\/hh\/[^/]+\/note/.test(path)) return { title: 'Ghi chú', back: true }
  if (/^\/hh\//.test(path)) return { title: 'Chi tiết hộ', back: true }
  if (/^\/receipt\//.test(path)) return { title: 'Biên lai thu tiền', back: true }
  return { title: 'Người thu hộ' }
}

export default function MobileLayout() {
  const nav = useNavigate()
  const loc = useLocation()
  const ab = appBarFor(loc.pathname)
  const tabActive = (to) => (to === '/' ? loc.pathname === '/' : to === '/list' ? (loc.pathname.startsWith('/list') || loc.pathname.startsWith('/hh') || loc.pathname.startsWith('/receipt')) : loc.pathname.startsWith(to))
  return (
    <div className="mstage">
      <div className="mphone">
        <div className="mstatusbar"><span>9:41</span><span className="msb-ic">▪▪▪ ▂▃▅ ⌁</span></div>
        <div className="mtop">
          {ab.back
            ? <button className="mtop-ic" onClick={() => nav(-1)}><Icon name="back" size={20} /></button>
            : <span className="mtop-ic ghost" />}
          <div className="mtop-title">{ab.title}</div>
          {ab.bell ? <button className="mtop-ic" onClick={() => nav('/profile')}><Icon name="bell" size={19} /></button>
            : ab.filter ? <button className="mtop-ic"><Icon name="filter" size={19} /></button>
              : <span className="mtop-ic ghost" />}
        </div>
        <div className="mbody"><Outlet /></div>
        <nav className="mbottom">
          {TABS.map((t) => (
            <button key={t.to} className={tabActive(t.to) ? 'on' : ''} onClick={() => nav(t.to)}>
              <Icon name={t.icon} size={20} />
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
        <Toasts />
      </div>
    </div>
  )
}

// ===== 2. Trang chủ =====
export function MHome() {
  const { state } = useStore()
  const nav = useNavigate()
  const hhs = assigned(state)
  const c = { total: hhs.length, paid: 0, unpaid: 0, exempt: 0 }
  hhs.forEach((h) => { const s = mstatus(state, h.id); c[s]++ })
  return (
    <>
      <div className="mcard mgreet">
        <div className="mavatar">{state.user?.name?.split(' ').slice(-1)[0][0]}</div>
        <div>
          <div className="mgreet-hi">Xin chào, <b>{state.user?.name}</b></div>
          <div className="mgreet-sub">Tổ trưởng TDP · Tuyến 07 – Ấp 7</div>
        </div>
      </div>

      <div className="mcard mdrive">
        <div className="mdrive-k">Đợt thu hiện tại</div>
        <div className="mdrive-name">{DRIVE.name}</div>
        <div className="mdrive-row">
          <span>{DRIVE.from} – {DRIVE.to}</span>
          <span className="mdrive-left">Còn {daysLeft()} ngày</span>
        </div>
      </div>

      <div className="msec-title">Tổng quan danh sách</div>
      <div className="mcard mover">
        <div className="mover-row"><span className="mo-ic blue"><Icon name="users" size={16} /></span><span className="mo-l">Tổng số hộ được giao</span><b>{c.total}</b></div>
        <div className="mover-row"><span className="mo-ic red"><Icon name="clock" size={16} /></span><span className="mo-l">Chưa thu</span><b className="red">{c.unpaid}</b></div>
        <div className="mover-row"><span className="mo-ic green"><Icon name="checkCircle" size={16} /></span><span className="mo-l">Đã thu</span><b className="green">{c.paid}</b></div>
        <div className="mover-row"><span className="mo-ic gray"><Icon name="doc" size={16} /></span><span className="mo-l">Đã miễn/không thu</span><b>{c.exempt}</b></div>
      </div>

      <button className="mbtn primary block" onClick={() => nav('/list')}>Xem danh sách hộ</button>
    </>
  )
}

// ===== 3. Danh sách hộ =====
export function MList() {
  const { state } = useStore()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [tab, setTab] = useState('all')
  const [page, setPage] = useState(0)
  const PER = 20

  const all = assigned(state).map((hh, i) => ({ hh, i, st: mstatus(state, hh.id), amt: amountOf(state, hh.id) }))
  const counts = { all: all.length, unpaid: all.filter((x) => x.st === 'unpaid').length, paid: all.filter((x) => x.st === 'paid').length }
  const filtered = all
    .filter((x) => tab === 'all' || x.st === tab)
    .filter((x) => {
      const s = q.trim().toLowerCase()
      if (!s) return true
      return x.hh.name.toLowerCase().includes(s) || x.hh.id.toLowerCase().includes(s) || x.hh.address.toLowerCase().includes(s)
    })
  const pages = Math.max(1, Math.ceil(filtered.length / PER))
  const pg = Math.min(page, pages - 1)
  const rows = filtered.slice(pg * PER, pg * PER + PER)

  const TABS3 = [{ id: 'all', label: `Tất cả (${counts.all})` }, { id: 'unpaid', label: `Chưa thu (${counts.unpaid})` }, { id: 'paid', label: `Đã thu (${counts.paid})` }]

  return (
    <>
      <div className="msearch">
        <Icon name="search" size={17} />
        <input placeholder="Tìm kiếm (nhập tên chủ hộ, địa chỉ…)" value={q} onChange={(e) => { setQ(e.target.value); setPage(0) }} />
      </div>
      <div className="mtabs">
        {TABS3.map((t) => <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => { setTab(t.id); setPage(0) }}>{t.label}</button>)}
      </div>

      {rows.map(({ hh, i, st, amt }) => (
        <div key={hh.id} className="mrow" onClick={() => nav(`/hh/${hh.id}`)}>
          <div className="mrow-no">{String(i + 1).padStart(3, '0')}</div>
          <div className="mrow-mid">
            <div className="mrow-name">{hh.name}</div>
            <div className="mrow-addr">{addrShort(hh)}</div>
          </div>
          <div className="mrow-right">
            <div className="mrow-amt">{fmt(amt)}</div>
            <div className={`mst ${MST[st].cls}`}>{MST[st].label}</div>
          </div>
        </div>
      ))}
      {!rows.length && <div className="mempty">Không có hộ nào khớp.</div>}

      <div className="mpager">
        <span>{filtered.length ? pg * PER + 1 : 0} – {Math.min((pg + 1) * PER, filtered.length)} / {filtered.length}</span>
        <div>
          <button disabled={pg === 0} onClick={() => setPage(pg - 1)}><Icon name="back" size={16} /></button>
          <button disabled={pg >= pages - 1} onClick={() => setPage(pg + 1)}><Icon name="chevron" size={16} /></button>
        </div>
      </div>
    </>
  )
}

// ===== 4. Chi tiết hộ =====
export function MDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { state } = useStore()
  const hh = state.households.find((h) => h.id === id)
  if (!hh) return <div className="mempty">Không tìm thấy hộ.</div>
  const st = mstatus(state, id)
  const amt = amountOf(state, id)
  const receipts = state.receipts.filter((r) => r.householdId === id)

  return (
    <>
      <div className="mcard mhh">
        <div className="mhh-no">{shortNo(hh.id)}</div>
        <div style={{ flex: 1 }}>
          <div className="mhh-name">{hh.name}</div>
          <div className="mhh-addr">{addrShort(hh)}</div>
        </div>
        <a className="mhh-call" href={`tel:${hh.phone}`}><Icon name="phone" size={16} /></a>
      </div>

      <div className="msec-title">Thông tin phải thu</div>
      <div className="mcard">
        <div className="mkv"><span>Kỳ thu</span><b>{DRIVE.name}</b></div>
        <div className="mkv"><span>Đối tượng</span><b>Hộ gia đình</b></div>
        <div className="mkv"><span>Số nhân khẩu</span><b>{hh.members} người</b></div>
        <div className="mkv"><span>Định mức</span><b>Hộ {hh.members} nhân khẩu</b></div>
      </div>

      <div className={`mcard mamt ${st}`}>
        <span>Số tiền phải thu</span>
        <b>{fmt(st === 'exempt' ? 0 : amt)}</b>
      </div>
      {st === 'exempt' && <div className="mnote-inline gray">Hộ thuộc diện miễn/không thu — không phát sinh thu.</div>}

      <div className="msec-title">Lịch sử thu</div>
      <div className="mcard">
        {receipts.slice(0, 3).map((r) => (
          <div className="mkv" key={r.id}><span>{r.time}</span><b className="green">{fmt(r.amount)} · Đã thu ✓</b></div>
        ))}
        <div className="mkv"><span>05/2026</span><b className="green">{fmt(83000)} · Đã thu ✓</b></div>
        <div className="mkv"><span>04/2026</span><b className="green">{fmt(83000)} · Đã thu ✓</b></div>
      </div>

      {st === 'unpaid' ? (
        <div className="mrow-btns">
          <button className="mbtn ghost" onClick={() => nav(`/hh/${id}/note`)}>Ghi chú</button>
          <button className="mbtn primary" onClick={() => nav(`/hh/${id}/collect`)}>Thu tiền</button>
        </div>
      ) : st === 'paid' ? (
        <button className="mbtn primary block" onClick={() => { const r = receipts[0]; r ? nav(`/receipt/${r.id}`) : nav('/list') }}>Xem biên lai</button>
      ) : (
        <button className="mbtn ghost block" onClick={() => nav(`/hh/${id}/note`)}>Ghi chú tình trạng hộ</button>
      )}
    </>
  )
}

// ===== 5–6. Thu tiền: chọn phương thức + nhập tiền =====
export function MCollect() {
  const { id } = useParams()
  const nav = useNavigate()
  const { state, mobileCollect, toast } = useStore()
  const hh = state.households.find((h) => h.id === id)
  const amt = amountOf(state, id)
  const [method, setMethod] = useState('cash')
  const [received, setReceived] = useState('')
  const [refNo, setRefNo] = useState('')
  const [note, setNote] = useState('')
  if (!hh) return <div className="mempty">Không tìm thấy hộ.</div>

  const recv = Number(received.replace(/\D/g, '')) || 0
  const change = method === 'cash' && recv >= amt ? recv - amt : 0
  const canSubmit = method !== 'cash' ? (method !== 'transferred' || refNo.trim()) : recv >= amt

  const submit = () => {
    mobileCollect(id, { method, note, received: method === 'cash' ? recv : null })
    toast('Thu tiền thành công — đã phát hành biên lai', 'success')
    nav(`/hh/${id}/success`)
  }

  return (
    <>
      <div className="mkv2"><span>Hộ:</span><b>{hh.name} ({shortNo(hh.id)})</b></div>
      <div className={`mcard mamt ${'unpaid'}`}><span>Số tiền phải thu</span><b>{fmt(amt)}</b></div>

      <div className="msec-title">Chọn phương thức thu</div>
      <div className="mcard mpad0">
        <label className={`mradio ${method === 'cash' ? 'on' : ''}`}>
          <input type="radio" checked={method === 'cash'} onChange={() => setMethod('cash')} />
          <div><b>Tiền mặt</b></div>
        </label>
        <label className={`mradio ${method === 'transfer' ? 'on' : ''}`}>
          <input type="radio" checked={method === 'transfer'} onChange={() => setMethod('transfer')} />
          <div><b>Chuyển khoản</b><small>Khách quét QR chuyển khoản cho xã</small></div>
        </label>
        <label className={`mradio ${method === 'transferred' ? 'on' : ''}`}>
          <input type="radio" checked={method === 'transferred'} onChange={() => setMethod('transferred')} />
          <div><b>Đã chuyển khoản</b><small>Nhập mã giao dịch / số tham chiếu</small></div>
        </label>
      </div>

      {method === 'cash' && (
        <>
          <div className="mfield">
            <label>Số tiền nhận</label>
            <input inputMode="numeric" placeholder="Nhập số tiền khách đưa" value={received}
              onChange={(e) => setReceived(e.target.value)} />
          </div>
          <div className="mkv2"><span>Tiền thừa trả lại</span><b className="green">{fmt(change)}</b></div>
        </>
      )}
      {method === 'transfer' && (
        <div className="mcard" style={{ textAlign: 'center' }}>
          <FakeQR value={id} />
          <div className="mnote-inline">Đưa mã QR để khách quét chuyển khoản đúng số tiền &amp; mã.</div>
        </div>
      )}
      {method === 'transferred' && (
        <div className="mfield">
          <label>Mã giao dịch / Số tham chiếu</label>
          <input placeholder="VD: FT26xxxxxx" value={refNo} onChange={(e) => setRefNo(e.target.value)} />
        </div>
      )}

      <div className="mfield">
        <label>Ghi chú (nếu có)</label>
        <textarea placeholder="Nhập ghi chú…" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      <button className="mbtn primary block" disabled={!canSubmit} onClick={submit}>Xác nhận thu</button>
    </>
  )
}

// ===== 7. Kết quả thu =====
export function MSuccess() {
  const { id } = useParams()
  const nav = useNavigate()
  const { state } = useStore()
  const hh = state.households.find((h) => h.id === id)
  const last = state.lastCollection?.householdId === id ? state.lastCollection : null
  const methodLabel = { cash: 'Tiền mặt', transfer: 'Chuyển khoản', transferred: 'Đã chuyển khoản' }
  return (
    <div className="msuccess">
      <div className="mtick"><Icon name="check" size={34} /></div>
      <div className="ms-title">Thu tiền thành công!</div>
      <div className="ms-amt">{fmt(last?.amount || amountOf(state, id))}</div>
      <div className="mcard" style={{ width: '100%' }}>
        <div className="mkv"><span>Hộ</span><b>{hh?.name} ({shortNo(id)})</b></div>
        <div className="mkv"><span>Kỳ thu</span><b>{DRIVE.name}</b></div>
        <div className="mkv"><span>Phương thức</span><b>{methodLabel[last?.method] || 'Tiền mặt'}</b></div>
        <div className="mkv"><span>Người thu</span><b>{state.user?.name}</b></div>
        <div className="mkv"><span>Thời gian</span><b>{last?.time}</b></div>
        <div className="mkv"><span>Ghi chú</span><b>{last?.note || '–'}</b></div>
      </div>
      <div className="mrow-btns" style={{ width: '100%' }}>
        <button className="mbtn ghost" onClick={() => { const r = last?.receiptIds?.[0]; r ? nav(`/receipt/${r}`) : nav('/list') }}>Xem biên lai</button>
        <button className="mbtn primary" onClick={() => nav('/list')}>Quay về danh sách</button>
      </div>
    </div>
  )
}

// ===== 8. Biên lai điện tử =====
export function MReceipt() {
  const { id } = useParams()
  const { state, toast } = useStore()
  const r = state.receipts.find((x) => x.id === id)
  if (!r) return <div className="mempty">Không tìm thấy biên lai.</div>
  const hh = state.households.find((h) => h.id === r.householdId)
  const methodLabel = { transfer_deposit: 'Tiền mặt', qr_self: 'Chuyển khoản' }
  return (
    <>
      <div className="mreceipt">
        <div className="mr-org">UBND XÃ ĐÔNG THẠNH</div>
        <div className="mr-desc">Giá dịch vụ thu gom, vận chuyển,<br />xử lý chất thải rắn sinh hoạt</div>
        <div className="mr-title">BIÊN LAI THU TIỀN</div>
        <div className="mr-no">Số: {r.id.replace('BL-', 'BL')}</div>
        <div className="mr-line"><span>Họ tên chủ hộ</span><b>{hh?.name}</b></div>
        <div className="mr-line"><span>Địa chỉ</span><b>{hh?.address}</b></div>
        <div className="mr-line"><span>Kỳ thu</span><b>{DRIVE.name}</b></div>
        <div className="mr-line"><span>Số tiền</span><b>{fmt(r.amount)}</b></div>
        <div className="mr-inwords">(Số tiền bằng chữ theo quy định)</div>
        <div className="mr-line"><span>Phương thức</span><b>{methodLabel[r.method] || 'Tiền mặt'}</b></div>
        <div className="mr-line"><span>Người thu</span><b>{state.user?.name}</b></div>
        <div className="mr-line"><span>Thời gian</span><b>{r.time}</b></div>
        <div className="mr-foot">Biên lai điện tử – không cần ký · {r.einvoice}</div>
      </div>
      <div className="mr-actions">
        <button className="mbtn ghost" onClick={() => toast('Đã tải biên lai (demo)', 'success')}><Icon name="download" size={15} /> Tải về</button>
        <button className="mbtn ghost" onClick={() => toast('Đã gửi Zalo/SMS (demo)', 'success')}><Icon name="share" size={15} /> Chia sẻ</button>
        <button className="mbtn ghost" onClick={() => toast('Đang in máy in Bluetooth (demo)', 'info')}><Icon name="print" size={15} /> In</button>
      </div>
    </>
  )
}

// ===== 10. Báo cáo nhanh =====
export function MReport() {
  const { state } = useStore()
  const hhs = assigned(state)
  const c = { total: hhs.length, paid: 0, unpaid: 0, exempt: 0 }
  let sumTotal = 0, sumPaid = 0, sumDue = 0
  hhs.forEach((h) => {
    const s = mstatus(state, h.id); c[s]++
    sumTotal += amountOf(state, h.id)
    if (s === 'paid') sumPaid += amountOf(state, h.id)
    if (s === 'unpaid') sumDue += dueOf(state, h.id)
  })
  const pc = (n) => (c.total ? ((n / c.total) * 100).toFixed(1) : 0)
  return (
    <>
      <div className="mfield">
        <label>Đợt thu</label>
        <div className="mselect"><span>{DRIVE.name}</span><Icon name="chevronDown" size={16} /></div>
      </div>
      <div className="mrep-grid">
        <div className="mrep-card"><div className="mrc-k">Tổng số hộ được giao</div><div className="mrc-v">{c.total}</div><div className="mrc-p">100%</div></div>
        <div className="mrep-card green"><div className="mrc-k">Đã thu</div><div className="mrc-v">{c.paid}</div><div className="mrc-p">{pc(c.paid)}%</div></div>
        <div className="mrep-card red"><div className="mrc-k">Chưa thu</div><div className="mrc-v">{c.unpaid}</div><div className="mrc-p">{pc(c.unpaid)}%</div></div>
        <div className="mrep-card gray"><div className="mrc-k">Miễn/không thu</div><div className="mrc-v">{c.exempt}</div><div className="mrc-p">{pc(c.exempt)}%</div></div>
      </div>
      <div className="msec-title">Tổng số tiền</div>
      <div className="mcard">
        <div className="mkv"><span>Tổng số tiền</span><b>{fmt(sumTotal)}</b></div>
        <div className="mkv"><span>Đã thu</span><b className="green">{fmt(sumPaid)}</b></div>
        <div className="mkv"><span>Còn phải thu</span><b className="red">{fmt(sumDue)}</b></div>
      </div>
    </>
  )
}

// ===== 11. Ghi chú =====
export function MNote() {
  const { id } = useParams()
  const nav = useNavigate()
  const { state, addNote, toast } = useStore()
  const hh = state.households.find((h) => h.id === id)
  const [type, setType] = useState('Hộ vắng nhà')
  const [content, setContent] = useState('')
  const [dt, setDt] = useState('12/06/2026 09:30')
  if (!hh) return <div className="mempty">Không tìm thấy hộ.</div>
  const save = () => {
    addNote(id, { type, content, datetime: dt })
    toast('Đã lưu ghi chú', 'success')
    nav(`/hh/${id}`)
  }
  return (
    <>
      <div className="mkv2"><span>Hộ:</span><b>{hh.name} ({shortNo(hh.id)})</b></div>
      <div className="mfield">
        <label>Loại ghi chú</label>
        <div className="mselect-wrap">
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option>Hộ vắng nhà</option>
            <option>Hẹn thu lại</option>
            <option>Từ chối nộp</option>
            <option>Khác</option>
          </select>
        </div>
      </div>
      <div className="mfield">
        <label>Nội dung</label>
        <textarea placeholder="Đến 2 lần, hộ vắng nhà…" value={content} onChange={(e) => setContent(e.target.value)} />
      </div>
      <div className="mfield">
        <label>Ngày giờ</label>
        <div className="mselect"><span>{dt}</span><Icon name="calendar" size={16} /></div>
      </div>
      <button className="mbtn primary block" onClick={save}>Lưu ghi chú</button>
    </>
  )
}

// ===== Cá nhân =====
export function MProfile() {
  const { state, logout } = useStore()
  const nav = useNavigate()
  return (
    <>
      <div className="mcard mgreet">
        <div className="mavatar">{state.user?.name?.split(' ').slice(-1)[0][0]}</div>
        <div>
          <div className="mgreet-hi"><b>{state.user?.name}</b></div>
          <div className="mgreet-sub">{state.user?.code} · Tổ trưởng TDP – Ấp 7</div>
        </div>
      </div>

      <div className="mcard mperm">
        <div className="mperm-h"><Icon name="info" size={16} /> Người thu hộ chỉ được phép:</div>
        <ul>
          <li>Xem danh sách hộ được giao</li>
          <li>Ghi nhận đã thu, chọn phương thức và nhập thông tin thu</li>
          <li>Xem biên lai điện tử</li>
          <li>Ghi chú tình trạng hộ</li>
        </ul>
        <div className="mperm-warn">Không được sửa số liệu, không được xóa giao dịch.</div>
      </div>

      <button className="mbtn ghost block" onClick={() => { logout(); nav('/login') }}>Đổi vai / Đăng xuất</button>
      <div className="mver">Phiên bản 1.0.0</div>
    </>
  )
}
