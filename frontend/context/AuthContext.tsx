"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { useRouter } from "next/navigation";


/* =========================================================
   TYPES
   ========================================================= */

export interface LoggedInUser {
  user_id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}


interface AuthContextType {
  user: LoggedInUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (
    token: string,
    user: LoggedInUser
  ) => void;

  logout: () => void;
}


/* =========================================================
   AUTH CONFIGURATION
   ========================================================= */

/*
 * Maximum session lifetime:
 *
 * 8 hours
 */
const SESSION_DURATION =
  8 * 60 * 60 * 1000;


/*
 * Maximum inactivity:
 *
 * 30 minutes
 */
const INACTIVITY_TIMEOUT =
  30 * 60 * 1000;


/*
 * Don't update last_activity_at
 * more than once every 30 seconds.
 */
const ACTIVITY_THROTTLE =
  30 * 1000;


/*
 * Check session every 10 seconds.
 */
const SESSION_CHECK_INTERVAL =
  10 * 1000;


/* =========================================================
   LOCAL STORAGE KEYS
   ========================================================= */

const TOKEN_KEY =
  "access_token";

const USER_KEY =
  "user";

const SESSION_STARTED_KEY =
  "session_started_at";

const LAST_ACTIVITY_KEY =
  "last_activity_at";

const SESSION_EXPIRES_KEY =
  "session_expires_at";


/* =========================================================
   AUTH CONTEXT
   ========================================================= */

const AuthContext =
  createContext<
    AuthContextType | undefined
  >(undefined);


/* =========================================================
   EXTERNAL AUTH STORE
   ========================================================= */

const authListeners =
  new Set<() => void>();


function subscribe(
  listener: () => void
) {
  authListeners.add(
    listener
  );

  return () => {
    authListeners.delete(
      listener
    );
  };
}


function notifyAuthListeners() {
  authListeners.forEach(
    (listener) => listener()
  );
}


/* =========================================================
   HYDRATION STORE
   ========================================================= */

/*
 * IMPORTANT:
 *
 * This replaces the old:
 *
 * typeof window === "undefined"
 *
 * approach.
 *
 * The server says:
 *
 * false = hydration not finished
 *
 * The browser says:
 *
 * true = hydration finished
 *
 * This prevents AppLayout from redirecting
 * to /login before localStorage authentication
 * has been restored.
 */

function subscribeHydration(
  listener: () => void
) {
  /*
   * Hydration status does not change through
   * external events, so there is nothing to
   * subscribe to.
   */
  return () => {
    void listener;
  };
}


function getHydrationSnapshot() {
  return true;
}


function getServerHydrationSnapshot() {
  return false;
}


/* =========================================================
   STORAGE HELPERS
   ========================================================= */

function getStoredToken(): string | null {

  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  return localStorage.getItem(
    TOKEN_KEY
  );
}


function getStoredUser():
  LoggedInUser | null {

  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  const storedUser =
    localStorage.getItem(
      USER_KEY
    );

  if (!storedUser) {
    return null;
  }

  try {

    return JSON.parse(
      storedUser
    ) as LoggedInUser;

  } catch {

    return null;
  }
}


/* =========================================================
   SESSION VALIDATION
   ========================================================= */

function isStoredSessionValid(): boolean {

  if (
    typeof window === "undefined"
  ) {
    return false;
  }


  const token =
    localStorage.getItem(
      TOKEN_KEY
    );

  const storedUser =
    localStorage.getItem(
      USER_KEY
    );

  const sessionStarted =
    localStorage.getItem(
      SESSION_STARTED_KEY
    );

  const lastActivity =
    localStorage.getItem(
      LAST_ACTIVITY_KEY
    );

  const sessionExpires =
    localStorage.getItem(
      SESSION_EXPIRES_KEY
    );


  /*
   * Missing session information
   */
  if (
    !token ||
    !storedUser ||
    !sessionStarted ||
    !lastActivity ||
    !sessionExpires
  ) {
    return false;
  }


  const now =
    Date.now();


  const sessionStartedTime =
    Number(
      sessionStarted
    );


  const lastActivityTime =
    Number(
      lastActivity
    );


  const sessionExpiresTime =
    Number(
      sessionExpires
    );


  /*
   * Invalid timestamps
   */
  if (
    Number.isNaN(
      sessionStartedTime
    ) ||
    Number.isNaN(
      lastActivityTime
    ) ||
    Number.isNaN(
      sessionExpiresTime
    )
  ) {
    return false;
  }


  /*
   * Maximum session lifetime
   */
  if (
    now >= sessionExpiresTime
  ) {
    return false;
  }


  /*
   * Inactivity timeout
   */
  if (
    now - lastActivityTime >=
    INACTIVITY_TIMEOUT
  ) {
    return false;
  }


  return true;
}


