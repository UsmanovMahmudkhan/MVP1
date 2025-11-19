import Layout from '@/components/Layout';
import styles from '@/styles/About.module.css';
import Link from 'next/link';

export default function About() {
    return (
        <Layout title="About - CodeArena">
            <div className={styles.aboutPage}>
                {/* Hero Section */}
                <section className={styles.hero}>
                    <div className="container">
                        <h1 className={styles.heroTitle}>About CodeArena</h1>
                        <p className={styles.heroSubtitle}>
                            An AI-powered coding platform built for developers, by developers
                        </p>
                    </div>
                </section>

                {/* Project Info */}
                <section className={styles.section}>
                    <div className="container">
                        <div className={styles.card}>
                            <div className={styles.badge}>Open Source Project</div>
                            <h2 className={styles.sectionTitle}>Academic Project</h2>
                            <p className={styles.text}>
                                CodeArena is proudly developed as part of the <strong>Open-Source Software</strong> course project
                                by <strong>Group 15</strong>. This project demonstrates our commitment to building practical,
                                real-world applications while embracing the principles of open-source development and collaborative coding.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Mission */}
                <section className={styles.section}>
                    <div className="container">
                        <h2 className={styles.sectionTitle}>Our Mission</h2>
                        <div className={styles.grid}>
                            <div className={styles.featureCard}>
                                <div className={styles.icon}>🎯</div>
                                <h3>Empower Developers</h3>
                                <p>Provide a platform where developers can sharpen their skills through AI-generated challenges tailored to their level.</p>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.icon}>🤖</div>
                                <h3>AI-Powered Learning</h3>
                                <p>Leverage cutting-edge AI technology to create unique, diverse coding problems that adapt to each user's journey.</p>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.icon}>🌐</div>
                                <h3>Open Source First</h3>
                                <p>Built on open-source principles, encouraging collaboration, transparency, and community-driven development.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className={styles.section}>
                    <div className="container">
                        <h2 className={styles.sectionTitle}>Platform Features</h2>
                        <div className={styles.featuresList}>
                            <div className={styles.featureItem}>
                                <div className={styles.featureIcon}>⚡</div>
                                <div>
                                    <h4>AI Challenge Generation</h4>
                                    <p>Powered by Google Gemini AI, generating unique coding challenges across multiple difficulty levels and programming languages.</p>
                                </div>
                            </div>
                            <div className={styles.featureItem}>
                                <div className={styles.featureIcon}>🔒</div>
                                <div>
                                    <h4>Secure Code Execution</h4>
                                    <p>Docker-based sandbox environment ensuring safe and isolated code execution for JavaScript and Java.</p>
                                </div>
                            </div>
                            <div className={styles.featureItem}>
                                <div className={styles.featureIcon}>🎨</div>
                                <div>
                                    <h4>Modern Web Arena</h4>
                                    <p>Futuristic, cyber-themed interface with Monaco editor integration for a premium coding experience.</p>
                                </div>
                            </div>
                            <div className={styles.featureItem}>
                                <div className={styles.featureIcon}>🏆</div>
                                <div>
                                    <h4>Gamification System</h4>
                                    <p>XP, levels, badges, daily streaks, and leaderboards to keep developers motivated and engaged.</p>
                                </div>
                            </div>
                            <div className={styles.featureItem}>
                                <div className={styles.featureIcon}>🔐</div>
                                <div>
                                    <h4>OAuth Integration</h4>
                                    <p>Seamless authentication with Google and GitHub for quick and secure access.</p>
                                </div>
                            </div>
                            <div className={styles.featureItem}>
                                <div className={styles.featureIcon}>📊</div>
                                <div>
                                    <h4>Comprehensive API</h4>
                                    <p>20+ RESTful endpoints supporting authentication, challenges, submissions, stats, and more.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tech Stack */}
                <section className={styles.section}>
                    <div className="container">
                        <h2 className={styles.sectionTitle}>Technology Stack</h2>
                        <div className={styles.techGrid}>
                            <div className={styles.techCard}>
                                <h4>Frontend</h4>
                                <ul>
                                    <li>Next.js 16</li>
                                    <li>React</li>
                                    <li>Monaco Editor</li>
                                    <li>CSS Modules</li>
                                </ul>
                            </div>
                            <div className={styles.techCard}>
                                <h4>Backend</h4>
                                <ul>
                                    <li>Node.js</li>
                                    <li>Express.js</li>
                                    <li>Sequelize ORM</li>
                                    <li>Passport.js</li>
                                </ul>
                            </div>
                            <div className={styles.techCard}>
                                <h4>Database</h4>
                                <ul>
                                    <li>PostgreSQL</li>
                                    <li>Docker Compose</li>
                                </ul>
                            </div>
                            <div className={styles.techCard}>
                                <h4>AI & Tools</h4>
                                <ul>
                                    <li>Google Gemini AI</li>
                                    <li>Docker Sandbox</li>
                                    <li>JWT Auth</li>
                                    <li>OAuth 2.0</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Team */}
                <section className={styles.section}>
                    <div className="container">
                        <h2 className={styles.sectionTitle}>Group 15</h2>
                        <div className={styles.card}>
                            <p className={styles.text}>
                                This project represents the collaborative effort of our team in the Open-Source Software course.
                                We've combined our skills in full-stack development, AI integration, DevOps, and UI/UX design
                                to create a comprehensive coding platform that serves both educational and practical purposes.
                            </p>
                            <p className={styles.text}>
                                Through this project, we've gained hands-on experience with modern web technologies,
                                cloud infrastructure, API design, database management, and the principles of open-source development.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className={styles.ctaSection}>
                    <div className="container">
                        <h2 className={styles.ctaTitle}>Ready to Start Coding?</h2>
                        <p className={styles.ctaText}>
                            Join CodeArena today and challenge yourself with AI-powered coding problems
                        </p>
                        <div className={styles.ctaButtons}>
                            <Link href="/register" className="btn btn-primary">
                                Get Started
                            </Link>
                            <Link href="/play" className="btn-outline">
                                Try Web Arena
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}
