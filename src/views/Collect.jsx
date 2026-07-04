import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore, openReceivablesOf } from '../store'
import { Icon, LockedField, Banner, Modal, FakeQR, StatusBadge } from '../components/ui'
import { fmt, areaName, maskCccd, maskPhone, PAID_STATUSES, CASH_DEADLINE, CASH_DEADLINE_SHORT } from '../data'

export default function Collect() {
  const { hhId } = useParams()
  const nav = useNavigate()
  const { state, collectMatched, collectCashHold, markAbsent, toast } = useStore()
  const [modal, setModal] = useState(null) // 'qr' | 'cashhold' | 'absent'
  const [proxyOn, setProxyOn] = useState(false) // TH-13: người đóng thay
  const [payerName, setPayerName] = useState('')
  const [payerId, setPayerId] = useState('')

  const hh = state.households.find((h) => h.id === hhId)
  if (!hh) return <div className="empty">Không tìm thấy hộ.</div>

  const recs = state.receivables.filter((r) => r.householdId === hhId)
  const open = openReceivablesOf(state, hhId)
  const remaining = open.reduce((s, r) => s + (r.amountDue - r.amountPaid), 0)
  const allClosed = recs.length > 0 && open.length === 0
  const paidQr = recs.find((r) => r.status === 'paid_qr')
  const cashWait = recs.find((r) => r.status === 'cash_wait')
  const allPaid = allClosed && recs.every((r) => PAID_STATUSES.includes(r.status))
  const partial = recs.find((r) => r.status === 'partial')
  const absent = open.some((r) => r.status === 'absent')
  const mainRec = open[0] || recs[0]

  const payer = proxyOn ? { name: payerName, idOrPhone: payerId } : null
  const proxyInvalid = proxyOn && (!payerName.trim() || !payerId.trim())

  const doMatched = (method) => {
    const res = collectMatched(hhId, { method, payer })
    setModal(null)
    toast(`Tiền về khớp mã — hệ thống phát hành ${res.receiptIds.length} biên lai`, 'success')
    nav(`/success/${hhId}`)
  }
  const doCashHold = () => {
    collectCashHold(hhId, { payer })
    setModal(null)
    toast(`Đã ghi "đã thu tiền mặt, chờ nộp" ${fmt(remaining)} — nhớ nộp ${CASH_DEADLINE}`, 'info')
    nav(`/success/${hhId}`)
  }
  const doAbsent = () => {
    markAbsent(hhId)
    setModal(null)
    toast('Đã in giấy báo để lại cho hộ (demo máy in Bluetooth)', 'info')
  }

  return (
    <>
      <button className="btn tertiary sm" onClick={() => nav(-1)} style={{ marginBottom: 10 }}>
        <Icon name="back" size={15} /> Quay lại danh sách
      </button>

      {/* TH-11: chặn thu/ghi hai lần */}
      {allPaid && (
        <Banner tone="error" icon="warning">
          <b>Hộ đã nộp đủ — hệ thống chặn thu trùng.</b><br />
          {paidQr
            ? <>Tiền đã về qua chuyển khoản, <b>khớp mã tự động</b> lúc <b>{paidQr.paidAt}</b>, biên lai <b>{paidQr.paidRef}</b>.</>
            : <>Khoản đã đóng, biên lai <b>{recs.find((r) => r.paidRef)?.paidRef}</b>.</>}
          {' '}Không thể ghi thu thêm cho kỳ này.
        </Banner>
      )}
      {!allPaid && cashWait && allClosed && (
        <Banner tone="warning" icon="cash">
          <b>Bạn đã thu tiền mặt hộ này lúc {cashWait.cashAt} — đang chờ nộp.</b><br />
          Hệ thống chặn thu lại. Biên lai sẽ phát hành khi bạn <b>chuyển khoản nộp theo QR</b> và tiền về khớp mã.
          {' '}<a href="#/cashbag" onClick={(e) => { e.preventDefault(); nav('/cashbag') }}>Mở Túi tiền — chờ nộp</a>.
        </Banner>
      )}
      {!allClosed && partial && (
        <Banner tone="warning" icon="info">
          Hộ đã <b>nộp một phần {fmt(partial.amountPaid)}</b> qua chuyển khoản ({partial.paidAt}).
          Số còn lại <b>{fmt(partial.amountDue - partial.amountPaid)}</b> vẫn theo dõi công nợ và nhắc nợ.
        </Banner>
      )}
      {!allClosed && absent && (
        <Banner tone="warning" icon="doc">
          Đã để <b>giấy báo</b> khi hộ vắng nhà ({open.find((r) => r.noticeLeftAt)?.noticeLeftAt}). Có thể thu khi gặp lại hộ.
        </Banner>
      )}

      {/* TH-02: hộ · CCCD · SĐT · công nợ — mọi trường KHÓA, dữ liệu cá nhân che bớt */}
      <div className="card">
        <div className="card-title">
          <Icon name="user" />Thông tin hộ
          <span className="badge neutral" style={{ marginLeft: 'auto' }}><Icon name="lock" size={11} /> Trường khóa — chỉ xác nhận, không sửa</span>
        </div>
        <div className="form-grid">
          <LockedField label="Mã hộ" value={hh.id} mono />
          <LockedField label="Chủ hộ" value={hh.name} />
          <LockedField label="CCCD (che theo NĐ 13/2023)" value={maskCccd(hh.cccd)} mono />
          <LockedField label="Số điện thoại (che)" value={maskPhone(hh.phone)} mono />
          <div className="full"><LockedField label="Địa chỉ (địa giới mới)" value={`${hh.address} — ${areaName(hh.area)}`} /></div>
          <div className="full"><LockedField label="Địa chỉ cũ (trước sáp nhập)" value={hh.oldAddress} /></div>
        </div>
        {hh.exemption && (
          <Banner tone="success" icon="percent">
            Hộ thuộc diện <b>{hh.exemption.type}</b> — giảm <b>{hh.exemption.percent}%</b> (lãnh đạo đã duyệt).
            Số phải thu bên dưới đã trừ sẵn — người thu không tự điều chỉnh.
          </Banner>
        )}
      </div>

      {/* Công nợ chi tiết */}
      <div className="card">
        <div className="card-title"><Icon name="doc" />Các khoản phải thu</div>
        <div className="grid-wrap">
          <table className="grid">
            <thead>
              <tr><th>Mã khoản</th><th>Nội dung</th><th className="num">Phải thu</th><th className="num">Đã thu</th><th className="num">Còn lại</th><th>Trạng thái</th></tr>
            </thead>
            <tbody>
              {recs.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '0.78rem' }}>{r.id}</td>
                  <td>
                    {r.label}
                    {r.exemptionPercent && <div style={{ fontSize: '0.72rem', color: 'var(--lumo-success)' }}>Đã giảm {r.exemptionPercent}% (gốc {fmt(r.baseAmount)})</div>}
                  </td>
                  <td className="num">{fmt(r.amountDue)}</td>
                  <td className="num">{fmt(r.amountPaid)}</td>
                  <td className="num" style={{ fontWeight: 700 }}>{fmt(r.amountDue - r.amountPaid)}</td>
                  <td><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="kv" style={{ marginTop: 6, borderTop: '1px solid var(--lumo-shade-10)' }}>
          <span className="k" style={{ fontWeight: 700 }}>TỔNG CÒN PHẢI THU</span>
          <span className="v" style={{ fontSize: '1.25rem', color: allClosed ? 'var(--lumo-success)' : 'var(--lumo-primary)' }}>
            {allClosed ? (allPaid ? 'Đã nộp đủ ✓' : 'Đã thu — chờ nộp') : fmt(remaining)}
          </span>
        </div>
      </div>

      {/* HD-05: QR VietQR của khoản — luồng tiền vào duy nhất */}
      {!allClosed && mainRec && (
        <div className="card">
          <div className="card-title"><Icon name="qr" />QR VietQR của khoản — luồng tiền vào duy nhất</div>
          <div className="qr-block">
            <FakeQR value={mainRec.id} />
            <div className="qr-meta">
              <div>Mã định danh khoản thu (in trên thông báo gửi hộ):</div>
              <div className="code">{mainRec.id}</div>
              <div style={{ marginTop: 6 }}>
                Mọi khoản đều vào bằng <b>chuyển khoản theo mã</b>. Tiền về khớp sao kê tự động →
                hệ thống phát hành biên lai và <b>chặn thu trùng</b>. Không có phiếu thu tiền mặt riêng.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ghi nhận thu — 3 cách kích hoạt + vắng nhà */}
      {!allClosed && (
        <div className="card">
          <div className="card-title"><Icon name="cash" />Ghi nhận thu tại hộ</div>

          {/* TH-13: người đóng thay */}
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.85rem', marginBottom: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={proxyOn} onChange={(e) => setProxyOn(e.target.checked)} />
            Người nộp <b>không phải chủ hộ</b> — ghi người đóng thay để truy vết
          </label>
          {proxyOn && (
            <>
              <Banner tone="warning" icon="info">
                Vẫn chọn hóa đơn theo <b>mã của chủ hộ</b>. Nợ &amp; biên lai <b>vẫn thuộc hộ {hh.name}</b> — chỉ ghi thêm người đóng thay.
              </Banner>
              <div className="form-grid">
                <div className="field">
                  <label>Họ tên người đóng thay *</label>
                  <div className="control"><input value={payerName} onChange={(e) => setPayerName(e.target.value)} placeholder="VD: Nguyễn Thị B" /></div>
                </div>
                <div className="field">
                  <label>SĐT hoặc CCCD người đóng *</label>
                  <div className="control"><input value={payerId} onChange={(e) => setPayerId(e.target.value)} placeholder="VD: 09xxxxxxxx / 079xxxxxxxxx" /></div>
                </div>
              </div>
            </>
          )}

          <div className="actions-row">
            <button className="btn primary lg" disabled={proxyInvalid} onClick={() => setModal('qr')}>
              <Icon name="qr" /> Dân quét QR tại chỗ · {fmt(remaining)}
            </button>
            <button className="btn lg" disabled={proxyInvalid} onClick={() => setModal('cashhold')}>
              <Icon name="cash" /> Hộ đóng tiền mặt — giữ, nộp cuối ngày
            </button>
            <button className="btn neutral lg" onClick={() => setModal('absent')}>
              <Icon name="doc" /> Hộ vắng nhà — in giấy báo
            </button>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--lumo-shade-40)', marginTop: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
            <Icon name="lock" size={13} />
            Số tiền tự tính từ bảng giá &amp; công nợ — không nhập tay. Ưu tiên hộ tự quét QR để tiền vào thẳng hệ thống;
            nếu hộ trả tiền mặt thì người thu giữ và <b>nộp lại hệ thống trước {CASH_DEADLINE_SHORT}</b> (giống ví COD của shipper). Mọi thao tác ghi audit trail.
          </div>
        </div>
      )}
      {allClosed && (
        <div className="actions-row" style={{ marginBottom: 20 }}>
          {allPaid ? (
            <button className="btn neutral lg" onClick={() => nav(`/receipts/${recs.find((r) => r.paidRef)?.paidRef || ''}`)}>
              <Icon name="receipt" /> Xem biên lai đã phát hành
            </button>
          ) : (
            <button className="btn primary lg" onClick={() => nav('/cashbag')}>
              <Icon name="cash" /> Mở Túi tiền — nộp về tài khoản
            </button>
          )}
        </div>
      )}

      {/* TH-04: dân quét QR tại chỗ */}
      {modal === 'qr' && (
        <Modal title="Dân quét QR — chuyển khoản tại chỗ" onClose={() => setModal(null)}
          footer={<>
            <button className="btn neutral" onClick={() => setModal(null)}>Hủy</button>
            <button className="btn success" onClick={() => doMatched('qr_onsite')}><Icon name="check" /> Tiền đã về — xác nhận</button>
          </>}>
          <Banner tone="info" icon="qr">
            Đưa mã QR của hộ cho người nộp quét bằng app ngân hàng. Số tiền &amp; nội dung đã điền sẵn theo mã — <b>không sửa được</b>.
          </Banner>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}><FakeQR value={mainRec?.id || hh.id} /></div>
          <div className="kv"><span className="k">Hộ</span><span className="v">{hh.name} ({hh.id})</span></div>
          {open.map((r) => (
            <div className="kv" key={r.id}><span className="k">{r.label}</span><span className="v">{fmt(r.amountDue - r.amountPaid)}</span></div>
          ))}
          <div className="kv"><span className="k" style={{ fontWeight: 700 }}>Tổng chuyển</span>
            <span className="v" style={{ fontSize: '1.2rem', color: 'var(--lumo-primary)' }}>{fmt(remaining)}</span></div>
          <div style={{ fontSize: '0.76rem', color: 'var(--lumo-shade-60)', marginTop: 8 }}>
            Khi tiền về khớp mã trên sao kê, hệ thống <b>tự phát hành biên lai</b> — mỗi khoản một biên lai. (Demo: bấm xác nhận để giả lập tiền về.)
          </div>
        </Modal>
      )}

      {/* TH-06: hộ đóng tiền mặt → người thu giữ, nộp lại hệ thống cuối ngày */}
      {modal === 'cashhold' && (
        <Modal title="Hộ đóng tiền mặt — người thu giữ, nộp cuối ngày" onClose={() => setModal(null)}
          footer={<>
            <button className="btn neutral" onClick={() => setModal(null)}>Hủy</button>
            <button className="btn primary" onClick={doCashHold}><Icon name="check" /> Xác nhận hộ đã đóng {fmt(remaining)}</button>
          </>}>
          <Banner tone="warning" icon="warning">
            Hộ đã đưa tiền mặt cho bạn. Tiền vào <b>túi tiền của người thu</b> — giống ví COD của shipper:
            bạn <b>phải nộp lại hệ thống trước {CASH_DEADLINE}</b>.
            <b> Chưa phát hành biên lai</b> — biên lai chỉ phát khi bạn nộp tiền về và khớp mã.
          </Banner>
          <div className="kv"><span className="k">Hộ</span><span className="v">{hh.name} ({hh.id})</span></div>
          <div className="kv"><span className="k">Số tiền hộ đóng</span><span className="v" style={{ fontWeight: 700 }}>{fmt(remaining)}</span></div>
          <div className="kv"><span className="k">Hạn người thu nộp về</span><span className="v" style={{ color: 'var(--lumo-error, #d0342c)' }}>{CASH_DEADLINE}</span></div>
          <div style={{ fontSize: '0.76rem', color: 'var(--lumo-shade-60)', marginTop: 8 }}>
            Hệ thống đối soát <b>đã thu vs đã nộp</b> của bạn và cảnh báo kế toán/lãnh đạo nếu chênh lệch hoặc quá hạn (TH-06, BC-11).
          </div>
        </Modal>
      )}

      {/* TH-12: vắng nhà — in giấy báo */}
      {modal === 'absent' && (
        <Modal title="Hộ vắng nhà — in giấy báo" onClose={() => setModal(null)}
          footer={<>
            <button className="btn neutral" onClick={() => setModal(null)}>Hủy</button>
            <button className="btn primary" onClick={doAbsent}><Icon name="print" /> In giấy báo &amp; đánh dấu</button>
          </>}>
          <div style={{ fontSize: '0.88rem', lineHeight: 1.55 }}>
            Giấy báo in qua <b>máy in nhiệt Bluetooth</b> gồm: tên hộ, mã hộ, số tiền phải nộp,
            <b> mã QR để hộ tự chuyển khoản</b> và hạn nộp. Hộ được đưa vào nhóm
            «Cần lưu ý» để quay lại thu sau.
          </div>
        </Modal>
      )}
    </>
  )
}
