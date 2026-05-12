import Layout from '../../components/Layout'
import ResellerPage from '../../components/reseller/ResellerPage'
export default function Reseller() { return <ResellerPage /> }
Reseller.getLayout = (page) => <Layout>{page}</Layout>
