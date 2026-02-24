import { formatStoreAddress, resolveComplementPayload } from "@/lib/storeAddress";

describe("resolveComplementPayload", () => {
  it("includes complement on create when provided", () => {
    expect(
      resolveComplementPayload({
        isCreate: true,
        formComplement: "Suite 12"
      })
    ).toEqual({ include: true, value: "Suite 12" });
  });

  it("includes updated complement on edit", () => {
    expect(
      resolveComplementPayload({
        isCreate: false,
        formComplement: "Apt 302",
        currentComplement: "Suite 12"
      })
    ).toEqual({ include: true, value: "Apt 302" });
  });

  it("includes empty string to clear complement on edit", () => {
    expect(
      resolveComplementPayload({
        isCreate: false,
        formComplement: "",
        currentComplement: "Apt 302"
      })
    ).toEqual({ include: true, value: "" });
  });

  it("omits complement when unchanged or missing in old payloads", () => {
    expect(
      resolveComplementPayload({
        isCreate: false,
        formComplement: "",
        currentComplement: undefined
      })
    ).toEqual({ include: false });
  });
});

describe("formatStoreAddress", () => {
  it("renders address without complement when complement is missing", () => {
    expect(
      formatStoreAddress({
        addressLine: "Av. Paulista, 1000"
      })
    ).toBe("Av. Paulista, 1000");
  });

  it("renders address with complement when present", () => {
    expect(
      formatStoreAddress({
        addressLine: "Av. Paulista, 1000",
        complement: "Apt 302"
      })
    ).toBe("Av. Paulista, 1000, Apt 302");
  });
});
