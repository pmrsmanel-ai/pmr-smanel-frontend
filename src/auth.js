const SESSION_KEY =
  'pmr_smanel_session';

export function getSession() {
  try {
    return JSON.parse(
      localStorage.getItem(
        SESSION_KEY
      ) || 'null'
    );
  } catch {
    return null;
  }
}

export function saveSession(
  session
) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(session)
  );
}

export function clearSession() {
  localStorage.removeItem(
    SESSION_KEY
  );
}

export function isAllowed(
  session,
  roles = []
) {
  return Boolean(
    session &&
      (
        roles.length === 0 ||
        roles.includes(session.role)
      )
  );
}