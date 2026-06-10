import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { P } from '../routes/appPaths'

const GOLD = '#e9c176'
const GOLD_DIM = '#c0b090'
const BG = '#0c0c14'
const SURFACE = '#161624'
const TEXT = '#f0ede5'

const features = [
  { icon: '📚', title: 'Vast Catalog', desc: 'Browse thousands of books, notes, and past-year question papers all in one place.' },
  { icon: '🔖', title: 'Save & Track', desc: 'Bookmark materials, track your borrows, and pick up right where you left off.' },
  { icon: '🔍', title: 'Smart Search', desc: 'Find exactly what you need with instant search and filter by category or type.' },
  { icon: '📈', title: 'Activity History', desc: 'See your full reading and borrowing history at a glance with detailed logs.' },
]

const stats = [
  { value: '5,000+', label: 'Materials' },
  { value: '1,200+', label: 'Active Members' },
  { value: '3 Types', label: 'Books · Notes · PYQs' },
  { value: '24/7', label: 'Access' },
]

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 640)
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 640)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return mobile
}

export default function LandingPage() {
  const navigate = useNavigate()
  const mobile = useIsMobile()

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TEXT, fontFamily: 'inherit', overflowX: 'hidden' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'linear-gradient(180deg,#0c0c14 70%,rgba(12,12,20,0.9))',
        borderBottom: `1px solid ${GOLD}22`,
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `0 ${mobile ? '1rem' : 'clamp(1rem,5vw,3rem)'}`, height: 64,
      }}>
        <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '0.04em', color: GOLD }}>
          Scholarly
        </span>
        {!mobile && (
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => navigate(P.login)}
              style={{
                background: 'transparent', border: `1px solid ${GOLD}66`,
                color: GOLD, borderRadius: 8, padding: '7px 20px',
                cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate(P.signup)}
              style={{
                background: GOLD, border: 'none',
                color: '#0c0c14', borderRadius: 8, padding: '7px 20px',
                cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem',
              }}
            >
              Get Started
            </button>
          </div>
        )}
      </nav>

      <div style={{ height: 64 }} />

      {/* ── Hero ── */}
      <section style={{
        position: 'relative', textAlign: 'center',
        padding: mobile
          ? '2.5rem 1.25rem 2rem'
          : 'clamp(3.5rem,8vw,6rem) clamp(1rem,5vw,3rem) clamp(2.5rem,6vw,4.5rem)',
        overflow: 'hidden',
      }}>
        {/* ambient blobs */}
        <div style={{
          position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
          width: mobile ? 300 : 600, height: mobile ? 250 : 400, borderRadius: '50%',
          background: `radial-gradient(ellipse, ${GOLD}18 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        <p style={{
          color: GOLD, fontWeight: 600, letterSpacing: '0.12em',
          fontSize: '0.75rem', marginBottom: 16, textTransform: 'uppercase',
        }}>
          Your Digital Library
        </p>

        <h1 style={{
          fontSize: mobile ? '2rem' : 'clamp(2.2rem,6vw,4rem)',
          fontWeight: 900, lineHeight: 1.15,
          margin: '0 auto 1rem', maxWidth: 720,
          background: `linear-gradient(135deg, ${TEXT} 40%, ${GOLD} 100%)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Every Book. Every Note.<br />Always Within Reach.
        </h1>

        <p style={{
          color: GOLD_DIM,
          fontSize: mobile ? '0.95rem' : 'clamp(1rem,2vw,1.15rem)',
          maxWidth: 500, margin: '0 auto 2rem', lineHeight: 1.65,
        }}>
          Scholarly puts your institution's entire library in your hands — browse, borrow, and manage materials from anywhere.
        </p>

        {/* CTA buttons — stacked full-width on mobile */}
        <div style={{
          display: 'flex', gap: 12, justifyContent: 'center',
          flexDirection: mobile ? 'column' : 'row',
          alignItems: mobile ? 'stretch' : 'center',
          maxWidth: mobile ? 320 : 'none', margin: '0 auto',
        }}>
          <button
            onClick={() => navigate(P.signup)}
            style={{
              background: GOLD, color: '#0c0c14',
              border: 'none', borderRadius: 10,
              padding: '13px 32px',
              fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
              boxShadow: `0 0 24px ${GOLD}44`,
            }}
          >
            Join for Free
          </button>
          <button
            onClick={() => navigate(P.login)}
            style={{
              background: 'transparent', color: TEXT,
              border: `1px solid #ffffff30`, borderRadius: 10,
              padding: '13px 32px',
              fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
            }}
          >
            Sign In →
          </button>
        </div>
      </section>

      {/* ── Stats bar — 2×2 on mobile, 4-in-a-row on desktop ── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '1px',
        background: `${GOLD}18`,
        border: `1px solid ${GOLD}22`,
        margin: `0 ${mobile ? '1rem' : 'clamp(1rem,5vw,4rem)'}`,
        borderRadius: 14, overflow: 'hidden',
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            flex: mobile ? '1 1 calc(50% - 1px)' : '1 1 140px',
            textAlign: 'center',
            padding: mobile ? '1.25rem 0.75rem' : '1.5rem 1rem',
            background: SURFACE,
          }}>
            <div style={{ fontSize: mobile ? '1.4rem' : '1.75rem', fontWeight: 800, color: GOLD }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: GOLD_DIM, marginTop: 4, letterSpacing: '0.04em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Features ── */}
      <section style={{
        padding: mobile ? '2.5rem 1.25rem' : 'clamp(3rem,7vw,5rem) clamp(1rem,5vw,3rem)',
        maxWidth: 1100, margin: '0 auto',
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: mobile ? '1.35rem' : 'clamp(1.5rem,3vw,2rem)',
          fontWeight: 800, color: TEXT, marginBottom: '0.5rem',
        }}>
          Everything You Need to Study Smarter
        </h2>
        <p style={{ textAlign: 'center', color: GOLD_DIM, marginBottom: '2rem', fontSize: '0.95rem' }}>
          Built for students, managed by librarians.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: mobile ? '1fr' : 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: mobile ? 12 : 20,
        }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: SURFACE, border: `1px solid ${GOLD}18`,
              borderRadius: 14,
              padding: mobile ? '1.25rem 1rem' : '1.75rem 1.5rem',
              display: mobile ? 'flex' : 'block',
              alignItems: mobile ? 'flex-start' : undefined,
              gap: mobile ? '0.85rem' : undefined,
            }}>
              <div style={{ fontSize: '1.75rem', flexShrink: 0, marginBottom: mobile ? 0 : '0.75rem' }}>{f.icon}</div>
              <div>
                <h3 style={{ color: TEXT, fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.35rem' }}>{f.title}</h3>
                <p style={{ color: GOLD_DIM, fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{
        margin: `0 ${mobile ? '1rem' : 'clamp(1rem,5vw,3rem)'} ${mobile ? '2rem' : 'clamp(2rem,5vw,4rem)'}`,
        background: 'linear-gradient(135deg, #12100a, #221a00)',
        border: `1px solid ${GOLD}44`,
        borderRadius: 18,
        padding: mobile ? '2rem 1.25rem' : 'clamp(2rem,5vw,3.5rem) clamp(1.5rem,4vw,3rem)',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at 50% 0%, ${GOLD}12, transparent 65%)`,
          pointerEvents: 'none',
        }} />
        <h2 style={{
          fontSize: mobile ? '1.3rem' : 'clamp(1.4rem,3vw,2rem)',
          fontWeight: 800, color: TEXT, marginBottom: '0.75rem',
        }}>
          Ready to explore the library?
        </h2>
        <p style={{
          color: GOLD_DIM, fontSize: '0.95rem',
          maxWidth: 480, margin: '0 auto 1.75rem', lineHeight: 1.6,
        }}>
          Create a free account and start browsing the catalog in minutes.
        </p>
        <button
          onClick={() => navigate(P.signup)}
          style={{
            background: GOLD, color: '#0c0c14',
            border: 'none', borderRadius: 10,
            padding: '13px 36px',
            width: mobile ? '100%' : 'auto',
            maxWidth: mobile ? 320 : 'none',
            fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
            boxShadow: `0 0 28px ${GOLD}55`,
          }}
        >
          Create Free Account
        </button>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: `1px solid ${GOLD}18`,
        padding: `1.5rem ${mobile ? '1.25rem' : 'clamp(1rem,5vw,3rem)'}`,
        display: 'flex',
        flexDirection: mobile ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: mobile ? 'center' : 'space-between',
        textAlign: mobile ? 'center' : 'left',
        gap: mobile ? 8 : 12,
      }}>
        <span style={{ fontWeight: 700, color: GOLD, fontSize: '1rem' }}>Scholarly</span>
        <span style={{ color: GOLD_DIM, fontSize: '0.78rem' }}>© 2026 Scholarly Library Management</span>
        <div style={{ display: 'flex', gap: 20 }}>
          <button onClick={() => navigate(P.login)} style={{ background: 'none', border: 'none', color: GOLD_DIM, cursor: 'pointer', fontSize: '0.85rem' }}>Sign In</button>
          <button onClick={() => navigate(P.signup)} style={{ background: 'none', border: 'none', color: GOLD_DIM, cursor: 'pointer', fontSize: '0.85rem' }}>Sign Up</button>
        </div>
      </footer>

    </div>
  )
}
