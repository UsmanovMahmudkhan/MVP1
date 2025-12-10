import Layout from '@/components/Layout';
import styles from '@/styles/Leaderboard.module.css';
import { useEffect, useState } from 'react';

export default function Leaderboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                const res = await fetch('http://localhost:3001/stats/leaderboard');
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();

                // Ensure data is an array
                if (Array.isArray(data)) {
                    setUsers(data);
                } else {
                    console.error('Leaderboard data is not an array:', data);
                    setError('Invalid leaderboard data');
                    setUsers([]);
                }
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
                setError('Failed to load leaderboard');
                setUsers([]);
            } finally {
                setLoading(false);
            }
        }
        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <Layout title="Leaderboard - CodeArena">
                <div className="container">
                    <div className={styles.header}>
                        <h1 className={styles.title}>Leaderboard</h1>
                        <p className={styles.subtitle}>Top performers</p>
                    </div>
                    <p style={{ textAlign: 'center', padding: '40px' }}>Loading...</p>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title="Leaderboard - CodeArena">
                <div className="container">
                    <div className={styles.header}>
                        <h1 className={styles.title}>Leaderboard</h1>
                        <p className={styles.subtitle}>Top performers</p>
                    </div>
                    <p style={{ textAlign: 'center', padding: '40px', color: '#dc2626' }}>{error}</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Leaderboard - CodeArena">
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.title}>Leaderboard</h1>
                    <p className={styles.subtitle}>Top performers</p>
                </div>

                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>User</th>
                            <th>Level</th>
                            <th>XP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                                    No users yet. Be the first to solve a challenge!
                                </td>
                            </tr>
                        ) : (
                            users.map((user, index) => (
                                <tr key={user.username || index}>
                                    <td className={styles.rank}>{index + 1}</td>
                                    <td className={styles.username}>{user.username}</td>
                                    <td className={styles.level}>Level {user.level}</td>
                                    <td className={styles.xp}>{user.xp} XP</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
}
