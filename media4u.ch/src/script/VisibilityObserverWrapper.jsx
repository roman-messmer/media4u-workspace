import { useEffect } from 'react';
import { useVisibilityObserver } from '../script/useVisibilityObserver';

const VisibilityObserverWrapper = () => {
  useVisibilityObserver(); // ✅ hier ist der Hook erlaubt
  return null; // kein DOM nötig, dient nur zur Initialisierung
};

export default VisibilityObserverWrapper;
