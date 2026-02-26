import {
  STORE_BADGES,
  getManagedStoreBadges,
  getStoreBadgeLabel,
  isKnownStoreBadge,
  normalizeStoreBadgeCode,
  normalizeStoreBadges
} from "@/lib/storeBadges";

describe("storeBadges", () => {
  it("exposes managed badges catalog", () => {
    expect(getManagedStoreBadges()).toEqual([STORE_BADGES.AMBASSADOR]);
  });

  it("normalizes badge code to uppercase", () => {
    expect(normalizeStoreBadgeCode(" ambassador ")).toBe("AMBASSADOR");
  });

  it("normalizes badges list by deduplicating and removing empty values", () => {
    expect(normalizeStoreBadges([" ambassador ", "", "AMBASSADOR", "gold"])).toEqual(["AMBASSADOR", "GOLD"]);
  });

  it("detects known badges", () => {
    expect(isKnownStoreBadge("AMBASSADOR")).toBe(true);
    expect(isKnownStoreBadge("ambassador")).toBe(true);
    expect(isKnownStoreBadge("new_badge")).toBe(false);
  });

  it("returns localized label for known badges and generic label for unknown badges", () => {
    expect(getStoreBadgeLabel("AMBASSADOR")).toBe("Embaixador");
    expect(getStoreBadgeLabel("prime_member")).toBe("PRIME MEMBER");
  });
});
