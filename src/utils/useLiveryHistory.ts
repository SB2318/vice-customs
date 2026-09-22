import { useState, useCallback, useEffect, useRef } from 'react';
import { LiveryState } from '../types';

const MAX_HISTORY_STEPS = 40;

export function useLiveryHistory(initialState: LiveryState) {
  const [history, setHistory] = useState<LiveryState[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Keep a ref to avoid stale closures in event listeners
  const stateRef = useRef({ history, currentIndex });
  stateRef.current = { history, currentIndex };

  const currentState = history[currentIndex] || initialState;

  /**
   * Push a new state onto history stack (truncating any redo steps)
   */
  const pushState = useCallback((nextStateOrUpdater: LiveryState | ((prev: LiveryState) => LiveryState)) => {
    setHistory((prevHistory) => {
      const current = prevHistory[stateRef.current.currentIndex] || prevHistory[prevHistory.length - 1];
      const nextState = typeof nextStateOrUpdater === 'function' ? nextStateOrUpdater(current) : nextStateOrUpdater;

      // Avoid duplicate consecutive states
      if (JSON.stringify(current) === JSON.stringify(nextState)) {
        return prevHistory;
      }

      // Slice history up to currentIndex + 1, then append nextState
      const newHistory = prevHistory.slice(0, stateRef.current.currentIndex + 1);
      newHistory.push(nextState);

      // Limit history capacity
      if (newHistory.length > MAX_HISTORY_STEPS) {
        newHistory.shift();
      }

      return newHistory;
    });

    setCurrentIndex((prevIdx) => {
      const slicedLen = Math.min(prevIdx + 1, MAX_HISTORY_STEPS - 1);
      return slicedLen;
    });
  }, []);

  /**
   * Set state directly without saving to history (e.g. for transient drag or initialization)
   */
  const setRawState = useCallback((state: LiveryState) => {
    setHistory([state]);
    setCurrentIndex(0);
  }, []);

  /**
   * Undo to previous step
   */
  const undo = useCallback(() => {
    setCurrentIndex((prevIdx) => {
      if (prevIdx > 0) {
        return prevIdx - 1;
      }
      return prevIdx;
    });
  }, []);

  /**
   * Redo to next step
   */
  const redo = useCallback(() => {
    setCurrentIndex((prevIdx) => {
      if (prevIdx < stateRef.current.history.length - 1) {
        return prevIdx + 1;
      }
      return prevIdx;
    });
  }, []);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  // Global Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z, Cmd+Z, Cmd+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (!isCmdOrCtrl) return;

      if (e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          // Redo
          e.preventDefault();
          redo();
        } else {
          // Undo
          e.preventDefault();
          undo();
        }
      } else if (e.key.toLowerCase() === 'y' && !isMac) {
        // Redo on Windows/Linux
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    liveryState: currentState,
    pushState,
    setRawState,
    undo,
    redo,
    canUndo,
    canRedo,
    historyLength: history.length,
    historyIndex: currentIndex
  };
}
