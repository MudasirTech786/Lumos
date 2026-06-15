"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import AssetTimeline from "./AssetTimeline";
import AllocateAssetModal from "./AllocateAssetModal";
import ReturnAssetDialog from "./ReturnAssetDialog";
const [showAllocate, setShowAllocate] =
  useState(false);

const [showReturn, setShowReturn] =
  useState(false);
import {
  getAsset,
  updateAssetStatus,
} from "@/services/inventoryAssetService";

const statuses = [
  "available",
  "in_use",
  "returned",
  "damaged",
  "under_repair",
  "written_off",
];

export default function AssetDetailDrawer({
  open,
  assetId,
  onClose,
}) {
  const [asset, setAsset] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    if (!assetId || !open) return;

    loadAsset();
  }, [assetId, open]);

  const loadAsset = async () => {
    try {
      setLoading(true);

      const response =
        await getAsset(assetId);

      setAsset(
        response.data ??
        response
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (
    status
  ) => {
    await updateAssetStatus(
      asset.id,
      status
    );

    await loadAsset();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">

      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 h-full w-[550px] bg-white shadow-xl overflow-y-auto">

        <div className="sticky top-0 bg-white border-b p-4 flex justify-between">

          <div>

            <h2 className="font-bold text-xl">
              {asset?.asset_code}
            </h2>

            <p className="text-sm text-gray-500">
              {asset?.item?.name}
            </p>

          </div>

          <button
            onClick={onClose}
          >
            <X />
          </button>

        </div>

        {loading && (
          <div className="p-5">
            Loading...
          </div>
        )}

        {asset && (

          <div className="p-5 space-y-6">

            <div className="grid grid-cols-2 gap-4">

              <div>

                <label className="text-xs text-gray-500">
                  Status
                </label>

                <div>
                  {asset.status}
                </div>

              </div>

              <div>

                <label className="text-xs text-gray-500">
                  Serial Number
                </label>

                <div>
                  {asset.serial_number ||
                    "-"}
                </div>

              </div>

              <div className="col-span-2">

                <label className="text-xs text-gray-500">
                  QR UUID
                </label>

                <div className="break-all text-sm">
                  {asset.qr_uuid}
                </div>

              </div>

            </div>

            <div>
              <div>

                <h3 className="font-semibold mb-3">
                  Asset Actions
                </h3>

                <div className="flex gap-2">

                  {asset.status === "available" && (
                    <button
                      onClick={() =>
                        setShowAllocate(true)
                      }
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                      Allocate To Shoot
                    </button>
                  )}

                  {asset.status === "in_use" && (
                    <button
                      onClick={() =>
                        setShowReturn(true)
                      }
                      className="px-4 py-2 bg-green-600 text-white rounded-lg"
                    >
                      Return Asset
                    </button>
                  )}

                </div>

              </div>

              <h3 className="font-semibold mb-3">
                Status Actions
              </h3>

              <div className="flex flex-wrap gap-2">

                {statuses.map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() =>
                        handleStatus(
                          status
                        )
                      }
                      className="px-3 py-2 border rounded-lg text-sm"
                    >
                      {status.replace(
                        "_",
                        " "
                      )}
                    </button>
                  )
                )}

              </div>

            </div>

            <div>

              <div>

                <h3 className="font-semibold mb-3">
                  Assignment
                </h3>

                {asset.active_allocation ? (

                  <div className="border rounded-lg p-4">

                    <div className="font-medium">
                      {asset.active_allocation.shoot?.title}
                    </div>

                    <div className="text-sm text-gray-500 mt-1">
                      Allocated:
                      {" "}
                      {asset.active_allocation.allocated_at}
                    </div>

                  </div>

                ) : (

                  <div className="border rounded-lg p-4 text-gray-500">
                    Not allocated to any shoot
                  </div>

                )}

              </div>

              <h3 className="font-semibold mb-3">
                Timeline
              </h3>

              <AssetTimeline
                logs={
                  asset.logs || []
                }
              />

            </div>

          </div>

        )}

      </div>
      <AllocateAssetModal
        open={showAllocate}
        asset={asset}
        onClose={() =>
          setShowAllocate(false)
        }
        onSuccess={() => {
          setShowAllocate(false);
          loadAsset();
        }}
      />

      <ReturnAssetDialog
        open={showReturn}
        asset={asset}
        onClose={() =>
          setShowReturn(false)
        }
        onSuccess={() => {
          setShowReturn(false);
          loadAsset();
        }}
      />
    </div>
  );
}