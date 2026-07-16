"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import api from "@/lib/api";
import Link from "next/link";
import progressToast from "@/lib/progressToast";
import usePageLoadingOverlay from "@/hooks/usePageLoadingOverlay";
import PageLoadingOverlay from "@/components/ui/PageLoadingOverlay";
import DateTimePicker from "@/components/ui/DateTimePicker";

export default function CrewPayrollPage() {

  const [payrolls, setPayrolls] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const overlay = usePageLoadingOverlay("Loading Crew Payroll...");

  const [form, setForm] =
    useState({
      start_date: "",
      end_date: "",
    });

  const fetchPayrolls =
    async () => {

      try {

        const res =
          await api.get(
            "/payrolls"
          );

        const crew =
          (res.data?.data || [])
          .filter(
            (p) =>
              p.type === "crew"
          );

        setPayrolls(
          crew
        );

      } catch {
          const id = progressToast.loading({ title: "Error", message: "" });
          progressToast.error(id, { title: "Error", message: "Failed to load payrolls" });
      } finally {
          overlay.finish();
        setLoading(false);

      }
    };

  useEffect(() => {

    fetchPayrolls();

  }, []);

  const generatePayroll =
    async () => {
      const pToastId = progressToast.loading({ title: "Generating...", message: "Generating crew payroll..." });
      try {

        await api.post(
          "/payrolls/generate-crew",
          form
        );

        progressToast.success(pToastId, { title: "Generated", message: "Crew payroll generated successfully" });

        fetchPayrolls();

      } catch {
          progressToast.error(pToastId, { title: "Error", message: "Generation failed" });
      }
    };

  return (
    <>
    <Layout>

      <div className="max-w-7xl mx-auto px-6 py-6">

        <div className="
          bg-white
          rounded-2xl
          border
          p-6
          mb-6
        ">

          <h1 className="
            text-3xl
            font-bold
          ">
            Crew Payroll
          </h1>

          <div className="
            grid
            md:grid-cols-3
            gap-4
            mt-5
          ">

            <DateTimePicker
              dateOnly
              label="Start Date"
              value={form.start_date}
              onChange={(val)=>
                setForm({
                  ...form,
                  start_date: val,
                })
              }
            />

            <DateTimePicker
              dateOnly
              label="End Date"
              value={form.end_date}
              onChange={(val)=>
                setForm({
                  ...form,
                  end_date: val,
                })
              }
            />

            <button
              onClick={
                generatePayroll
              }
              className="
                bg-blue-600
                text-white
                rounded-xl
                px-5
              "
            >
              Generate Payroll
            </button>

          </div>

        </div>

        <div className="
          bg-white
          border
          rounded-2xl
          overflow-hidden
        ">

          <table className="w-full">

            <thead>

              <tr className="
                bg-gray-50
              ">
                <th className="p-4 text-left">
                  Reference
                </th>

                <th className="p-4 text-left">
                  Period
                </th>

                <th className="p-4 text-left">
                  Net Amount
                </th>

                <th className="p-4 text-left">
                  Status
                </th>

                <th className="p-4 text-left">
                  Action
                </th>
              </tr>

            </thead>

            <tbody>

              {payrolls.map(
                (payroll) => (

                <tr
                  key={
                    payroll.id
                  }
                  className="
                    border-t
                  "
                >

                  <td className="p-4">
                    {
                      payroll.reference
                    }
                  </td>

                  <td className="p-4">
                    {
                      payroll.period_start
                    }
                    {" - "}
                    {
                      payroll.period_end
                    }
                  </td>

                  <td className="p-4">
                    Rs{" "}
                    {Number(
                      payroll.net_amount
                    ).toLocaleString()}
                  </td>

                  <td className="p-4">
                    {
                      payroll.status
                    }
                  </td>

                  <td className="p-4">

                    <Link
                      href={`/dashboard/finance/payrolls/${payroll.id}`}
                      className="
                        text-blue-600
                      "
                    >
                      View
                    </Link>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </Layout>
        <PageLoadingOverlay visible={overlay.visible} overlayRect={overlay.overlayRect} text={overlay.text} />
    </>
  );
}