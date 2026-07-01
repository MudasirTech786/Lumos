"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Layout from "@/components/Layout";
import api from "@/lib/api";
import progressToast from "@/lib/progressToast";

import {
    Plus,
    Receipt,
    Eye,
} from "lucide-react";

export default function ProductionInvoicesPage() {

    const router = useRouter();

    const [loading, setLoading] =
        useState(true);

    const [invoices, setInvoices] =
        useState([]);

    async function fetchInvoices() {

        try {

            const res =
                await api.get(
                    "/production-invoices"
                );

            setInvoices(
                res.data.data ||
                res.data
            );

        } catch (error) {

            const id = progressToast.loading({ title: "Error", message: "" });
            progressToast.error(id, { title: "Error", message: "Failed to load invoices" });

        } finally {

            setLoading(false);
        }
    }

    useEffect(() => {

        fetchInvoices();

    }, []);

    return (

        <Layout>

            <div className="
                max-w-7xl
                mx-auto
                px-6
                py-8
            ">

                <div className="
                    flex
                    justify-between
                    items-center
                    mb-8
                ">

                    <div>

                        <h1 className="
                            text-4xl
                            font-black
                        ">
                            Production Invoices
                        </h1>

                        <p className="
                            text-slate-500
                            mt-2
                        ">
                            Manage all production invoices
                        </p>

                    </div>

                    <button
                        onClick={() =>
                            router.push(
                                "/dashboard/shoots"
                            )
                        }
                        className="
                            bg-blue-600
                            text-white
                            px-5
                            py-3
                            rounded-2xl
                            font-bold
                        "
                    >
                        <Plus size={16} />
                    </button>

                </div>

                <div className="
                    bg-white
                    border
                    rounded-3xl
                    overflow-hidden
                ">

                    <table className="w-full">

                        <thead>

                            <tr className="
                                bg-slate-50
                                border-b
                            ">

                                <th className="
                                    px-6
                                    py-4
                                    text-left
                                ">
                                    Invoice #
                                </th>

                                <th className="
                                    px-6
                                    py-4
                                    text-left
                                ">
                                    Title
                                </th>

                                <th className="
                                    px-6
                                    py-4
                                    text-left
                                ">
                                    Total
                                </th>

                                <th className="
                                    px-6
                                    py-4
                                    text-left
                                ">
                                    Paid
                                </th>

                                <th className="
                                    px-6
                                    py-4
                                    text-left
                                ">
                                    Balance
                                </th>

                                <th className="
                                    px-6
                                    py-4
                                    text-left
                                ">
                                    Status
                                </th>

                                <th className="
                                    px-6
                                    py-4
                                    text-left
                                ">
                                    Actions
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {loading ? (

                                <tr>

                                    <td
                                        colSpan={7}
                                        className="
                                            text-center
                                            py-12
                                        "
                                    >
                                        Loading...
                                    </td>

                                </tr>

                            ) : invoices.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan={7}
                                        className="
                                            text-center
                                            py-12
                                        "
                                    >
                                        No invoices found
                                    </td>

                                </tr>

                            ) : (

                                invoices.map(
                                    invoice => (

                                    <tr
                                        key={invoice.id}
                                        className="
                                            border-b
                                        "
                                    >

                                        <td className="
                                            px-6
                                            py-4
                                        ">
                                            {
                                                invoice.invoice_number
                                            }
                                        </td>

                                        <td className="
                                            px-6
                                            py-4
                                        ">
                                            {
                                                invoice.title
                                            }
                                        </td>

                                        <td className="
                                            px-6
                                            py-4
                                        ">
                                            Rs {Number(
                                                invoice.total_amount
                                            ).toLocaleString()}
                                        </td>

                                        <td className="
                                            px-6
                                            py-4
                                        ">
                                            Rs {Number(
                                                invoice.paid_amount
                                            ).toLocaleString()}
                                        </td>

                                        <td className="
                                            px-6
                                            py-4
                                        ">
                                            Rs {Number(
                                                invoice.balance_due
                                            ).toLocaleString()}
                                        </td>

                                        <td className="
                                            px-6
                                            py-4
                                        ">
                                            {
                                                invoice.status
                                            }
                                        </td>

                                        <td className="
                                            px-6
                                            py-4
                                        ">

                                            <button
                                                onClick={() =>
                                                    router.push(
                                                        `/dashboard/invoices/production-invoices/${invoice.id}`
                                                    )
                                                }
                                                className="
                                                    text-blue-600
                                                "
                                            >
                                                <Eye
                                                    size={18}
                                                />
                                            </button>

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </Layout>

    );
}