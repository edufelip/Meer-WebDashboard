type StoreAddressLike = {
  addressLine?: string | null;
  complement?: string | null;
};

type StoreAddressPayloadFields = {
  addressLine: string | null;
  complement: string | null;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
};

const normalize = (value?: string | null) => (value ?? "").trim();

export function formatStoreAddress(store?: StoreAddressLike | null): string | null {
  const addressLine = normalize(store?.addressLine);
  if (!addressLine) return null;

  const complement = normalize(store?.complement);
  if (!complement) return addressLine;

  return `${addressLine}, ${complement}`;
}

export function buildStoreAddressPayload({
  isCreate,
  isOnlineStore,
  formAddressLine,
  formComplement,
  formNeighborhood,
  formLatitude,
  formLongitude,
  current
}: {
  isCreate: boolean;
  isOnlineStore: boolean;
  formAddressLine: string;
  formComplement: string;
  formNeighborhood: string;
  formLatitude: string;
  formLongitude: string;
  current?: Partial<StoreAddressPayloadFields> | null;
}): {
  payload: Partial<StoreAddressPayloadFields>;
  hasChanges: boolean;
  hasAddress: boolean;
  hasCoordinates: boolean;
  addressChanged: boolean;
  isCleared: boolean;
  error?: string;
} {
  const addressLine = normalize(formAddressLine);
  const complement = normalize(formComplement);
  const neighborhood = normalize(formNeighborhood);
  const latText = formLatitude.trim();
  const lngText = formLongitude.trim();

  const hasLat = latText !== "";
  const hasLng = lngText !== "";
  const hasAddress = addressLine !== "";
  const shouldClear = isOnlineStore || !hasAddress;
  const payload: Partial<StoreAddressPayloadFields> = {};

  const currentAddressLine = normalize(current?.addressLine);
  const currentComplement = normalize(current?.complement);
  const currentNeighborhood = normalize(current?.neighborhood);
  const currentLatitude = current?.latitude ?? null;
  const currentLongitude = current?.longitude ?? null;

  const setFieldIfChanged = <K extends keyof StoreAddressPayloadFields>(key: K, next: StoreAddressPayloadFields[K]) => {
    const currentValue = current?.[key] ?? null;
    if (isCreate || currentValue !== next) {
      payload[key] = next;
    }
  };

  if (hasLat !== hasLng) {
    return {
      payload: {},
      hasChanges: false,
      hasAddress,
      hasCoordinates: false,
      addressChanged: addressLine !== currentAddressLine,
      isCleared: shouldClear,
      error: "Latitude e longitude devem ser enviadas juntas."
    };
  }

  if (shouldClear) {
    setFieldIfChanged("addressLine", null);
    setFieldIfChanged("complement", null);
    setFieldIfChanged("neighborhood", null);
    setFieldIfChanged("latitude", null);
    setFieldIfChanged("longitude", null);

    return {
      payload,
      hasChanges: Object.keys(payload).length > 0,
      hasAddress: false,
      hasCoordinates: false,
      addressChanged: addressLine !== currentAddressLine,
      isCleared: true
    };
  }

  if (!hasLat || !hasLng) {
    return {
      payload,
      hasChanges: false,
      hasAddress: true,
      hasCoordinates: false,
      addressChanged: addressLine !== currentAddressLine,
      isCleared: false
    };
  }

  const latitude = Number(latText);
  const longitude = Number(lngText);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return {
      payload: {},
      hasChanges: false,
      hasAddress: true,
      hasCoordinates: true,
      addressChanged: addressLine !== currentAddressLine,
      isCleared: false,
      error: "Latitude e longitude devem ser números."
    };
  }

  if (isCreate || currentAddressLine !== addressLine) {
    payload.addressLine = addressLine;
  }
  if (isCreate || currentComplement !== complement) {
    payload.complement = complement || null;
  }
  if (isCreate || currentNeighborhood !== neighborhood) {
    payload.neighborhood = neighborhood || null;
  }
  if (isCreate || currentLatitude !== latitude) {
    payload.latitude = latitude;
  }
  if (isCreate || currentLongitude !== longitude) {
    payload.longitude = longitude;
  }

  return {
    payload,
    hasChanges: Object.keys(payload).length > 0,
    hasAddress: true,
    hasCoordinates: true,
    addressChanged: addressLine !== currentAddressLine,
    isCleared: false
  };
}
