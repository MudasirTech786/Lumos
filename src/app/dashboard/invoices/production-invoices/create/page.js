"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Layout from "@/components/Layout";
import api from "@/lib/api";
import toast from "react-hot-toast";

import {
    ArrowLeft,
    Receipt,
    Plus,
    Trash2,
    Save,
} from "lucide-react";

function CreateProductionInvoiceContent() {

    const router = useRouter();
    const searchParams = useSearchParams();

    const shootId = searchParams.get("shoot_id");

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        shoot_id: "",
        title: "",
        issue_date: new Date().toISOString().split("T")[0],
        due_date: "",
        tax_percentage: 0,
        discount_amount: 0,
        notes: "",
    });

    useEffect(() => {
        if (shootId) {
            setForm((prev) => ({
                ...prev,
                shoot_id: shootId,
            }));
        }
    }, [shootId]);

    const [items, setItems] = useState([
        {
            description: "",
            quantity: 1,
            unit_price: 0,
        },
    ]);

    const subtotal = useMemo(() => {
        return items.reduce((sum, item) => {
            return (
                sum +
                (Number(item.quantity) || 0) *
                (Number(item.unit_price) || 0)
            );
        }, 0);
    }, [items]);

    const taxAmount = useMemo(() => {
        return (
            subtotal *
            (Number(form.tax_percentage || 0) / 100)
        );
    }, [subtotal, form.tax_percentage]);

    const grandTotal = useMemo(() => {
        return (
            subtotal +
            taxAmount -
            Number(form.discount_amount || 0)
        );
    }, [
        subtotal,
        taxAmount,
        form.discount_amount,
    ]);

    const updateItem = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = value;
        setItems(updated);
    };

    const addItem = () => {
        setItems([
            ...items,
            {
                description: "",
                quantity: 1,
                unit_price: 0,
            },
        ]);
    };

    const removeItem = (index) => {
        if (items.length === 1) return;

        setItems(
            items.filter((_, i) => i !== index)
        );
    };

    const handleSubmit = async () => {
        try {

            setLoading(true);

            await api.post(
                "/production-invoices",
                {
                    ...form,
                    items,
                }
            );

            toast.success(
                "Invoice created successfully"
            );

            router.back();

        } catch (error) {

            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to create invoice"
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50">

                <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

                    <div className="flex items-center justify-between">

                        <div>

                            <button
                                onClick={() => router.back()}
                                className="flex items-center gap-2 text-blue-600 font-medium mb-4"
                            >
                                <ArrowLeft size={16} />
                                Back
                            </button>

                            <h1 className="text-4xl font-black text-slate-900">
                                Create Production Invoice
                            </h1>

                            <p className="text-slate-500 mt-2">
                                Create invoice for shoot #{shootId || "-"}
                            </p>

                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="
                                inline-flex
                                items-center
                                gap-2
                                px-6
                                py-3
                                bg-blue-600
                                hover:bg-blue-700
                                text-white
                                rounded-2xl
                                font-bold
                                disabled:opacity-50
                            "
                        >
                            <Save size={16} />
                            {loading
                                ? "Creating..."
                                : "Create Invoice"}
                        </button>

                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 p-8">

                        <div className="flex items-center gap-3 mb-6">

                            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Receipt
                                    size={16}
                                    className="text-blue-600"
                                />
                            </div>

                            <h2 className="text-xl font-bold">
                                Invoice Details
                            </h2>

                        </div>

                        <div className="grid md:grid-cols-2 gap-6">

                            <div>
                                <label className="block mb-2 text-sm font-semibold">
                                    Title
                                </label>

                                <input
                                    value={form.title}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            title: e.target.value,
                                        })
                                    }
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3"
                                    placeholder="50% Advance Payment"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-semibold">
                                    Shoot ID
                                </label>

                                <input
                                    value={form.shoot_id}
                                    readOnly
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-semibold">
                                    Issue Date
                                </label>

                                <input
                                    type="date"
                                    value={form.issue_date}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            issue_date:
                                                e.target.value,
                                        })
                                    }
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-semibold">
                                    Due Date
                                </label>

                                <input
                                    type="date"
                                    value={form.due_date}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            due_date:
                                                e.target.value,
                                        })
                                    }
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3"
                                />
                            </div>

                        </div>

                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 p-8">

                        <div className="flex justify-between items-center mb-6">

                            <h2 className="text-xl font-bold">
                                Invoice Items
                            </h2>

                            <button
                                onClick={addItem}
                                className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    px-4
                                    py-2
                                    rounded-xl
                                    bg-blue-600
                                    text-white
                                "
                            >
                                <Plus size={14} />
                                Add Item
                            </button>

                        </div>

                        <div className="space-y-4">

                            {items.map((item, index) => (

                                <div
                                    key={index}
                                    className="grid md:grid-cols-12 gap-4 border border-slate-200 rounded-2xl p-4"
                                >

                                    <div className="md:col-span-5">
                                        <input
                                            placeholder="Description"
                                            value={item.description}
                                            onChange={(e) =>
                                                updateItem(
                                                    index,
                                                    "description",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-xl px-4 py-3"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) =>
                                                updateItem(
                                                    index,
                                                    "quantity",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-xl px-4 py-3"
                                        />
                                    </div>

                                    <div className="md:col-span-3">
                                        <input
                                            type="number"
                                            value={item.unit_price}
                                            onChange={(e) =>
                                                updateItem(
                                                    index,
                                                    "unit_price",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-xl px-4 py-3"
                                        />
                                    </div>

                                    <div className="md:col-span-1 flex items-center font-black">
                                        Rs{" "}
                                        {(
                                            Number(item.quantity || 0) *
                                            Number(item.unit_price || 0)
                                        ).toLocaleString()}
                                    </div>

                                    <div className="md:col-span-1 flex items-center justify-center">
                                        <button
                                            onClick={() =>
                                                removeItem(index)
                                            }
                                            className="text-red-500"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 p-8">

                        <h2 className="text-xl font-bold mb-6">
                            Invoice Summary
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">

                            <div>
                                <label className="block mb-2 text-sm font-semibold">
                                    Tax %
                                </label>

                                <input
                                    type="number"
                                    value={form.tax_percentage}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            tax_percentage:
                                                e.target.value,
                                        })
                                    }
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-semibold">
                                    Discount
                                </label>

                                <input
                                    type="number"
                                    value={form.discount_amount}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            discount_amount:
                                                e.target.value,
                                        })
                                    }
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3"
                                />
                            </div>

                        </div>

                        <div className="mt-8 space-y-3 text-lg">

                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>
                                    Rs {subtotal.toLocaleString()}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span>Tax</span>
                                <span>
                                    Rs {taxAmount.toLocaleString()}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span>Discount</span>
                                <span>
                                    Rs {Number(
                                        form.discount_amount || 0
                                    ).toLocaleString()}
                                </span>
                            </div>

                            <div className="flex justify-between text-2xl font-black text-blue-600 pt-4 border-t">

                                <span>Total</span>

                                <span>
                                    Rs {grandTotal.toLocaleString()}
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </Layout>
    );
}

export default function CreateProductionInvoicePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CreateProductionInvoiceContent />
        </Suspense>
    );
}