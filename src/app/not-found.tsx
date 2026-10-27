import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#0C0907',
      color: '#F2E9D8',
      fontFamily: 'monospace',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '3rem', margin: '0 0 1rem' }}>404</h1>
      <p style={{ fontSize: '1.2rem', margin: '0 0 2rem', opacity: 0.8 }}>
        This page could not be found.
      </p>
      <Link
        href="/"
        style={{
          color: '#E0A93B',
          textDecoration: 'underline',
          fontSize: '1rem'
        }}
      >
        Return Home
      </Link>
    </div>
  );
}

