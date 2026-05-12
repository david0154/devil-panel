import Layout from '../../components/Layout'
import SecurityPage from '../../components/security/SecurityPage'
export default function Security() { return <SecurityPage /> }
Security.getLayout = (page) => <Layout>{page}</Layout>
