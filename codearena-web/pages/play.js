import Layout from '@/components/Layout';
import styles from '@/styles/Play.module.css';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function Play() {
    const [challenge, setChallenge] = useState(null);
    const [code, setCode] = useState('// Start a new challenge to begin coding!');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [language, setLanguage] = useState('javascript');
    const [difficulty, setDifficulty] = useState('easy');
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    const startChallenge = async () => {
        setLoading(true);
        setOutput('');
        try {
            const res = await fetch('http://localhost:3000/challenges/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ difficulty, language })
            });
            const data = await res.json();
            setChallenge(data);
            setCode(data.template);
            setOutput('Challenge loaded. Ready to code!');
        } catch (err) {
            console.error(err);
            setOutput('⚠️ Error generating challenge. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const submitSolution = async () => {
        if (!challenge) return;
        setSubmitting(true);
        setOutput('⚡ Running tests...');

        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const res = await fetch('http://localhost:3000/submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    challengeId: challenge.id,
                    code,
                    language
                })
            });

            const data = await res.json();
            if (data.error) {
                setOutput(`❌ Error: ${data.error}`);
            } else {
                if (data.status === 'passed') {
                    setOutput(`✅ All tests passed!\n\n${JSON.stringify(JSON.parse(data.output), null, 2)}`);
                } else {
                    setOutput(`❌ Tests failed.\n\n${data.output}`);
                }
            }
        } catch (err) {
            console.error(err);
            setOutput('❌ Error submitting solution.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout title="Web Arena - CodeArena">
            <div className={styles.arena}>
                <div className="container">
                    <div className={styles.header}>
                        <h1 className={styles.title}>Web Arena</h1>
                        <p className={styles.subtitle}>Your coding battlefield awaits</p>
                    </div>

                    {/* Toolbar */}
                    <div className={styles.toolbar}>
                        <div className={styles.controls}>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className={styles.select}
                            >
                                <option value="javascript">JavaScript</option>
                                <option value="java">Java</option>
                            </select>
                            <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className={styles.select}
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                        <button
                            onClick={startChallenge}
                            disabled={loading}
                            className="btn btn-primary"
                        >
                            {loading ? '⚡ Generating...' : '🎯 New Challenge'}
                        </button>
                    </div>

                    {/* Main Layout */}
                    <div className={styles.layout}>
                        {/* Editor Panel */}
                        <div className={styles.editorPanel}>
                            <div className={styles.editorHeader}>
                                <span className={styles.editorTitle}>Code Editor</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                    {language === 'javascript' ? 'JS' : 'JAVA'}
                                </span>
                            </div>
                            <div className={styles.editorContainer}>
                                <Editor
                                    height="100%"
                                    defaultLanguage="javascript"
                                    language={language}
                                    value={code}
                                    onChange={(value) => setCode(value || '')}
                                    theme="vs-dark"
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        fontFamily: 'Monaco, Menlo, monospace',
                                        lineNumbers: 'on',
                                        roundedSelection: true,
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className={styles.sidebar}>
                            {/* Challenge Info */}
                            {challenge ? (
                                <div className={styles.challengePanel}>
                                    <h3 className={styles.challengeTitle}>{challenge.title}</h3>
                                    <span className={styles.badge}>{difficulty}</span>
                                    <p className={styles.challengeDescription}>{challenge.description}</p>

                                    {challenge.testCases && challenge.testCases.length > 0 && (
                                        <div style={{ marginTop: '16px' }}>
                                            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                                                Test Cases
                                            </h4>
                                            {challenge.testCases.slice(0, 3).map((tc, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        fontSize: '12px',
                                                        fontFamily: 'Monaco, monospace',
                                                        padding: '8px 12px',
                                                        background: 'var(--midnight-light)',
                                                        borderRadius: '6px',
                                                        marginBottom: '6px',
                                                        border: '1px solid var(--glass-border)'
                                                    }}
                                                >
                                                    <div style={{ color: 'var(--cyber-cyan)' }}>Input: {tc.input}</div>
                                                    <div style={{ color: 'var(--text-secondary)' }}>Output: {tc.output}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className={styles.challengePanel}>
                                    <h3 className={styles.challengeTitle}>No Challenge</h3>
                                    <p className={styles.challengeDescription}>
                                        Click "New Challenge" to generate an AI-powered coding problem.
                                    </p>
                                </div>
                            )}

                            {/* Run Button */}
                            <button
                                onClick={submitSolution}
                                disabled={submitting || !challenge}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '16px' }}
                            >
                                {submitting ? '⚡ Running...' : '▶ Run Code'}
                            </button>
                        </div>
                    </div>

                    {/* Console Output */}
                    <div className={styles.consolePanel}>
                        <div className={styles.consoleHeader}>Console Output</div>
                        <div className={styles.consoleOutput}>
                            {output ? (
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                    {output}
                                </pre>
                            ) : (
                                <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                    Output will appear here...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
