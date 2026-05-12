import Layout from '../../components/Layout'
import EmailPage from '../../components/email/EmailPage'
export default function Email() { return <EmailPage /> }
Email.getLayout = (page) => <Layout>{page}</Layout>
