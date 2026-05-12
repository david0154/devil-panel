import Layout from '../../components/Layout'
import BillingPage from '../../components/billing/BillingPage'
export default function Billing() { return <BillingPage /> }
Billing.getLayout = (page) => <Layout>{page}</Layout>
