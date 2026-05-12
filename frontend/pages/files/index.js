import Layout from '../../components/Layout'
import FileManagerPage from '../../components/filemanager/FileManagerPage'
export default function Files() { return <FileManagerPage /> }
Files.getLayout = (page) => <Layout>{page}</Layout>
