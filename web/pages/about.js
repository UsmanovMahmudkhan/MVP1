import Layout from '@/components/Layout';
import styles from '@/styles/About.module.css';
import Link from 'next/link';

export default function About() {
    return (
        <Layout title="About - MVP1">
            <div className={styles.aboutPage}>
                {/* Hero Section */}
                <section className={styles.hero}>
                    <div className="container">
                        <h1 className={styles.heroTitle}>About MVP1</h1>
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
                                MVP1 is proudly developed as part of the <strong>Open-Source Software</strong> course project
                                by <strong>sejong students</strong>. This project demonstrates our commitment to building practical,
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
                                <h3>Developer Empowerment</h3>
                                <p>Providing a robust platform where developers can sharpen their skills through AI-generated challenges tailored to their proficiency level.</p>
                            </div>
                            <div className={styles.featureCard}>
                                <h3>Adaptive AI Learning</h3>
                                <p>Leveraging cutting-edge AI technology to create unique, diverse coding problems that adapt to each user's learning journey.</p>
                            </div>
                            <div className={styles.featureCard}>
                                <h3>Open Source Commitment</h3>
                                <p>Built on open-source principles, fostering collaboration, transparency, and community-driven development.</p>
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
                                <div>
                                    <h4>Dynamic Challenge Generation</h4>
                                    <p>Powered by Google Gemini AI, generating unique coding challenges across multiple difficulty levels and programming languages.</p>
                                </div>
                            </div>
                            <div className={styles.featureItem}>
                                <div>
                                    <h4>Isolated Execution Environment</h4>
                                    <p>Docker-based sandbox environment ensuring safe and isolated code execution for JavaScript and Java.</p>
                                </div>
                            </div>
                            <div className={styles.featureItem}>
                                <div>
                                    <h4>Advanced Coding Interface</h4>
                                    <p>Professional-grade interface with Monaco editor integration for a seamless coding experience.</p>
                                </div>
                            </div>
                            <div className={styles.featureItem}>
                                <div>
                                    <h4>Engagement & Progression</h4>
                                    <p>Comprehensive progression system with XP, levels, and leaderboards to track development milestones.</p>
                                </div>
                            </div>
                            <div className={styles.featureItem}>
                                <div>
                                    <h4>Secure Authentication</h4>
                                    <p>Seamless authentication integration with Google and GitHub for secure access control.</p>
                                </div>
                            </div>
                            <div className={styles.featureItem}>
                                <div>
                                    <h4>Extensible API Architecture</h4>
                                    <p>Robust RESTful API supporting authentication, challenge management, submissions, and statistical analysis.</p>
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
                        <h2 className={styles.sectionTitle}>sejong students</h2>
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
                            Join MVP1 today and challenge yourself with AI-powered coding problems
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
