"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import api from "@/lib/api";
import progressToast from "@/lib/progressToast";

import {
  DollarSign,
  TrendingUp,
  Receipt,
  Wallet,
  BarChart3,
} from "lucide-react";

export default function FinanceReportsPage() {

  const [loading, setLoading] =
    useState(true);

  const [report, setReport] =
    useState(null);

  const fetchReport =
    async () => {

      try {

        setLoading(true);

        const res =
          await api.get(
            "/payrolls/finance/reports"
          );

        setReport(
          res.data
        );

      } catch {
          const id = progressToast.loading({ title: "Error", message: "" });
          progressToast.error(id, { title: "Error", message: "Failed to load reports" });
      } finally {

        setLoading(false);

      }
    };

  useEffect(() => {

    fetchReport();

  }, []);

  if (loading) {

    return (
      <Layout>
        <div className="
          py-32
          text-center
        ">
          Loading Reports...
        </div>
      </Layout>
    );
  }

  const totals =
    report?.totals || {};

  const breakdown =
    report?.breakdown || {};

  return (
    <Layout>

      <div className="
        max-w-7xl
        mx-auto
        px-6
        pb-20
      ">

        {/* HERO */}

        <div className="py-6">

          <div className="
            bg-white
            border
            border-gray-200
            rounded-2xl
            shadow-sm
            overflow-hidden
          ">

            <div className="
              h-1
              bg-blue-600
            " />

            <div className="p-8">

              <div>

                <div className="
                  inline-flex
                  items-center
                  gap-2
                  px-4
                  py-1.5
                  rounded-full
                  bg-blue-50
                  text-blue-700
                  text-sm
                  font-semibold
                ">
                  <BarChart3 size={14} />
                  Finance Reports
                </div>

                <h1 className="
                  mt-4
                  text-4xl
                  font-bold
                ">
                  Financial Reports
                </h1>

                <p className="
                  mt-2
                  text-gray-500
                ">
                  Company-wide financial
                  analytics and reporting
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* TOP CARDS */}

        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-4
          gap-5
          mb-6
        ">

          <SummaryCard
            title="Revenue"
            value={totals.revenue}
            icon={
              <DollarSign size={18} />
            }
          />

          <SummaryCard
            title="Total Cost"
            value={totals.cost}
            icon={
              <Receipt size={18} />
            }
          />

          <SummaryCard
            title="Profit"
            value={totals.profit}
            icon={
              <TrendingUp size={18} />
            }
          />

          <SummaryCard
            title="Pending Payroll"
            value={
              totals.payroll_pending
            }
            icon={
              <Wallet size={18} />
            }
          />

        </div>

                {/* COST BREAKDOWN */}

        <div className="
          bg-white
          border
          border-gray-200
          rounded-2xl
          shadow-sm
          overflow-hidden
          mb-6
        ">

          <div className="
            px-6
            py-5
            border-b
            border-gray-100
          ">

            <h2 className="
              text-lg
              font-semibold
            ">
              Cost Breakdown
            </h2>

          </div>

          <div className="
            p-6
          ">

            <div className="
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-5
              gap-4
            ">

              <BreakdownCard
                title="Crew Cost"
                value={breakdown.crew}
              />

              <BreakdownCard
                title="Logistics"
                value={breakdown.logistics}
              />

              <BreakdownCard
                title="Inventory"
                value={breakdown.inventory}
              />

              <BreakdownCard
                title="Repairs"
                value={breakdown.repairs}
              />

              <BreakdownCard
                title="Expenses"
                value={breakdown.expenses}
              />

            </div>

          </div>

        </div>

        {/* EXECUTIVE SUMMARY */}

        <div className="
          bg-white
          border
          border-gray-200
          rounded-2xl
          shadow-sm
          p-6
          mb-6
        ">

          <h2 className="
            text-lg
            font-semibold
            mb-5
          ">
            Executive Summary
          </h2>

          <div className="
            grid
            md:grid-cols-2
            gap-6
          ">

            <div className="
              border
              border-gray-200
              rounded-xl
              p-5
            ">

              <p className="
                text-sm
                text-gray-500
              ">
                Revenue
              </p>

              <h3 className="
                mt-3
                text-3xl
                font-bold
              ">
                Rs{" "}
                {Number(
                  totals.revenue || 0
                ).toLocaleString()}
              </h3>

            </div>

            <div className="
              border
              border-gray-200
              rounded-xl
              p-5
            ">

              <p className="
                text-sm
                text-gray-500
              ">
                Profit / Loss
              </p>

              <h3
                className={`mt-3 text-3xl font-bold ${
                  Number(
                    totals.profit || 0
                  ) >= 0
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                Rs{" "}
                {Number(
                  totals.profit || 0
                ).toLocaleString()}
              </h3>

            </div>

            <div className="
              border
              border-gray-200
              rounded-xl
              p-5
            ">

              <p className="
                text-sm
                text-gray-500
              ">
                Payroll Paid
              </p>

              <h3 className="
                mt-3
                text-3xl
                font-bold
              ">
                Rs{" "}
                {Number(
                  totals.payroll_paid || 0
                ).toLocaleString()}
              </h3>

            </div>

            <div className="
              border
              border-gray-200
              rounded-xl
              p-5
            ">

              <p className="
                text-sm
                text-gray-500
              ">
                Payroll Pending
              </p>

              <h3 className="
                mt-3
                text-3xl
                font-bold
              ">
                Rs{" "}
                {Number(
                  totals.payroll_pending || 0
                ).toLocaleString()}
              </h3>

            </div>

          </div>

        </div>

                {/* FINANCIAL HEALTH */}

        <div
          className="
            bg-white
            border
            border-gray-200
            rounded-2xl
            shadow-sm
            p-6
          "
        >

          <h2
            className="
              text-lg
              font-semibold
              mb-5
            "
          >
            Financial Health
          </h2>

          <div className="
            grid
            md:grid-cols-3
            gap-5
          ">

            <div
              className="
                border
                border-gray-200
                rounded-xl
                p-5
              "
            >

              <p className="
                text-sm
                text-gray-500
              ">
                Revenue Coverage
              </p>

              <h3 className="
                mt-3
                text-3xl
                font-bold
              ">
                {Number(
                  totals.cost || 0
                ) === 0
                  ? "0%"
                  : `${Math.round(
                      (Number(
                        totals.revenue || 0
                      ) /
                        Number(
                          totals.cost || 1
                        )) *
                        100
                    )}%`}
              </h3>

            </div>

            <div
              className="
                border
                border-gray-200
                rounded-xl
                p-5
              "
            >

              <p className="
                text-sm
                text-gray-500
              ">
                Total Expenses
              </p>

              <h3 className="
                mt-3
                text-3xl
                font-bold
              ">
                Rs{" "}
                {(
                  Number(
                    breakdown.crew || 0
                  ) +
                  Number(
                    breakdown.logistics || 0
                  ) +
                  Number(
                    breakdown.inventory || 0
                  ) +
                  Number(
                    breakdown.repairs || 0
                  ) +
                  Number(
                    breakdown.expenses || 0
                  )
                ).toLocaleString()}
              </h3>

            </div>

            <div
              className="
                border
                border-gray-200
                rounded-xl
                p-5
              "
            >

              <p className="
                text-sm
                text-gray-500
              ">
                Financial Status
              </p>

              <h3
                className={`mt-3 text-3xl font-bold ${
                  Number(
                    totals.profit || 0
                  ) >= 0
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {Number(
                  totals.profit || 0
                ) >= 0
                  ? "Profitable"
                  : "Loss"}
              </h3>

            </div>

          </div>

        </div>

      </div>

    </Layout>

  );
}

function SummaryCard({
  title,
  value,
  icon,
}) {

  return (

    <div
      className="
        bg-white
        border
        border-gray-200
        rounded-2xl
        p-6
        shadow-sm
      "
    >

      <div className="
        flex
        items-center
        justify-between
      ">

        <div>

          <p className="
            text-sm
            text-gray-500
          ">
            {title}
          </p>

          <h3 className="
            mt-3
            text-3xl
            font-bold
          ">
            Rs{" "}
            {Number(
              value || 0
            ).toLocaleString()}
          </h3>

        </div>

        <div
          className="
            w-12
            h-12
            rounded-xl
            bg-blue-50
            text-blue-600
            flex
            items-center
            justify-center
          "
        >
          {icon}
        </div>

      </div>

    </div>

  );
}

function BreakdownCard({
  title,
  value,
}) {

  return (

    <div
      className="
        border
        border-gray-200
        rounded-xl
        p-5
      "
    >

      <p className="
        text-sm
        text-gray-500
      ">
        {title}
      </p>

      <h4 className="
        mt-3
        text-2xl
        font-bold
      ">
        Rs{" "}
        {Number(
          value || 0
        ).toLocaleString()}
      </h4>

    </div>

  );
}   