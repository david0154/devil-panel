import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  RiDashboardLine, RiGlobalLine, RiServerLine, RiDnsLine,
  RiMailLine, RiShieldLine, RiLockLine, RiBarChartLine,
  RiBrainLine, RiMoneyDollarCircleLine, RiStoreLine,
  RiFolder3Line, RiSettings3Line, RiRocketLine, RiMenuLine,
  RiBellLine, RiSearchLine, RiLogoutBoxLine, RiUserLine,
  RiMoonLine
} from 'react-icons/ri'
import { logout, getUser } from '../lib/auth'
import styles from '../styles/layout.module.scss'

const NAV = [
  { section: 'Main' },
  { href: '/dashboard',  icon: <RiDashboardLine />, label: 'Dashboard' },
  { href: '/websites',   icon: <RiGlobalLine />,    label: 'Websites' },
  { href: '/vps',        icon: <RiServerLine />,    label: 'VPS' },
  { section: 'Services' },
  { href: '/dns',        icon: <RiDnsLine />,       label: 'DNS' },
  { href: '/email',      icon: <RiMailLine />,      label: 'Email' },
  { href: '/ssl',        icon: <RiLockLine />,      label: 'SSL' },
  { href: '/files',      icon: <RiFolder3Line />,   label: 'File Manager' },
  { section: 'Security & Monitor' },
  { href: '/security',   icon: <RiShieldLine />,    label: 'Security' },
  { href: '/monitoring', icon: <RiBarChartLine />,  label: 'Monitoring' },
  { section: 'Business' },
  { href: '/ai',         icon: <RiBrainLine />,     label: 'AI Assistant' },
  { href: '/billing',    icon: <RiMoneyDollarCircleLine />, label: 'Billing' },
  { href: '/reseller',   icon: <RiStoreLine />,     label: 'Reseller' },
  { section: 'System' },
  { href: '/settings',   icon: <RiSettings3Line />, label: 'Settings' },
]

export default function Layout({ children }) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setUser(getUser())
    const token = localStorage.getItem('dp_token')
    if (!token) router.push('/login')
  }, [router])

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarLogo}>
          <div className={styles.logoIcon}><RiRocketLine /></div>
          <div className={styles.logoText}>
            <h1>Devil Panel</h1>
            <span>Devil One Pvt Ltd</span>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {NAV.map((item, i) =>
            item.section ? (
              <div key={i} className={styles.navSection}>{item.section}</div>
            ) : (
              <Link key={i} href={item.href}
                className={`sidebar-nav-item ${router.pathname.startsWith(item.href) ? 'active' : ''}`}>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.avatar}>{user?.username?.[0]?.toUpperCase() || 'A'}</div>
          <div className={styles.userInfo}>
            <div className="name">{user?.username || 'Admin'}</div>
            <div className="role">{user?.role || 'Administrator'}</div>
          </div>
          <button onClick={logout} style={{ marginLeft:'auto', background:'none', border:'none', color:'#555570', cursor:'pointer', fontSize:'1.1rem' }}>
            <RiLogoutBoxLine />
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background:'none', border:'none', color:'#8888a8', cursor:'pointer', fontSize:'1.3rem' }}>
              <RiMenuLine />
            </button>
            <div className={styles.searchBar}>
              <RiSearchLine />
              <input placeholder="Search anything..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className={styles.topbarRight}>
            <button className={styles.iconBtn}>
              <RiBellLine />
              <span className={styles.notifBadge} />
            </button>
            <button className={styles.iconBtn}><RiMoonLine /></button>
            <button className={styles.iconBtn}><RiUserLine /></button>
          </div>
        </header>
        <main className={styles.content}>{children}</main>
      </div>

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:99, display:'none' }}
          className="mobile-overlay" />
      )}
    </div>
  )
}
