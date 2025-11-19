import Layout from '@/components/Layout';
import styles from '@/styles/Play.module.css';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function Play() {
    const [challenge, setChallenge] = useState(null);
    const [code, setCode] = useState('// Click "Start Challenge" to begin!');
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
    }, []);

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
        } catch (err) {
            console.error(err);
            setOutput('Error generating challenge. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const submitSolution = async () => {
        if (!challenge) return;
        setSubmitting(true);
        setOutput('Running tests...');

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
                setOutput(`Error: ${data.error}`);
            } else {
                if (data.status === 'passed') {
                    setOutput(`✅ Passed!\n\n${JSON.stringify(JSON.parse(data.output), null, 2)}`);
                } else {
                    setOutput(`❌ Failed.\n\n${data.output}`);
                }
            }
        } catch (err) {
            console.error(err);
            setOutput('Error submitting solution.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout title="Web Arena - CodeArena">
            <div className={styles.container}>
                <div className={styles.sidebar}>
                    <div className={styles.controls}>
                        <select value={language} onChange={(e) => setLanguage(e.target.value)} className={styles.select}>
                            <option value="javascript">JavaScript</option>
                            <option value="java">Java</option>
                        </select>
                        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={styles.select}>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                        <button onClick={startChallenge} disabled={loading} className="btn" style={{ width: '100%' }}>
                            {loading ? 'Generating...' : 'New Challenge'}
                        </button>
                    </div>

                    {challenge && (
                        <div className={styles.challengeInfo}>
                            <h2>{challenge.title}</h2>
                            <p className={styles.description}>{challenge.description}</p>
                            <div className={styles.testCases}>
                                <h3>Test Cases</h3>
                                {challenge.testCases.map((tc, i) => (
                                    <div key={i} className={styles.testCase}>
                                        <code>In: {tc.input}</code>
                                        <code>Out: {tc.output}</code>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.editorArea}>
                    <Editor
                        height="60vh"
                        defaultLanguage="javascript"
                        language={language}
                        value={code}
                        onChange={(value) => setCode(value)}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                        }}
                    />

                    <div className={styles.outputArea}>
                        <div className={styles.actionBar}>
                            <span className={styles.label}>Console Output</span>
                            <button onClick={submitSolution} disabled={submitting || !challenge} className="btn">
                                {submitting ? 'Running...' : 'Run Code'}
                            </button>
                        </div>
                        <pre className={styles.output}>{output}</pre>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
