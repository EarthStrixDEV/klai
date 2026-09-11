import { describe, expect, it } from "vitest";
import { loyaltyProgramFor, loyaltyProgramForFuel } from "../lib/loyalty";

describe("loyaltyProgramFor", () => {
  it("names the programme for brands the spec lists", () => {
    expect(loyaltyProgramFor("seven-eleven")).toBe("All Member");
    expect(loyaltyProgramFor("ptt")).toBe("Blue Card");
    expect(loyaltyProgramFor("cafe-amazon")).toBe("Blue Card");
    expect(loyaltyProgramFor("inthanin")).toBe("Greenmiles");
  });

  it("returns null for brands whose programme has not been verified", () => {
    // spec/klai-spec.md Open Questions: ยังไม่ได้เช็คว่า CJ More / Chao Doi มีระบบแต้มไหม
    expect(loyaltyProgramFor("cj-more")).toBeNull();
    expect(loyaltyProgramFor("chao-doi")).toBeNull();
    expect(loyaltyProgramFor("jiffy")).toBeNull();
    expect(loyaltyProgramFor("black-canyon")).toBeNull();
    expect(loyaltyProgramFor("ev-charging")).toBeNull();
  });
});

describe("loyaltyProgramForFuel", () => {
  it("maps the fuel-brand side onto the same programmes", () => {
    expect(loyaltyProgramForFuel("PTT")).toBe("Blue Card");
    expect(loyaltyProgramForFuel("Bangchak")).toBe("Greenmiles");
  });

  it("returns null for fuel brands with no verified programme", () => {
    expect(loyaltyProgramForFuel("PT")).toBeNull();
    expect(loyaltyProgramForFuel("Caltex")).toBeNull();
  });
});
