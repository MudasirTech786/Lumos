"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import api from "@/lib/api";
import progressToast from "@/lib/progressToast";
import { useConfirm } from "@/context/ConfirmContext";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft, Package, Plus, Search, User,
  CheckCircle2, RotateCcw, Trash2, AlertTriangle,
  Boxes, ScanLine, ShieldCheck, Hash, X,
  ChevronDown, Layers, RefreshCw, Tag,
} from "lucide-react";

/* ─── STATUS CONFIG ──────────────────────────────────── */
const USAGE_STATUS = {
  reserved:           { label: "Reserved",           cls: "bg-amber-50  text-amber-700  border-amber-200"  },
  checked_out:        { label: "Checked Out",        cls: "bg-blue-50   text-blue-700   border-blue-200"   },
  partially_returned: { label: "Partial Return",     cls: "bg-orange-50 text-orange-700 border-orange-200" },
  returned:           { label: "Returned",           cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};
const ASSET_STATUS = {
  available:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  in_use:       "bg-blue-50    text-blue-700    border-blue-200",
  returned:     "bg-slate-100  text-slate-600   border-slate-200",
  damaged:      "bg-rose-50    text-rose-700    border-rose-200",
  under_repair: "bg-amber-50   text-amber-700   border-amber-200",
  written_off:  "bg-red-100    text-red-800     border-red-200",
};
const getUsageStatus  = (s) => USAGE_STATUS[s]  ?? { label: s, cls: "bg-slate-100 text-slate-500 border-slate-200" };
const getAssetStatus  = (s) => ASSET_STATUS[s]  ?? "bg-slate-100 text-slate-500 border-slate-200";

/* ─── SHARED PRIMITIVES ─────────────────────────────── */
const inp = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all";

function FieldLabel({ children }) {
  return <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">{children}</p>;
}

function StatusPill({ cfg }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold capitalize ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function InfoRow({ icon, label, value, mono, highlight }) {
  const vc = highlight === "rose"    ? "text-rose-600 font-bold"
           : highlight === "emerald" ? "text-emerald-600 font-bold"
           : "text-slate-800 font-semibold";
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 shrink-0">{icon}</div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 w-28 shrink-0">{label}</span>
      <span className={`text-sm flex-1 min-w-0 truncate ${mono ? "font-mono" : ""} ${vc}`}>{value ?? "—"}</span>
    </div>
  );
}

/* ─── OVERLAY MODAL ─────────────────────────────────── */
function Modal({ title, subtitle, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        style={{ boxShadow: "0 32px 64px -12px rgba(0,0,0,0.28)" }}>
        <div className="h-[3px] bg-gradient-to-r from-blue-500 to-indigo-400 rounded-t-2xl" />

        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Package size={15} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{title}</p>
              {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── INVENTORY ITEM CARD ───────────────────────────── */
function InventoryCard({ item, onCheckout, onDelete, onReturn }) {
  const statusCfg = getUsageStatus(item.status);

  return (
    <div className={[
      "rounded-2xl border overflow-hidden transition-all",
      item.asset ? "border-blue-200" : "border-slate-200",
    ].join(" ")}>
      {/* accent */}
      <div className={`h-[3px] ${item.asset ? "bg-gradient-to-r from-blue-500 to-indigo-400" : "bg-gradient-to-r from-slate-200 to-slate-300"}`} />

      <div className={`p-5 ${item.asset ? "bg-gradient-to-br from-blue-50/40 to-indigo-50/20" : "bg-white"}`}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

          {/* LEFT: info */}
          <div className="flex-1 min-w-0">

            {/* item header */}
            <div className="flex items-start gap-3 mb-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.asset ? "bg-blue-100 text-blue-600" : "bg-violet-50 text-violet-500"}`}>
                {item.asset ? <ScanLine size={17} /> : <Package size={17} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                  {item.asset ? "QR-Tracked Asset" : "Inventory Item"}
                </p>
                <h3 className="text-base font-black text-slate-900 leading-tight truncate">{item.item?.name}</h3>
                {item.item?.category && (
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <Tag size={9} /> {item.item.category}
                  </p>
                )}
              </div>
              <StatusPill cfg={statusCfg} />
            </div>

            {/* QR asset block */}
            {item.asset && (
              <div className="flex items-center gap-4 rounded-xl border border-blue-200 bg-white px-4 py-3 mb-4">
                <div className="shrink-0 bg-white border border-slate-100 rounded-xl p-1.5 shadow-sm">
                  <QRCodeSVG value={item.asset.qr_uuid} size={64} level="M" includeMargin={false} />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={11} className="text-blue-500 shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">QR Asset</span>
                  </div>
                  <p className="text-sm font-black text-slate-900 font-mono">{item.asset.asset_code}</p>
                  {item.asset.serial_number && (
                    <p className="text-[10px] font-mono text-slate-400">SN: {item.asset.serial_number}</p>
                  )}
                  <p className="text-[9px] font-mono text-slate-300 truncate">{item.asset.qr_uuid}</p>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${getAssetStatus(item.asset.status)}`}>
                    {item.asset.status?.replaceAll("_", " ") || "—"}
                  </span>
                </div>
              </div>
            )}

            {/* info rows */}
            <div className="rounded-xl border border-slate-100 bg-white divide-y divide-slate-50 overflow-hidden">
              <InfoRow icon={<User size={14} />}          label="Assigned To" value={item.assignedUser?.name || "Not assigned"} />
              <InfoRow icon={<Boxes size={14} />}         label="Quantity"    value={item.quantity} />
              <InfoRow icon={<CheckCircle2 size={14} />}  label="Returned"    value={item.returned_quantity} highlight={item.returned_quantity > 0 ? "emerald" : null} />
              <InfoRow icon={<AlertTriangle size={14} />} label="Lost"        value={item.lost_quantity || 0} highlight={item.lost_quantity > 0 ? "rose" : null} />
              {item.asset && (
                <InfoRow icon={<ScanLine size={14} />} label="Asset Code" value={item.asset.asset_code} mono />
              )}
            </div>
          </div>

          {/* RIGHT: actions */}
          <div className="flex lg:flex-col gap-2 shrink-0">
            {item.status === "reserved" && (
              <button onClick={() => onCheckout(item.id)}
                className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 transition-colors">
                <Package size={13} /> Check Out
              </button>
            )}
            {(item.status === "checked_out" || item.status === "partially_returned") && (
              <button onClick={onReturn}
                className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 transition-colors">
                <RotateCcw size={13} /> Return
              </button>
            )}
            {item.status === "reserved" && (
              <button onClick={() => onDelete(item.id)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-4 py-2.5 transition-colors">
                <Trash2 size={13} /> Delete
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

/* ─── STAT CARD ─────────────────────────────────────── */
function StatCard({ label, value, color }) {
  const colors = {
    default: "bg-white border-slate-200 text-slate-900",
    blue:    "bg-blue-50 border-blue-100 text-blue-700",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
    rose:    "bg-rose-50 border-rose-100 text-rose-700",
  };
  return (
    <div className={`rounded-2xl border px-5 py-4 shadow-sm ${colors[color] || colors.default}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════ */
export default function ShootInventoryPage() {
  const params = useParams();
  const router = useRouter();

  const [loading,          setLoading]          = useState(true);
  const [saving,           setSaving]           = useState(false);
  const [showForm,         setShowForm]         = useState(false);
  const [showReturnModal,  setShowReturnModal]  = useState(false);
  const [inventoryList,    setInventoryList]    = useState([]);
  const [items,            setItems]            = useState([]);
  const [users,            setUsers]            = useState([]);
  const [search,           setSearch]           = useState("");
  const [statusFilter,     setStatusFilter]     = useState("all");
  const [selectedUsage,    setSelectedUsage]    = useState(null);
  const [returnType,       setReturnType]       = useState("partial");

  const [form, setForm] = useState({
    inventory_item_id: "", assigned_to: "", quantity: 1, notes: "",
  });
  const [returnForm, setReturnForm] = useState({
    returned_quantity: 1, damaged_quantity: 0, lost_quantity: 0, notes: "",
  });

  const selectedItem = items.find((i) => i.id == form.inventory_item_id);

  const confirmDialog = useConfirm();

  /* ── fetch ── */
  const fetchData = async () => {
    try {
      const [invRes, itemsRes, usersRes] = await Promise.all([
        api.get(`/shoots/${params.id}/inventory`),
        api.get("/inventory/items"),
        api.get("/users"),
      ]);
      setInventoryList(invRes.data.inventory || []);
      setItems(itemsRes.data?.data || itemsRes.data || []);
      const ud = usersRes?.data?.users?.data || usersRes?.data?.data || usersRes?.data || [];
      setUsers(Array.isArray(ud) ? ud : []);
    } catch {
      const id = progressToast.loading({ title: "Error", message: "" });
      progressToast.error(id, { title: "Error", message: "Failed loading inventory" });
    }
    finally   { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  /* ── allocate ── */
  const allocateInventory = async () => {
    if (!form.inventory_item_id) { const id = progressToast.loading({ title: "Error", message: "" }); progressToast.error(id, { title: "Error", message: "Select an inventory item" }); return; }
    setSaving(true);
    const pToastId = progressToast.loading({ title: "Allocating...", message: "Allocating inventory..." });
    try {
      await api.post(`/shoots/${params.id}/inventory`, form);
      progressToast.success(pToastId, { title: "Allocated", message: "Inventory allocated" });
      setForm({ inventory_item_id: "", assigned_to: "", quantity: 1, notes: "" });
      setShowForm(false);
      fetchData();
    } catch (e) { progressToast.error(pToastId, { title: "Error", message: e.response?.data?.message || "Allocation failed" }); }
    finally     { setSaving(false); }
  };

  /* ── checkout ── */
  const checkoutItem = async (id) => {
    const pToastId = progressToast.loading({ title: "Checking out...", message: "Processing checkout..." });
    try { await api.post(`/shoot-inventory/${id}/checkout`); progressToast.success(pToastId, { title: "Checked Out", message: "Checked out" }); fetchData(); }
    catch { progressToast.error(pToastId, { title: "Error", message: "Checkout failed" }); }
  };

  /* ── return ── */
  const processReturn = async () => {
    const pToastId = progressToast.loading({ title: "Processing...", message: "Processing return..." });
    try {
      await api.post(`/shoot-inventory/${selectedUsage.id}/return`, returnForm);
      progressToast.success(pToastId, { title: "Returned", message: "Return processed" });
      setShowReturnModal(false); setSelectedUsage(null); fetchData();
    } catch (e) { progressToast.error(pToastId, { title: "Error", message: e.response?.data?.message || "Return failed" }); }
  };

  /* ── delete ── */
  const deleteAllocation = async (id) => {
    const ok = await confirmDialog({
      variant: "danger",
      title: "Delete Allocation",
      description: "This action cannot be undone.",
      confirmText: "Delete",
      confirmAction: () => api.delete(`/shoot-inventory/${id}`),
    });
    if (!ok) return;
    fetchData();
  };

  /* ── return type ── */
  const handleReturnType = (type) => {
    setReturnType(type);
    const out = selectedUsage.quantity - selectedUsage.returned_quantity - (selectedUsage.lost_quantity || 0);
    const presets = {
      full:    { returned_quantity: out, damaged_quantity: 0, lost_quantity: 0, notes: "" },
      partial: { returned_quantity: 1,   damaged_quantity: 0, lost_quantity: 0, notes: "" },
      damaged: { returned_quantity: 1,   damaged_quantity: 1, lost_quantity: 0, notes: "" },
      lost:    { returned_quantity: 0,   damaged_quantity: 0, lost_quantity: 1, notes: "" },
      mixed:   { returned_quantity: 1,   damaged_quantity: 0, lost_quantity: 0, notes: "" },
    };
    setReturnForm(presets[type]);
  };

  /* ── filter ── */
  const filtered = inventoryList.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch = !q || item.item?.name?.toLowerCase().includes(q) || item.assignedUser?.name?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  /* ── stats ── */
  const stats = useMemo(() => ({
    total:      inventoryList.length,
    checkedOut: inventoryList.filter(i => i.status === "checked_out").length,
    returned:   inventoryList.filter(i => i.status === "returned").length,
    lost:       inventoryList.reduce((s, i) => s + (i.lost_quantity || 0), 0),
  }), [inventoryList]);

  /* ── loading ── */
  if (loading) return (
    <Layout>
      <div className="min-h-screen bg-slate-50/70 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={22} className="text-slate-300 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading inventory…</p>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50/70">
        <div className="max-w-5xl mx-auto px-5 py-8 space-y-5">

          {/* ── HEADER ── */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <button onClick={() => router.back()}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors mb-3">
                <ArrowLeft size={13} /> Back
              </button>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Shoot Inventory</h1>
              <p className="text-sm text-slate-400 mt-0.5">Allocate and track equipment for this production</p>
            </div>

            <button onClick={() => setShowForm(true)}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 shadow-sm transition-colors shrink-0">
              <Plus size={15} /> Allocate
            </button>
          </div>

          {/* ── STATS ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total"       value={stats.total}      color="default" />
            <StatCard label="Checked Out" value={stats.checkedOut} color="blue"    />
            <StatCard label="Returned"    value={stats.returned}   color="emerald" />
            <StatCard label="Lost"        value={stats.lost}       color="rose"    />
          </div>

          {/* ── FILTER BAR ── */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by item name or assignee…"
                className={inp + " pl-10"} />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 focus:border-blue-400 outline-none transition-all cursor-pointer shadow-sm">
              <option value="all">All Statuses</option>
              <option value="reserved">Reserved</option>
              <option value="checked_out">Checked Out</option>
              <option value="partially_returned">Partial Return</option>
              <option value="returned">Returned</option>
            </select>
            <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-2.5 text-sm text-slate-500 font-medium shadow-sm shrink-0">
              <Layers size={13} className="text-slate-300" />
              <span><strong className="text-slate-700">{filtered.length}</strong> item{filtered.length !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* ── INVENTORY LIST ── */}
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200">
                <Package size={24} />
              </div>
              <p className="text-sm font-semibold text-slate-400">No inventory found</p>
              {search && (
                <button onClick={() => setSearch("")}
                  className="text-xs font-bold text-blue-500 hover:text-blue-700 transition-colors">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(item => (
                <InventoryCard
                  key={item.id}
                  item={item}
                  onCheckout={checkoutItem}
                  onDelete={deleteAllocation}
                  onReturn={() => {
                    setSelectedUsage(item);
                    const rem = item.quantity - item.returned_quantity - (item.lost_quantity || 0);
                    setReturnType("partial");
                    setReturnForm({ returned_quantity: rem > 0 ? 1 : 0, damaged_quantity: 0, lost_quantity: 0, notes: "" });
                    setShowReturnModal(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          ALLOCATE MODAL
      ══════════════════════════════════════════════════ */}
      {showForm && (
        <Modal
          title="Allocate Inventory"
          subtitle="Assign equipment to crew"
          onClose={() => setShowForm(false)}
          footer={
            <>
              <button onClick={() => setShowForm(false)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={allocateInventory} disabled={saving}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-bold disabled:opacity-50 transition-colors">
                {saving ? "Allocating…" : "Allocate Inventory"}
              </button>
            </>
          }
        >
          <div className="grid sm:grid-cols-2 gap-4">
            {/* item select */}
            <div className="sm:col-span-2">
              <FieldLabel>Inventory Item</FieldLabel>
              <select value={form.inventory_item_id}
                onChange={e => setForm({ ...form, inventory_item_id: e.target.value })}
                className={inp + " cursor-pointer"}>
                <option value="">Select item…</option>
                {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>

              {selectedItem && (
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${selectedItem.calculated_available > 0 ? "bg-emerald-500" : "bg-rose-500"}`} />
                  <span className="text-sm text-slate-600 flex-1">
                    <strong className="text-slate-800">{selectedItem.calculated_available}</strong> of {selectedItem.quantity} available
                  </span>
                  <span className={`text-[10px] font-bold rounded-full border px-2 py-0.5 ${selectedItem.calculated_available > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
                    {selectedItem.status}
                  </span>
                </div>
              )}
            </div>

            {/* assigned to */}
            <div>
              <FieldLabel>Assigned To</FieldLabel>
              <select value={form.assigned_to}
                onChange={e => setForm({ ...form, assigned_to: e.target.value })}
                className={inp + " cursor-pointer"}>
                <option value="">Select user…</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>

            {/* quantity */}
            <div>
              <FieldLabel>Quantity</FieldLabel>
              <input type="number" value={form.quantity}
                max={selectedItem?.calculated_available || 1}
                onChange={e => setForm({ ...form, quantity: e.target.value })}
                className={inp} />
            </div>

            {/* notes */}
            <div className="sm:col-span-2">
              <FieldLabel>Notes (optional)</FieldLabel>
              <textarea rows={3} value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Allocation notes…"
                className={inp + " resize-none"} />
            </div>
          </div>
        </Modal>
      )}

      {/* ══════════════════════════════════════════════════
          RETURN MODAL
      ══════════════════════════════════════════════════ */}
      {showReturnModal && selectedUsage && (() => {
        const outstanding = selectedUsage.quantity - selectedUsage.returned_quantity - (selectedUsage.lost_quantity || 0);
        return (
          <Modal
            title="Process Return"
            subtitle={`${selectedUsage.item?.name} · ${outstanding} outstanding`}
            onClose={() => { setShowReturnModal(false); setSelectedUsage(null); }}
            footer={
              <>
                <button onClick={() => { setShowReturnModal(false); setSelectedUsage(null); }}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button onClick={processReturn}
                  className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 text-sm font-bold transition-colors">
                  Process Return
                </button>
              </>
            }
          >
            {/* stats mini row */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Allocated",    value: selectedUsage.quantity,           color: "bg-slate-50 border-slate-200 text-slate-700" },
                { label: "Returned",     value: selectedUsage.returned_quantity,   color: "bg-emerald-50 border-emerald-100 text-emerald-700" },
                { label: "Lost",         value: selectedUsage.lost_quantity || 0, color: "bg-rose-50 border-rose-100 text-rose-700" },
                { label: "Outstanding",  value: outstanding,                       color: "bg-blue-50 border-blue-100 text-blue-700" },
              ].map(s => (
                <div key={s.label} className={`rounded-xl border px-3 py-2.5 text-center ${s.color}`}>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{s.label}</p>
                  <p className="text-xl font-black mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>

            {/* return type */}
            <div>
              <FieldLabel>Return Type</FieldLabel>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {["full","partial","damaged","lost","mixed"].map(t => (
                  <button key={t} onClick={() => handleReturnType(t)}
                    className={`rounded-xl border px-3 py-2.5 text-xs font-bold capitalize transition-all ${
                      returnType === t
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600"
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* qty inputs */}
            <div className="grid sm:grid-cols-2 gap-4">
              {returnType !== "lost" && (
                <div>
                  <FieldLabel>Returned Quantity</FieldLabel>
                  <input type="number" value={returnForm.returned_quantity}
                    onChange={e => setReturnForm({ ...returnForm, returned_quantity: Number(e.target.value) })}
                    className={inp} />
                </div>
              )}
              {(returnType === "damaged" || returnType === "mixed") && (
                <div>
                  <FieldLabel>Damaged Quantity</FieldLabel>
                  <input type="number" value={returnForm.damaged_quantity}
                    onChange={e => setReturnForm({ ...returnForm, damaged_quantity: Number(e.target.value) })}
                    className={inp} />
                </div>
              )}
              {(returnType === "lost" || returnType === "mixed") && (
                <div>
                  <FieldLabel>Lost Quantity</FieldLabel>
                  <input type="number" value={returnForm.lost_quantity}
                    onChange={e => setReturnForm({ ...returnForm, lost_quantity: Number(e.target.value) })}
                    className={inp} />
                </div>
              )}
            </div>

            {/* notes */}
            <div>
              <FieldLabel>Notes (optional)</FieldLabel>
              <textarea rows={3} value={returnForm.notes}
                onChange={e => setReturnForm({ ...returnForm, notes: e.target.value })}
                placeholder="Return notes…"
                className={inp + " resize-none"} />
            </div>
          </Modal>
        );
      })()}

    </Layout>
  );
}