import Layout from '../../components/Layout'
import WebsitesPage from '../../components/websites/WebsitesPage'
export default function Websites() { return <WebsitesPage /> }
Websites.getLayout = (page) => <Layout>{page}</Layout>
