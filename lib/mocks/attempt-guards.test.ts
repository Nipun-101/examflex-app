import { afterEach, describe, expect, it, vi } from "vitest";
import {
  armBackTrap,
  armBeforeUnload,
  armPageHide,
} from "@/lib/mocks/attempt-guards";

const disposers: Array<() => void> = [];

afterEach(() => {
  while (disposers.length) disposers.pop()?.();
});

function fire(type: string): Event {
  const event = new Event(type, { cancelable: true });
  window.dispatchEvent(event);
  return event;
}

describe("armBeforeUnload", () => {
  it("prevents unload while active", () => {
    disposers.push(armBeforeUnload(window, { isActive: () => true }));
    expect(fire("beforeunload").defaultPrevented).toBe(true);
  });

  it("stays silent once disarmed", () => {
    disposers.push(armBeforeUnload(window, { isActive: () => false }));
    expect(fire("beforeunload").defaultPrevented).toBe(false);
  });

  it("removes the listener on dispose", () => {
    const dispose = armBeforeUnload(window, { isActive: () => true });
    dispose();
    expect(fire("beforeunload").defaultPrevented).toBe(false);
  });
});

describe("armPageHide", () => {
  it("calls onLeave only while active", () => {
    const onLeave = vi.fn();
    let active = true;
    disposers.push(armPageHide(window, { isActive: () => active, onLeave }));
    fire("pagehide");
    expect(onLeave).toHaveBeenCalledTimes(1);
    active = false;
    fire("pagehide");
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it("removes the listener on dispose", () => {
    const onLeave = vi.fn();
    armPageHide(window, { isActive: () => true, onLeave })();
    fire("pagehide");
    expect(onLeave).not.toHaveBeenCalled();
  });
});

describe("armBackTrap", () => {
  it("pushes a trap entry and re-arms on back", () => {
    const push = vi.spyOn(window.history, "pushState");
    const onBack = vi.fn();
    disposers.push(armBackTrap(window, { isActive: () => true, onBack }));
    expect(push).toHaveBeenCalledTimes(1);

    fire("popstate");
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledTimes(2);
    push.mockRestore();
  });

  it("lets navigation through once disarmed", () => {
    const push = vi.spyOn(window.history, "pushState");
    const onBack = vi.fn();
    disposers.push(armBackTrap(window, { isActive: () => false, onBack }));
    push.mockClear();

    fire("popstate");
    expect(onBack).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
    push.mockRestore();
  });

  it("removes the listener on dispose", () => {
    const onBack = vi.fn();
    armBackTrap(window, { isActive: () => true, onBack })();
    fire("popstate");
    expect(onBack).not.toHaveBeenCalled();
  });
});
