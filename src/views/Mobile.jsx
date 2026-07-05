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
  { to: '/cashbag', icon: 'cash', label: 'Chờ nộp', badge: 'cash' },
  { to: '/report', icon: 'chart', label: 'Báo cáo' },
  { to: '/profile', icon: 'user', label: 'Cá nhân' },
]
function appBarFor(path) {
  if (path === '/') return { title: 'Trang chủ', bell: true }
  if (path === '/list') return { title: 'Danh sách hộ', filter: true }
  if (path === '/cashbag') return { title: 'Chờ nộp — tiền mặt' }
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
  const { state } = useStore()
  const cashCount = state.cashBag?.length || 0
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
        <nav className="mbottom mbottom5">
          {TABS.map((t) => (
            <button key={t.to} className={tabActive(t.to) ? 'on' : ''} onClick={() => nav(t.to)}>
              <span className="mtab-ic">
                <Icon name={t.icon} size={20} />
                {t.badge === 'cash' && cashCount > 0 && <span className="mtab-badge">{cashCount}</span>}
              </span>
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
  const bag = state.cashBag || []
  const bagTotal = bag.reduce((s, e) => s + e.amount, 0)
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

      {bag.length > 0 && (
        <button className="mcard mcashcta" onClick={() => nav('/cashbag')}>
          <span className="mcashcta-ic"><Icon name="cash" size={18} /></span>
          <span className="mcashcta-mid">
            <span className="mcashcta-t">Tiền mặt chờ nộp</span>
            <span className="mcashcta-s">{bag.length} hộ · nộp lại bằng QR</span>
          </span>
          <span className="mcashcta-r">
            <b>{fmt(bagTotal)}</b>
            <Icon name="chevron" size={16} />
          </span>
        </button>
      )}

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
  const isCashWait = st === 'paid' && recsOf(state, id).some((r) => r.status === 'cash_wait')

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
      ) : isCashWait ? (
        <>
          <div className="minfo">
            <Icon name="info" size={16} />
            <div>Hộ đã đóng <b>tiền mặt</b> — đang <b>chờ nộp</b>. Biên lai phát hành sau khi bạn nộp lại bằng QR ở tab <b>“Chờ nộp”</b>.</div>
          </div>
          <button className="mbtn primary block" onClick={() => nav('/cashbag')}>Đến tab Chờ nộp</button>
        </>
      ) : st === 'paid' ? (
        <button className="mbtn primary block" onClick={() => { const r = receipts[0]; r ? nav(`/receipt/${r.id}`) : nav('/list') }}>Xem biên lai</button>
      ) : (
        <button className="mbtn ghost block" onClick={() => nav(`/hh/${id}/note`)}>Ghi chú tình trạng hộ</button>
      )}
    </>
  )
}

