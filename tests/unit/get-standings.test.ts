import { describe, expect, it } from "vitest";
import { computeZones } from "@/lib/queries/get-standings";

describe("computeZones", () => {
  it("calculates promotion and relegation zones for top-flight league with 20 teams", () => {
    const zones = computeZones("LEAGUE", 1, 20);
    expect(zones.promotion).toEqual([1, 2, 3, 4]);
    expect(zones.relegation).toEqual([18, 19, 20]);
  });

  it("calculates promotion and relegation zones for second-tier league with 24 teams", () => {
    const zones = computeZones("LEAGUE", 2, 24);
    expect(zones.promotion).toEqual([1, 2]);
    expect(zones.relegation).toEqual([22, 23, 24]);
  });

  it("returns empty zones for CUP competitions", () => {
    const zones = computeZones("CUP", null, 32);
    expect(zones.promotion).toEqual([]);
    expect(zones.relegation).toEqual([]);
  });

  it("returns empty zones for CONTINENTAL competitions", () => {
    const zones = computeZones("CONTINENTAL", null, 36);
    expect(zones.promotion).toEqual([]);
    expect(zones.relegation).toEqual([]);
  });

  it("handles small table sizes (less than 10 rows) without relegation", () => {
    const zones = computeZones("LEAGUE", 1, 8);
    expect(zones.promotion).toEqual([1, 2, 3, 4]);
    expect(zones.relegation).toEqual([]);
  });

  it("filters out promotion positions that exceed rowCount", () => {
    const zones = computeZones("LEAGUE", 1, 3);
    expect(zones.promotion).toEqual([1, 2, 3]);
    expect(zones.relegation).toEqual([]);
  });
});
