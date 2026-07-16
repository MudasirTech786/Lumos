    "use client";

    import { useEffect, useState } from "react";
    import { useParams } from "next/navigation";
    import api from "@/lib/api";
    import Image from "next/image";

    export default function InvoicePrintPage() {
        const { id } = useParams();
        const [invoice, setInvoice] = useState(null);

        useEffect(() => {
            loadInvoice();
        }, []);

        const loadInvoice = async () => {
            try {
                const res = await api.get(`/production-invoices/${id}`);
                setInvoice(res.data.data || res.data);
            } catch (error) {
                console.error(error);
            }
        };

        useEffect(() => {
            if (invoice) {
                setTimeout(() => {
                    window.print();
                }, 500);
            }
        }, [invoice]);

        const fmt = (val) =>
            Number(val || 0).toLocaleString("en-PK", { minimumFractionDigits: 2 });

        if (!invoice) {
            return <div className="p-10 text-gray-500">Loading...</div>;
        }

        const clientName =
            invoice.shoot?.client_name || invoice.title || "—";

        return (
            <>
                <style jsx global>{`
                    * {
                        box-sizing: border-box;
                        margin: 0;
                        padding: 0;
                    }

                    body {
                        background: white !important;
                        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
                        color: #111;
                    }

                    @media print {
                        body {
                            background: white !important;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }

                        .no-print {
                            display: none !important;
                        }

                        @page {
                            size: A4;
                            margin: 12mm;
                        }
                    }

                    .invoice-wrap {
                        max-width: 100%;
                        margin: 0;
                        background: white;
                        padding: 32px 24px 48px;
                    }

                    /* ── HEADER ── */
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 32px;
                    }

                    .company-info h1 {
                        font-size: 18px;
                        font-weight: 800;
                        letter-spacing: 0.01em;
                        margin-bottom: 8px;
                    }

                    .company-info p {
                        font-size: 11.5px;
                        color: #444;
                        line-height: 1.7;
                    }

                    .logo-block {
                        text-align: right;
                    }

                    .logo-block img {
                        height: 72px;
                        width: auto;
                        object-fit: contain;
                    }

                    /* ── INVOICE META BAR ── */
                    .meta-bar {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
    }

                    .invoice-label {
                        font-size: 22px;
                        font-weight: 900;
                        letter-spacing: 0.06em;
                        color: #2b7a6f;
                        text-transform: uppercase;
                    }

                    .meta-grid {
                        display: grid;
                        grid-template-columns: auto auto;
                        column-gap: 16px;
                        row-gap: 2px;
                        text-align: right;
                    }

                    .meta-grid .label {
                        font-size: 10px;
                        font-weight: 700;
                        letter-spacing: 0.08em;
                        color: #777;
                        text-transform: uppercase;
                        text-align: left;
                    }

                    .meta-grid .value {
                        font-size: 11.5px;
                        font-weight: 500;
                        color: #111;
                    }

                    /* ── BILL TO ── */
                    .bill-to {
                        margin-bottom: 20px;
                    }

                    .bill-to .label {
                        font-size: 10px;
                        font-weight: 700;
                        letter-spacing: 0.1em;
                        text-transform: uppercase;
                        color: #777;
                        margin-bottom: 4px;
                    }

                    .bill-to .client-name {
                        font-size: 14px;
                        font-weight: 600;
                        color: #111;
                    }

                    /* ── TABLE ── */
                    .invoice-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 0;
                    }

                    .invoice-table thead tr {
                        background-color: #b0cece;
                    }

                    .invoice-table thead th {
                        padding: 9px 12px;
                        font-size: 10.5px;
                        font-weight: 700;
                        letter-spacing: 0.06em;
                        text-transform: uppercase;
                        color: #222;
                        text-align: left;
                    }

                    .invoice-table thead th.right {
                        text-align: right;
                    }

                    .invoice-table tbody tr {
                        border-bottom: 1px solid #e8e8e8;
                    }

                    .invoice-table tbody tr:last-child {
                        border-bottom: none;
                    }

                    .invoice-table tbody td {
                        padding: 9px 12px;
                        font-size: 12px;
                        color: #222;
                        vertical-align: middle;
                    }

                    .invoice-table tbody td.right {
                        text-align: right;
                    }

                    /* ── TOTALS SECTION ── */
                    .totals-row {
                        display: flex;
                        justify-content: flex-end;
                        margin-top: 0;
                        border-top: 2px dashed #ccc;
                    }

                    .totals-box {
                        width: 340px;
                        padding-top: 14px;
                    }

                    .totals-box .line {
                        display: flex;
                        justify-content: space-between;
                        font-size: 12px;
                        color: #444;
                        padding: 4px 0;
                    }

                    .totals-box .balance-line {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 10px 0 0;
                        margin-top: 6px;
                    }

                    .totals-box .balance-label {
                        font-size: 11px;
                        font-weight: 700;
                        letter-spacing: 0.1em;
                        text-transform: uppercase;
                        color: #666;
                    }

                    .totals-box .balance-value {
                        font-size: 22px;
                        font-weight: 900;
                        color: #111;
                    }

                    /* ── BANK DETAILS ── */
                    .bank-box {
                        margin-top: 32px;
                        background: #d6e8e8;
                        border-radius: 4px;
                        padding: 14px 18px;
                        font-size: 12px;
                        color: #222;
                        line-height: 1.8;
                    }

                    .bank-box strong {
                        font-weight: 700;
                    }
                `}</style>

                <div className="invoice-wrap">

                    {/* ── HEADER: Company Info + Logo ── */}
                    <div className="header">
                        <div className="company-info">
                            <h1>Lumos Rentals</h1>
                            <p>Office # 12-A, Evernew Studios, Multan Road</p>
                            <p>Lahore, Punjab &nbsp;54300</p>
                            <p>+92 333 8996651</p>
                            <p>masood.mughal@lumosrentals.com</p>
                            <p>www.lumosrentals.com</p>
                        </div>

                        <div className="logo-block">
                            {/* Place your logo at public/images/logo.png */}
                            <Image
                                src="/images/invoice-logo.png"
                                alt="Lumos Rentals"
                                width={200}
                                height={72}
                                style={{ objectFit: "contain", height: "102px", width: "auto" }}
                                priority
                            />
                        </div>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginTop: "24px",
                            marginBottom: "24px",
                        }}
                    >

                        {/* BILL TO */}

                        <div className="bill-to">
                            <div className="label">Bill To</div>

                            <div className="client-name">
                                {clientName}
                            </div>
                        </div>

                        {/* INVOICE META */}

                        <div className="meta-bar">
                            <div className="invoice-label">
                                Invoice
                            </div>

                            <div className="meta-grid">
                                <span className="label">
                                    Invoice
                                </span>

                                <span className="value">
                                    {invoice.invoice_number}
                                </span>

                                <span className="label">
                                    Date
                                </span>

                                <span className="value">
                                    {new Date(
                                        invoice.issue_date
                                    ).toLocaleDateString(
                                        "en-GB"
                                    )}
                                </span>

                                <span className="label">
                                    Terms
                                </span>

                                <span className="value">
                                    Net 30
                                </span>
                            </div>
                        </div>

                    </div>

                    {/* ── TABLE ── */}
                    <table className="invoice-table">
                        <thead>
                            <tr>
                                <th style={{ width: "110px" }}>Date</th>
                                <th>Activity</th>
                                <th className="right" style={{ width: "60px" }}>Qty</th>
                                <th className="right" style={{ width: "100px" }}>Rate</th>
                                <th className="right" style={{ width: "110px" }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items?.map((item) => (
                                <tr key={item.id}>
                                    <td>{new Date(invoice.issue_date).toLocaleDateString("en-GB")}</td>
                                    <td>{item.description}</td>
                                    <td className="right">{item.quantity}</td>
                                    <td className="right">{fmt(item.unit_price)}</td>
                                    <td className="right">{fmt(item.line_total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* ── TOTALS ── */}
                    <div className="totals-row">
                        <div className="totals-box">
                            {Number(invoice.subtotal) > 0 && (
                                <div className="line">
                                    <span>Subtotal</span>
                                    <span>Rs {fmt(invoice.subtotal)}</span>
                                </div>
                            )}
                            {Number(invoice.tax_amount) > 0 && (
                                <div className="line">
                                    <span>Tax</span>
                                    <span>Rs {fmt(invoice.tax_amount)}</span>
                                </div>
                            )}
                            {Number(invoice.discount_amount) > 0 && (
                                <div className="line">
                                    <span>Discount</span>
                                    <span>– Rs {fmt(invoice.discount_amount)}</span>
                                </div>
                            )}

                            <div className="balance-line">
                                <span className="balance-label">Balance Due</span>
                                <span className="balance-value">
                                    Rs {fmt(invoice.balance_due)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── BANK DETAILS ── */}
                    <div className="bank-box">
                        <div><strong>Account Title:</strong> HASSAN LATIF</div>
                        <div><strong>Account No:</strong> 02430110660941</div>
                        <div><strong>IBAN:</strong> PK22 MEZN 0002430110660941</div>
                        <div><strong>Bank:</strong> Meezan Bank</div>
                    </div>

                </div>
            </>
        );
    }
