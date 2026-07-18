import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';

export type OWebOrg = {
  id: string;
  name: string;
  slug: string;
  plan?: string | null;
  role?: string;
  credits_balance?: number;
};

export type OWebAuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number | null;
  userId?: string | null;
  email?: string | null;
  activeOrgId?: string | null;
  orgs?: OWebOrg[];
  updatedAt: number;
};

export type OWebAuthStorage = BaseStorage<OWebAuthSession | null> & {
  getSession: () => Promise<OWebAuthSession | null>;
  setSession: (session: OWebAuthSession) => Promise<void>;
  clearSession: () => Promise<void>;
  setActiveOrgId: (orgId: string) => Promise<void>;
  setOrgs: (orgs: OWebOrg[], activeOrgId?: string | null) => Promise<void>;
};

const storage = createStorage<OWebAuthSession | null>('oweb-auth', null, {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

export const owebAuthStore: OWebAuthStorage = {
  ...storage,
  async getSession() {
    return storage.get();
  },
  async setSession(session) {
    await storage.set(session);
  },
  async clearSession() {
    await storage.set(null);
  },
  async setActiveOrgId(orgId) {
    const current = await storage.get();
    if (!current) return;
    await storage.set({ ...current, activeOrgId: orgId, updatedAt: Date.now() });
  },
  async setOrgs(orgs, activeOrgId) {
    const current = await storage.get();
    if (!current) return;
    await storage.set({
      ...current,
      orgs,
      activeOrgId: activeOrgId ?? current.activeOrgId ?? orgs[0]?.id ?? null,
      updatedAt: Date.now(),
    });
  },
};
