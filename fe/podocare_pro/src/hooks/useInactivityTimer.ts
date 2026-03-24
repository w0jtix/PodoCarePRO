import { useEffect, useRef } from 'react';
import AuthService from '../services/AuthService';

const INACTIVITY_TIMEOUT_MS = 3 * 60 * 1000; // 3 mins

export function useInactivityTimer() {
    const lastActivityRef = useRef<number>(Date.now());

    useEffect(() => {
        const handleActivity = () => {
            lastActivityRef.current = Date.now();
        };

        const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(e => window.addEventListener(e, handleActivity));

        const intervalId = setInterval(() => {
            if (Date.now() - lastActivityRef.current > INACTIVITY_TIMEOUT_MS) {
                AuthService.logout();
            }
        }, 30_000);

        return () => {
            events.forEach(e => window.removeEventListener(e, handleActivity));
            clearInterval(intervalId);
        };
    }, []);
}
