import React, { createContext, useContext, useState, useCallback } from 'react'
import {
  HOUSEHOLDS, RECEIVABLES, RECEIPTS, CASH_BAG, BANK_LINES, EXEMPTIONS, BATCHES, AUDIT_LOG, SEQ,
  ROLES, CURRENT_PERIOD, CASH_DEADLINE, PAID_STATUSES, CLOSED_STATUSES, overdueDays,
} from './data'

const KEY = 'dt-multirole-demo-v1'

function buildInitial() {
  return {
    user: null,               // { roleKey, code, name, roleLabel }
    households: HOUSEHOLDS,
    receivables: RECEIVABLES,
    receipts: RECEIPTS,
    cashBag: CASH_BAG,
    depositedLog: [],
    bankLines: BANK_LINES,
    exemptions: EXEMPTIONS,
    batches: BATCHES,
    auditLog: AUDIT_LOG,
    notes: [],
    receiptSeq: SEQ.receipt,
    cashSeq: SEQ.cash,
    adhocSeq: SEQ.adhoc,
    exemptSeq: SEQ.exempt,
    auditSeq: SEQ.audit,
    lastCollection: null,
  }
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) { /* dữ liệu hỏng → khởi tạo lại */ }
  return buildInitial()
}

const StoreCtx = createContext(null)
const ToastCtx = createContext(null)

