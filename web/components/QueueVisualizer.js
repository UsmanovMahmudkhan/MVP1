import { useState, useEffect, useRef } from 'react';
import styles from '@/styles/Play.module.css';

export default function QueueVisualizer({ initialLine, offers }) {
    const [history, setHistory] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const timerRef = useRef(null);

    // Calculate all steps on mount or when inputs change
    useEffect(() => {
        if (!initialLine || !offers) return;

        const steps = [];
        let currentLine = [...initialLine];

        // Initial state
        steps.push({
            line: [...currentLine],
            description: "Initial Queue",
            highlight: -1,
            offer: null
        });

        offers.forEach((offer, index) => {
            const lastPersonIndex = currentLine.length - 1;

            if (currentLine.length === 0) {
                steps.push({
                    line: [],
                    description: `Offer ${offer}: Queue is empty, no one to swap.`,
                    highlight: -1,
                    offer: offer
                });
                return;
            }

            // Calculate new position
            // If offer > queue size, we still swap with the person at 'offer' position from the end?
            // The problem usually implies: swap the last person with the person at (lastIndex - offer)
            // If offer is 0, no change.

            let targetIndex = lastPersonIndex - offer;

            // Edge case: if targetIndex < 0, usually means they cut to the front or it's invalid?
            // Based on "Line Cutting" usually:
            // "A person from the back of the line cuts 'offer' places forward"

            if (targetIndex < 0) targetIndex = 0; // Cap at front

            const person = currentLine[lastPersonIndex];

            // Remove from back
            const lineAfterRemove = [...currentLine];
            lineAfterRemove.splice(lastPersonIndex, 1);

            // Insert at target
            lineAfterRemove.splice(targetIndex, 0, person);

            currentLine = lineAfterRemove;

            steps.push({
                line: [...currentLine],
                description: `Offer ${offer}: Last person cuts ${offer} spots to position ${targetIndex + 1}.`,
                highlight: targetIndex,
                offer: offer
            });
        });

        setHistory(steps);
        setCurrentStep(0);
        setIsPlaying(false);
    }, [initialLine, offers]);

    useEffect(() => {
        if (isPlaying) {
            timerRef.current = setInterval(() => {
                setCurrentStep(prev => {
                    if (prev < history.length - 1) return prev + 1;
                    setIsPlaying(false);
                    return prev;
                });
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isPlaying, history]);

    const handleStep = (direction) => {
        setIsPlaying(false);
        setCurrentStep(prev => {
            const next = prev + direction;
            return Math.max(0, Math.min(next, history.length - 1));
        });
    };

    if (history.length === 0) return null;

    const currentState = history[currentStep];

    return (
        <div className={styles.visualizer}>
            <div className={styles.visualizerHeader}>
                <h4>Queue Simulation</h4>
                <div className={styles.visualizerControls}>
                    <button onClick={() => setCurrentStep(0)} disabled={currentStep === 0}>⏮</button>
                    <button onClick={() => handleStep(-1)} disabled={currentStep === 0}>◀</button>
                    <button onClick={() => setIsPlaying(!isPlaying)}>
                        {isPlaying ? '⏸' : '▶'}
                    </button>
                    <button onClick={() => handleStep(1)} disabled={currentStep === history.length - 1}>▶</button>
                    <button onClick={() => setCurrentStep(history.length - 1)} disabled={currentStep === history.length - 1}>⏭</button>
                </div>
            </div>

            <div className={styles.visualizerStepInfo}>
                <span>Step {currentStep} / {history.length - 1}</span>
                <p>{currentState.description}</p>
            </div>

            <div className={styles.queueContainer}>
                {currentState.line.length === 0 ? (
                    <div className={styles.emptyQueue}>Queue is Empty</div>
                ) : (
                    currentState.line.map((person, idx) => (
                        <div
                            key={`${person}-${idx}`}
                            className={`${styles.queueItem} ${idx === currentState.highlight ? styles.highlight : ''}`}
                        >
                            {person}
                        </div>
                    ))
                )}
            </div>
            <div className={styles.queueLegend}>
                <span>Front</span>
                <span>Back</span>
            </div>
        </div>
    );
}