/* =========================================================
   AUTH SNAPSHOTS
   ========================================================= */

const SERVER_AUTH_SNAPSHOT =
  "";


/* ---------------------------------------------------------
   Token
   --------------------------------------------------------- */

function getTokenSnapshot(): string {

  if (
    !isStoredSessionValid()
  ) {
    return "";
  }

  return (
    getStoredToken() ?? ""
  );
}


/* ---------------------------------------------------------
   User
   --------------------------------------------------------- */

function getUserSnapshot(): string {

  if (
    !isStoredSessionValid()
  ) {
    return "";
  }

  const user =
    getStoredUser();

  return user
    ? JSON.stringify(user)
    : "";
}


/* =========================================================
   AUTH PROVIDER
   ========================================================= */

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {

  const router =
    useRouter();


  /* =======================================================
     HYDRATION
     ======================================================= */

  const hasHydrated =
    useSyncExternalStore(
      subscribeHydration,
      getHydrationSnapshot,
      getServerHydrationSnapshot
    );


  /* =======================================================
     TOKEN
     ======================================================= */

  const tokenSnapshot =
    useSyncExternalStore(
      subscribe,
      getTokenSnapshot,
      () => SERVER_AUTH_SNAPSHOT
    );


  /* =======================================================
     USER
     ======================================================= */

  const userSnapshot =
    useSyncExternalStore(
      subscribe,
      getUserSnapshot,
      () => SERVER_AUTH_SNAPSHOT
    );


  /* =======================================================
     PARSE USER
     ======================================================= */

  let user:
    LoggedInUser | null = null;


  if (userSnapshot) {

    try {

      user =
        JSON.parse(
          userSnapshot
        ) as LoggedInUser;

    } catch {

      user = null;
    }
  }


  /* =======================================================
     AUTH STATE
     ======================================================= */

  const token =
    tokenSnapshot || null;


  const isAuthenticated =
    !!token && !!user;


  /*
   * VERY IMPORTANT:
   *
   * AppLayout must wait until hydration
   * has completed before deciding whether
   * the user is authenticated.
   */
  const isLoading =
    !hasHydrated;


  /* =======================================================
     CLEAR SESSION
     ======================================================= */

  const clearSession =
    useCallback(() => {

      if (
        typeof window === "undefined"
      ) {
        return;
      }


      localStorage.removeItem(
        TOKEN_KEY
      );

      localStorage.removeItem(
        USER_KEY
      );

      localStorage.removeItem(
        SESSION_STARTED_KEY
      );

      localStorage.removeItem(
        LAST_ACTIVITY_KEY
      );

      localStorage.removeItem(
        SESSION_EXPIRES_KEY
      );


      notifyAuthListeners();

    }, []);


  /* =======================================================
     LOGOUT
     ======================================================= */

  const logout =
    useCallback(() => {

      clearSession();

      router.replace(
        "/login"
      );

    }, [
      clearSession,
      router,
    ]);


  /* =======================================================
     LOGIN
     ======================================================= */

  const login =
    useCallback(
      (
        newToken: string,
        newUser: LoggedInUser
      ) => {

        if (
          typeof window === "undefined"
        ) {
          return;
        }


        const now =
          Date.now();


        const sessionExpires =
          now +
          SESSION_DURATION;


        /*
         * Store token
         */
        localStorage.setItem(
          TOKEN_KEY,
          newToken
        );


        /*
         * Store user
         */
        localStorage.setItem(
          USER_KEY,
          JSON.stringify(
            newUser
          )
        );


        /*
         * Store session start
         */
        localStorage.setItem(
          SESSION_STARTED_KEY,
          String(now)
        );


        /*
         * Store last activity
         */
        localStorage.setItem(
          LAST_ACTIVITY_KEY,
          String(now)
        );


        /*
         * Store maximum expiry
         */
        localStorage.setItem(
          SESSION_EXPIRES_KEY,
          String(
            sessionExpires
          )
        );


        /*
         * Tell React that authentication
         * has changed.
         */
        notifyAuthListeners();

      },
      []
    );


  /* =======================================================
     SESSION MONITOR
     ======================================================= */

  useEffect(() => {

    /*
     * Don't start until hydration is complete.
     */
    if (!hasHydrated) {
      return;
    }


    /*
     * Don't monitor if nobody is logged in.
     */
    if (!isAuthenticated) {
      return;
    }


    let lastRecordedActivity =
      Number(
        localStorage.getItem(
          LAST_ACTIVITY_KEY
        )
      ) || 0;


    /* -------------------------------------------------------
       EXPIRE SESSION
       ------------------------------------------------------- */

    const expireSession = (
      reason:
        | "timeout"
        | "expired"
    ) => {

      clearSession();

      router.replace(
        `/login?reason=${reason}`
      );

    };


    /* -------------------------------------------------------
       USER ACTIVITY
       ------------------------------------------------------- */

    const updateActivity = () => {

      const now =
        Date.now();


      const lastActivity =
        Number(
          localStorage.getItem(
            LAST_ACTIVITY_KEY
          )
        );


      const sessionExpires =
        Number(
          localStorage.getItem(
            SESSION_EXPIRES_KEY
          )
        );


      /*
       * Maximum session expired.
       */
      if (
        !sessionExpires ||
        now >= sessionExpires
      ) {

        expireSession(
          "expired"
        );

        return;
      }


      /*
       * Inactivity expired.
       *
       * Check BEFORE updating activity.
       */
      if (
        !lastActivity ||
        now - lastActivity >=
          INACTIVITY_TIMEOUT
      ) {

        expireSession(
          "timeout"
        );

        return;
      }


      /*
       * Throttle localStorage writes.
       */
      if (
        now -
          lastRecordedActivity <
        ACTIVITY_THROTTLE
      ) {
        return;
      }


      localStorage.setItem(
        LAST_ACTIVITY_KEY,
        String(now)
      );


      lastRecordedActivity =
        now;

    };


    /* -------------------------------------------------------
       ACTIVITY EVENTS
       ------------------------------------------------------- */

    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];


    activityEvents.forEach(
      (eventName) => {

        window.addEventListener(
          eventName,
          updateActivity
        );

      }
    );


    /* -------------------------------------------------------
       SESSION CHECKER
       ------------------------------------------------------- */

    const sessionChecker =
      window.setInterval(() => {

        const now =
          Date.now();


        const lastActivity =
          Number(
            localStorage.getItem(
              LAST_ACTIVITY_KEY
            )
          );


        const sessionExpires =
          Number(
            localStorage.getItem(
              SESSION_EXPIRES_KEY
            )
          );


        /*
         * Missing session data
         */
        if (
          !lastActivity ||
          !sessionExpires
        ) {

          expireSession(
            "expired"
          );

          return;
        }


        /*
         * Maximum session lifetime
         */
        if (
          now >= sessionExpires
        ) {

          expireSession(
            "expired"
          );

          return;
        }


        /*
         * Inactivity
         */
        if (
          now - lastActivity >=
          INACTIVITY_TIMEOUT
        ) {

          expireSession(
            "timeout"
          );

        }

      }, SESSION_CHECK_INTERVAL);


    /* -------------------------------------------------------
       CLEANUP
       ------------------------------------------------------- */

    return () => {

      activityEvents.forEach(
        (eventName) => {

          window.removeEventListener(
            eventName,
            updateActivity
          );

        }
      );


      window.clearInterval(
        sessionChecker
      );

    };

  }, [
    hasHydrated,
    isAuthenticated,
    clearSession,
    router,
  ]);


  /* =======================================================
     OLD SESSION CLEANUP
     ======================================================= */

  useEffect(() => {

    /*
     * Wait for hydration.
     */
    if (!hasHydrated) {
      return;
    }


    if (
      typeof window === "undefined"
    ) {
      return;
    }


    const token =
      localStorage.getItem(
        TOKEN_KEY
      );


    const storedUser =
      localStorage.getItem(
        USER_KEY
      );


    const sessionStarted =
      localStorage.getItem(
        SESSION_STARTED_KEY
      );


    const lastActivity =
      localStorage.getItem(
        LAST_ACTIVITY_KEY
      );


    const sessionExpires =
      localStorage.getItem(
        SESSION_EXPIRES_KEY
      );


    /*
     * Old authentication data from
     * before session management existed.
     */
    if (
      token &&
      storedUser &&
      (
        !sessionStarted ||
        !lastActivity ||
        !sessionExpires
      )
    ) {

      clearSession();

      router.replace(
        "/login"
      );

      return;
    }


    /*
     * Session metadata exists but
     * session is already invalid.
     */
    if (
      token &&
      storedUser &&
      !isStoredSessionValid()
    ) {

      clearSession();

      router.replace(
        "/login?reason=expired"
      );

    }

  }, [
    hasHydrated,
    clearSession,
    router,
  ]);


  /* =======================================================
     PROVIDER
     ======================================================= */

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


/* =========================================================
   useAuth
   ========================================================= */

export function useAuth() {

  const context =
    useContext(
      AuthContext
    );


  if (!context) {

    throw new Error(
      "useAuth must be used inside AuthProvider"
    );

  }


  return context;
}