function nowStr() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())} ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(load)
  const [toasts, setToasts] = useState([])

  const persist = useCallback((next) => {
    setState(next)
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch (e) { /* bỏ qua khi storage đầy */ }
  }, [])

  const toast = useCallback((msg, tone = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, msg, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }, [])

  // Ghi nhật ký audit
  const logAction = (s, action) => {
    const entry = { id: s.auditSeq + 1, time: nowStr(), actor: `${s.user?.code} ${s.user?.name}`, role: s.user?.roleLabel, action }
    return { auditLog: [entry, ...s.auditLog], auditSeq: s.auditSeq + 1 }
  }

  const login = (roleKey) => {
    const r = ROLES[roleKey]
    persist({ ...state, user: { roleKey, code: r.code, name: r.name, roleLabel: r.roleLabel } })
  }
  const logout = () => persist({ ...state, user: null })
  const resetDemo = () => {
    const fresh = buildInitial()
    fresh.user = state.user
    persist(fresh)
    toast('Đã khôi phục dữ liệu demo ban đầu', 'info')
  }

  // ===== NGƯỜI THU HỘ (NTH) =====
  const collectMatched = (householdId, { method, payer } = {}) => {
    const time = nowStr()
    let seq = state.receiptSeq
    const newReceipts = []
    const status = method === 'qr_onsite' ? 'paid_qr' : 'paid_transfer'
    const receivables = state.receivables.map((r) => {
      const open = r.householdId === householdId && !CLOSED_STATUSES.includes(r.status)
      if (!open) return r
      const remaining = r.amountDue - r.amountPaid
      const rid = `BL-${String(++seq).padStart(6, '0')}`
      newReceipts.push({
        id: rid, receivableId: r.id, householdId, amount: remaining, method, payer: payer || null,
        collectedBy: `Hệ thống — khớp sao kê theo mã (ghi nhận: ${state.user?.code})`,
        time, einvoice: `HĐĐT 1C26TDT-${String(seq).padStart(8, '0')}`, partial: false,
      })
      return { ...r, amountPaid: r.amountDue, status, paidAt: time, paidRef: rid, payer: payer || null }
    })
    const amount = newReceipts.reduce((s, x) => s + x.amount, 0)
    const lastCollection = { householdId, type: 'receipts', receiptIds: newReceipts.map((x) => x.id), amount, time, payer: payer || null }
    persist({ ...state, receivables, receipts: [...newReceipts, ...state.receipts], receiptSeq: seq, lastCollection,
      ...logAction(state, `Hộ ${householdId} quét QR tại chỗ — tiền khớp mã, phát hành ${newReceipts.length} biên lai`) })
    return lastCollection
  }

  const collectCashHold = (householdId, { payer } = {}) => {
    const time = nowStr()
    const ids = []
    let amount = 0
    const receivables = state.receivables.map((r) => {
      const open = r.householdId === householdId && !CLOSED_STATUSES.includes(r.status)
      if (!open) return r
      ids.push(r.id); amount += r.amountDue - r.amountPaid
      return { ...r, status: 'cash_wait', cashAt: time, payer: payer || null }
    })
    const entry = { id: `TM-${String(state.cashSeq + 1).padStart(4, '0')}`, householdId, receivableIds: ids, amount, collectedAt: time, deadline: CASH_DEADLINE, payer: payer || null }
    const lastCollection = { householdId, type: 'cash_wait', receiptIds: [], amount, time, payer: payer || null }
    persist({ ...state, receivables, cashBag: [...state.cashBag, entry], cashSeq: state.cashSeq + 1, lastCollection,
      ...logAction(state, `Hộ ${householdId} đóng tiền mặt ${amount.toLocaleString('vi-VN')}đ — chờ nộp`) })
    return lastCollection
  }

  const depositCashBag = () => {
    const time = nowStr()
    let seq = state.receiptSeq
    const newReceipts = []
    const allIds = state.cashBag.flatMap((e) => e.receivableIds)
    const payerByRec = {}
    state.cashBag.forEach((e) => e.receivableIds.forEach((id) => { payerByRec[id] = e.payer || null }))
    const receivables = state.receivables.map((r) => {
      if (!allIds.includes(r.id)) return r
      const remaining = r.amountDue - r.amountPaid
      const rid = `BL-${String(++seq).padStart(6, '0')}`
      newReceipts.push({
        id: rid, receivableId: r.id, householdId: r.householdId, amount: remaining, method: 'transfer_deposit', payer: payerByRec[r.id],
        collectedBy: `Hệ thống — khớp sao kê theo mã (nộp bởi: ${state.user?.code})`,
        time, einvoice: `HĐĐT 1C26TDT-${String(seq).padStart(8, '0')}`, partial: false,
      })
      return { ...r, amountPaid: r.amountDue, status: 'paid_transfer', paidAt: time, paidRef: rid }
    })
    const total = state.cashBag.reduce((s, e) => s + e.amount, 0)
    const log = { time, total, entries: state.cashBag, receiptIds: newReceipts.map((x) => x.id) }
    persist({ ...state, receivables, receipts: [...newReceipts, ...state.receipts], receiptSeq: seq, cashBag: [], depositedLog: [log, ...state.depositedLog],
      ...logAction(state, `Nộp túi tiền mặt ${total.toLocaleString('vi-VN')}đ — phát hành ${newReceipts.length} biên lai`) })
    return log
  }

  const markAbsent = (householdId) => {
    const receivables = state.receivables.map((r) =>
      r.householdId === householdId && r.status === 'pending' ? { ...r, status: 'absent', noticeLeftAt: nowStr() } : r)
    persist({ ...state, receivables, ...logAction(state, `In giấy báo vắng nhà cho hộ ${householdId}`) })
  }

  // ==== APP MOBILE ====
  // method: 'cash' (đóng tiền mặt — chờ nộp) | 'transfer' (khách quét QR chuyển khoản cho xã)
  const mobileCollect = (householdId, { method, note } = {}) => {
    const time = nowStr()

    // TIỀN MẶT: không phát hành biên lai ngay. Hộ đã đưa đủ tiền → ghi nhận "đã thu tiền mặt — chờ nộp"
    // và cho vào túi tiền. Cuối ngày / hết hạn đợt thu, người thu hộ tự nộp lại bằng QR (depositCashBag)
    // vì hệ thống chỉ nhận tiền qua chuyển khoản. Biên lai phát hành khi nộp.
    if (method === 'cash') {
      const ids = []
      let amount = 0
      const receivables = state.receivables.map((r) => {
        const open = r.householdId === householdId && !CLOSED_STATUSES.includes(r.status)
        if (!open) return r
        ids.push(r.id); amount += r.amountDue - r.amountPaid
        return { ...r, status: 'cash_wait', cashAt: time, note: note || null }
      })
      const entry = { id: `TM-${String(state.cashSeq + 1).padStart(4, '0')}`, householdId, receivableIds: ids, amount, collectedAt: time, deadline: CASH_DEADLINE, note: note || null, payer: state.user?.name }
      const lastCollection = { householdId, type: 'cash_wait', receiptIds: [], amount, time, method: 'cash', note: note || null, deadline: CASH_DEADLINE }
      persist({ ...state, receivables, cashBag: [...state.cashBag, entry], cashSeq: state.cashSeq + 1, lastCollection,
        ...logAction(state, `Hộ ${householdId} đóng tiền mặt ${amount.toLocaleString('vi-VN')}đ — chờ nộp`) })
      return lastCollection
    }

    // CHUYỂN KHOẢN: khách quét QR chuyển thẳng cho xã → hệ thống khớp mã, phát hành biên lai ngay.
    let seq = state.receiptSeq
    const newReceipts = []
    let amount = 0
    const receivables = state.receivables.map((r) => {
      const open = r.householdId === householdId && !CLOSED_STATUSES.includes(r.status)
      if (!open) return r
      const remaining = r.amountDue - r.amountPaid
      amount += remaining
      const rid = `BL-${String(++seq).padStart(6, '0')}`
      newReceipts.push({
        id: rid, receivableId: r.id, householdId, amount: remaining,
        method: 'qr_self', note: note || null,
        collectedBy: `${state.user?.code} — ${state.user?.name}`,
        time, einvoice: `HĐĐT 1C26TDT-${String(seq).padStart(8, '0')}`,
      })
      return { ...r, amountPaid: r.amountDue, status: 'paid_qr', paidAt: time, paidRef: rid, payMethod: 'transfer' }
    })
    const lastCollection = { householdId, type: 'receipt', receiptIds: newReceipts.map((x) => x.id), amount, time, method: 'transfer', note: note || null }
    persist({ ...state, receivables, receipts: [...newReceipts, ...state.receipts], receiptSeq: seq, lastCollection,
      ...logAction(state, `Thu tiền hộ ${householdId} — ${amount.toLocaleString('vi-VN')}đ (chuyển khoản QR)`) })
    return lastCollection
  }

  const addNote = (householdId, { type, content, datetime }) => {
    const entry = { id: `GC-${state.notes.length + 1}`, householdId, type, content, datetime, by: state.user?.code }
    // Hộ vắng nhà → đánh dấu absent
    const receivables = type === 'Hộ vắng nhà'
      ? state.receivables.map((r) => (r.householdId === householdId && r.status === 'pending' ? { ...r, status: 'absent', noticeLeftAt: datetime } : r))
      : state.receivables
    persist({ ...state, notes: [entry, ...state.notes], receivables, ...logAction(state, `Ghi chú hộ ${householdId}: ${type}`) })
    return entry
  }

  // Nhắc nợ: gửi lại QR qua Zalo/SMS cho hộ quá hạn (tăng số lần đã gửi)
  const sendReminder = (householdId) => {
    const day = nowStr().split(' ')[1]
    const receivables = state.receivables.map((r) =>
      r.householdId === householdId && !CLOSED_STATUSES.includes(r.status)
        ? { ...r, remindersSent: (r.remindersSent || 0) + 1, lastReminderAt: day } : r)
    persist({ ...state, receivables, ...logAction(state, `Nhắc nợ — gửi lại QR (Zalo/SMS) cho hộ ${householdId}`) })
  }

  // ===== CÁN BỘ XÃ (CB) =====
  const createAdhoc = (householdId) => {
    const hh = state.households.find((h) => h.id === householdId)
    const seq = state.adhocSeq + 1
    const base = CURRENT_PERIOD.monthlyRate * CURRENT_PERIOD.months
    const pct = hh?.exemption?.percent || 0
    const rec = {
      id: `KT-${CURRENT_PERIOD.id}-${hh.area}-${String(seq).padStart(4, '0')}`,
      householdId, period: CURRENT_PERIOD.id, kind: 'current',
      label: `Giá DV thu gom, vận chuyển CTRSH — ${CURRENT_PERIOD.name}`,
      baseAmount: base, exemptionPercent: pct || undefined,
      amountDue: Math.round(base * (100 - pct) / 100), amountPaid: 0,
      status: 'pending', assignedTo: null, adhoc: true, createdAt: nowStr(),
    }
    persist({ ...state, receivables: [...state.receivables, rec], adhocSeq: seq,
      ...logAction(state, `Tạo khoản thu lẻ ${rec.id} cho hộ ${householdId} (cờ «tạo lẻ»)`) })
    return rec
  }

  const createExemption = ({ householdId, type, percent, reason }) => {
    const seq = state.exemptSeq + 1
    const ex = { id: `MG-2026-${String(seq).padStart(3, '0')}`, householdId, type, percent, reason, status: 'pending', createdBy: state.user?.code, createdAt: nowStr() }
    persist({ ...state, exemptions: [ex, ...state.exemptions], exemptSeq: seq,
      ...logAction(state, `Lập đề nghị miễn giảm ${ex.id} (hộ ${householdId}, ${percent === 100 ? 'miễn' : 'giảm ' + percent + '%'})`) })
    return ex
  }

  // ===== KẾ TOÁN (KT) =====
  // Khớp một dòng sao kê chờ khớp → phát hành biên lai cho khoản tương ứng
  const matchBankLine = (lineId) => {
    const line = state.bankLines.find((l) => l.id === lineId)
    if (!line || line.status !== 'pending_match') return null
    const time = nowStr()
    let seq = state.receiptSeq
    let receiptId = null
    const receivables = state.receivables.map((r) => {
      if (r.id !== line.matchCode || CLOSED_STATUSES.includes(r.status)) return r
      receiptId = `BL-${String(++seq).padStart(6, '0')}`
      return { ...r, amountPaid: r.amountDue, status: 'paid_qr', paidAt: time, paidRef: receiptId }
    })
    if (!receiptId) return null
    const rec = state.receivables.find((r) => r.id === line.matchCode)
    const newReceipt = { id: receiptId, receivableId: rec.id, householdId: rec.householdId, amount: rec.amountDue - rec.amountPaid, method: 'qr_self', collectedBy: 'Hệ thống — khớp sao kê (KT xác nhận)', time, einvoice: `HĐĐT 1C26TDT-${String(seq).padStart(8, '0')}` }
    const bankLines = state.bankLines.map((l) => l.id === lineId ? { ...l, status: 'matched', receiptId } : l)
    persist({ ...state, receivables, bankLines, receipts: [newReceipt, ...state.receipts], receiptSeq: seq,
      ...logAction(state, `Khớp sao kê ${lineId} → phát hành biên lai ${receiptId}`) })
    return newReceipt
  }

  // Xử lý dòng treo (TH-08): gán tay / hoàn / xác minh
  const resolveSuspense = (lineId, action) => {
    const map = { refund: 'Hoàn — chuyển nhầm', verify: 'Đang xác minh', assign: 'Đã gán tay vào khoản' }
    const bankLines = state.bankLines.map((l) => l.id === lineId ? { ...l, status: 'resolved', resolution: map[action] || action } : l)
    persist({ ...state, bankLines, ...logAction(state, `Xử lý dòng treo ${lineId}: ${map[action] || action}`) })
  }

  // ===== LÃNH ĐẠO (LĐ) =====
  const decideExemption = (id, decision) => {
    const exemptions = state.exemptions.map((e) => e.id === id ? { ...e, status: decision, decidedBy: state.user?.name, decidedAt: nowStr() } : e)
    persist({ ...state, exemptions, ...logAction(state, `${decision === 'approved' ? 'Duyệt' : 'Từ chối'} miễn giảm ${id}`) })
  }
  const signBatch = (id) => {
    const batches = state.batches.map((b) => b.id === id ? { ...b, status: 'signed', signedBy: state.user?.name, signedAt: nowStr() } : b)
    persist({ ...state, batches, ...logAction(state, `Ký duyệt đợt hóa đơn ${id}`) })
  }

  const api = {
    state, login, logout, resetDemo, toast,
    collectMatched, collectCashHold, depositCashBag, markAbsent, sendReminder,
    mobileCollect, addNote,
    createAdhoc, createExemption,
    matchBankLine, resolveSuspense,
    decideExemption, signBatch,
  }

  return (
    <StoreCtx.Provider value={api}>
      <ToastCtx.Provider value={toasts}>{children}</ToastCtx.Provider>
    </StoreCtx.Provider>
  )
}

