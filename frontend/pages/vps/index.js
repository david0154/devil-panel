import Layout from '../../components/Layout'
import VpsPage from '../../components/vps/VpsPage'
export default function VPS() { return <VpsPage /> }
VPS.getLayout = (page) => <Layout>{page}</Layout>
