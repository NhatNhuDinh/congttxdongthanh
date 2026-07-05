import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { Icon, StatusBadge, LockedField, Banner, Modal, FakeQR } from '../components/ui'
import { AREAS, areaName, fmt, maskCccd, maskPhone, CURRENT_PERIOD, EXEMPT_TYPES, CLOSED_STATUSES } from '../data'

const openDebtOf = (state, hhId) => state.receivables
  .filter((r) => r.householdId === hhId && !CLOSED_STATUSES.includes(r.status))
  .reduce((s, r) => s + (r.amountDue - r.amountPaid), 0)

export function CadreOverview() {
  const { state } = useStore()
  const nav = useNavigate()
  const pendingBatches = state.batches.filter((b) => b.status === 'pending').length
  const pendingExempt = state.exemptions.filter((e) => e.status === 'pending').length
  const totalDebt = state.households.reduce((s, h) => s + openDebtOf(state, h.id), 0)
  return (
    <>
      <Banner tone="info" icon="doc">
        Cán bộ xã (Phòng Kinh tế): quản lý <b>danh mục hộ</b>, <b>sinh hóa đơn theo đợt</b>, tạo khoản thu lẻ và
        <b> lập đề nghị miễn giảm</b> trình lãnh đạo. Không đi thu tại hộ (việc của người thu hộ) và không đối soát tiền (việc của kế toán).
      </Banner>
      <div className="stat-grid">
        <div className="stat" style={{ cursor: 'pointer' }} onClick={() => nav('/households')}><div className="k">Hộ toàn xã</div><div className="v">{state.households.length}</div><div className="sub">3 địa bàn</div></div>
        <div className="stat" style={{ cursor: 'pointer' }} onClick={() => nav('/invoices')}><div className="k">Đợt chờ lãnh đạo ký</div><div className="v warning">{pendingBatches}</div><div className="sub">đã sinh khoản</div></div>
        <div className="stat" style={{ cursor: 'pointer' }} onClick={() => nav('/exemptions')}><div className="k">Miễn giảm chờ duyệt</div><div className="v warning">{pendingExempt}</div><div className="sub">đã trình lãnh đạo</div></div>
        <div className="stat" style={{ cursor: 'pointer' }} onClick={() => nav('/debts')}><div className="k">Công nợ toàn xã</div><div className="v primary" style={{ fontSize: '1.05rem' }}>{fmt(totalDebt)}</div><div className="sub">còn phải thu</div></div>
      </div>
      <div className="card">
        <div className="card-title"><Icon name="list" />Việc cần làm</div>
        <div className="kv" style={{ cursor: 'pointer' }} onClick={() => nav('/households')}><span className="k">Chống trùng hộ khi hợp nhất 3 xã (DM-04)</span><span className="v"><span className="badge warning">1 nghi trùng</span></span></div>
        <div className="kv" style={{ cursor: 'pointer' }} onClick={() => nav('/adhoc')}><span className="k">Hộ mới chưa có khoản thu → tạo khoản lẻ</span><span className="v"><Icon name="chevron" size={15} /></span></div>
        <div className="kv" style={{ cursor: 'pointer' }} onClick={() => nav('/invoices')}><span className="k">Đợt hóa đơn Quý 3 chờ ký duyệt</span><span className="v"><Icon name="chevron" size={15} /></span></div>
      </div>
    </>
  )
}

