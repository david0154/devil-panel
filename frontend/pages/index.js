import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    const token = localStorage.getItem('dp_token')
    router.replace(token ? '/dashboard' : '/login')
  }, [router])
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#0a0a0f' }}>
      <div className="loading-spinner" />
    </div>
  )
}
