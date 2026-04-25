"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const KEY = "govcon:nav_sidebar_collapsed";

type NavLayoutValue = {
  /** Desktop sidebar: icon rail vs full */
  navCollapsed: boolean;
  setNavCollapsed: (v: boolean) => void;
  toggleNav: () => void;
};

const NavLayoutContext = createContext<NavLayoutValue | null>(null);

function readStored(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(KEY) === "1";
}

export function NavLayoutProvider({ children }: { children: ReactNode }) {
  const [navCollapsed, setNavCollapsedState] = useState(false);

  useEffect(() => {
    setNavCollapsedState(readStored());
  }, []);

  const setNavCollapsed = useCallback((v: boolean) => {
    setNavCollapsedState(v);
    try {
      if (typeof window !== "undefined") sessionStorage.setItem(KEY, v ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleNav = useCallback(() => {
    setNavCollapsedState((prev) => {
      const next = !prev;
      try {
        if (typeof window !== "undefined") sessionStorage.setItem(KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ navCollapsed, setNavCollapsed, toggleNav }),
    [navCollapsed, setNavCollapsed, toggleNav]
  );

  return <NavLayoutContext.Provider value={value}>{children}</NavLayoutContext.Provider>;
}

export function useNavLayout() {
  const ctx = useContext(NavLayoutContext);
  if (!ctx) throw new Error("useNavLayout must be used within NavLayoutProvider");
  return ctx;
}
