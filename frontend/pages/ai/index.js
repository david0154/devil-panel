import Layout from '../../components/Layout'
import AiPage from '../../components/ai/AiPage'
export default function AI() { return <AiPage /> }
AI.getLayout = (page) => <Layout>{page}</Layout>
