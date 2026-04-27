// src/components/console/ConsoleTextbild2.jsx
import React from 'react';
import "../../css/console_textbild2.css";

const ConsoleTextbild2 = ({ 
    onNext, 
    onBack, 
    onStart, 
    activeIndex, 
    totalFrames 
}) => {
    
    // Buttons deaktivieren, wenn Logik es erfordert
    const isStart = activeIndex === 0;
    const isEnd = activeIndex >= totalFrames - 1;

    return (
        <div className="console_textbild2">
            {/* ZURÜCK BUTTON */}
            <button 
                id="frame_back" 
                className="nav_button" 
                onClick={onBack} 
                disabled={isStart} 
                aria-label="Vorheriges Frame"
            >
                <img src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20height='24px'%20viewBox='0%20-960%20960%20960'%20width='24px'%20fill='%23000000'%3e%3cpath%20d='M400-80%200-480l400-400%2071%2071-329%20329%20329%20329-71%2071Z'/%3e%3c/svg%3e" alt="Zurück" />
            </button>
            
            {/* RESET / START BUTTON */}
            <button 
                id="frame_start" 
                className="nav_button" 
                onClick={onStart} 
                disabled={isStart} 
                aria-label="Erstes Frame anzeigen"
            >
                <img src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20height='24px'%20viewBox='0%20-960%20960%20960'%20width='24px'%20fill='%23000000'%3e%3cpath%20d='M480-80q-75%200-140.5-28.5t-114-77q-48.5-48.5-77-114T120-440h80q0%20117%2081.5%20198.5T480-160q117%200%20198.5-81.5T760-440q0-117-81.5-198.5T480-720h-6l62%2062-56%2058-160-160%20160-160%2056%2058-62%2062h6q75%200%20140.5%2028.5t114%2077q48.5%2048.5%2077%20114T840-440q0%2075-28.5%20140.5t-77%20114q-48.5%2048.5-114%2077T480-80Z'/%3e%3c/svg%3e" alt="Reset" />
            </button>
            
            {/* VORWÄRTS BUTTON */}
            <button 
                id="frame_next" 
                className="nav_button" 
                onClick={onNext} 
                disabled={isEnd} 
                aria-label="Nächstes Frame"
            >
                <img src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20height='24px'%20viewBox='0%20-960%20960%20960'%20width='24px'%20fill='%23000000'%3e%3cpath%20d='m321-80-71-71%20329-329-329-329%2071-71%20400%20400L321-80Z'/%3e%3c/svg%3e" alt="Vor" />
            </button>
        </div>
    );
};

export default ConsoleTextbild2;