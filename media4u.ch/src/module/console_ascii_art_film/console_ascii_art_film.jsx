import React, { useState, useEffect, useRef, useCallback } from 'react';
import "./console_ascii_art_film.css";

import ArrowBackIcon from './arrow_back.svg';
import ReplayIcon from './replay.svg';
import PlayIcon from './play.svg';
import PauseIcon from './pause.svg';
import ArrowForwardIcon from './arrow_forward.svg';

// Funktionale Komponente mit Hooks
const ConsoleAsciiArtFilm = () => {
    const [currentFrame, setCurrentFrame] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    
    // useRef speichert die Intervall-ID, ohne Re-Renders auszulösen
    const intervalRef = useRef(null);

    // Hilfsfunktion: Zählt die externen Frames im DOM
    const getMaxFrames = () => {
        return document.querySelectorAll(".ascii_art_film_matrix .frame").length || 1;
    };

    const pause = useCallback(() => {
        setIsPlaying(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const play = useCallback(() => {
        if (!isPlaying) {
            setIsPlaying(true);
            intervalRef.current = setInterval(() => {
                setCurrentFrame((prev) => (prev + 1 > getMaxFrames() ? 1 : prev + 1));
            }, 100);
        }
    }, [isPlaying]);

    const reset = useCallback(() => {
        pause();
        setCurrentFrame(1);
    }, [pause]);

    const previous = useCallback(() => {
        pause();
        setCurrentFrame((prev) => (prev - 1 < 1 ? getMaxFrames() : prev - 1));
    }, [pause]);

    const next = useCallback(() => {
        pause();
        setCurrentFrame((prev) => (prev + 1 > getMaxFrames() ? 1 : prev + 1));
    }, [pause]);

    // Side-Effect: Aktualisiert die externen DOM-Elemente sicher NACH dem Render
    useEffect(() => {
        const frames = document.querySelectorAll(".ascii_art_film_matrix .frame");
        frames.forEach((frame, index) => {
            if (index + 1 === currentFrame) {
                frame.classList.add("show");
            } else {
                frame.classList.remove("show");
            }
        });
    }, [currentFrame]);

    // Cleanup: Stoppt das Intervall, wenn die Komponente verlassen wird
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    return (
        <div className="ascii_player">
            <nav className="ascii_player__controls" aria-label="ASCII-Filmsteuerung">
                <button type="button" className="ascii_player__btn ascii_player__btn--back" onClick={previous} aria-label="Zurück">
                    <img src={ArrowBackIcon} alt="" aria-hidden="true" className="ascii_player__icon" />
                </button>
                <button type="button" className="ascii_player__btn ascii_player__btn--reset" onClick={reset} aria-label="Zurücksetzen">
                    <img src={ReplayIcon} alt="" aria-hidden="true" className="ascii_player__icon" />
                </button>
                <button type="button" className="ascii_player__btn ascii_player__btn--play" onClick={play} aria-label="Abspielen">
                    <img src={PlayIcon} alt="" aria-hidden="true" className="ascii_player__icon" />
                </button>
                <button type="button" className="ascii_player__btn ascii_player__btn--pause" onClick={pause} aria-label="Pausieren">
                    <img src={PauseIcon} alt="" aria-hidden="true" className="ascii_player__icon" />
                </button>
                <button type="button" className="ascii_player__btn ascii_player__btn--next" onClick={next} aria-label="Vor">
                    <img src={ArrowForwardIcon} alt="" aria-hidden="true" className="ascii_player__icon" />
                </button>
            </nav>
        </div>
    );
};

export default ConsoleAsciiArtFilm;