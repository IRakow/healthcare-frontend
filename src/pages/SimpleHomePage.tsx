import { useNavigate } from 'react-router-dom'

export default function SimpleHomePage() {
  const navigate = useNavigate()

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 'bold', 
          color: '#111827',
          marginBottom: '3rem',
          textAlign: 'center'
        }}>
          AI Healthcare Platform
        </h1>

        {/* Quick Navigation Section */}
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1f2937' }}>
            Quick Navigation (Skip Login)
          </h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/admin/dashboard')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Admin Dashboard
            </button>
            <button 
              onClick={() => navigate('/owner/dashboard')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Owner Dashboard
            </button>
            <button 
              onClick={() => navigate('/patient/dashboard')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Patient Dashboard
            </button>
          </div>
        </div>
        
        {/* Login Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {/* Admin Portal */}
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px'
            }}>
              👨‍💼
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#1f2937' }}>
              Admin Portal
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              System administration and management
            </p>
            <button 
              onClick={() => navigate('/admin/login')}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Admin Login
            </button>
          </div>

          {/* Owner Portal */}
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              backgroundColor: '#10b981',
              borderRadius: '50%',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px'
            }}>
              🏢
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#1f2937' }}>
              Employer Portal
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              Manage your organization's healthcare
            </p>
            <button 
              onClick={() => navigate('/owner/login')}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Owner Login
            </button>
          </div>

          {/* Patient Portal */}
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              backgroundColor: '#8b5cf6',
              borderRadius: '50%',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px'
            }}>
              👤
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#1f2937' }}>
              Patient Portal
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              Access your health information
            </p>
            <button 
              onClick={() => navigate('/patient/login')}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Patient Login
            </button>
          </div>
        </div>

        {/* Available Routes Section */}
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1f2937' }}>
            All Available Routes
          </h2>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#3b82f6', marginBottom: '10px' }}>Admin Routes:</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <button onClick={() => navigate('/admin/login')} style={{ padding: '5px 10px', backgroundColor: '#e0e7ff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>/admin/login</button>
              <button onClick={() => navigate('/admin/dashboard')} style={{ padding: '5px 10px', backgroundColor: '#e0e7ff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>/admin/dashboard</button>
              <button onClick={() => navigate('/admin/employers')} style={{ padding: '5px 10px', backgroundColor: '#e0e7ff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>/admin/employers</button>
              <button onClick={() => navigate('/admin/settings')} style={{ padding: '5px 10px', backgroundColor: '#e0e7ff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>/admin/settings</button>
              <button onClick={() => navigate('/admin/billing')} style={{ padding: '5px 10px', backgroundColor: '#e0e7ff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>/admin/billing</button>
              <button onClick={() => navigate('/admin/audit')} style={{ padding: '5px 10px', backgroundColor: '#e0e7ff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>/admin/audit</button>
              <button onClick={() => navigate('/admin/backup')} style={{ padding: '5px 10px', backgroundColor: '#e0e7ff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>/admin/backup</button>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#10b981', marginBottom: '10px' }}>Owner Routes:</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <button onClick={() => navigate('/owner/login')} style={{ padding: '5px 10px', backgroundColor: '#d1fae5', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>/owner/login</button>
              <button onClick={() => navigate('/owner/dashboard')} style={{ padding: '5px 10px', backgroundColor: '#d1fae5', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>/owner/dashboard</button>
              <button onClick={() => navigate('/owner/employees')} style={{ padding: '5px 10px', backgroundColor: '#d1fae5', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>/owner/employees</button>
              <button onClick={() => navigate('/owner/analytics')} style={{ padding: '5px 10px', backgroundColor: '#d1fae5', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>/owner/analytics</button>
              <button onClick={() => navigate('/owner/branding')} style={{ padding: '5px 10px', backgroundColor: '#d1fae5', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>/owner/branding</button>
              <button onClick={() => navigate('/owner/invoices')} style={{ padding: '5px 10px', backgroundColor: '#d1fae5', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>/owner/invoices</button>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#8b5cf6', marginBottom: '10px' }}>Patient Routes:</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <button onClick={() => navigate('/patient/login')} style={{ padding: '5px 10px', backgroundColor: '#e9d5ff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>/patient/login</button>
              <button onClick={() => navigate('/patient/dashboard')} style={{ padding: '5px 10px', backgroundColor: '#e9d5ff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>/patient/dashboard</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}