export const useStore = () => useContext(StoreCtx)
export const useToasts = () => useContext(ToastCtx)

// ---- Selectors ----
export function householdOf(state, id) {
  return state.households.find((h) => h.id === id)
}
export function openReceivablesOf(state, householdId) {
  return state.receivables.filter((r) => r.householdId === householdId && !CLOSED_STATUSES.includes(r.status))
}
export function remainingOf(state, householdId) {
  return openReceivablesOf(state, householdId).reduce((s, r) => s + (r.amountDue - r.amountPaid), 0)
}
export function cashBagTotal(state) {
  return state.cashBag.reduce((s, e) => s + e.amount, 0)
}
// Thông tin quá hạn của hộ (dựa trên khoản còn mở cũ nhất)
export function overdueInfoOf(state, householdId) {
  const open = openReceivablesOf(state, householdId).filter((r) => r.dueISO)
  if (!open.length) return { days: 0, dueISO: null, reminders: 0 }
  const oldest = open.reduce((a, b) => (a.dueISO < b.dueISO ? a : b))
  const reminders = Math.max(...open.map((r) => r.remindersSent || 0))
  return { days: overdueDays(oldest.dueISO), dueISO: oldest.dueISO, due: oldest.due, reminders }
}
export function householdStatus(state, householdId, assignedTo = 'NTH-007') {
  const recs = state.receivables.filter((r) => r.householdId === householdId && r.assignedTo === assignedTo)
  if (!recs.length) return 'pending'
  if (recs.every((r) => r.status === 'exempt')) return 'exempt'
  if (recs.every((r) => CLOSED_STATUSES.includes(r.status))) {
    if (recs.some((r) => r.status === 'cash_wait')) return 'cash_wait'
    if (recs.some((r) => r.status === 'paid_transfer')) return 'paid_transfer'
    return 'paid_qr'
  }
  if (recs.some((r) => r.status === 'partial')) return 'partial'
  if (recs.some((r) => r.status === 'absent')) return 'absent'
  return 'pending'
}
