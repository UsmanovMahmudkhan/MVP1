import Layout from '@/components/Layout';
import styles from '@/styles/Profile.module.css';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Profile() {
    const router = useRouter();
    const { username } = router.query;
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!username) return;

        fetch(`http://localhost:3000/stats/${username}`)
            .then(res => {
                if (!res.ok) throw new Error('User not found');
                return res.json();
            })
            .then(data => {
                setUser(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [username]);

    if (loading) return <Layout><div className="container"><p style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</p></div></Layout>;
    if (error) return <Layout><div className="container"><p style={{ textAlign: 'center', marginTop: '100px', color: 'red' }}>{error}</p></div></Layout>;

    return (
        <Layout title={`${user.username} - CodeArena`}>
            <div className={styles.profileHeader}>
                <div className={styles.avatarLg}>{user.username[0].toUpperCase()}</div>
                <h1 className={styles.username}>{user.username}</h1>
                <div className={styles.levelBadge}>Level {user.level}</div>
            </div>

            <div className="container">
                <div className={styles.statsGrid}>
                    <div className="card">
                        <h3>XP</h3>
                        <p className={styles.statValue}>{user.xp.toLocaleString()}</p>
                    </div>
                    <div className="card">
                        <h3>Challenges Solved</h3>
                        <p className={styles.statValue}>{user.challengesSolved}</p>
                    </div>
                    <div className="card">
                        <h3>Total Submissions</h3>
                        <p className={styles.statValue}>{user.totalSubmissions}</p>
                    </div>
                    <div className="card">
                        <h3>Passed</h3>
                        <p className={styles.statValue}>{user.passedSubmissions}</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
