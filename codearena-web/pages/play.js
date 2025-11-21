import Layout from '@/components/Layout';
import styles from '@/styles/Play.module.css';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import QueueVisualizer from '@/components/QueueVisualizer';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function Play() {
    const [challenge, setChallenge] = useState(null);
    const [code, setCode] = useState('// Start a new challenge to begin coding!');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [language, setLanguage] = useState('javascript');
    const [difficulty, setDifficulty] = useState('easy');
    const [isDemo, setIsDemo] = useState(false);
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
        setIsDemo(false);
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
            setOutput('Error generating challenge. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const loadDemoChallenge = () => {
        setIsDemo(true);
        setChallenge({
            id: 'demo-line-cutting',
            title: 'Line Cutting Service',
            description: `Implement a function that simulates a queue where people can cut in line based on specific offers.
            
**Rules:**
1. You are given an initial queue of people (array of strings).
2. You are given an array of "offers" (integers).
3. Each offer represents how many spots the **current last person** in the queue can move forward.
4. If the offer is 0, the person stays at the end.
5. If the offer is greater than the number of people ahead, they move to the front (index 0).
6. **Crucial:** The offer always applies to the person who is *currently* at the last position after all previous offers have been processed.

**Edge Cases:**
- If the queue is empty, return an empty array.
- If the offers array is empty, return the original queue.
- If an offer is larger than the queue size, the person moves to the front.

**Example:**
Queue: ["A", "B", "C"]
Offers: [1, 0]

1. Offer 1: Last person ("C") moves 1 spot forward.
   Queue becomes: ["A", "C", "B"]
2. Offer 0: Last person ("B") moves 0 spots.
   Queue remains: ["A", "C", "B"]

Return: ["A", "C", "B"]`,
            testCases: [
                { input: JSON.stringify([["A", "B", "C"], [1]]), output: JSON.stringify(["A", "C", "B"]) },
                { input: JSON.stringify([["A", "B", "C"], [1, 0]]), output: JSON.stringify(["A", "C", "B"]) },
                { input: JSON.stringify([["A", "B", "C", "D"], [2, 1]]), output: JSON.stringify(["A", "D", "C", "B"]) },
                { input: JSON.stringify([[], [1]]), output: JSON.stringify([]) },
                { input: JSON.stringify([["A"], [5]]), output: JSON.stringify(["A"]) }
            ]
        });
        setCode(`function solution(line, offers) {
  // Your code here
  if (!line || line.length === 0) return [];
  
  let currentLine = [...line];
  
  for (let i = 0; i < offers.length; i++) {
    const offer = offers[i];
    if (currentLine.length === 0) break;
    
    const lastPersonIndex = currentLine.length - 1;
    const person = currentLine[lastPersonIndex];
    
    // Calculate new position
    // Ensure we don't go below index 0
    let newIndex = lastPersonIndex - offer;
    if (newIndex < 0) newIndex = 0;
    
    // Remove from back
    currentLine.splice(lastPersonIndex, 1);
    
    // Insert at new position
    currentLine.splice(newIndex, 0, person);
  }
  
  return currentLine;
}`);
        setOutput('Demo Challenge Loaded: Line Cutting Service');
    };

    const submitSolution = async () => {
        if (!challenge) return;
        setSubmitting(true);
        setOutput('Running tests...');

        // If Demo, run locally for quick feedback (optional, but good for "Demo")
        // But to keep it consistent with the "Run" fix, we'll send it to the server
        // However, the server might not know how to validate "demo-line-cutting" if it expects DB IDs.
        // So for the Demo, we might need a special handling or just rely on the generic execution if the server supports it.
        // Actually, the server expects a challengeId to fetch test cases from DB.
        // So for this Demo, we should probably run it client-side or mock the server response.

        if (isDemo) {
            // Client-side execution for Demo
            try {
                // Safe eval wrapper
                const userCode = code + `
                return solution(args[0], args[1]);
                `;

                const results = [];
                let allPassed = true;

                challenge.testCases.forEach(tc => {
                    try {
                        const args = JSON.parse(tc.input); // Array of arguments [line, offers]
                        // We need to construct a function from the user code
                        // This is a bit hacky for client-side, but works for simple demos
                        // Better: use the same server endpoint but pass test cases? 
                        // The current server endpoint expects challengeId.
                        // Let's just simulate it for now to show the UI features.

                        // Simple client-side eval for the demo
                        const func = new Function('args', userCode);
                        const result = func(args);
                        const actual = JSON.stringify(result);
                        const expected = tc.output;
                        const passed = actual === expected;

                        if (!passed) allPassed = false;
                        results.push({
                            input: tc.input,
                            expected,
                            actual,
                            passed
                        });
                    } catch (e) {
                        allPassed = false;
                        results.push({
                            input: tc.input,
                            expected: tc.output,
                            actual: e.message,
                            passed: false
                        });
                    }
                });

                if (allPassed) {
                    setOutput(`All tests passed!\n\n${JSON.stringify(results, null, 2)}`);
                } else {
                    setOutput(`Tests failed.\n\n${JSON.stringify(results, null, 2)}`);
                }
            } catch (e) {
                setOutput(`Error: ${e.message}`);
            }
            setSubmitting(false);
            return;
        }

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
                    setOutput(`All tests passed!\n\n${JSON.stringify(JSON.parse(data.output), null, 2)}`);
                } else {
                    setOutput(`Tests failed.\n\n${data.output}`);
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
            <div className={styles.arena}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <div>
                            <h1 className={styles.title}>Web Arena</h1>
                            <p className={styles.subtitle}>Your coding workspace</p>
                        </div>
                        <button
                            onClick={loadDemoChallenge}
                            className={styles.demoButton}
                        >
                            Load Line Cutting Demo
                        </button>
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
                            {loading ? 'Generating...' : 'New Challenge'}
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
                                        fontFamily: 'SF Mono, Menlo, monospace',
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
                                    <span className={styles.badge}>{isDemo ? 'Demo' : difficulty}</span>
                                    <div className={styles.challengeDescription}>
                                        {challenge.description}
                                    </div>

                                    {isDemo && (
                                        <div className={styles.visualizerSection}>
                                            <QueueVisualizer
                                                initialLine={["A", "B", "C", "D", "E"]}
                                                offers={[2, 1, 0, 5]}
                                            />
                                        </div>
                                    )}

                                    {challenge.testCases && challenge.testCases.length > 0 && (
                                        <div style={{ marginTop: '24px' }}>
                                            <h4 style={{ fontSize: '12px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Test Cases
                                            </h4>
                                            {challenge.testCases.slice(0, 3).map((tc, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        fontSize: '12px',
                                                        fontFamily: 'SF Mono, monospace',
                                                        padding: '12px',
                                                        background: 'rgba(255, 255, 255, 0.03)',
                                                        borderRadius: '6px',
                                                        marginBottom: '8px',
                                                        border: '1px solid rgba(255, 255, 255, 0.05)'
                                                    }}
                                                >
                                                    <div style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>Input: {tc.input}</div>
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
                                        Click "New Challenge" to generate an AI-powered coding problem, or "Load Line Cutting Demo" to see the new visualization features.
                                    </p>
                                </div>
                            )}

                            {/* Run Button */}
                            <button
                                onClick={submitSolution}
                                disabled={submitting || !challenge}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '12px', flex: '0 0 auto' }}
                            >
                                {submitting ? 'Running...' : 'Run Code'}
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
