
/**
 * Führt einen Fetch-Request mit Basic Auth durch.
 * Username und Passwort sind für Demo-Zwecke fest hinterlegt.
 *
 * @param url Die URL für den Request
 * @param options Fetch-Optionen (optional)
 * @returns Promise der Fetch-Response
 */
export function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const username = 'demo';      // Backend-User (aus application.properties)
  const password = 'demo123';   // Backend-Passwort
  const authHeader = 'Basic ' + btoa(`${username}:${password}`);

  // Header zusammenbauen (evtl. bestehende Header übernehmen)
  options.headers = {
    ...(options.headers || {}),
    'Authorization': authHeader
  };

  return fetch(url, options);
}
