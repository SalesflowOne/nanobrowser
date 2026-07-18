import { useCallback, useEffect, useState } from 'react';
import type { OWebAuthSession } from '@extension/storage';
import { Button } from '@extension/ui';

type Props = { isDarkMode: boolean };

async function sendOwebMessage<T>(message: Record<string, unknown>): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, response => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (!response?.ok) {
        reject(new Error(response?.error || 'Request failed'));
        return;
      }
      resolve(response as T);
    });
  });
}

export function OWebAccountSettings({ isDarkMode }: Props) {
  const [session, setSession] = useState<OWebAuthSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await sendOwebMessage<{ session: OWebAuthSession | null }>({ type: 'oweb_get_session' });
      setSession(res.session);
      setError(null);
    } catch (err) {
      setSession(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const signIn = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await sendOwebMessage<{ session: OWebAuthSession }>({ type: 'oweb_sign_in' });
      setSession(res.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    setBusy(true);
    try {
      await sendOwebMessage({ type: 'oweb_sign_out' });
      setSession(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const setOrg = async (orgId: string) => {
    setBusy(true);
    try {
      await sendOwebMessage({ type: 'oweb_set_org', orgId });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-6">
      <div
        className={`rounded-lg border ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-blue-100 bg-gray-50'} p-6 text-left shadow-sm`}>
        <h2 className={`mb-2 text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          OWeb account
        </h2>
        <p className={`mb-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Sign in to use OWeb models, credits, and workspace policy from the Chrome Companion.
        </p>

        {error ? <p className="mb-3 text-sm text-red-500">{error}</p> : null}

        {!session ? (
          <Button theme={isDarkMode ? 'dark' : 'light'} variant="primary" disabled={busy} onClick={() => void signIn()}>
            {busy ? 'Connecting…' : 'Sign in with OWeb'}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Signed in as <span className="font-medium">{session.email || session.userId}</span>
            </div>

            <label className="block text-sm">
              <span className={`mb-1 block font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Workspace
              </span>
              <select
                className={`w-full rounded-md border px-3 py-2 ${
                  isDarkMode ? 'border-slate-600 bg-slate-900 text-gray-100' : 'border-gray-300 bg-white'
                }`}
                value={session.activeOrgId || ''}
                disabled={busy}
                onChange={e => void setOrg(e.target.value)}>
                {(session.orgs || []).map(org => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                    {typeof org.credits_balance === 'number' ? ` · ${org.credits_balance} credits` : ''}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex gap-2">
              <Button theme={isDarkMode ? 'dark' : 'light'} variant="secondary" disabled={busy} onClick={() => void load()}>
                Refresh
              </Button>
              <Button theme={isDarkMode ? 'dark' : 'light'} variant="secondary" disabled={busy} onClick={() => void signOut()}>
                Sign out
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
