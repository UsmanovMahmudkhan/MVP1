import Layout from '@/components/Layout';
import styles from '@/styles/Profile.module.css';
import { useEffect, useState } from 'react';
import ContributionGraph from '@/components/ContributionGraph';
import { useRouter } from 'next/router';

export default function Profile() {
    const router = useRouter();
    const { username } = router.query;
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!username) return;

        async function fetchProfile() {
            try {
                let url;

                // If username is "me", fetch current user's profile
                if (username === 'me') {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        router.push('/login');
                        return;
                    }

                    // Fetch current user from /auth/me
                    const res = await fetch('http://localhost:3001/auth/me', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!res.ok) {
                        if (res.status === 401) {
                            localStorage.removeItem('token');
                            router.push('/login');
                            return;
                        }
                        const errorText = await res.text();
                        console.error('Profile fetch failed:', res.status, errorText);

                        if (res.status === 404 || res.status === 400) {
                            // Token might be valid but user doesn't exist, or token is invalid (400)
                            localStorage.removeItem('token');
                            router.push('/login');
                            return;
                        }

                        throw new Error(`Failed to fetch profile: ${res.status} ${errorText}`);
                    }

                    const userData = await res.json();

                    // Now fetch public stats for this user
                    try {
                        const statsRes = await fetch(`http://localhost:3001/stats/${userData.username}`);
                        if (statsRes.ok) {
                            const statsData = await statsRes.json();
                            setUser({ ...userData, ...statsData });
                        } else {
                            console.warn('Failed to fetch user stats:', statsRes.status);
                            setUser(userData);
                        }
                    } catch (statsErr) {
                        console.error('Error fetching stats:', statsErr);
                        setUser(userData);
                    }
                } else {
                    // Fetch public profile
                    const res = await fetch(`http://localhost:3001/stats/${username}`);
                    if (!res.ok) {
                        throw new Error('User not found');
                    }
                    const data = await res.json();
                    setUser(data);
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError(err.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, [username, router]);

    if (loading) {
        return (
            <Layout title="Profile">
                <div className="container">
                    <p style={{ textAlign: 'center', padding: '60px' }}>Loading...</p>
                </div>
            </Layout>
        );
    }

    if (error || !user) {
        return (
            <Layout title="Profile">
                <div className="container">
                    <p style={{ textAlign: 'center', padding: '60px', color: '#dc2626' }}>
                        {error || 'User not found'}
                    </p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title={`${user.username} - Profile`}>
            <div className={styles.profileHeader}>
                <div className="container">
                    <div className={styles.avatarLg}>
                        {user.username ? user.username[0].toUpperCase() : '?'}
                    </div>
                    <h1 className={styles.username}>{user.username}</h1>
                    <span className={styles.levelBadge}>Level {user.level || 1}</span>
                </div>
            </div>

            <div className="container">
                <div className={styles.statsGrid}>
                    <div className="card">
                        <h3>XP</h3>
                        <p className={styles.statValue}>{user.xp || 0}</p>
                    </div>
                    <div className="card">
                        <h3>Level</h3>
                        <p className={styles.statValue}>{user.level || 1}</p>
                    </div>
                    <div className="card">
                        <h3>Challenges Solved</h3>
                        <p className={styles.statValue}>{user.challengesSolved || 0}</p>
                    </div>
                    <div className="card">
                        <h3>Total Submissions</h3>
                        <p className={styles.statValue}>{user.totalSubmissions || 0}</p>
                    </div>
                </div>
            </div>

            <div className="container">
                <ContributionGraph data={user.dailyActivity} />
            </div>
        </Layout >
    );
}
