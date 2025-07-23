export default function SimpleHomePage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)',
      padding: '4rem 2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 'bold', 
          textAlign: 'center',
          marginBottom: '2rem',
          color: '#1f2937'
        }}>
          AI Healthcare Platform
        </h1>
        
        <p style={{ 
          fontSize: '1.25rem', 
          textAlign: 'center',
          marginBottom: '3rem',
          color: '#6b7280'
        }}>
          Transforming healthcare with AI-powered insights and personalized care
        </p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          {/* Admin Card */}
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: '#dbeafe',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '2rem'
            }}>
              🏢
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>
              Platform Admin
            </h2>
            <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
              Manage employers, billing, and system settings
            </p>
            <a 
              href="/admin/login"
              style={{
                display: 'block',
                padding: '0.75rem 1rem',
                background: '#2563eb',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '500'
              }}
            >
              Admin Login
            </a>
          </div>

          {/* Owner Card */}
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: '#d1fae5',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '2rem'
            }}>
              💼
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>
              Employer Portal
            </h2>
            <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
              Manage employees, view analytics, and configure benefits
            </p>
            <a 
              href="/owner/login"
              style={{
                display: 'block',
                padding: '0.75rem 1rem',
                background: '#059669',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '500'
              }}
            >
              Employer Login
            </a>
          </div>

          {/* Patient Card */}
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: '#e9d5ff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '2rem'
            }}>
              👤
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>
              Patient Portal
            </h2>
            <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
              Access your health records, book appointments, and chat with AI
            </p>
            <a 
              href="/patient/login"
              style={{
                display: 'block',
                padding: '0.75rem 1rem',
                background: '#7c3aed',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '500'
              }}
            >
              Patient Login
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}