export function CadreHouseholds() {
  const { state } = useStore()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [area, setArea] = useState('all')
  const rows = state.households
    .filter((h) => area === 'all' || h.area === area)
    .filter((h) => {
      const s = q.trim().toLowerCase()
      if (!s) return true
      return h.name.toLowerCase().includes(s) || h.id.toLowerCase().includes(s)
        || h.address.toLowerCase().includes(s) || h.cccd.includes(s) || h.phone.replace(/\s/g, '').includes(s.replace(/\s/g, ''))
    })
  const CAP = 120
  const shown = rows.slice(0, CAP)
  return (
    <>
      <Banner tone="info" icon="search">
        Tra cứu <b>toàn bộ hộ trên địa bàn xã</b> ({state.households.length} hộ, DM-07) theo tên, mã hộ, CCCD, SĐT, địa chỉ.
        Cán bộ được xem toàn xã; người thu hộ thì chỉ thấy hộ trong tuyến của mình.
      </Banner>
      <div className="toolbar">
        <div className="search">
          <Icon name="search" size={16} />
          <input placeholder="Tên, mã hộ, CCCD, SĐT, địa chỉ…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
        </div>
        <div className="seg">
          <button className={area === 'all' ? 'on' : ''} onClick={() => setArea('all')}>Mọi địa bàn</button>
          {AREAS.map((a) => <button key={a.id} className={area === a.id ? 'on' : ''} onClick={() => setArea(a.id)}>{a.name}</button>)}
        </div>
      </div>
      <div style={{ fontSize: '0.76rem', color: 'var(--lumo-shade-60)', margin: '2px 2px 8px' }}>
        {rows.length > CAP ? <>Đang hiển thị <b>{CAP}</b> / {rows.length} hộ — thu hẹp tìm kiếm để xem tiếp.</> : <>{rows.length} hộ.</>}
      </div>
      {shown.map((hh) => {
        const debt = openDebtOf(state, hh.id)
        const hasAny = state.receivables.some((r) => r.householdId === hh.id)
        return (
          <div key={hh.id} className="hh-row" onClick={() => nav(`/households/${hh.id}`)}>
            <div className="avatar" style={{ background: hh.dupOf ? 'var(--lumo-error, #d0342c)' : 'var(--lumo-shade-40)' }}>{hh.name.split(' ').slice(-1)[0][0]}</div>
            <div className="info">
              <div className="name">{hh.name} {hh.isNew && <span className="badge info">hộ mới</span>} {hh.dupOf && <span className="badge error">nghi trùng</span>}</div>
              <div className="meta">{hh.id} · {hh.address} · {areaName(hh.area)}</div>
            </div>
            <div className="right">
              {!hasAny ? <span className="badge warning">chưa có khoản</span>
                : <div className={`amount ${debt === 0 ? 'zero' : ''}`}>{debt === 0 ? 'Hết nợ' : `Nợ ${fmt(debt)}`}</div>}
            </div>
          </div>
        )
      })}
      {!rows.length && <div className="empty"><Icon name="search" size={28} />Không tìm thấy hộ nào.</div>}
    </>
  )
}

