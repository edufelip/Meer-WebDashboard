import { extractNeighborhoodFromMapboxFeature } from "@/lib/mapbox";

describe("extractNeighborhoodFromMapboxFeature", () => {
  it("uses locality when neighborhood is missing", () => {
    const feature = {
      context: [
        { id: "postcode.1", text: "05416-000" },
        { id: "locality.2", text_pt: "Pinheiros", text: "Pinheiros" },
        { id: "place.3", text_pt: "São Paulo", text: "Sao Paulo" }
      ]
    };

    expect(extractNeighborhoodFromMapboxFeature(feature)).toBe("Pinheiros");
  });

  it("prioritizes neighborhood over locality and place", () => {
    const feature = {
      context: [
        { id: "neighborhood.1", text_pt: "Vila Madalena" },
        { id: "locality.2", text_pt: "Pinheiros" },
        { id: "place.3", text_pt: "São Paulo" }
      ]
    };

    expect(extractNeighborhoodFromMapboxFeature(feature)).toBe("Vila Madalena");
  });

  it("falls back to place when no smaller region exists", () => {
    const feature = {
      context: [{ id: "place.3", text_pt: "São Paulo" }]
    };

    expect(extractNeighborhoodFromMapboxFeature(feature)).toBe("São Paulo");
  });

  it("returns undefined with missing context", () => {
    expect(extractNeighborhoodFromMapboxFeature(undefined)).toBeUndefined();
    expect(extractNeighborhoodFromMapboxFeature({})).toBeUndefined();
  });
});
