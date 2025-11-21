import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
    return (
        <nav className={`${styles.nav} glass`}>
            <div className="container">
                <div className={styles.content}>
                    <Link href="/" className={styles.logo}>
                        CodeArena
                    </Link>
                    <div className={styles.links}>
                        <Link href="/play" className={styles.link}>
                            Play
                        </Link>
                        <Link href="/leaderboard" className={styles.link}>
                            Leaderboard
                        </Link>
                        <Link href="/mentor" className={styles.link}>
                            Mentor
                        </Link>
                        <Link href="/about" className={styles.link}>
                            About
                        </Link>
                        <Link href="/profile/me" className={styles.link}>
                            Profile
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
