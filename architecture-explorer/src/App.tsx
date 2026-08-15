import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ExplorerProvider } from '@/state/explorer'
import { AppShell } from '@/components/AppShell'
import { DetailDrawer } from '@/components/DetailDrawer'
import { SearchPalette } from '@/components/SearchPalette'

/**
 * Routes are lazy-loaded (§34). The heavy canvases (React Flow) and charts
 * (Recharts) only load when their view is actually opened, which keeps the
 * initial bundle small even though the explorer carries 15 screens.
 */
const Overview = lazy(() => import('@/views/Overview'))
const BusinessArchitecture = lazy(() => import('@/views/BusinessArchitecture'))
const OrganizationLifecycle = lazy(() => import('@/views/OrganizationLifecycle'))
const NetworkArchitecture = lazy(() => import('@/views/NetworkArchitecture'))
const TrustEngine = lazy(() => import('@/views/TrustEngine'))
const VerificationLifecycle = lazy(() => import('@/views/VerificationLifecycle'))
const CustomerLifecycle = lazy(() => import('@/views/CustomerLifecycle'))
const TechnicalArchitecture = lazy(() => import('@/views/TechnicalArchitecture'))
const DataArchitecture = lazy(() => import('@/views/DataArchitecture'))
const SecurityGovernance = lazy(() => import('@/views/SecurityGovernance'))
const RevenueArchitecture = lazy(() => import('@/views/RevenueArchitecture'))
const ApiArchitecture = lazy(() => import('@/views/ApiArchitecture'))
const ProviderArchitecture = lazy(() => import('@/views/ProviderArchitecture'))
const FutureNetwork = lazy(() => import('@/views/FutureNetwork'))
const ArchitecturePrinciples = lazy(() => import('@/views/ArchitecturePrinciples'))

function ViewFallback() {
  return (
    <div className="px-5 md:px-8 py-7">
      <div className="animate-pulse space-y-4 max-w-[900px]">
        <div className="h-3 w-24 rounded bg-slate-200" />
        <div className="h-7 w-80 rounded bg-slate-200" />
        <div className="h-4 w-full max-w-[600px] rounded bg-slate-100" />
        <div className="h-[320px] rounded-xl bg-slate-100" />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ExplorerProvider>
      <AppShell>
        <Suspense fallback={<ViewFallback />}>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/business" element={<BusinessArchitecture />} />
            <Route path="/organization" element={<OrganizationLifecycle />} />
            <Route path="/network" element={<NetworkArchitecture />} />
            <Route path="/trust-engine" element={<TrustEngine />} />
            <Route path="/verification" element={<VerificationLifecycle />} />
            <Route path="/customer-lifecycle" element={<CustomerLifecycle />} />
            <Route path="/technical" element={<TechnicalArchitecture />} />
            <Route path="/data" element={<DataArchitecture />} />
            <Route path="/security" element={<SecurityGovernance />} />
            <Route path="/revenue" element={<RevenueArchitecture />} />
            <Route path="/api" element={<ApiArchitecture />} />
            <Route path="/providers" element={<ProviderArchitecture />} />
            <Route path="/future" element={<FutureNetwork />} />
            <Route path="/principles" element={<ArchitecturePrinciples />} />
          </Routes>
        </Suspense>
      </AppShell>
      <DetailDrawer />
      <SearchPalette />
    </ExplorerProvider>
  )
}
