import Layout from '../../components/Layout'
import MonitoringPage from '../../components/monitoring/MonitoringPage'
export default function Monitoring() { return <MonitoringPage /> }
Monitoring.getLayout = (page) => <Layout>{page}</Layout>
