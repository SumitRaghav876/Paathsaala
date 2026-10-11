import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const Ctx = createContext({ ids: new Set(), toggle: async () => {}, loggedIn: false });
export const useBookmarks = () => useContext(Ctx);

export function BookmarksProvider({ user, children }) {
  const [ids, setIds] = useState(new Set());
  useEffect(() => {
    if (user) api('/me/bookmark-ids').then((a) => setIds(new Set(a))).catch(() => {});
    else setIds(new Set());
  }, [user]);
  const toggle = useCallback(async (id) => {
    const r = await api('/me/bookmarks/' + id, { method: 'POST' });
    setIds(new Set(r.ids));
  }, []);
  return <Ctx.Provider value={{ ids, toggle, loggedIn: !!user }}>{children}</Ctx.Provider>;
}