// ===== 5–6. Thu tiền: chọn phương thức (tiền mặt chờ nộp / chuyển khoản QR) =====
export function MCollect() {
  const { id } = useParams()
  const nav = useNavigate()
  const { state, mobileCollect, toast } = useStore()
  const hh = state.households.find((h) => h.id === id)
  const amt = amountOf(state, id)
  const [method, setMethod] = useState('cash')
  const [note, setNote] = useState('')
  if (!hh) return <div className="mempty">Không tìm thấy hộ.</div>

  const submit = () => {
    mobileCollect(id, { method, note })
    if (method === 'cash') toast('Đã ghi nhận thu tiền mặt — chờ nộp', 'success')
    else toast('Thu tiền thành công — đã phát hành biên lai', 'success')
    nav(`/hh/${id}/success`)
  }

  return (
    <>
      <div className="mkv2"><span>Hộ:</span><b>{hh.name} ({shortNo(hh.id)})</b></div>
      <div className="mcard mamt unpaid"><span>Số tiền phải thu</span><b>{fmt(amt)}</b></div>

      <div className="msec-title">Chọn phương thức thu</div>
      <div className="mcard mpad0">
        <label className={`mradio ${method === 'cash' ? 'on' : ''}`}>
          <input type="radio" checked={method === 'cash'} onChange={() => setMethod('cash')} />
          <div><b>Tiền mặt</b><small>Hộ đưa tiền mặt — ghi nhận “chờ nộp”, cuối ngày nộp lại bằng QR</small></div>
        </label>
        <label className={`mradio ${method === 'transfer' ? 'on' : ''}`}>
          <input type="radio" checked={method === 'transfer'} onChange={() => setMethod('transfer')} />
          <div><b>Chuyển khoản</b><small>Khách quét QR chuyển khoản thẳng cho xã</small></div>
        </label>
      </div>

      {method === 'cash' ? (
        <div className="minfo">
          <Icon name="info" size={16} />
          <div>
            Không cần nhập số tiền — chỉ xác nhận hộ đã đóng đủ <b>{fmt(amt)}</b> tiền mặt.
            Trạng thái sẽ là <b>“Đã thu tiền mặt — chờ nộp”</b>. Cuối ngày (hoặc hết hạn đợt thu),
            bạn nộp lại bằng QR cho các hộ đã đóng tiền mặt — hệ thống chỉ nhận tiền qua chuyển khoản.
          </div>
        </div>
      ) : (
        <div className="mcard" style={{ textAlign: 'center' }}>
          <FakeQR value={id} />
          <div className="mnote-inline">Đưa mã QR để khách quét chuyển khoản đúng số tiền &amp; mã. Biên lai phát hành ngay khi khớp.</div>
        </div>
      )}

      <div className="mfield">
        <label>Ghi chú (nếu có)</label>
        <textarea placeholder="Nhập ghi chú…" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      <button className="mbtn primary block" onClick={submit}>
        {method === 'cash' ? 'Xác nhận đã thu tiền mặt' : 'Xác nhận thu'}
      </button>
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
  const isCash = last?.type === 'cash_wait' || last?.method === 'cash'

  if (isCash) {
    return (
      <div className="msuccess">
        <div className="mtick amber"><Icon name="cash" size={32} /></div>
        <div className="ms-title">Đã thu tiền mặt — chờ nộp</div>
        <div className="ms-amt">{fmt(last?.amount || amountOf(state, id))}</div>
        <div className="mcard" style={{ width: '100%' }}>
          <div className="mkv"><span>Hộ</span><b>{hh?.name} ({shortNo(id)})</b></div>
          <div className="mkv"><span>Kỳ thu</span><b>{DRIVE.name}</b></div>
          <div className="mkv"><span>Phương thức</span><b>Tiền mặt</b></div>
          <div className="mkv"><span>Trạng thái</span><b className="amber">Chờ nộp bằng QR</b></div>
          <div className="mkv"><span>Người thu</span><b>{state.user?.name}</b></div>
          <div className="mkv"><span>Thời gian</span><b>{last?.time}</b></div>
          <div className="mkv"><span>Ghi chú</span><b>{last?.note || '–'}</b></div>
        </div>
        <div className="minfo" style={{ width: '100%' }}>
          <Icon name="info" size={16} />
          <div>Biên lai sẽ phát hành sau khi bạn nộp tiền mặt bằng QR (cuối ngày / hết hạn đợt thu) — hệ thống chỉ nhận tiền qua chuyển khoản.</div>
        </div>
        <button className="mbtn primary block" onClick={() => nav('/list')}>Quay về danh sách</button>
      </div>
    )
  }

  return (
    <div className="msuccess">
      <div className="mtick"><Icon name="check" size={34} /></div>
      <div className="ms-title">Thu tiền thành công!</div>
      <div className="ms-amt">{fmt(last?.amount || amountOf(state, id))}</div>
      <div className="mcard" style={{ width: '100%' }}>
        <div className="mkv"><span>Hộ</span><b>{hh?.name} ({shortNo(id)})</b></div>
        <div className="mkv"><span>Kỳ thu</span><b>{DRIVE.name}</b></div>
        <div className="mkv"><span>Phương thức</span><b>Chuyển khoản</b></div>
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

// ===== 9. Chờ nộp — túi tiền mặt: chọn hộ → nộp 1 thể bằng QR =====
export function MCashBag() {
  const { state, depositCashBag, toast } = useStore()
  const nav = useNavigate()
  const bag = state.cashBag || []
  const [sel, setSel] = useState(() => new Set(bag.map((e) => e.id)))
  const [step, setStep] = useState('list') // list | qr | done
  const [result, setResult] = useState(null)

  const selEntries = bag.filter((e) => sel.has(e.id))
  const selTotal = selEntries.reduce((s, e) => s + e.amount, 0)
  const bagTotal = bag.reduce((s, e) => s + e.amount, 0)
  const allChecked = bag.length > 0 && sel.size === bag.length
  const hhName = (id) => state.households.find((h) => h.id === id)?.name || id
  const hhAddr = (id) => { const h = state.households.find((x) => x.id === id); return h ? addrShort(h) : '' }

  const toggle = (id) => setSel((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleAll = () => setSel(allChecked ? new Set() : new Set(bag.map((e) => e.id)))

  const confirmDeposit = () => {
    const ids = [...sel]
    const log = depositCashBag(ids)
    setResult(log)
    setStep('done')
    toast(`Đã nộp ${log?.count || ids.length} hộ — phát hành biên lai`, 'success')
  }

  // ---- Kết quả nộp ----
  if (step === 'done') {
    return (
      <div className="msuccess">
        <div className="mtick"><Icon name="check" size={34} /></div>
        <div className="ms-title">Nộp tiền mặt thành công!</div>
        <div className="ms-amt">{fmt(result?.total || 0)}</div>
        <div className="mcard" style={{ width: '100%' }}>
          <div className="mkv"><span>Số hộ đã nộp</span><b>{result?.count || 0} hộ</b></div>
          <div className="mkv"><span>Biên lai phát hành</span><b className="green">{result?.receiptIds?.length || 0}</b></div>
          <div className="mkv"><span>Phương thức</span><b>Chuyển khoản (QR)</b></div>
          <div className="mkv"><span>Thời gian</span><b>{result?.time}</b></div>
          <div className="mkv"><span>Còn chờ nộp</span><b className={bag.length ? 'amber' : ''}>{bag.length} hộ</b></div>
        </div>
        <button className="mbtn primary block" onClick={() => { if (bag.length) { setSel(new Set(bag.map((e) => e.id))); setStep('list') } else nav('/') }}>
          {bag.length ? 'Về danh sách chờ nộp' : 'Về trang chủ'}
        </button>
      </div>
    )
  }

  // ---- Bước quét QR để nộp ----
  if (step === 'qr') {
    return (
      <>
        <div className="mcard mamt unpaid"><span>Số tiền cần nộp</span><b>{fmt(selTotal)}</b></div>
        <div className="mnote-inline">{selEntries.length} hộ · nộp gộp một lần cho xã</div>
        <div className="mcard" style={{ textAlign: 'center' }}>
          <FakeQR value={`NOP-${state.user?.code}-${selEntries.length}`} />
          <div className="mnote-inline">Quét mã VietQR để chuyển khoản đúng <b>{fmt(selTotal)}</b> về tài khoản xã. Hệ thống khớp sao kê và phát hành biên lai cho từng hộ.</div>
        </div>
        <div className="minfo">
          <Icon name="info" size={16} />
          <div>Sau khi chuyển khoản thành công, bấm <b>“Tôi đã chuyển khoản”</b> để hệ thống ghi nhận và phát hành biên lai.</div>
        </div>
        <div className="mrow-btns">
          <button className="mbtn ghost" onClick={() => setStep('list')}>Quay lại</button>
          <button className="mbtn primary" onClick={confirmDeposit}>Tôi đã chuyển khoản</button>
        </div>
      </>
    )
  }

  // ---- Danh sách chờ nộp ----
  if (!bag.length) {
    return (
      <>
        <div className="mcb-empty">
          <div className="mcb-empty-ic"><Icon name="checkCircle" size={30} /></div>
          <div className="mcb-empty-t">Không có hộ nào chờ nộp</div>
          <div className="mcb-empty-s">Tiền mặt thu tại hộ sẽ hiện ở đây để bạn nộp lại bằng QR.</div>
        </div>
        <button className="mbtn ghost block" onClick={() => nav('/list')}>Xem danh sách hộ</button>
      </>
    )
  }

  return (
    <>
      <div className="mcb-head">
        <div>
          <div className="mcb-head-k">Tổng tiền mặt đang giữ</div>
          <div className="mcb-head-v">{fmt(bagTotal)}</div>
        </div>
        <div className="mcb-head-c">{bag.length} hộ</div>
      </div>

      <div className="mcb-selbar">
        <label className="mcb-check">
          <input type="checkbox" checked={allChecked} onChange={toggleAll} />
          <span>Chọn tất cả</span>
        </label>
        <span className="mcb-selinfo">Đã chọn <b>{sel.size}</b></span>
      </div>

      {bag.map((e) => (
        <label key={e.id} className={`mcb-row ${sel.has(e.id) ? 'on' : ''}`}>
          <input type="checkbox" checked={sel.has(e.id)} onChange={() => toggle(e.id)} />
          <div className="mcb-mid">
            <div className="mcb-name">{hhName(e.householdId)}</div>
            <div className="mcb-sub">{hhAddr(e.householdId)} · {e.collectedAt}</div>
            {e.note && <div className="mcb-note">Ghi chú: {e.note}</div>}
          </div>
          <div className="mcb-amt">{fmt(e.amount)}</div>
        </label>
      ))}

      <div className="mcb-foot">
        <div className="mcb-foot-l">
          <span>Nộp {sel.size} hộ đã chọn</span>
          <b>{fmt(selTotal)}</b>
        </div>
        <button className="mbtn primary block" disabled={!sel.size} onClick={() => setStep('qr')}>
          Nộp bằng QR
        </button>
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
