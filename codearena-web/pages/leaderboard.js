import Layout from '@/components/Layout';
import styles from '@/styles/Leaderboard.module.css';
import { useEffect, useState } from 'react';

export default function Leaderboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:3000/stats/leaderboard')
            .then(res => res.json())
            .then(data => {
                setUsers(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch leaderboard:', err);
                setLoading(false);
            });
    }, []);

    return (
        <Layout title="Leaderboard - CodeArena">
            <div className="container">
                <div className={styles.header}>
                    <h1>Leaderboard</h1>
                    <p>Top developers competing for glory.</p>
                </div>

                <div className="card">
                    {loading ? (
                        <p style={{ textAlign: 'center', padding: '20px' }}>Loading...</p>
                    ) : (
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
                                {users.map((user, index) => (
                                    <tr key={user.username}>
                                        <td className={styles.rank}>{index + 1}</td>
                                        <td className={styles.user}>
                                            <div className={styles.avatar}>{user.username[0].toUpperCase()}</div>
                                            {user.username}
                                        </td>
                                        <td>{user.level}</td>
                                        <td className={styles.xp}>{user.xp.toLocaleString()} XP</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </Layout>
    );
}
