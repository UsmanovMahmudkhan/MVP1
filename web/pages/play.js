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
    const [topic, setTopic] = useState('');
    const [isDemo, setIsDemo] = useState(false);
    
    // Available topics for selection
    const availableTopics = [
        { value: '', label: 'Random Topic' },
        { value: 'array manipulation', label: 'Array Manipulation' },
        { value: 'string processing', label: 'String Processing' },
        { value: 'hash map usage', label: 'Hash Maps' },
        { value: 'two pointers', label: 'Two Pointers' },
        { value: 'sliding window', label: 'Sliding Window' },
        { value: 'binary search', label: 'Binary Search' },
        { value: 'recursion', label: 'Recursion' },
        { value: 'dynamic programming', label: 'Dynamic Programming' },
        { value: 'stack operations', label: 'Stack Operations' },
        { value: 'queue operations', label: 'Queue Operations' },
        { value: 'linked list', label: 'Linked Lists' },
        { value: 'tree traversal', label: 'Tree Traversal' },
        { value: 'graph algorithms', label: 'Graph Algorithms' },
        { value: 'sorting algorithms', label: 'Sorting Algorithms' },
        { value: 'mathematical computation', label: 'Mathematical Computation' },
        { value: 'bit manipulation', label: 'Bit Manipulation' },
        { value: 'greedy algorithms', label: 'Greedy Algorithms' },
        { value: 'backtracking', label: 'Backtracking' }
    ];
    const [aiAssistance, setAiAssistance] = useState(null);
    const [loadingAssistance, setLoadingAssistance] = useState(false);
    const [showAssistance, setShowAssistance] = useState(false);
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
            const token = localStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const res = await fetch('http://localhost:3001/challenges/generate', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ difficulty, language, topic: topic || undefined })
            });
            
            
            // Parse JSON response safely
            let data;
            try {
                const text = await res.text();
                data = text ? JSON.parse(text) : {};
            } catch (parseError) {
                console.error('Failed to parse response:', parseError);
                throw new Error(`Invalid response from server. Status: ${res.status}`);
            }
            
            
            // Check if response is successful before setting challenge
            if (!res.ok) {
                // Handle quota errors specially
                if (res.status === 503 && (data.error === 'API quota exceeded' || data.error === 'API key not configured')) {
                    throw new Error(`⚠️ ${data.message}\n\n${data.suggestion || ''}`);
                }
                // Handle authentication errors
                if (res.status === 401 || (data.message && data.message.includes('authentication'))) {
                    throw new Error(`🔑 Authentication Error: ${data.message || data.error || 'API key authentication failed. Please contact the administrator.'}`);
                }
                throw new Error(data.message || data.error || 'Failed to generate challenge');
            }
            
            // Only set challenge if response is successful
            setChallenge(data);
            setCode(data.template || '// Your code here');
            setOutput('Challenge loaded. Ready to code!');
        } catch (err) {
            console.error('Challenge generation error:', err);
            // Extract error message - handle both Error objects and plain strings
            let errorMsg = 'Failed to generate challenge. Please try again.';
            if (err instanceof Error) {
                errorMsg = err.message;
            } else if (typeof err === 'string') {
                errorMsg = err;
            } else if (err && err.message) {
                errorMsg = err.message;
            }
            
            // Display error in output area
            setOutput(`❌ Error: ${errorMsg}\n\n💡 Tip: You can use the "Load Line Cutting Demo" button to try a demo challenge.`);
            // Clear challenge state on error so UI doesn't try to render invalid data
            setChallenge(null);
            setCode('// Start a new challenge to begin coding!');
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
            const res = await fetch('http://localhost:3001/submissions', {
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

            
            // Parse JSON response safely
            let data;
            try {
                const text = await res.text();
                data = text ? JSON.parse(text) : {};
            } catch (parseError) {
                console.error('Failed to parse response:', parseError);
                throw new Error(`Invalid response from server. Status: ${res.status}`);
            }
            
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
            console.error('Challenge generation error:', err);
            // Extract error message - handle both Error objects and plain strings
            let errorMsg = 'Failed to generate challenge. Please try again.';
            if (err instanceof Error) {
                errorMsg = err.message;
            } else if (typeof err === 'string') {
                errorMsg = err;
            } else if (err && err.message) {
                errorMsg = err.message;
            }
            
            // Display error in output area
            setOutput(`❌ Error: ${errorMsg}\n\n💡 Tip: You can use the "Load Line Cutting Demo" button to try a demo challenge.`);
            // Clear challenge state on error so UI doesn't try to render invalid data
            setChallenge(null);
            setCode('// Start a new challenge to begin coding!');
        } finally {
            setSubmitting(false);
        }
    };

    const getAIAssistance = async () => {
        if (!challenge) {
            setOutput('Please start a challenge first.');
            return;
        }

        // Check if it's a demo challenge (no ID means it's not saved in database)
        if (isDemo || !challenge.id || challenge.id === 'demo-line-cutting') {
            setAiAssistance({
                error: 'AI assistance is not available for demo challenges. Please generate a new challenge to use AI help.',
                topicsToLearn: ['Array manipulation', 'Queue operations', 'Algorithm design'],
                youtubeVideos: [
                    {
                        title: 'Learn Array Manipulation',
                        url: 'https://www.youtube.com/results?search_query=array+manipulation+' + language + '+tutorial',
                        description: 'Educational videos about array manipulation'
                    }
                ],
                hints: [
                    'Think about how to manipulate array elements',
                    'Consider using array methods like splice or slice',
                    'Remember that array indices start at 0'
                ],
                learningPath: 'This demo challenge focuses on array manipulation and queue operations. Practice with array methods and understand how to move elements within arrays.'
            });
            setShowAssistance(true);
            return;
        }

        setLoadingAssistance(true);
        setShowAssistance(true);
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const res = await fetch('http://localhost:3001/challenges/assistance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    challengeId: challenge.id,
                    userCode: code,
                    language: language,
                    topic: challenge.topic || ''
                })
            });

            let data;
            try {
                const text = await res.text();
                data = text ? JSON.parse(text) : {};
            } catch (parseError) {
                console.error('Failed to parse response:', parseError);
                throw new Error(`Invalid response from server. Status: ${res.status}`);
            }

            if (!res.ok) {
                // Handle authentication errors
                if (res.status === 401 || res.status === 400) {
                    // Token is invalid or expired, redirect to login
                    localStorage.removeItem('token');
                    router.push('/login');
                    return;
                }
                throw new Error(data.message || data.error || 'Failed to get AI assistance');
            }

            setAiAssistance(data);
        } catch (err) {
            console.error('AI assistance error:', err);
            const errorMsg = err instanceof Error ? err.message : 'Failed to get AI assistance';
            
            // Check if it's an authentication error
            if (errorMsg.includes('token') || errorMsg.includes('Invalid token') || errorMsg.includes('Access denied')) {
                localStorage.removeItem('token');
                router.push('/login');
                return;
            }
            
            setAiAssistance({
                error: errorMsg,
                topicsToLearn: [],
                youtubeVideos: [],
                hints: [],
                learningPath: 'Unable to load AI assistance at this time.'
            });
        } finally {
            setLoadingAssistance(false);
        }
    };

    return (
        <Layout title="Web Arena - MVP1">
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
                            <select
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className={styles.select}
                                title="Select a specific topic or leave as 'Random Topic' for variety"
                            >
                                {availableTopics.map((t) => (
                                    <option key={t.value} value={t.value}>
                                        {t.label}
                                    </option>
                                ))}
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
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <div>
                                            <h3 className={styles.challengeTitle}>{challenge.title}</h3>
                                            <span className={styles.badge}>{isDemo ? 'Demo' : difficulty}</span>
                                        </div>
                                        <button
                                            onClick={getAIAssistance}
                                            disabled={loadingAssistance}
                                            className={styles.aiHelpButton}
                                            title="Get AI assistance with learning resources and hints"
                                        >
                                            {loadingAssistance ? 'Loading...' : 'AI Help'}
                                        </button>
                                    </div>
                                    <div className={styles.challengeDescription}>
                                        {challenge.description}
                                    </div>

                                    {/* AI Assistance Panel */}
                                    {showAssistance && (
                                        <div className={styles.aiAssistancePanel}>
                                            {loadingAssistance ? (
                                                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                    Analyzing challenge and preparing guidance...
                                                </div>
                                            ) : aiAssistance ? (
                                                <div>
                                                    {aiAssistance.error ? (
                                                        <div style={{ padding: '12px', background: 'rgba(255, 0, 0, 0.1)', borderRadius: '6px', color: 'var(--text-primary)', marginBottom: '16px' }}>
                                                            {aiAssistance.error}
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {/* Learning Path */}
                                                            {aiAssistance.learningPath && (
                                                                <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                                                    <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>Learning Path</h4>
                                                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                                                        {aiAssistance.learningPath}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {/* Topics to Learn */}
                                                            {aiAssistance.topicsToLearn && aiAssistance.topicsToLearn.length > 0 && (
                                                                <div style={{ marginBottom: '20px' }}>
                                                                    <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                                        Topics to Learn
                                                                    </h4>
                                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                                        {aiAssistance.topicsToLearn.map((topic, idx) => (
                                                                            <span
                                                                                key={idx}
                                                                                style={{
                                                                                    fontSize: '11px',
                                                                                    padding: '6px 12px',
                                                                                    background: 'rgba(255, 255, 255, 0.08)',
                                                                                    borderRadius: '12px',
                                                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                                                    color: 'var(--text-primary)'
                                                                                }}
                                                                            >
                                                                                {topic}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* YouTube Videos */}
                                                            {aiAssistance.youtubeVideos && aiAssistance.youtubeVideos.length > 0 && (
                                                                <div style={{ marginBottom: '20px' }}>
                                                                    <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                                        Recommended Videos
                                                                    </h4>
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                                        {aiAssistance.youtubeVideos.map((video, idx) => (
                                                                            <a
                                                                                key={idx}
                                                                                href={video.url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                style={{
                                                                                    display: 'block',
                                                                                    padding: '10px',
                                                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                                                    borderRadius: '6px',
                                                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                                                    textDecoration: 'none',
                                                                                    transition: 'all 0.2s',
                                                                                    fontSize: '12px'
                                                                                }}
                                                                                onMouseEnter={(e) => {
                                                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                                                                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                                                                                }}
                                                                                onMouseLeave={(e) => {
                                                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                                                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                                                                }}
                                                                            >
                                                                                <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                                                                    {video.title}
                                                                                </div>
                                                                                {video.description && (
                                                                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                                                                        {video.description}
                                                                                    </div>
                                                                                )}
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Hints */}
                                                            {aiAssistance.hints && aiAssistance.hints.length > 0 && (
                                                                <div>
                                                                    <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                                        Progressive Hints
                                                                    </h4>
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                        {aiAssistance.hints.map((hint, idx) => (
                                                                            <div
                                                                                key={idx}
                                                                                style={{
                                                                                    padding: '10px',
                                                                                    background: 'rgba(255, 255, 255, 0.03)',
                                                                                    borderRadius: '6px',
                                                                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                                                                    fontSize: '12px',
                                                                                    color: 'var(--text-secondary)',
                                                                                    lineHeight: '1.5',
                                                                                    position: 'relative',
                                                                                    paddingLeft: '28px'
                                                                                }}
                                                                            >
                                                                                <span style={{
                                                                                    position: 'absolute',
                                                                                    left: '10px',
                                                                                    fontSize: '14px',
                                                                                    fontWeight: '600',
                                                                                    color: 'rgba(59, 130, 246, 0.8)'
                                                                                }}>
                                                                                    {idx + 1}
                                                                                </span>
                                                                                {hint}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => setShowAssistance(false)}
                                                        style={{
                                                            marginTop: '16px',
                                                            width: '100%',
                                                            padding: '8px',
                                                            background: 'rgba(255, 255, 255, 0.05)',
                                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                                            borderRadius: '6px',
                                                            color: 'var(--text-secondary)',
                                                            cursor: 'pointer',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        Close Assistance
                                                    </button>
                                                </div>
                                            ) : null}
                                        </div>
                                    )}

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
