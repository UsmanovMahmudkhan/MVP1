import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Mentor.module.css';

export default function Mentor() {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [responseText, setResponseText] = useState('');
    const [status, setStatus] = useState('');

    const synthRef = useRef(null);



    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        // Initialize Speech Synthesis only
        if (typeof window !== 'undefined') {
            synthRef.current = window.speechSynthesis;
        }

        // Cleanup function to stop recognition if component unmounts
        return () => {
            if (synthRef.current) {
                synthRef.current.cancel();
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await sendAudioToBackend(audioBlob);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsListening(true);
            setStatus('Listening...');
        } catch (error) {
            console.error('Error accessing microphone:', error);
            setStatus('Microphone access denied or error.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsListening(false);
        }
    };

    const sendAudioToBackend = async (audioBlob) => {
        setIsProcessing(true);
        setStatus('Transcribing & Thinking...');
        setResponseText('');

        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        try {
            const response = await fetch('http://localhost:3000/mentor/chat', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.answer) {
                setResponseText(data.answer);
                speakResponse(data.answer);
            } else {
                setResponseText("I couldn't understand that.");
                setStatus('');
            }
        } catch (error) {
            console.error('Error fetching mentor response:', error);
            setResponseText("Sorry, I'm having trouble connecting to the server.");
            setStatus('Connection Error');
        } finally {
            setIsProcessing(false);
        }
    };

    const speakResponse = (text) => {
        if (!synthRef.current) return;

        // Cancel any current speaking
        synthRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Select a better voice
        const voices = synthRef.current.getVoices();
        const preferredVoice = voices.find(voice =>
            (voice.name.includes('Google') && voice.lang === 'en-US') ||
            (voice.name.includes('Natural') && voice.lang === 'en-US') ||
            (voice.name.includes('Samantha') && voice.lang === 'en-US')
        );

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        // Adjust rate and pitch for a more conversational tone
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
            setIsSpeaking(true);
            setStatus('Speaking...');
        };
        utterance.onend = () => {
            setIsSpeaking(false);
            setStatus('');
        };
        utterance.onerror = () => {
            setIsSpeaking(false);
            setStatus('');
        };

        synthRef.current.speak(utterance);
    };

    const toggleListening = () => {
        if (isListening) {
            stopRecording();
        } else {
            // Stop speaking if currently speaking
            if (isSpeaking) {
                synthRef.current?.cancel();
                setIsSpeaking(false);
            }
            startRecording();
        }
    };

    const handleVoiceInput = async (text) => {
        setIsProcessing(true);
        setStatus('Thinking...');
        setResponseText('');

        try {
            const response = await fetch('http://localhost:3000/mentor/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: text }),
            });

            const data = await response.json();

            if (data.answer) {
                setResponseText(data.answer);
                speakResponse(data.answer);
            } else {
                setResponseText("I couldn't understand that.");
                setStatus('');
            }
        } catch (error) {
            console.error('Error fetching mentor response:', error);
            setResponseText("Sorry, I'm having trouble connecting to the server.");
            setStatus('Connection Error');
        } finally {
            setIsProcessing(false);
        }
    };

    // Determine orb class based on state
    const getOrbClass = () => {
        if (isListening) return `${styles.orbContainer} ${styles.listening}`;
        if (isProcessing) return `${styles.orbContainer} ${styles.processing}`;
        if (isSpeaking) return `${styles.orbContainer} ${styles.speaking}`;
        return styles.orbContainer;
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>CodeArena Mentor</title>
                <meta name="description" content="Your personal AI programming tutor" />
            </Head>

            <Link href="/" className={styles.backLink}>
                ← Back to Home
            </Link>

            <div className={styles.header}>
                <h1 className={styles.title}>Talk to Your Programming Mentor</h1>
                <p className={styles.subtitle}>Ask anything about Java or JavaScript. Just speak.</p>
            </div>

            <div className={getOrbClass()}>
                <div className={styles.orb}></div>
            </div>

            <div className={styles.controls}>
                <button
                    className={`${styles.micButton} ${isListening ? styles.active : ''}`}
                    onClick={toggleListening}
                    aria-label="Toggle Microphone"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" y1="19" x2="12" y2="23"></line>
                        <line x1="8" y1="23" x2="16" y2="23"></line>
                    </svg>
                </button>

                <div className={`${styles.statusText} ${status ? styles.visible : ''}`}>
                    {status}
                </div>
            </div>

            <form
                className={styles.inputForm}
                onSubmit={(e) => {
                    e.preventDefault();
                    const text = e.target.elements.textInput.value;
                    if (text.trim()) {
                        handleVoiceInput(text);
                        e.target.elements.textInput.value = '';
                    }
                }}
            >
                <input
                    type="text"
                    name="textInput"
                    placeholder="Or type your question here..."
                    className={styles.textInput}
                    disabled={isProcessing || isListening}
                />
                <button
                    type="submit"
                    className={styles.sendButton}
                    disabled={isProcessing || isListening}
                >
                    Send
                </button>
            </form>

            <div className={styles.responseContainer}>
                <p className={`${styles.responseText} ${responseText ? styles.visible : ''}`}>
                    {responseText}
                </p>
            </div>
        </div>
    );
}
