import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  
  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: '36px', margin: '0 0 8px', color: 'var(--ink)' }}>Profile</h1>
        <p style={{ color: 'var(--body)', fontSize: '16px' }}>Manage your account details and expertise.</p>
      </div>

      <div style={{ padding: '32px', background: 'var(--surface-card)', borderRadius: '12px', border: '1px solid var(--hairline)' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: 'var(--ink)' }}>Account Information</h3>
        <div style={{ display: 'grid', gap: '16px', fontSize: '15px', color: 'var(--body)' }}>
          <div><strong style={{ color: 'var(--body-strong)' }}>Name:</strong> {user?.name}</div>
          <div><strong style={{ color: 'var(--body-strong)' }}>Email:</strong> {user?.email}</div>
          <div><strong style={{ color: 'var(--body-strong)' }}>Role:</strong> <span style={{ textTransform: 'capitalize' }}>{user?.role?.toLowerCase()}</span></div>
        </div>
      </div>
    </div>
  );
}
