import Layout from '../../components/Layout'
import SettingsPage from '../../components/settings/SettingsPage'
export default function Settings() { return <SettingsPage /> }
Settings.getLayout = (page) => <Layout>{page}</Layout>
