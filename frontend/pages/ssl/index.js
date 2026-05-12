import Layout from '../../components/Layout'
import SslPage from '../../components/ssl/SslPage'
export default function SSL() { return <SslPage /> }
SSL.getLayout = (page) => <Layout>{page}</Layout>
