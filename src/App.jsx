import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store'
import Layout from './components/Layout'
import Login from './views/Login'

// NGƯỜI THU HỘ (NTH) — app mobile
import MobileLayout, { MHome, MList, MDetail, MCollect, MSuccess, MReceipt, MReport, MNote, MProfile } from './views/Mobile'

// QUẢN TRỊ (QT)
import { AdminOverview, AdminUsers, AdminAreas, AdminPricing, AdminIntegrations, AdminAudit } from './views/Admin'
// CÁN BỘ XÃ (CB)
import { CadreOverview, CadreHouseholds, CadreHouseholdDetail, CadreInvoices, CadreAdhoc, CadreExemptions, CadreDebts } from './views/Cadre'
// KẾ TOÁN (KT)
import { AcctOverview, AcctReconcile, AcctSuspense, AcctCashReconcile, AcctLedger, AcctReports } from './views/Accountant'
// LÃNH ĐẠO (LĐ)
import { LeaderDashboard, LeaderAssignments, LeaderApprovals, LeaderBatches, LeaderReports } from './views/Leader'

const NTH_ROUTES = [
  ['/', <MHome />], ['/list', <MList />], ['/hh/:id', <MDetail />], ['/hh/:id/collect', <MCollect />],
  ['/hh/:id/success', <MSuccess />], ['/hh/:id/note', <MNote />], ['/receipt/:id', <MReceipt />],
  ['/report', <MReport />], ['/profile', <MProfile />],
]
const DESKTOP_ROUTES = {
  QT: [['/', <AdminOverview />], ['/users', <AdminUsers />], ['/areas', <AdminAreas />], ['/pricing', <AdminPricing />], ['/integrations', <AdminIntegrations />], ['/audit', <AdminAudit />]],
  CB: [['/', <CadreOverview />], ['/households', <CadreHouseholds />], ['/households/:hhId', <CadreHouseholdDetail />], ['/invoices', <CadreInvoices />], ['/adhoc', <CadreAdhoc />], ['/exemptions', <CadreExemptions />], ['/debts', <CadreDebts />]],
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
