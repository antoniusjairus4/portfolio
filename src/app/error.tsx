'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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
      <h2 style={{ fontSize: '2rem', margin: '0 0 1rem' }}>Something went wrong!</h2>
      <p style={{ fontSize: '1rem', margin: '0 0 2rem', opacity: 0.8, maxWidth: '32rem' }}>
        {error.message || 'An unexpected error occurred.'}
      </p>
      <button
        onClick={() => reset()}
        style={{
          backgroundColor: '#8B1E2D',
          color: '#F2E9D8',
          border: 'none',
          padding: '0.6rem 1.4rem',
          fontSize: '0.9rem',
          cursor: 'pointer',
          borderRadius: '4px'
        }}
      >
        Try again
      </button>
    </div>
  );
}

