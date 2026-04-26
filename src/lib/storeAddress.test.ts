import { buildStoreAddressPayload, formatStoreAddress } from "@/lib/storeAddress";

describe("buildStoreAddressPayload", () => {
  it("keeps address fields for a physical store", () => {
    expect(
      buildStoreAddressPayload({
        isCreate: true,
        isOnlineStore: false,
        formAddressLine: "Av. Paulista, 1000",
        formComplement: "Apt 302",
        formNeighborhood: "Bela Vista",
        formLatitude: "-23.561684",
        formLongitude: "-46.656139"
      })
    ).toEqual({
      payload: {
        addressLine: "Av. Paulista, 1000",
        complement: "Apt 302",
        neighborhood: "Bela Vista",
        latitude: -23.561684,
        longitude: -46.656139
      },
      hasChanges: true,
      hasAddress: true,
      hasCoordinates: true,
      addressChanged: true,
      isCleared: false
    });
  });

  it("clears address fields for an online-only store on create", () => {
    expect(
      buildStoreAddressPayload({
        isCreate: true,
        isOnlineStore: true,
        formAddressLine: "",
        formComplement: "",
        formNeighborhood: "",
        formLatitude: "",
        formLongitude: ""
      })
    ).toEqual({
      payload: {
        addressLine: null,
        complement: null,
        neighborhood: null,
        latitude: null,
        longitude: null
      },
      hasChanges: true,
      hasAddress: false,
      hasCoordinates: false,
      addressChanged: false,
      isCleared: true
    });
  });

  it("clears persisted address fields when editing a store to online-only", () => {
    expect(
      buildStoreAddressPayload({
        isCreate: false,
        isOnlineStore: true,
        formAddressLine: "",
        formComplement: "",
        formNeighborhood: "",
        formLatitude: "",
        formLongitude: "",
        current: {
          addressLine: "Av. Paulista, 1000",
          complement: "Apt 302",
          neighborhood: "Bela Vista",
          latitude: -23.561684,
          longitude: -46.656139
        }
      })
    ).toEqual({
      payload: {
        addressLine: null,
        complement: null,
        neighborhood: null,
        latitude: null,
        longitude: null
      },
      hasChanges: true,
      hasAddress: false,
      hasCoordinates: false,
      addressChanged: true,
      isCleared: true
    });
  });

  it("clears neighborhood and coordinates when the address is manually removed", () => {
    expect(
      buildStoreAddressPayload({
        isCreate: false,
        isOnlineStore: false,
        formAddressLine: "",
        formComplement: "",
        formNeighborhood: "",
        formLatitude: "",
        formLongitude: "",
        current: {
          addressLine: "Av. Paulista, 1000",
          complement: null,
          neighborhood: "Bela Vista",
          latitude: -23.561684,
          longitude: -46.656139
        }
      })
    ).toEqual({
      payload: {
        addressLine: null,
        neighborhood: null,
        latitude: null,
        longitude: null
      },
      hasChanges: true,
      hasAddress: false,
      hasCoordinates: false,
      addressChanged: true,
      isCleared: true
    });
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
