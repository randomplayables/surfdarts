/**
 * API Service for connecting with RandomPlayables platform
 * Handles session management and data storage for SurfDarts
 */

const API_BASE_URL = import.meta.env.MODE === 'production'
  ? 'https://www.randomplayables.com/api'
  : '/api';

console.log("Using API base URL:", API_BASE_URL);

// You will need to get a Game ID from the RandomPlayables platform admin
const GAME_ID = import.meta.env.VITE_GAME_ID || 'surfdarts-dev';

// Session storage keys
const SESSION_STORAGE_KEY = 'surfdartsGameSession';
const SESSION_CREATION_TIME_KEY = 'surfdartsGameSessionCreationTime';

function getContextFromURL() {
  if (typeof window === 'undefined') {
    return { token: null, userId: null, username: null, surveyMode: false, questionId: null };
  }
  
  const urlParams = new URLSearchParams(window.location.search);
  const authToken = urlParams.get('authToken');
  const userId = urlParams.get('userId');
  const username = urlParams.get('username');
  const surveyMode = urlParams.get('surveyMode') === 'true';
  const questionId = urlParams.get('questionId');
  
  return { token: authToken, userId, username, surveyMode, questionId };
}

let sessionInitPromise: Promise<any> | null = null;

/**
 * Initializes a game session with the platform.
 * Ensures only one session initialization request is in flight at a time.
 * @returns {Promise<any>} A promise that resolves with the session information.
 */
export async function initGameSession(): Promise<any> {
  if (sessionInitPromise) {
    return sessionInitPromise;
  }

  sessionInitPromise = (async () => {
    try {
      const lastCreationTime = localStorage.getItem(SESSION_CREATION_TIME_KEY);
      const currentSession = localStorage.getItem(SESSION_STORAGE_KEY);
      const now = Date.now();
      
      if (lastCreationTime && currentSession && (now - parseInt(lastCreationTime) < 3000)) {
        return JSON.parse(currentSession);
      }
      
      localStorage.removeItem(SESSION_STORAGE_KEY);
      
      const { token, userId, username, surveyMode, questionId } = getContextFromURL();
      
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/game-session`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          gameId: GAME_ID,
          passedUserId: userId,
          passedUsername: username,
          surveyMode: surveyMode,
          surveyQuestionId: questionId
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.warn(`Could not connect to RandomPlayables platform. Status: ${response.status}. Using local session.`);
        const localSession = {
          sessionId: `local-${Date.now()}`,
          userId: userId || null,
          username: username || null,
          isGuest: !userId,
          gameId: GAME_ID,
        };
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(localSession));
        localStorage.setItem(SESSION_CREATION_TIME_KEY, now.toString());
        return localSession;
      }
      
      const session = await response.json();
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      localStorage.setItem(SESSION_CREATION_TIME_KEY, now.toString());

      if (surveyMode && window.parent) {
          window.parent.postMessage({ type: 'GAME_SESSION_CREATED', payload: session }, '*');
      }

      return session;

    } catch (error) {
      console.error('Error initializing game session:', error);
      const { userId, username } = getContextFromURL();
      const localSession = {
        sessionId: `local-${Date.now()}`,
        userId: userId || null,
        username: username || null,
        isGuest: !userId,
        gameId: GAME_ID,
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(localSession));
      localStorage.setItem(SESSION_CREATION_TIME_KEY, Date.now().toString());
      return localSession;

    } finally {
      setTimeout(() => {
        sessionInitPromise = null;
      }, 5000);
    }
  })();
  
  return sessionInitPromise;
}

/**
 * Saves a significant game event to the platform's database.
 * @param {string} eventName - A string describing the event (e.g., 'round_1', 'game_end').
 * @param {any} eventData - The data object associated with the event.
 * @returns {Promise<any | null>} A promise resolving to the server's response or null.
 */
export async function saveGameData(eventName: string, eventData: any): Promise<any | null> {
  const sessionString = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionString) {
    console.error('No active game session found for saving data.');
    return null;
  }
  const session = JSON.parse(sessionString);

  if (session.sessionId.startsWith('local-')) {
    console.log('Local session, data not sent to server:', { eventName, eventData });
    return { success: true, offline: true };
  }

  let roundNumber = -1;
  if (eventName.startsWith('round_')) {
    try {
      roundNumber = parseInt(eventName.split('_')[1], 10);
    } catch {
      roundNumber = -1;
    }
  } else if (eventName === 'game_end') {
    roundNumber = 999;
  }

  const { token, userId, username } = getContextFromURL();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/game-data`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({
        sessionId: session.sessionId,
        roundNumber,
        roundData: eventData,
        ...(userId && { passedUserId: userId }),
        ...(username && { passedUsername: username })
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving game data:', error);
    return null;
  }
}