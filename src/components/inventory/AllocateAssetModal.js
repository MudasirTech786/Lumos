"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function AllocateAssetModal({
  open,
  asset,
  onClose,
  onSuccess,
}) {

  const [shoots, setShoots] =
    useState([]);

  const [shootId, setShootId] =
    useState("");

  const [notes, setNotes] =
    useState("");

  useEffect(() => {

    if (!open) return;

    api
      .get("/shoots")
      .then((res) => {
        setShoots(
          res.data.data || []
        );
      });

  }, [open]);

  const allocate = async () => {

    await api.post(
      `/inventory-assets/${asset.id}/allocate`,
      {
        shoot_id: shootId,
        notes,
      }
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

      <div className="absolute left-1/2 top-1/2 w-[500px] -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6">

        <h2 className="font-bold text-lg mb-4">
          Allocate Asset
        </h2>

        <select
          value={shootId}
          onChange={(e) =>
            setShootId(
              e.target.value
            )
          }
          className="w-full border rounded-lg p-3"
        >
          <option value="">
            Select Shoot
          </option>

          {shoots.map((shoot) => (
            <option
              key={shoot.id}
              value={shoot.id}
            >
              {shoot.title}
            </option>
          ))}
        </select>

        <textarea
          value={notes}
          onChange={(e) =>
            setNotes(
              e.target.value
            )
          }
          className="w-full border rounded-lg p-3 mt-3"
          rows={4}
          placeholder="Notes"
        />

        <div className="flex justify-end gap-2 mt-4">

          <button
            onClick={onClose}
            className="border px-4 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={allocate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Allocate
          </button>

        </div>

      </div>

    </div>
  );
}