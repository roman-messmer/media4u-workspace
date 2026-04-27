// src/components/ui/ConsoleSmsTextbild.jsx
import React, { useState, useEffect, useCallback } from 'react';
import "./console_sms_textbild.css";

// SVG-Icons
import ArrowBackIcon from '../../icons/arrow_back.svg';
import ReplayIcon from '../../icons/replay.svg';
import ArrowForwardIcon from '../../icons/arrow_forward.svg';

const ConsoleSmsTextbild = ({ displayRef }) => {
    const [currentFrame, setCurrentFrame] = useState(0);
    const [totalFrames, setTotalFrames] = useState(0);

    // Initialisiert die Anzahl der Frames, sobald die Referenz (displayRef) geladen ist
    useEffect(() => {
        if (displayRef?.current) {
            const frames = displayRef.current.querySelectorAll('.frame');
            setTotalFrames(frames.length);
        }
    }, [displayRef]);

    // Side-Effect: Steuert die .show Klasse sicher und getrennt vom Render-Zyklus
    useEffect(() => {
        if (displayRef?.current) {
            const frames = displayRef.current.querySelectorAll('.frame');
            frames.forEach((frame, index) => {
                if (index === currentFrame) {
                    frame.classList.add('show');
                } else {
                    frame.classList.remove('show');
                }
            });
        }
    }, [currentFrame, displayRef]);

    const handleNext = useCallback(() => {
        setCurrentFrame((prev) => Math.min(prev + 1, totalFrames - 1));
    }, [totalFrames]);

    const handleBack = useCallback(() => {
        setCurrentFrame((prev) => Math.max(prev - 1, 0));
    }, []);

    const handleStart = useCallback(() => {
        setCurrentFrame(0);
    }, []);

    return (
        <div className="sms_console">
            <button
                type="button"
                onClick={handleBack}
                className="sms_console__btn"
                disabled={currentFrame === 0}
                aria-label="Vorheriges Frame"
            >
                <img src={ArrowBackIcon} alt="" aria-hidden="true" className="sms_console__icon" />
            </button>
            
            <button
                type="button"
                onClick={handleStart}
                className="sms_console__btn"
                disabled={currentFrame === 0}
                aria-label="Erstes Frame anzeigen"
            >
                <img src={ReplayIcon} alt="" aria-hidden="true" className="sms_console__icon" />
            </button>
            
            <button
                type="button"
                onClick={handleNext}
                className="sms_console__btn"
                disabled={totalFrames === 0 || currentFrame === totalFrames - 1}
                aria-label="Nächstes Frame"
            >
                <img src={ArrowForwardIcon} alt="" aria-hidden="true" className="sms_console__icon" />
            </button>
        </div>
    );
};

export default ConsoleSmsTextbild;