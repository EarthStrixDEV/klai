import { afterEach, describe, expect, it, vi } from "vitest";
import { requestCoordinates } from "../lib/geolocation";

const mockGeolocation = (impl: (success: PositionCallback, error: PositionErrorCallback, options?: PositionOptions) => void) => {
  vi.stubGlobal("navigator", { geolocation: { getCurrentPosition: vi.fn(impl) } });
};

const position = (lat: number, lng: number, accuracy = 1000) => ({ coords: { latitude: lat, longitude: lng, accuracy } }) as GeolocationPosition;

describe("requestCoordinates", () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

  it("resolves as soon as the low-accuracy fix comes back, without requesting high accuracy when no callback is given", async () => {
    let highAccuracyCalls = 0;
    mockGeolocation((success, _error, options) => {
      if (options?.enableHighAccuracy) { highAccuracyCalls++; return; }
      success(position(13.75, 100.5));
    });
    const result = await requestCoordinates();
    expect(result).toEqual({ lat: 13.75, lng: 100.5 });
    expect(highAccuracyCalls).toBe(0); // no onRefine passed — no reason to spend battery on a second fix
  });

  it("resolves the low-accuracy fix without waiting for the high-accuracy one when onRefine is given", async () => {
    mockGeolocation((success, _error, options) => {
      if (options?.enableHighAccuracy) return; // never resolves — must not block the promise
      success(position(13.75, 100.5));
    });
    const result = await requestCoordinates(() => {});
    expect(result).toEqual({ lat: 13.75, lng: 100.5 });
  });

  it("rejects when the browser has no geolocation support", async () => {
    vi.stubGlobal("navigator", {});
    await expect(requestCoordinates()).rejects.toThrow("เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง");
  });

  it("rejects with a friendly message when the user denies both requests", async () => {
    mockGeolocation((_success, error) => error({ code: 1, message: "denied" } as GeolocationPositionError));
    await expect(requestCoordinates()).rejects.toThrow("กรุณาอนุญาตการเข้าถึงตำแหน่ง เพื่อค้นหาร้านใกล้คุณ");
  });

  it("calls onRefine with the high-accuracy fix once it arrives, if it differs from the first", async () => {
    mockGeolocation((success, _error, options) => {
      if (options?.enableHighAccuracy) { success(position(13.76, 100.51)); return; }
      success(position(13.75, 100.5));
    });
    const onRefine = vi.fn();
    await requestCoordinates(onRefine);
    await vi.waitFor(() => expect(onRefine).toHaveBeenCalledWith({ lat: 13.76, lng: 100.51 }));
  });

  it("does not call onRefine when the high-accuracy fix matches the low-accuracy one", async () => {
    mockGeolocation((success) => success(position(13.75, 100.5)));
    const onRefine = vi.fn();
    await requestCoordinates(onRefine);
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(onRefine).not.toHaveBeenCalled();
  });

  it("does not throw when the high-accuracy request errors out after resolving", async () => {
    mockGeolocation((success, error, options) => {
      if (options?.enableHighAccuracy) { error({ code: 3, message: "timeout" } as GeolocationPositionError); return; }
      success(position(13.75, 100.5));
    });
    const onRefine = vi.fn();
    await expect(requestCoordinates(onRefine)).resolves.toEqual({ lat: 13.75, lng: 100.5 });
    expect(onRefine).not.toHaveBeenCalled();
  });
});
