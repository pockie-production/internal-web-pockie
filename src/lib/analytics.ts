import axios from 'axios';

type AnalyticsEventInput = {
  eventName: string;
  page?: string;
  feature?: string;
  payload?: Record<string, unknown>;
};

const SESSION_KEY = 'pockie_internal_session_id';

function getSessionId() {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `internal_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function trackInternalEvent(input: AnalyticsEventInput) {
  const token = localStorage.getItem('accessToken');
  if (!token) return;

  void axios.post('/api/v1/internal/analytics/events', {
    ...input,
    sessionId: getSessionId(),
  }).catch(() => undefined);
}
