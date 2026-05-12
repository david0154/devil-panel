import Layout from '../../components/Layout'
import DnsPage from '../../components/dns/DnsPage'
export default function DNS() { return <DnsPage /> }
DNS.getLayout = (page) => <Layout>{page}</Layout>
