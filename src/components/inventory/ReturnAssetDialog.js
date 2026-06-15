"use client";

import api from "@/lib/api";

export default function ReturnAssetDialog({
  open,
  asset,
  onClose,
  onSuccess,
}) {

  const submit = async () => {

    await api.post(
      `/inventory-assets/${asset.id}/return`
    );

    onSuccess();
  };

  if (!open) return null;

  return (

    <div className="fixed inset-0 z-[100]">

      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="absolute left-1/2 top-1/2 w-[420px] -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6">

        <h2 className="font-bold text-lg">
          Return Asset
        </h2>

        <p className="text-gray-500 mt-2">
          Are you sure you want to
          return this asset?
        </p>

        <div className="flex justify-end gap-2 mt-5">

          <button
            onClick={onClose}
            className="border px-4 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Return Asset
          </button>

        </div>

      </div>

    </div>
  );
}