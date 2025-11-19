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
            <main>{children}</main>
            <footer style={{ textAlign: 'center', padding: '40px 0', fontSize: '12px', color: '#86868b' }}>
                <div className="container">
                    Copyright © {new Date().getFullYear()} CodeArena. All rights reserved.
                </div>
            </footer>
        </>
    );
}
