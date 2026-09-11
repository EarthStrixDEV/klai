import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readSource = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const hostsIn = (source: string) => [...source.matchAll(/https:\/\/([a-z0-9.-]+)/g)].map((match) => match[1]);

describe("service worker data hosts", () => {
  // sw.js เป็นไฟล์ static นอก module graph จึงต้องกันด้วย test ว่ารายชื่อ host ไม่หลุดจาก lib ที่เรียกจริง
  it("covers every external host the app fetches from", () => {
    const worker = readSource("public/sw.js");
    const called = new Set([
      ...hostsIn(readSource("lib/overpass.ts")),
      ...hostsIn(readSource("lib/fuel-prices.ts")),
      ...hostsIn(readSource("lib/weather.ts")),
    ]);

    const missing = [...called].filter((host) => !worker.includes(`"${host}"`));
    expect(missing, `sw.js ไม่ได้แคช host เหล่านี้: ${missing.join(", ")}`).toEqual([]);
  });

  it("caches the routes that have pages", () => {
    const worker = readSource("public/sw.js");
    for (const route of ["/map", "/stores", "/favorites", "/emergency", "/shopping-list", "/about"]) {
      expect(worker).toContain(`"${route}"`);
    }
  });
});
