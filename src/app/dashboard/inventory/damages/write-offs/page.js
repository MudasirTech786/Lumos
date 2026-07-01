"use client";

import { useEffect, useMemo, useState } from "react";

import Layout from "@/components/Layout";

import api from "@/lib/api";

import progressToast from "@/lib/progressToast";

import {
  ArchiveX,
  Plus,
  Search,
  BadgeDollarSign,
  ShieldAlert,
  CalendarClock,
  Boxes,
  ClipboardX,
  X,
} from "lucide-react";

export default function WriteOffsPage() {

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [writeOffs, setWriteOffs] =
    useState([]);

  const [items, setItems] =
    useState([]);

  const [damageReports, setDamageReports] =
    useState([]);

  const [showForm, setShowForm] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [form, setForm] =
    useState({

      inventory_item_id: "",

      damage_report_id: "",

      reason: "",

      notes: "",

      estimated_loss_value: "",
    });

  /* ========================================================= */
  /* FETCH */
  /* ========================================================= */

  const fetchData = async () => {

    try {

      const [
        writeoffsRes,
        itemsRes,
        reportsRes,
      ] = await Promise.all([

        api.get(
          "/inventory/write-offs"
        ),

        api.get(
          "/inventory/items"
        ),

        api.get(
          "/inventory/damage-reports"
        ),
      ]);

      setWriteOffs(

        writeoffsRes.data
          ?.write_offs?.data ||

        []
      );

      setItems(

        itemsRes.data?.data ||

        itemsRes.data ||

        []
      );

      setDamageReports(

        reportsRes.data
          ?.reports?.data ||

        []
      );

    } catch (error) {

      console.log(error);

      const pToastId = progressToast.loading({ title: "Error", message: "Failed loading write-offs" });
      progressToast.error(pToastId, { title: "Error", message: "Failed loading write-offs" });

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {

    fetchData();

  }, []);

  /* ========================================================= */
  /* CREATE */
  /* ========================================================= */

  const createWriteOff = async () => {

    if (
      !form.inventory_item_id
    ) {

      const pToastId = progressToast.loading({ title: "Error", message: "Select inventory item" });
      progressToast.error(pToastId, { title: "Error", message: "Select inventory item" });

      return;
    }

    if (!form.reason) {

      const pToastId = progressToast.loading({ title: "Error", message: "Enter reason" });
      progressToast.error(pToastId, { title: "Error", message: "Enter reason" });

      return;
    }

    setSaving(true);

    const pToastId = progressToast.loading({ title: "Creating...", message: "Creating write-off..." });

    try {

      await api.post(

        "/inventory/write-offs",

        form
      );

      progressToast.success(pToastId, { title: "Completed", message: "Write-off completed" });

      setForm({

        inventory_item_id: "",

        damage_report_id: "",

        reason: "",

        notes: "",

        estimated_loss_value: "",
      });

      setShowForm(false);

      fetchData();

    } catch (error) {

      console.log(error);

      progressToast.error(pToastId, { title: "Error", message: error.response?.data?.message || "Failed creating write-off" });

    } finally {

      setSaving(false);
    }
  };

  /* ========================================================= */
  /* FILTER */
  /* ========================================================= */

  const filteredWriteOffs =
    writeOffs.filter((item) => {

      return (

        (item.item?.name || "")
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        (item.reason || "")
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
      );
    });

  /* ========================================================= */
  /* STATS */
  /* ========================================================= */

  const stats = useMemo(() => {

    return {

      total:
        writeOffs.length,

      loss:

        writeOffs.reduce(

          (acc, item) =>

            acc +

            Number(
              item.estimated_loss_value ||
              0
            ),

          0
        ),
    };

  }, [writeOffs]);

  /* ========================================================= */
  /* LOADING */
  /* ========================================================= */

  if (loading) {

    return (

      <Layout>

        <div className="
          py-24
          text-center
          text-gray-500
        ">

          Loading write-offs...

        </div>

      </Layout>
    );
  }

  return (

    <Layout>

      <div className="
        mx-auto
        max-w-7xl
        pb-24
      ">

        {/* ========================================================= */}
        {/* HEADER */}
        {/* ========================================================= */}

        <div>

          <h1 className="
            text-3xl
            font-bold
            text-gray-900
          ">

            Write-Offs

          </h1>

          <p className="
            mt-2
            text-sm
            text-gray-500
          ">

            Permanently retire damaged or unusable inventory assets

          </p>

        </div>

        {/* ========================================================= */}
        {/* STATS */}
        {/* ========================================================= */}

        <div className="
          mt-10
          grid
          grid-cols-1
          gap-4
          md:grid-cols-2
        ">

          <StatCard
            title="Total Write-Offs"
            value={stats.total}
          />

          <StatCard
            title="Estimated Loss"
            value={`Rs ${stats.loss}`}
          />

        </div>

        {/* ========================================================= */}
        {/* CTA */}
        {/* ========================================================= */}

        <div className="mt-6">

          <button
            onClick={() =>
              setShowForm(true)
            }
            className="
              flex
              w-full
              items-center
              justify-between
              rounded-3xl
              bg-red-600
              px-6
              py-5
              text-left
              text-white
            "
          >

            <div>

              <h2 className="
                text-lg
                font-semibold
              ">

                New Write-Off

              </h2>

              <p className="
                mt-1
                text-sm
                text-red-100
              ">

                Permanently retire unusable inventory equipment

              </p>

            </div>

            <Plus size={22} />

          </button>

        </div>

        {/* ========================================================= */}
        {/* QUEUE */}
        {/* ========================================================= */}

        <div className="mt-6">

          <Card title="Write-Off Queue">

            {/* SEARCH */}

            <div className="
              relative
            ">

              <Search
                size={18}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search write-offs..."
                className="
                  w-full
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  pl-12
                  pr-4
                  py-4
                  text-sm
                  outline-none
                "
              />

            </div>

            {/* LIST */}

            <div className="
              mt-6
              space-y-4
            ">

              {filteredWriteOffs
                .length === 0 ? (

                <EmptyState />

              ) : (

                filteredWriteOffs.map(
                  (item) => (

                    <WriteOffCard
                      key={item.id}
                      item={item}
                    />

                  )
                )

              )}

            </div>

          </Card>

        </div>

        {/* ========================================================= */}
        {/* MODAL */}
        {/* ========================================================= */}

        {showForm && (

          <div className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            p-6
            backdrop-blur-sm
          ">

            <div className="
              w-full
              max-w-3xl
              rounded-3xl
              bg-white
              shadow-2xl
            ">

              {/* HEADER */}

              <div className="
                flex
                items-center
                justify-between
                border-b
                border-gray-100
                px-6
                py-5
              ">

                <div>

                  <h2 className="
                    text-xl
                    font-bold
                    text-gray-900
                  ">

                    Create Write-Off

                  </h2>

                  <p className="
                    mt-1
                    text-sm
                    text-gray-500
                  ">

                    Permanently retire inventory equipment

                  </p>

                </div>

                <button
                  onClick={() =>
                    setShowForm(false)
                  }
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-gray-100
                    text-gray-500
                    transition
                    hover:bg-gray-200
                  "
                >

                  <X size={18} />

                </button>

              </div>

              {/* BODY */}

              <div className="
                max-h-[75vh]
                overflow-y-auto
                p-6
              ">

                <div className="
                  grid
                  grid-cols-1
                  gap-5
                  md:grid-cols-2
                ">

                  {/* ITEM */}

                  <SelectInput
                    label="Inventory Item"
                    value={
                      form.inventory_item_id
                    }
                    onChange={(value) =>
                      setForm({
                        ...form,
                        inventory_item_id:
                          value,
                      })
                    }
                    options={items.map(
                      (item) => ({

                        label:
                          item.name,

                        value:
                          item.id,
                      })
                    )}
                  />

                  {/* DAMAGE REPORT */}

                  <SelectInput
                    label="Related Damage Report"
                    value={
                      form.damage_report_id
                    }
                    onChange={(value) =>
                      setForm({
                        ...form,
                        damage_report_id:
                          value,
                      })
                    }
                    options={damageReports.map(
                      (report) => ({

                        label:

                          `${report.item?.name || "Unknown"}

                          (${report.issue_type})`,

                        value:
                          report.id,
                      })
                    )}
                  />

                  {/* REASON */}

                  <Input
                    label="Write-Off Reason"
                    value={
                      form.reason
                    }
                    onChange={(value) =>
                      setForm({
                        ...form,
                        reason:
                          value,
                      })
                    }
                    icon={
                      <ShieldAlert
                        size={18}
                      />
                    }
                    placeholder="Destroyed during transport"
                  />

                  {/* LOSS */}

                  <Input
                    label="Estimated Loss Value"
                    value={
                      form.estimated_loss_value
                    }
                    onChange={(value) =>
                      setForm({
                        ...form,
                        estimated_loss_value:
                          value,
                      })
                    }
                    type="number"
                    icon={
                      <BadgeDollarSign
                        size={18}
                      />
                    }
                    placeholder="450000"
                  />

                </div>

                {/* NOTES */}

                <div className="mt-5">

                  <label className="
                    text-sm
                    font-medium
                    text-gray-700
                  ">

                    Write-Off Notes

                  </label>

                  <textarea
                    rows={5}
                    value={
                      form.notes
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        notes:
                          e.target.value,
                      })
                    }
                    className="
                      mt-2
                      w-full
                      rounded-2xl
                      border
                      border-gray-200
                      px-4
                      py-4
                      text-sm
                      outline-none
                    "
                    placeholder="Additional write-off notes..."
                  />

                </div>

              </div>

              {/* FOOTER */}

              <div className="
                flex
                items-center
                justify-between
                border-t
                border-gray-100
                px-6
                py-5
              ">

                <div>

                  <p className="
                    text-sm
                    font-semibold
                    text-gray-700
                  ">

                    Permanent Action

                  </p>

                  <p className="
                    mt-1
                    text-xs
                    text-gray-500
                  ">

                    This inventory item will be permanently removed

                  </p>

                </div>

                <div className="
                  flex
                  items-center
                  gap-3
                ">

                  <button
                    onClick={() =>
                      setShowForm(false)
                    }
                    className="
                      rounded-2xl
                      border
                      border-gray-200
                      bg-white
                      px-5
                      py-3
                      text-sm
                      font-semibold
                      text-gray-600
                    "
                  >

                    Cancel

                  </button>

                  <button
                    onClick={
                      createWriteOff
                    }
                    disabled={saving}
                    className="
                      rounded-2xl
                      bg-red-600
                      px-6
                      py-3
                      text-sm
                      font-semibold
                      text-white
                    "
                  >

                    {saving
                      ? "Processing..."
                      : "Complete Write-Off"}

                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

      </div>

    </Layout>
  );
}

/* ========================================================= */
/* CARD */
/* ========================================================= */

function Card({
  title,
  children,
}) {

  return (

    <div className="
      rounded-3xl
      border
      border-gray-200
      bg-white
      p-6
    ">

      <h2 className="
        text-xl
        font-bold
        text-gray-900
      ">

        {title}

      </h2>

      <div className="mt-5">

        {children}

      </div>

    </div>
  );
}

/* ========================================================= */
/* STAT CARD */
/* ========================================================= */

function StatCard({
  title,
  value,
}) {

  return (

    <div className="
      rounded-3xl
      border
      border-gray-200
      bg-white
      p-5
    ">

      <p className="
        text-sm
        text-gray-500
      ">

        {title}

      </p>

      <h3 className="
        mt-3
        text-2xl
        font-bold
        text-gray-900
      ">

        {value}

      </h3>

    </div>
  );
}

/* ========================================================= */
/* EMPTY */
/* ========================================================= */

function EmptyState() {

  return (

    <div className="
      rounded-2xl
      border
      border-dashed
      border-gray-300
      py-20
      text-center
    ">

      <ClipboardX
        size={48}
        className="
          mx-auto
          text-gray-300
        "
      />

      <h3 className="
        mt-4
        text-lg
        font-semibold
        text-gray-900
      ">

        No write-offs found

      </h3>

      <p className="
        mt-2
        text-sm
        text-gray-500
      ">

        Retired inventory history will appear here

      </p>

    </div>
  );
}

/* ========================================================= */
/* WRITEOFF CARD */
/* ========================================================= */

function WriteOffCard({
  item,
}) {

  return (

    <div className="
      rounded-2xl
      border
      border-gray-200
      p-5
    ">

      <div className="
        flex
        flex-col
        gap-5
      ">

        <div>

          <h3 className="
            text-xl
            font-bold
            text-gray-900
          ">

            {item.item?.name}

          </h3>

        </div>

        <div className="
          grid
          grid-cols-1
          gap-4
          md:grid-cols-2
        ">

          <InfoRow
            icon={
              <ShieldAlert
                size={18}
              />
            }
            label="Reason"
            value={
              item.reason
            }
          />

          <InfoRow
            icon={
              <BadgeDollarSign
                size={18}
              />
            }
            label="Estimated Loss"
            value={`Rs ${item.estimated_loss_value || 0}`}
          />

          <InfoRow
            icon={
              <CalendarClock
                size={18}
              />
            }
            label="Written Off"
            value={
              item.written_off_at
                ? new Date(
                  item.written_off_at
                ).toLocaleDateString()
                : "—"
            }
          />

          <InfoRow
            icon={
              <Boxes size={18} />
            }
            label="Approver"
            value={
              item.approver?.name ||
              "—"
            }
          />

        </div>

        {item.notes && (

          <div className="
            rounded-2xl
            bg-gray-50
            p-4
          ">

            <p className="
              text-xs
              font-semibold
              uppercase
              tracking-wider
              text-gray-400
            ">

              Write-Off Notes

            </p>

            <p className="
              mt-2
              text-sm
              text-gray-700
            ">

              {item.notes}

            </p>

          </div>

        )}

      </div>

    </div>
  );
}

/* ========================================================= */
/* INPUT */
/* ========================================================= */

function Input({
  label,
  value,
  onChange,
  icon,
  type = "text",
  placeholder = "",
}) {

  return (

    <div>

      <label className="
        text-sm
        font-medium
        text-gray-700
      ">

        {label}

      </label>

      <div className="
        relative
        mt-2
      ">

        {icon && (

          <div className="
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-gray-400
          ">

            {icon}

          </div>

        )}

        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className={`
            w-full
            rounded-2xl
            border
            border-gray-200
            bg-white
            ${icon
              ? "pl-12"
              : "pl-4"
            }
            pr-4
            py-4
            text-sm
            outline-none
          `}
        />

      </div>

    </div>
  );
}

/* ========================================================= */
/* SELECT */
/* ========================================================= */

function SelectInput({
  label,
  value,
  onChange,
  options,
}) {

  return (

    <div>

      <label className="
        text-sm
        font-medium
        text-gray-700
      ">

        {label}

      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="
          mt-2
          w-full
          rounded-2xl
          border
          border-gray-200
          bg-white
          px-4
          py-4
          text-sm
          outline-none
        "
      >

        <option value="">
          Select
        </option>

        {options.map((option) => (

          <option
            key={option.value}
            value={option.value}
          >

            {option.label}

          </option>

        ))}

      </select>

    </div>
  );
}

/* ========================================================= */
/* INFO */
/* ========================================================= */

function InfoRow({
  icon,
  label,
  value,
}) {

  return (

    <div className="
      flex
      items-start
      gap-3
    ">

      <div className="
        mt-0.5
        text-gray-400
      ">

        {icon}

      </div>

      <div>

        <p className="
          text-xs
          text-gray-500
        ">

          {label}

        </p>

        <p className="
          mt-1
          text-sm
          font-medium
          text-gray-900
        ">

          {value}

        </p>

      </div>

    </div>
  );
}