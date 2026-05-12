import '../styles/globals.scss'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useEffect } from 'react'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Load Google Fonts
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }, [])

  const getLayout = Component.getLayout || ((page) => page)
  return (
    <>
      {getLayout(<Component {...pageProps} />)}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        theme="dark"
        toastStyle={{ background: '#13131a', border: '1px solid #1e1e2e', color: '#f0f0f5' }}
      />
    </>
  )
}
