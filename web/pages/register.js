import Layout from '@/components/Layout';
import styles from '@/styles/Login.module.css';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:3001/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Store token
            localStorage.setItem('token', data.token);

            // Redirect to Web Arena
            router.push('/play');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <Layout title="Register - MVP1">
            <div className={styles.container}>
                <div className={styles.card}>
                    <h1 className={styles.title}>Create Account</h1>
                    <p className={styles.subtitle}>Join MVP1 and start coding</p>

                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                autoComplete="username"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                autoComplete="new-password"
                                minLength="6"
                            />
                        </div>

                        <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <div style={{
                        margin: '24px 0',
                        textAlign: 'center',
                        color: 'var(--text-secondary)',
                        fontSize: '13px',
                        position: 'relative'
                    }}>
                        or continue with
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                        <button
                            onClick={async () => {
                                try {
                                    const res = await fetch('http://localhost:3001/auth/google', { redirect: 'manual' });
                                    if (res.ok || res.status === 302) {
                                        window.location.href = 'http://localhost:3001/auth/google';
                                    } else {
                                        const data = await res.json();
                                        setError(data.message || 'Google sign-in is not available. Please use email/password.');
                                    }
                                } catch (err) {
                                    setError('Unable to connect to Google sign-in. Please use email/password.');
                                }
                            }}
                            className="btn-outline"
                            style={{ width: '100%' }}
                        >
                            Google
                        </button>
                        <button
                            onClick={async () => {
                                try {
                                    const res = await fetch('http://localhost:3001/auth/github', { redirect: 'manual' });
                                    if (res.ok || res.status === 302) {
                                        window.location.href = 'http://localhost:3001/auth/github';
                                    } else {
                                        const data = await res.json();
                                        setError(data.message || 'GitHub sign-in is not available. Please use email/password.');
                                    }
                                } catch (err) {
                                    setError('Unable to connect to GitHub sign-in. Please use email/password.');
                                }
                            }}
                            className="btn-outline"
                            style={{ width: '100%' }}
                        >
                            GitHub
                        </button>
                    </div>

                    <p className={styles.footer}>
                        Already have an account? <Link href="/login" className={styles.hint}>Sign in</Link>
                    </p>
                </div>
            </div>
        </Layout>
    );
}
