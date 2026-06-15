import api from "@/lib/api";

export const getAssets = async (params = {}) => {
  const response = await api.get(
    "/inventory/inventory-assets",
    {
      params,
    }
  );

  return response.data;
};

export const getAsset = async (id) => {
  const response = await api.get(
    `/inventory/inventory-assets/${id}`
  );

  return response.data;
};

export const lookupAsset = async (uuid) => {
  const response = await api.get(
    `/inventory/inventory-assets/lookup/${uuid}`
  );

  return response.data;
};

export const updateAssetStatus = async (
  assetId,
  status,
  notes = ""
) => {
  const response = await api.post(
    `/inventory/inventory-assets/${assetId}/status`,
    {
      status,
      notes,
    }
  );

  return response.data;
};

export const allocateAsset = async (
  assetId,
  shootId
) => {

  const response =
    await api.post(
      `/inventory-assets/${assetId}/allocate`,
      {
        shoot_id: shootId,
      }
    );

  return response.data;
};

export const returnAsset = async (
  assetId
) => {

  const response =
    await api.post(
      `/inventory-assets/${assetId}/return`
    );

  return response.data;
};

export const getShoots = async () => {

  const response =
    await api.get("/shoots");

  return response.data;
};