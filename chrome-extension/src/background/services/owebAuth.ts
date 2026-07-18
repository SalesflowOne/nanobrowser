import {
  AgentNameEnum,
  agentModelStore,
  getDefaultAgentModelParams,
  getDefaultProviderConfig,
  llmProviderStore,
  owebAuthStore,
  ProviderTypeEnum,
  type OWebAuthSession,
  type OWebOrg,
} from '@extension/storage';
import { OWEB_API_BASE, OWEB_APP_ORIGIN } from '../config';

const DEFAULT_OWEB_MODEL = 'google/gemini-2.5-flash';

type SessionResponse = {
  user: { id: string; email: string | null };
  orgs: OWebOrg[];
  activeOrgId: string | null;
};

function parseAuthRedirectUrl(redirectedTo: string): {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
} {
  const url = new URL(redirectedTo);
  const hash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;
  const params = new URLSearchParams(hash || url.search);
  const access_token = params.get('access_token') || '';
  const refresh_token = params.get('refresh_token') || '';
  const expires_at_raw = params.get('expires_at');
  if (!access_token || !refresh_token) {
    throw new Error('Sign-in did not return tokens. Try again.');
  }
  return {
    access_token,
    refresh_token,
    expires_at: expires_at_raw ? Number(expires_at_raw) : undefined,
  };
}

export async function ensureOwebProviderConfigured(accessToken: string): Promise<void> {
  const config = getDefaultProviderConfig(ProviderTypeEnum.OWeb);
  config.apiKey = accessToken;
  config.baseUrl = OWEB_API_BASE;
  await llmProviderStore.setProvider(ProviderTypeEnum.OWeb, config);

  for (const agent of [AgentNameEnum.Planner, AgentNameEnum.Navigator]) {
    await agentModelStore.setAgentModel(agent, {
      provider: ProviderTypeEnum.OWeb,
      modelName: DEFAULT_OWEB_MODEL,
      parameters: getDefaultAgentModelParams(ProviderTypeEnum.OWeb, agent),
    });
  }
}

export async function fetchOwebSession(accessToken: string): Promise<SessionResponse> {
  const res = await fetch(`${OWEB_APP_ORIGIN}/api/extension/session`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Session failed (${res.status})`);
  }
  return (await res.json()) as SessionResponse;
}

export async function applyOwebSession(tokens: {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
}): Promise<OWebAuthSession> {
  const sessionInfo = await fetchOwebSession(tokens.access_token);
  const stored: OWebAuthSession = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: tokens.expires_at ?? null,
    userId: sessionInfo.user.id,
    email: sessionInfo.user.email,
    activeOrgId: sessionInfo.activeOrgId,
    orgs: sessionInfo.orgs,
    updatedAt: Date.now(),
  };
  await owebAuthStore.setSession(stored);
  await ensureOwebProviderConfigured(tokens.access_token);
  return stored;
}

export async function signInWithOweb(): Promise<OWebAuthSession> {
  const redirectUri = chrome.identity.getRedirectURL();
  const authUrl = new URL('/auth/extension', OWEB_APP_ORIGIN);
  authUrl.searchParams.set('redirect_uri', redirectUri);

  const redirectedTo = await chrome.identity.launchWebAuthFlow({
    url: authUrl.toString(),
    interactive: true,
  });
  if (!redirectedTo) {
    throw new Error('Sign-in was cancelled.');
  }
  const tokens = parseAuthRedirectUrl(redirectedTo);
  return applyOwebSession(tokens);
}

export async function signOutOweb(): Promise<void> {
  await owebAuthStore.clearSession();
  try {
    await llmProviderStore.removeProvider(ProviderTypeEnum.OWeb);
  } catch {
    // ignore
  }
}

export async function refreshOwebSessionIfNeeded(): Promise<OWebAuthSession | null> {
  const session = await owebAuthStore.getSession();
  if (!session) return null;

  try {
    const info = await fetchOwebSession(session.accessToken);
    const next: OWebAuthSession = {
      ...session,
      userId: info.user.id,
      email: info.user.email,
      orgs: info.orgs,
      activeOrgId:
        session.activeOrgId && info.orgs.some(o => o.id === session.activeOrgId)
          ? session.activeOrgId
          : info.activeOrgId,
      updatedAt: Date.now(),
    };
    await owebAuthStore.setSession(next);
    await ensureOwebProviderConfigured(next.accessToken);
    return next;
  } catch {
    await owebAuthStore.clearSession();
    return null;
  }
}

export async function getActiveOwebOrgId(): Promise<string | null> {
  const session = await owebAuthStore.getSession();
  return session?.activeOrgId ?? null;
}
