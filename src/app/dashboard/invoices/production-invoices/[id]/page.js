"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Layout from "@/components/Layout";
import api from "@/lib/api";
import progressToast from "@/lib/progressToast";

import {
    ArrowLeft,
    Receipt,
    DollarSign,
    Plus,
    CheckCircle2,
} from "lucide-react";

export default function ProductionInvoiceDetailPage() {

    const { id } = useParams();

    const router = useRouter();

    const [loading, setLoading] = useState(true);

    const [invoice, setInvoice] = useState(null);

    const [paymentForm, setPaymentForm] = useState({
        payment_date:
            new Date()
                .toISOString()
                .split("T")[0],

        amount: "",

        payment_method:
            "bank_transfer",

        reference_number: "",

        notes: "",
    });

    async function fetchInvoice() {

        try {

            const res =
                await api.get(
                    `/production-invoices/${id}`
                );

            setInvoice(res.data.data || res.data);

        } catch (error) {

            console.error(error);

            const id = progressToast.loading({ title: "Error", message: "" });
            progressToast.error(id, { title: "Error", message: "Failed to load invoice" });

        } finally {

            setLoading(false);
        }
    }

    useEffect(() => {

        fetchInvoice();

    }, [id]);

    async function recordPayment() {

        const pToastId = progressToast.loading({ title: "Recording Payment", message: "Processing..." });

        try {

            await api.post(
                `/production-invoices/${id}/payments`,
                paymentForm
            );

            progressToast.success(pToastId, {
                title: "Payment Recorded",
                message: "Payment recorded successfully",
            });

            setPaymentForm({
                payment_date:
                    new Date()
                        .toISOString()
                        .split("T")[0],

                amount: "",

                payment_method:
                    "bank_transfer",

                reference_number: "",

                notes: "",
            });

            fetchInvoice();

        } catch (error) {

            progressToast.error(pToastId, {
                title: "Error",
                message: error?.response?.data?.message ||
                "Failed to record payment",
            });
        }
    }

    if (loading) {

        return (
            <Layout>
                <div className="p-8">
                    Loading...
                </div>
            </Layout>
        );
    }

    if (!invoice) {

        return (
            <Layout>
                <div className="p-8">
                    Invoice not found
                </div>
            </Layout>
        );
    }

    return (
        <Layout>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

                {/* Header */}

                <div className="bg-white border border-slate-200 rounded-3xl p-8">

                    <button
                        onClick={() => router.back()}
                        className="
            flex
            items-center
            gap-2
            text-blue-600
            font-medium
            mb-6
        "
                    >
                        <ArrowLeft size={16} />
                        Back
                    </button>

                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

                        <div>

                            <h1 className="
                text-4xl
                font-black
                text-slate-900
            ">
                                {invoice.invoice_number}
                            </h1>

                            <p className="
                text-slate-500
                mt-2
                text-lg
            ">
                                {invoice.title}
                            </p>

                        </div>

                        <div className="flex items-center gap-3">

                            <span className="
                px-4
                py-2
                rounded-full
                bg-emerald-50
                border
                border-emerald-200
                text-emerald-700
                font-bold
                text-sm
            ">
                                {invoice.status}
                            </span>

                            <button
                                onClick={() =>
                                    window.open(
                                        `/dashboard/invoices/production-invoices/${invoice.id}/print`,
                                        "_blank"
                                    )
                                }
                                className="
                    px-5
                    py-2.5
                    rounded-xl
                    bg-slate-900
                    text-white
                    font-semibold
                "
                            >
                                Print Invoice
                            </button>

                        </div>

                    </div>

                </div>

                {/* Summary */}

                <div className="grid md:grid-cols-4 gap-6">

                    <MetricCard
                        title="Invoice Total"
                        value={invoice.total_amount}
                    />

                    <MetricCard
                        title="Paid"
                        value={invoice.paid_amount}
                        color="emerald"
                    />

                    <MetricCard
                        title="Outstanding"
                        value={invoice.balance_due}
                        color="orange"
                    />

                    <MetricCard
                        title="Due Date"
                        text={new Date(invoice.due_date).toLocaleDateString("en-GB")}
                    />

                </div>

                {/* Items */}

                <div className="
    grid
    lg:grid-cols-2
    gap-6
">

                    <div className="
        bg-white
        border
        rounded-3xl
        p-6
    ">

                        <h3 className="
            text-lg
            font-bold
            mb-4
        ">
                            Invoice Details
                        </h3>

                        <div className="space-y-3">

                            <Row
                                label="Invoice #"
                                value={invoice.invoice_number}
                            />

                            <Row
                                label="Issue Date"
                                value={new Date(invoice.issue_date).toLocaleDateString("en-GB")}
                            />

                            <Row
                                label="Due Date"
                                value={new Date(invoice.due_date).toLocaleDateString("en-GB")}
                            />

                            <Row
                                label="Status"
                                value={invoice.status}
                            />

                        </div>

                    </div>

                    <div className="
        bg-white
        border
        rounded-3xl
        p-6
    ">

                        <h3 className="
            text-lg
            font-bold
            mb-4
        ">
                            Payment Summary
                        </h3>

                        <div className="space-y-3">

                            <Row
                                label="Total"
                                value={`Rs ${Number(
                                    invoice.total_amount
                                ).toLocaleString()}`}
                            />

                            <Row
                                label="Paid"
                                value={`Rs ${Number(
                                    invoice.paid_amount
                                ).toLocaleString()}`}
                            />

                            <Row
                                label="Outstanding"
                                value={`Rs ${Number(
                                    invoice.balance_due
                                ).toLocaleString()}`}
                            />

                        </div>

                    </div>

                </div>

                {/* Record Payment */}

                <div className="
    bg-white
    rounded-3xl
    border
    overflow-hidden
">

                    <div className="
        px-8
        py-5
        border-b
    ">
                        <h2 className="
            text-xl
            font-bold
        ">
                            Payment History
                        </h2>
                    </div>

                    {invoice.payments?.length ? (

                        <table className="w-full">

                            <thead>
                                <tr>
                                    <th className="px-6 py-4 text-left">
                                        Date
                                    </th>

                                    <th className="px-6 py-4 text-left">
                                        Method
                                    </th>

                                    <th className="px-6 py-4 text-left">
                                        Amount
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {invoice.payments.map(
                                    payment => (

                                        <tr key={payment.id}>

                                            <td className="px-6 py-4">
                                                {payment.payment_date}
                                            </td>

                                            <td className="px-6 py-4">
                                                {payment.payment_method}
                                            </td>

                                            <td className="px-6 py-4">
                                                Rs {Number(
                                                    payment.amount
                                                ).toLocaleString()}
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    ) : (

                        <div className="
            p-8
            text-center
            text-slate-400
        ">
                            No payments recorded
                        </div>

                    )}

                </div>

                <div className="
    bg-white
    rounded-3xl
    border
    overflow-hidden
">

                    <div className="
        px-8
        py-5
        border-b
    ">
                        <h2 className="
            text-xl
            font-bold
        ">
                            Invoice Items
                        </h2>
                    </div>

                    <table className="w-full">

                        <thead>

                            <tr>

                                <th className="px-6 py-4 text-left">
                                    Description
                                </th>

                                <th className="px-6 py-4 text-left">
                                    Qty
                                </th>

                                <th className="px-6 py-4 text-left">
                                    Rate
                                </th>

                                <th className="px-6 py-4 text-left">
                                    Amount
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {invoice.items?.map(item => (

                                <tr key={item.id}>

                                    <td className="px-6 py-4">
                                        {item.description}
                                    </td>

                                    <td className="px-6 py-4">
                                        {item.quantity}
                                    </td>

                                    <td className="px-6 py-4">
                                        Rs {Number(
                                            item.unit_price
                                        ).toLocaleString()}
                                    </td>

                                    <td className="px-6 py-4 font-bold">
                                        Rs {Number(
                                            item.line_total
                                        ).toLocaleString()}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </div>

        </Layout>
    );
    function MetricCard({
        title,
        value,
        text,
        color = "slate"
    }) {
        return (
            <div className="
            bg-white
            border
            border-slate-200
            rounded-3xl
            p-6
        ">
                <p className="
                text-sm
                text-slate-500
                mb-2
            ">
                    {title}
                </p>

                <div className={`
                text-3xl
                font-black
                ${color === "emerald"
                        ? "text-emerald-600"
                        : ""}
                ${color === "orange"
                        ? "text-orange-500"
                        : ""}
            `}>
                    {text ||
                        `Rs ${Number(
                            value || 0
                        ).toLocaleString()}`}
                </div>
            </div>
        );
    }

    function Row({
        label,
        value
    }) {
        return (
            <div className="
            flex
            justify-between
            py-2
            border-b
            border-slate-100
        ">
                <span className="text-slate-500">
                    {label}
                </span>

                <span className="font-semibold">
                    {value}
                </span>
            </div>
        );
    }
}