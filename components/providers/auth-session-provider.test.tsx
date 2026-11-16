import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AuthSessionProvider,
  resetAuthSessionBootForTests,
  useAuthSession,
} from "@/components/providers/auth-session-provider";

const refreshAccessToken = vi.fn();
const getAuthToken = vi.fn();
const healAuthSessionCookies = vi.fn();
const wipeLegacyAuthStorage = vi.fn();
const subscribeAuthChange = vi.fn(() => () => undefined);
const isAuthenticated = vi.fn(() => false);
const getWindow = vi.fn(() => window);

vi.mock("@/lib/auth/tokens", () => ({
  refreshAccessToken: (...args: unknown[]) => refreshAccessToken(...args),
  getAuthToken: () => getAuthToken(),
  healAuthSessionCookies: () => healAuthSessionCookies(),
  wipeLegacyAuthStorage: () => wipeLegacyAuthStorage(),
  subscribeAuthChange: (...args: unknown[]) => subscribeAuthChange(...args),
  isAuthenticated: () => isAuthenticated(),
}));

vi.mock("@/lib/auth/runtime-env", () => ({
  getWindow: () => getWindow(),
}));

function Probe() {
  const session = useAuthSession();
  return (
    <div>
      <span>{session.status}</span>
      <span>{session.isAuthenticated ? "yes" : "no"}</span>
      <button type="button" onClick={() => session.refresh()}>
        Refresh
      </button>
    </div>
  );
}

describe("AuthSessionProvider", () => {
  beforeEach(() => {
    resetAuthSessionBootForTests();
    refreshAccessToken.mockResolvedValue(null);
    getAuthToken.mockReturnValue(null);
    isAuthenticated.mockReturnValue(false);
    getWindow.mockReset();
    getWindow.mockImplementation(() => window);
    window.history.pushState({}, "", "/");
  });

  it("boots as unauthenticated and exposes refresh", async () => {
    render(
      <AuthSessionProvider>
        <Probe />
      </AuthSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("unauthenticated")).toBeInTheDocument();
    });
    expect(wipeLegacyAuthStorage).toHaveBeenCalled();
  });

  it("cancels boot work after unmount", async () => {
    let resolveBoot: () => void = () => undefined;
    let authListener: (() => void) | null = null;
    refreshAccessToken.mockImplementation(
      () =>
        new Promise<string | null>((resolve) => {
          resolveBoot = () => resolve(null);
        })
    );
    subscribeAuthChange.mockImplementation((cb: () => void) => {
      authListener = cb;
      return () => undefined;
    });
    resetAuthSessionBootForTests();

    const { unmount } = render(
      <AuthSessionProvider>
        <Probe />
      </AuthSessionProvider>
    );
    unmount();
    authListener?.();
    resolveBoot();
    await Promise.resolve();
    expect(screen.queryByText("unauthenticated")).not.toBeInTheDocument();
  });

  it("marks authenticated when a memory token exists after boot", async () => {
    refreshAccessToken.mockResolvedValue("tok");
    getAuthToken.mockReturnValue("tok");
    isAuthenticated.mockReturnValue(true);

    render(
      <AuthSessionProvider>
        <Probe />
      </AuthSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("authenticated")).toBeInTheDocument();
      expect(screen.getByText("yes")).toBeInTheDocument();
    });
  });

  it("redirects unauthenticated users off protected paths after boot", async () => {
    resetAuthSessionBootForTests();
    refreshAccessToken.mockResolvedValue(null);
    getAuthToken.mockReturnValue(null);
    isAuthenticated.mockReturnValue(false);

    const replace = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        pathname: "/today",
        search: "",
        replace,
      },
    });

    render(
      <AuthSessionProvider>
        <Probe />
      </AuthSessionProvider>
    );

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/login?redirect=%2Ftoday");
    });
  });

  it("skips protected redirect when window is unavailable", async () => {
    getWindow.mockReturnValue(undefined);
    render(
      <AuthSessionProvider>
        <Probe />
      </AuthSessionProvider>
    );
    await waitFor(() => {
      expect(screen.getByText("unauthenticated")).toBeInTheDocument();
    });
  });

  it("does not redirect authenticated users on protected paths", async () => {
    refreshAccessToken.mockResolvedValue("tok");
    getAuthToken.mockReturnValue("tok");
    isAuthenticated.mockReturnValue(true);
    const replace = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        pathname: "/today",
        search: "",
        replace,
      },
    });
    getWindow.mockImplementation(() => window);

    render(
      <AuthSessionProvider>
        <Probe />
      </AuthSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("authenticated")).toBeInTheDocument();
    });
    expect(replace).not.toHaveBeenCalled();
  });

  it("does not redirect unauthenticated users on public paths", async () => {
    const replace = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        pathname: "/",
        search: "",
        replace,
      },
    });
    getWindow.mockImplementation(() => window);

    render(
      <AuthSessionProvider>
        <Probe />
      </AuthSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("unauthenticated")).toBeInTheDocument();
    });
    expect(replace).not.toHaveBeenCalled();
  });

  it("reuses the module boot promise across providers", async () => {
    resetAuthSessionBootForTests();
    refreshAccessToken.mockClear();
    refreshAccessToken.mockResolvedValue(null);

    const { unmount } = render(
      <AuthSessionProvider>
        <Probe />
      </AuthSessionProvider>
    );
    await waitFor(() => {
      expect(screen.getByText("unauthenticated")).toBeInTheDocument();
    });
    unmount();

    render(
      <AuthSessionProvider>
        <Probe />
      </AuthSessionProvider>
    );
    await waitFor(() => {
      expect(screen.getByText("unauthenticated")).toBeInTheDocument();
    });
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
  });

  it("throws when useAuthSession is used outside the provider", () => {
    expect(() => render(<Probe />)).toThrow(
      /must be used within AuthSessionProvider/
    );
  });

  it("resyncs when auth listeners fire and refresh is clicked", async () => {
    let listener: (() => void) | null = null;
    subscribeAuthChange.mockImplementation((cb: () => void) => {
      listener = cb;
      return () => undefined;
    });
    getAuthToken.mockReturnValue(null);

    const { getByRole } = render(
      <AuthSessionProvider>
        <Probe />
      </AuthSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("unauthenticated")).toBeInTheDocument();
    });

    getAuthToken.mockReturnValue("tok");
    isAuthenticated.mockReturnValue(true);
    listener?.();
    await waitFor(() => {
      expect(screen.getByText("authenticated")).toBeInTheDocument();
    });

    getByRole("button", { name: "Refresh" }).click();
    expect(healAuthSessionCookies).toHaveBeenCalled();
  });
});
