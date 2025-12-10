import Navbar from './Navbar';
import Head from 'next/head';

export default function Layout({ children, title = 'CodeArena' }) {
    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <Navbar />
            <main style={{ position: 'relative', zIndex: 1 }}>{children}</main>
            <footer style={{
                textAlign: 'center',
                padding: 'var(--spacing-2xl) 0',
                fontSize: '14px',
                color: 'var(--text-muted)',
                borderTop: '1px solid var(--glass-border)',
                marginTop: 'var(--spacing-3xl)',
                background: 'var(--bg-secondary)'
            }}>
                <div className="container">
                    Copyright © {new Date().getFullYear()} CodeArena. All rights reserved.
                </div>
            </footer>
        </>
    );
}
