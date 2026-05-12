import Layout from '../../components/Layout'
import DashboardPage from '../../components/dashboard/DashboardPage'

export default function Dashboard() {
  return <DashboardPage />
}
Dashboard.getLayout = (page) => <Layout>{page}</Layout>