export function CadreHouseholdDetail() {
  const { hhId } = useParams()
  const nav = useNavigate()
  const { state } = useStore()
  const hh = state.households.find((h) => h.id === hhId)
  if (!hh) return <div className="empty">Không tìm thấy hộ.</div>
  const recs = state.receivables.filter((r) => r.householdId === hhId)
  const receipts = state.receipts.filter((r) => r.householdId === hhId)
  const debt = openDebtOf(state, hhId)
  const dup = hh.dupOf && state.households.find((h) => h.id === hh.dupOf)
  return (
    <>
      <button className="btn tertiary sm" onClick={() => nav(-1)} style={{ marginBottom: 10 }}><Icon name="back" size={15} /> Quay lại</button>
      {dup && (
        <Banner tone="error" icon="warning">
          Bản ghi này <b>nghi trùng</b> với hộ <b>{dup.name} ({dup.id})</b> (cùng CCCD/địa chỉ, nguồn sổ giấy).
          Cán bộ xem xét <b>gộp hộ</b> để không kế thừa nợ hai lần (DM-04).
        </Banner>
      )}
      <div className="card">
        <div className="card-title"><Icon name="user" />Hồ sơ hộ</div>
        <div className="form-grid">
          <LockedField label="Mã hộ" value={hh.id} mono />
          <LockedField label="Chủ hộ" value={hh.name} />
          <LockedField label="CCCD (che)" value={maskCccd(hh.cccd)} mono />
          <LockedField label="Số điện thoại (che)" value={maskPhone(hh.phone)} mono />
          <LockedField label="Số nhân khẩu" value={`${hh.members} người`} />
          <LockedField label="Địa bàn" value={areaName(hh.area)} />
          <div className="full"><LockedField label="Địa chỉ (địa giới mới)" value={hh.address} /></div>
          <div className="full"><LockedField label="Địa chỉ cũ (trước sáp nhập)" value={hh.oldAddress} /></div>
        </div>
        {hh.exemption && <Banner tone="success" icon="percent">Diện <b>{hh.exemption.type}</b> — giảm {hh.exemption.percent}% (đã duyệt).</Banner>}
      </div>
      <div className="card">
        <div className="card-title"><Icon name="doc" />Công nợ ({recs.length} khoản{debt > 0 ? ` · còn ${fmt(debt)}` : ' · hết nợ'})</div>
        {!recs.length && (
          <Banner tone="warning" icon="warning">
            Hộ <b>chưa có khoản thu nào</b> — dùng <a href="#/adhoc" onClick={(e) => { e.preventDefault(); nav('/adhoc') }}>Tạo khoản thu lẻ</a>.
          </Banner>
        )}
        {recs.length > 0 && (
          <div className="grid-wrap">
            <table className="grid">
              <thead><tr><th>Mã khoản</th><th>Nội dung</th><th className="num">Còn lại</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {recs.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '0.78rem' }}>{r.id}{r.adhoc && <span className="badge info" style={{ marginLeft: 5 }}>lẻ</span>}</td>
                    <td style={{ fontSize: '0.82rem' }}>{r.label}</td>
                    <td className="num" style={{ fontWeight: 700 }}>{fmt(r.amountDue - r.amountPaid)}</td>
                    <td><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="card">
        <div className="card-title"><Icon name="receipt" />Lịch sử biên lai</div>
        {receipts.length === 0 && <div className="empty">Chưa có biên lai.</div>}
        {receipts.map((r) => (
          <div key={r.id} className="kv"><span className="k">{r.id} · {r.time}</span><span className="v">{fmt(r.amount)}</span></div>
        ))}
      </div>
    </>
  )
}

export function CadreInvoices() {
  const { state, toast } = useStore()
  return (
    <>
      <Banner tone="info" icon="doc">
        Sinh khoản phải thu <b>hàng loạt theo kỳ/địa bàn</b> từ hợp đồng (HD-01), xem &amp; duyệt trước khi phát hành (HD-02).
        Cả đợt cần <b>một cú ký duyệt của lãnh đạo</b> — không ký từng hóa đơn (mục 8.6).
      </Banner>
      <div className="toolbar"><div style={{ flex: 1 }} />
        <button className="btn primary" onClick={() => toast('Đã sinh khoản đợt mới — chờ lãnh đạo ký (demo)', 'success')}><Icon name="plus" /> Sinh khoản đợt mới</button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div className="grid-wrap">
          <table className="grid">
            <thead><tr><th>Mã đợt</th><th>Nội dung</th><th className="num">Số khoản</th><th className="num">Tổng tiền</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {state.batches.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '0.78rem' }}>{b.id}</td>
                  <td style={{ fontSize: '0.84rem' }}>{b.name}<div style={{ fontSize: '0.72rem', color: 'var(--lumo-shade-60)' }}>Lập bởi {b.createdBy} · {b.createdAt}</div></td>
                  <td className="num">{b.count}</td>
                  <td className="num" style={{ fontWeight: 700 }}>{fmt(b.total)}</td>
                  <td>{b.status === 'signed'
                    ? <span className="badge success">Đã ký duyệt</span>
                    : <span className="badge warning">Chờ lãnh đạo ký</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export function CadreAdhoc() {
  const { state, createAdhoc, toast } = useStore()
  const nav = useNavigate()
  const [hhId, setHhId] = useState('')
  const [created, setCreated] = useState(null)
  const candidates = state.households.filter((h) => !state.receivables.some((r) => r.householdId === h.id && r.period === CURRENT_PERIOD.id))
  const hh = state.households.find((h) => h.id === hhId)
  const base = CURRENT_PERIOD.monthlyRate * CURRENT_PERIOD.months
  const pct = hh?.exemption?.percent || 0
  const amount = Math.round(base * (100 - pct) / 100)

  const submit = () => {
    const rec = createAdhoc(hhId)
    setCreated(rec)
    toast(`Đã tạo khoản ${rec.id} và sinh mã QR`, 'success')
  }

  if (created) {
    const chh = state.households.find((h) => h.id === created.householdId)
    return (
      <>
        <Banner tone="success" icon="checkCircle">
          <b>Đã tạo khoản thu lẻ {created.id}</b> cho hộ {chh?.name} — gắn kỳ {CURRENT_PERIOD.name}, cờ «tạo lẻ» để audit.
          Khoản dùng <b>cùng bộ sinh mã trung tâm</b>, xuất hiện trong báo cáo ngang hàng khoản theo đợt.
        </Banner>
        <div className="card">
          <div className="card-title"><Icon name="qr" />Mã định danh & QR của khoản</div>
          <div className="qr-block">
            <FakeQR value={created.id} />
            <div className="qr-meta">
              <div className="code">{created.id}</div>
              <div style={{ marginTop: 6 }}>Số phải thu: <b>{fmt(created.amountDue)}</b></div>
              <div style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--lumo-shade-60)' }}>Khoản sẽ được lãnh đạo phân công cho người thu hộ theo tuyến.</div>
            </div>
          </div>
        </div>
        <div className="actions-row"><button className="btn neutral lg" onClick={() => setCreated(null)}>Tạo khoản khác</button></div>
      </>
    )
  }

  return (
    <>
      <Banner tone="info" icon="plus">
        Dùng cho <b>hộ mới / ngoài đợt</b> chưa được sinh khoản. Hộ phải có mã hộ trước; khoản lẻ lấy mã từ
        <b> cùng bộ sinh mã trung tâm</b>, gắn kỳ &amp; địa bàn hiện hành và tự liên kết công nợ cũ (HD-03).
      </Banner>
      <div className="card">
        <div className="card-title"><Icon name="plus" />Tạo khoản thu lẻ — {CURRENT_PERIOD.name}</div>
        <div className="field">
          <label>Chọn hộ (chưa có khoản trong kỳ) *</label>
          <div className="control">
            <select value={hhId} onChange={(e) => setHhId(e.target.value)}>
              <option value="">— Chọn hộ —</option>
              {candidates.map((h) => <option key={h.id} value={h.id}>{h.name} · {h.id} · {areaName(h.area)}</option>)}
            </select>
          </div>
        </div>
        {hh && (
          <>
            <div className="form-grid">
              <LockedField label="Địa bàn (theo hộ)" value={areaName(hh.area)} />
              <LockedField label="Kỳ thu (hiện hành)" value={CURRENT_PERIOD.name} />
              <LockedField label="Đơn giá QĐ 67/2025" value={`${fmt(CURRENT_PERIOD.monthlyRate)}/tháng × ${CURRENT_PERIOD.months}`} />
              <LockedField label="Số phải thu (tự tính)" value={pct ? `${fmt(amount)} (giảm ${pct}%)` : fmt(amount)} />
            </div>
            <button className="btn primary lg" onClick={submit}><Icon name="qr" /> Tạo khoản & sinh mã QR</button>
          </>
        )}
      </div>
    </>
  )
}

export function CadreExemptions() {
  const { state, createExemption, toast } = useStore()
  const [open, setOpen] = useState(false)
  const [hhId, setHhId] = useState('')
  const [type, setType] = useState(EXEMPT_TYPES[0])
  const [percent, setPercent] = useState(50)
  const [reason, setReason] = useState('')
  const ST = { pending: { label: 'Chờ lãnh đạo duyệt', tone: 'warning' }, approved: { label: 'Đã duyệt', tone: 'success' }, rejected: { label: 'Từ chối', tone: 'error' } }

  const submit = () => {
    createExemption({ householdId: hhId, type, percent: Number(percent), reason })
    setOpen(false); setHhId(''); setReason('')
    toast('Đã gửi đề nghị miễn giảm — chờ lãnh đạo duyệt', 'success')
  }
  return (
    <>
      <Banner tone="info" icon="percent">
        Cán bộ <b>chỉ lập đề nghị</b> kèm căn cứ; việc <b>duyệt thuộc thẩm quyền lãnh đạo</b> (quyết định về tiền bắt buộc lãnh đạo duyệt — CN-04).
      </Banner>
      <div className="toolbar"><div style={{ flex: 1 }} />
        <button className="btn primary" onClick={() => setOpen(true)}><Icon name="plus" /> Lập đề nghị mới</button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div className="grid-wrap">
          <table className="grid">
            <thead><tr><th>Mã</th><th>Hộ</th><th>Đối tượng</th><th className="num">Mức</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {state.exemptions.map((e) => {
                const hh = state.households.find((h) => h.id === e.householdId)
                const st = ST[e.status] || ST.pending
                return (
                  <tr key={e.id}>
                    <td style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '0.78rem' }}>{e.id}</td>
                    <td>{hh?.name}<div style={{ fontSize: '0.72rem', color: 'var(--lumo-shade-60)' }}>{e.householdId}</div></td>
                    <td style={{ fontSize: '0.84rem' }}>{e.type}<div style={{ fontSize: '0.72rem', color: 'var(--lumo-shade-60)', maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={e.reason}>{e.reason}</div></td>
                    <td className="num" style={{ fontWeight: 700 }}>{e.percent === 100 ? 'Miễn' : `Giảm ${e.percent}%`}</td>
                    <td><span className={`badge ${st.tone}`}>{st.label}</span>{e.decidedBy && <div style={{ fontSize: '0.7rem', color: 'var(--lumo-shade-60)', marginTop: 3 }}>{e.decidedBy} · {e.decidedAt}</div>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      {open && (
        <Modal title="Lập đề nghị miễn giảm" onClose={() => setOpen(false)}
          footer={<>
            <button className="btn neutral" onClick={() => setOpen(false)}>Hủy</button>
            <button className="btn primary" disabled={!hhId || !reason.trim()} onClick={submit}><Icon name="send" /> Gửi lãnh đạo duyệt</button>
          </>}>
          <div className="field">
            <label>Hộ đề nghị *</label>
            <div className="control">
              <select value={hhId} onChange={(e) => setHhId(e.target.value)}>
                <option value="">— Chọn hộ —</option>
                {state.households.map((h) => <option key={h.id} value={h.id}>{h.name} · {h.id}</option>)}
              </select>
            </div>
          </div>
          <div className="form-grid">
            <div className="field"><label>Đối tượng *</label><div className="control"><select value={type} onChange={(e) => setType(e.target.value)}>{EXEMPT_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div></div>
            <div className="field"><label>Mức đề nghị *</label><div className="control"><select value={percent} onChange={(e) => setPercent(e.target.value)}><option value={50}>Giảm 50%</option><option value={100}>Miễn 100%</option></select></div></div>
          </div>
          <div className="field">
            <label>Căn cứ / lý do *</label>
            <div className="control"><textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="VD: Hộ cận nghèo 2026 theo QĐ số…; có xác nhận của trưởng ấp…" /></div>
          </div>
        </Modal>
      )}
    </>
  )
}

export function CadreDebts() {
  const { state } = useStore()
  const nav = useNavigate()
  const rows = state.households
    .map((h) => ({ hh: h, debt: openDebtOf(state, h.id) }))
    .filter((x) => x.debt > 0)
    .sort((a, b) => b.debt - a.debt)
  const total = rows.reduce((s, r) => s + r.debt, 0)
  return (
    <>
      <Banner tone="info" icon="list">
        Theo dõi công nợ theo hộ/địa bàn/kỳ (CN-01) và tuổi nợ. Nhắc nợ quá hạn do hệ thống/kế toán thực hiện (CN-05).
      </Banner>
      <div className="stat-grid">
        <div className="stat"><div className="k">Hộ còn nợ</div><div className="v warning">{rows.length}</div><div className="sub">toàn xã</div></div>
        <div className="stat"><div className="k">Tổng công nợ</div><div className="v primary" style={{ fontSize: '1.05rem' }}>{fmt(total)}</div><div className="sub">còn phải thu</div></div>
        <div className="stat"><div className="k">Có nợ kế thừa</div><div className="v">{state.receivables.filter((r) => r.kind === 'legacy' && !CLOSED_STATUSES.includes(r.status)).length}</div><div className="sub">từ xã cũ (CN-03)</div></div>
        <div className="stat"><div className="k">Nộp một phần</div><div className="v">{state.receivables.filter((r) => r.status === 'partial').length}</div><div className="sub">CN-02</div></div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div className="grid-wrap">
          <table className="grid">
            <thead><tr><th>Hộ</th><th>Địa bàn</th><th className="num">Còn nợ</th><th>Ghi chú</th></tr></thead>
            <tbody>
              {rows.slice(0, 120).map(({ hh, debt }) => {
                const legacy = state.receivables.some((r) => r.householdId === hh.id && r.kind === 'legacy' && !CLOSED_STATUSES.includes(r.status))
                const partial = state.receivables.some((r) => r.householdId === hh.id && r.status === 'partial')
                return (
                  <tr key={hh.id} className="row" onClick={() => nav(`/households/${hh.id}`)}>
                    <td>{hh.name}<div style={{ fontSize: '0.72rem', color: 'var(--lumo-shade-60)' }}>{hh.id}</div></td>
                    <td>{areaName(hh.area)}</td>
                    <td className="num" style={{ fontWeight: 700 }}>{fmt(debt)}</td>
                    <td>{legacy && <span className="badge warning">nợ kế thừa</span>} {partial && <span className="badge warning">nộp một phần</span>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
