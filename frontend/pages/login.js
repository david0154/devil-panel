import { useState } from 'react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi'
import { RiRocketLine } from 'react-icons/ri'
import api from '../lib/api'
import styles from '../styles/auth.module.scss'

export default function Login() {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const [showPass, setShowPass] = useState(false)
  const [twoFaRequired, setTwoFaRequired] = useState(false)
  const [twoFaToken, setTwoFaToken] = useState('')
  const [tempCreds, setTempCreds] = useState(null)

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/auth/login', data)
      if (res.data.requires2FA) {
        setTwoFaRequired(true)
        setTempCreds(data)
        toast.info('Enter your 2FA code')
        return
      }
      localStorage.setItem('dp_token', res.data.token)
      localStorage.setItem('dp_user', JSON.stringify(res.data.user))
      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    }
  }

  const handle2FA = async () => {
    try {
      const res = await api.post('/auth/login/2fa', { ...tempCreds, token: twoFaToken })
      localStorage.setItem('dp_token', res.data.token)
      localStorage.setItem('dp_user', JSON.stringify(res.data.user))
      toast.success('Authenticated!')
      router.push('/dashboard')
    } catch { toast.error('Invalid 2FA code') }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authLogo}>
          <div className={styles.logoIcon}><RiRocketLine /></div>
          <h1>Devil Panel</h1>
          <p>Powering Fast, Secure &amp; Intelligent Hosting</p>
        </div>

        {!twoFaRequired ? (
          <form className={styles.authForm} onSubmit={handleSubmit(onSubmit)}>
            <div className="input-group">
              <label>Email or Username</label>
              <div style={{ position:'relative' }}>
                <FiMail style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#555570' }} />
                <input style={{ paddingLeft: '2.25rem' }} placeholder="admin@devilpanel.com"
                  {...register('email', { required: 'Required' })} />
              </div>
              {errors.email && <span style={{ color:'#f87171', fontSize:'0.78rem' }}>{errors.email.message}</span>}
            </div>

            <div className="input-group">
              <label>Password</label>
              <div style={{ position:'relative' }}>
                <FiLock style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#555570' }} />
                <input style={{ paddingLeft:'2.25rem', paddingRight:'2.5rem' }}
                  type={showPass ? 'text' : 'password'} placeholder="••••••••"
                  {...register('password', { required: 'Required', minLength: { value:6, message:'Min 6 chars' } })} />
                <button type="button" style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#555570', cursor:'pointer' }}
                  onClick={() => setShowPass(!showPass)}>{showPass ? <FiEyeOff /> : <FiEye />}</button>
              </div>
              {errors.password && <span style={{ color:'#f87171', fontSize:'0.78rem' }}>{errors.password.message}</span>}
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'-0.5rem' }}>
              <a href="/forgot-password" style={{ fontSize:'0.82rem', color:'#8888a8' }}>Forgot password?</a>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width:'100%', marginTop:'0.5rem' }} disabled={isSubmitting}>
              {isSubmitting ? <span className="loading-spinner sm" /> : 'Sign In'}
            </button>
          </form>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div className={styles.twoFactorBox}>
              <div className={styles.icon}><FiShield /></div>
              <p>Enter the 6-digit code from your authenticator app</p>
            </div>
            <div className="input-group">
              <label>2FA Code</label>
              <input type="text" maxLength="6" placeholder="000000" value={twoFaToken}
                onChange={e => setTwoFaToken(e.target.value)}
                style={{ letterSpacing:'0.3em', textAlign:'center', fontSize:'1.25rem' }} />
            </div>
            <button className="btn btn-primary" style={{ width:'100%' }} onClick={handle2FA}>Verify</button>
            <button className="btn btn-ghost" style={{ width:'100%' }} onClick={() => setTwoFaRequired(false)}>Back</button>
          </div>
        )}

        <div className={styles.authFooter}>
          <p style={{ fontSize:'0.75rem', color:'#555570', marginTop:'1.5rem', textAlign:'center' }}>
            Devil Panel &copy; 2025 Devil One Pvt Ltd
          </p>
        </div>
      </div>
    </div>
  )
}
