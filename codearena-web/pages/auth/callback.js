import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const { token, error } = router.query;

        if (token) {
            // Store token in localStorage
            localStorage.setItem('token', token);
            // Redirect to Web Arena
            router.push('/play');
        } else if (error) {
            // Redirect to login with error
            router.push(`/login?error=${error}`);
        }
    }, [router.query, router]);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'var(--midnight-deep)',
            color: 'var(--text-primary)'
        }}>
            <div style={{ textAlign: 'center' }}>
                <div className="spinner" style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid var(--glass-border)',
                    borderTopColor: 'var(--electric-violet)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 20px'
                }}></div>
                <p>Completing authentication...</p>
            </div>
        </div>
    );
}
