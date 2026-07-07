import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store'
import Layout from './components/Layout'
import Login from './views/Login'
// ---- Vai CÁN BỘ XÃ (6 màn — mount trong Layout chung tại ROOT) ----
import CadreOverview2 from './views/cadre/Overview'
import { CadreObjects, CadreObjectDetail } from './views/cadre/Objects'
import CadreInvoices2, { CadreInvoiceDetail } from './views/cadre/Invoices'
import CadreRoutesView from './views/cadre/RoutesView'
import CadreDebts2 from './views/cadre/Debts'
import { CadreCollect, CadreCollectDetail } from './views/cadre/Collect'

// NGƯỜI THU HỘ (NTH) — app mobile
import MobileLayout, { MHome, MList, MDetail, MCollect, MSuccess, MReceipt, MCashBag, MReport, MNote, MProfile } from './views/Mobile'

// QUẢN TRỊ (QT)
import { AdminOverview, AdminUsers, AdminAreas, AdminPricing, AdminIntegrations, AdminAudit } from './views/Admin'
// KẾ TOÁN (KT)
import { AcctOverview, AcctReconcile, AcctSuspense, AcctCashReconcile, AcctLedger, AcctReports } from './views/Accountant'
// LÃNH ĐẠO (LĐ)
import { LeaderDashboard, LeaderAssignments, LeaderApprovals, LeaderBatches, LeaderReports } from './views/Leader'

const NTH_ROUTES = [
  ['/', <MHome />], ['/list', <MList />], ['/hh/:id', <MDetail />], ['/hh/:id/collect', <MCollect />],
  ['/hh/:id/success', <MSuccess />], ['/hh/:id/note', <MNote />], ['/receipt/:id', <MReceipt />],
  ['/cashbag', <MCashBag />], ['/report', <MReport />], ['/profile', <MProfile />],
]
const DESKTOP_ROUTES = {
  QT: [['/', <AdminOverview />], ['/users', <AdminUsers />], ['/areas', <AdminAreas />], ['/pricing', <AdminPricing />], ['/integrations', <AdminIntegrations />], ['/audit', <AdminAudit />]],
  CB: [['/', <CadreOverview2 />], ['/objects', <CadreObjects />], ['/objects/:id', <CadreObjectDetail />], ['/invoices', <CadreInvoices2 />], ['/invoices/:id', <CadreInvoiceDetail />], ['/routes', <CadreRoutesView />], ['/debts', <CadreDebts2 />], ['/collect', <CadreCollect />], ['/collect/:id', <CadreCollectDetail />]],
  KT: [['/', <AcctOverview />], ['/reconcile', <AcctReconcile />], ['/suspense', <AcctSuspense />], ['/cash-reconcile', <AcctCashReconcile />], ['/ledger', <AcctLedger />], ['/reports', <AcctReports />]],
  LD: [['/', <LeaderDashboard />], ['/assignments', <LeaderAssignments />], ['/approvals', <LeaderApprovals />], ['/batches', <LeaderBatches />], ['/reports', <LeaderReports />]],
}

export default function App() {
  const { state } = useStore()

  if (!state.user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  const isNTH = state.user.roleKey === 'NTH'
  const routes = isNTH ? NTH_ROUTES : (DESKTOP_ROUTES[state.user.roleKey] || DESKTOP_ROUTES.CB)

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route element={isNTH ? <MobileLayout /> : <Layout />}>
        {routes.map(([path, el]) => <Route key={path} path={path} element={el} />)}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
