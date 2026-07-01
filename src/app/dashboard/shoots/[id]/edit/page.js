"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

import Layout from "@/components/Layout";

import { useParams } from "next/navigation";

import api from "@/lib/api";

import progressToast from "@/lib/progressToast";

import {
    Briefcase,
    CalendarDays,
    MapPin,
    FileText,
    Building2,
    ArrowLeft,
    Sparkles,
    Clock3,
    Film,
    Users,
    ChevronRight,
} from "lucide-react";

export default function EditShootPage() {

    const params = useParams();

    const shootId = params.id;

    const router = useRouter();


    const [loading, setLoading] =
        useState(false);

    const [fetching, setFetching] =
        useState(true);

    const [form, setForm] =
        useState({
            title: "",
            client_name: "",
            client_budget: "",
            client_invoice_amount: "",
            location: "",
            start_datetime: "",
            end_datetime: "",
            status: "planned",
            notes: "",
        });

    useEffect(() => {

        if (shootId) {
            fetchShoot();
        }

    }, [shootId]);

    const fetchShoot = async () => {


        try {

            const { data } =
                await api.get(
                    `/shoots/${shootId}`
                );

            setForm({

                title:
                    data.title || "",

                client_name:
                    data.client_name || "",

                client_budget:
                    data.client_budget || "",

                client_invoice_amount:
                    data.client_invoice_amount || "",

                location:
                    data.location || "",

                start_datetime:
                    data.start_datetime
                        ? data.start_datetime.slice(
                            0,
                            16
                        )
                        : "",

                end_datetime:
                    data.end_datetime
                        ? data.end_datetime.slice(
                            0,
                            16
                        )
                        : "",

                status:
                    data.status ||
                    "planned",

                notes:
                    data.notes || "",
            });

        } catch {
            const id = progressToast.loading({ title: "Error", message: "" });
            progressToast.error(id, { title: "Error", message: "Failed to load production" });

            router.push(
                "/dashboard/shoots"
            );

        } finally {

            setFetching(false);
        }


    };

    const updateShoot =
        async () => {


            if (!form.title) {
                const id = progressToast.loading({ title: "Error", message: "" });
                progressToast.error(id, { title: "Error", message: "Production title is required" });
                return;
            }

            setLoading(true);

            const pToastId = progressToast.loading({ title: "Updating...", message: "Updating production..." });

            try {

                await api.put(
                    `/shoots/${shootId}`,
                    form
                );

                progressToast.success(pToastId, { title: "Updated", message: "Production updated successfully" });

                router.push(
                    "/dashboard/shoots"
                );

            } catch {

                progressToast.error(pToastId, { title: "Error", message: "Failed to update production" });

            } finally {

                setLoading(false);
            }
        };


    if (fetching) {


        return (

            <Layout>

                <div className="
      flex
      items-center
      justify-center
      h-[500px]
    ">

                    Loading Production...

                </div>

            </Layout>
        );


    }

    return (


        <Layout>

            <div className="
    max-w-7xl
    mx-auto
    pb-24
    space-y-7
  ">

                {/* ================================================= */}
                {/* TOP HEADER */}
                {/* ================================================= */}

                <div className="
      flex
      flex-col
      xl:flex-row
      xl:items-center
      xl:justify-between
      gap-6
    ">

                    <div>

                        <button
                            onClick={() =>
                                router.back()
                            }
                            className="
            inline-flex
            items-center
            gap-2
            rounded-2xl
            border
            border-blue-100
            bg-white
            px-4
            py-2.5
            text-sm
            font-semibold
            text-blue-700
            hover:bg-blue-50
            transition-all
          "
                        >

                            <ArrowLeft size={16} />

                            Back to Productions

                        </button>

                        <div className="mt-6">

                            <div className="
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-blue-100
            bg-blue-50
            px-4
            py-2
            text-[11px]
            font-semibold
            uppercase
            tracking-[0.22em]
            text-blue-700
          ">

                                <Sparkles size={12} />

                                Production Editor

                            </div>

                            <h1 className="
            mt-4
            text-4xl
            md:text-5xl
            font-black
            tracking-[-0.06em]
            text-gray-900
          ">

                                Edit Production

                            </h1>

                            <p className="
            mt-4
            max-w-3xl
            text-base
            leading-relaxed
            text-gray-500
          ">

                                Update production details,
                                schedules, budgets and
                                workflow configuration.

                            </p>

                        </div>

                    </div>

                    <div className="
        hidden
        xl:flex
        items-center
        gap-4
      ">

                        <TopStat
                            icon={
                                <Film size={18} />
                            }
                            title="Production"
                            value="Workflow"
                        />

                        <TopStat
                            icon={
                                <Users size={18} />
                            }
                            title="Crew"
                            value="Operations"
                        />

                        <TopStat
                            icon={
                                <Clock3 size={18} />
                            }
                            title="Status"
                            value="Editing"
                        />

                    </div>

                </div>

                {/* ================================================= */}
                {/* FORM */}
                {/* ================================================= */}

                <div className="
      rounded-[40px]
      border
      border-blue-100
      bg-white/70
      backdrop-blur-2xl
      p-6
      md:p-8
      shadow-[0_20px_80px_rgba(37,99,235,0.06)]
    ">

                    <div className="
        flex
        flex-col
        lg:flex-row
        lg:items-center
        lg:justify-between
        gap-4
        mb-8
      ">

                        <div>

                            <h3 className="
            text-3xl
            font-black
            tracking-[-0.05em]
            text-gray-900
          ">
                                Production Information
                            </h3>

                            <p className="
            mt-2
            text-sm
            text-gray-500
          ">
                                Configure all production and workflow details
                            </p>

                        </div>

                        <div className="
          inline-flex
          items-center
          gap-2
          rounded-2xl
          border
          border-blue-100
          bg-blue-50
          px-4
          py-3
          text-sm
          font-semibold
          text-blue-700
        ">

                            <Clock3 size={16} />

                            Editing Mode

                        </div>

                    </div>

                    <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        gap-5
      ">

                        <Input
                            icon={<Briefcase size={18} />}
                            label="Production Title"
                            placeholder="Commercial Shoot 2026"
                            value={form.title}
                            onChange={(value) =>
                                setForm({
                                    ...form,
                                    title: value,
                                })
                            }
                        />

                        <Input
                            icon={<Building2 size={18} />}
                            label="Client / Brand"
                            placeholder="Nike, Coca Cola..."
                            value={form.client_name}
                            onChange={(value) =>
                                setForm({
                                    ...form,
                                    client_name: value,
                                })
                            }
                        />

                        <Input
                            icon={<Building2 size={18} />}
                            label="Client Budget"
                            placeholder="500000"
                            value={form.client_budget}
                            onChange={(value) =>
                                setForm({
                                    ...form,
                                    client_budget: value,
                                })
                            }
                        />

                        <Input
                            icon={<Building2 size={18} />}
                            label="Invoice Amount"
                            placeholder="500000"
                            value={form.client_invoice_amount}
                            onChange={(value) =>
                                setForm({
                                    ...form,
                                    client_invoice_amount: value,
                                })
                            }
                        />

                        <Input
                            icon={<MapPin size={18} />}
                            label="Production Location"
                            placeholder="Karachi Studio A"
                            value={form.location}
                            onChange={(value) =>
                                setForm({
                                    ...form,
                                    location: value,
                                })
                            }
                        />

                        <Input
                            type="datetime-local"
                            icon={<CalendarDays size={18} />}
                            label="Start Schedule"
                            value={form.start_datetime}
                            onChange={(value) =>
                                setForm({
                                    ...form,
                                    start_datetime: value,
                                })
                            }
                        />

                        <Input
                            type="datetime-local"
                            icon={<Clock3 size={18} />}
                            label="End Schedule"
                            value={form.end_datetime}
                            onChange={(value) =>
                                setForm({
                                    ...form,
                                    end_datetime: value,
                                })
                            }
                        />

                    </div>

                    <div className="mt-7">

                        <label className="
          text-sm
          font-semibold
          text-gray-700
        ">
                            Production Status
                        </label>

                        <select
                            value={form.status}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    status:
                                        e.target.value,
                                })
                            }
                            className="
            w-full
            rounded-[28px]
            border
            border-blue-100
            bg-white/80
            pl-14
            pr-5
            py-5
            text-sm
            text-slate-700
            outline-none
            resize-none
            backdrop-blur-xl
            transition-all
            focus:border-blue-300
            focus:ring-4
            focus:ring-blue-500/10
            hover:border-blue-200
          "
                        >

                            <option value="planned">
                                Planned
                            </option>

                            <option value="scheduled">
                                Scheduled
                            </option>

                            <option value="active">
                                Active
                            </option>

                            <option value="completed">
                                Completed
                            </option>

                            <option value="cancelled">
                                Cancelled
                            </option>

                        </select>

                    </div>

                    <div className="mt-7">

                        <label className="
          text-sm
          font-semibold
          text-gray-700
        ">
                            Production Notes
                        </label>

                        <div className="relative mt-3">

                            <div className="
            absolute
            top-5
            left-5
            text-blue-600
          ">

                                <FileText size={18} />

                            </div>

                            <textarea
                                rows={7}
                                value={form.notes}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        notes:
                                            e.target.value,
                                    })
                                }
                                placeholder="


Add production requirements,
shoot details, logistics notes,
crew expectations or planning information...
"
                                className="
w-full
rounded-[28px]
border
border-blue-100
bg-white/80
pl-14
pr-5
py-5
text-sm
text-slate-700
outline-none
resize-none
backdrop-blur-xl
transition-all
focus:border-blue-300
focus:ring-4
focus:ring-blue-500/10
hover:border-blue-200
"
                            />


                        </div>

                    </div>

                    <div className="
        flex
        flex-col-reverse
        sm:flex-row
        sm:items-center
        sm:justify-end
        gap-3
        mt-10
      ">

                        <button
                            onClick={() =>
                                router.back()
                            }
                            className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-2xl
            border
            border-blue-100
            bg-white
            px-6
            py-4
            text-sm
            font-semibold
            text-gray-700
            hover:bg-blue-50
            transition-all
          "
                        >

                            Cancel

                        </button>

                        <button
                            onClick={updateShoot}
                            disabled={loading}
                            className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-2xl
            bg-blue-600
            px-7
            py-4
            text-sm
            font-semibold
            text-white
            shadow-[0_15px_45px_rgba(37,99,235,0.28)]
            hover:bg-blue-700
            transition-all
            disabled:opacity-60
          "
                        >

                            {loading
                                ? "Updating Production..."
                                : "Update Production"}

                            {!loading && (
                                <ChevronRight
                                    size={16}
                                />
                            )}

                        </button>

                    </div>

                </div>

            </div >

        </Layout >


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
    font-semibold
    text-slate-700
  ">

                {label}

            </label>

            <div className="relative mt-3">

                <div className="
      absolute
      left-4
      top-1/2
      z-10
      -translate-y-1/2
      text-blue-600
    ">

                    {icon}

                </div>

                <input
                    type={type}
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) =>
                        onChange(
                            e.target.value
                        )
                    }
                    className="
        w-full
        rounded-[28px]
        border
        border-blue-100
        bg-white/80
        pl-14
        pr-5
        py-5
        text-sm
        text-slate-700
        outline-none
        resize-none
        backdrop-blur-xl
        transition-all
        placeholder:text-slate-400
        focus:border-blue-300
        focus:ring-4
        focus:ring-blue-500/10
        hover:border-blue-200
      "
                />

            </div>

        </div>


    );
}

/* ========================================================= */
/* TOP STATS */
/* ========================================================= */

function TopStat({
    icon,
    title,
    value,
}) {

    return (


        <div className="
  rounded-3xl
  border
  border-blue-100
  bg-white
  px-5
  py-4
  shadow-[0_12px_40px_rgba(37,99,235,0.05)]
">

            <div className="
    flex
    items-center
    gap-3
  ">

                <div className="
      w-11
      h-11
      rounded-2xl
      bg-blue-50
      flex
      items-center
      justify-center
      text-blue-600
    ">

                    {icon}

                </div>

                <div>

                    <p className="
        text-xs
        uppercase
        tracking-wide
        text-gray-400
      ">
                        {title}
                    </p>

                    <h3 className="
        text-sm
        font-bold
        text-gray-900
      ">
                        {value}
                    </h3>

                </div>

            </div>

        </div>


    );
}

/* ========================================================= */
/* METRIC CARD */
/* ========================================================= */

function MetricCard({
    title,
    value,
    glow,
}) {

    const glowStyles = {


        blue:
            "from-blue-500/20 to-blue-400/5 border-blue-300/10",

        cyan:
            "from-cyan-500/20 to-cyan-400/5 border-cyan-300/10",

        violet:
            "from-violet-500/20 to-violet-400/5 border-violet-300/10",

        emerald:
            "from-emerald-500/20 to-emerald-400/5 border-emerald-300/10",


    };

    return (


        <div className={`
  group
  relative
  overflow-hidden
  rounded-[28px]
  border
  bg-gradient-to-br
  p-5
  backdrop-blur-2xl
  transition-all
  duration-300
  hover:-translate-y-1
  hover:shadow-[0_0_45px_rgba(59,130,246,0.22)]
  ${glowStyles[glow]}
`}>

            <div className="
    absolute
    inset-0
    bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.08),transparent)]
  " />

            <div className="
    relative
    z-10
  ">

                <p className="
      text-[11px]
      uppercase
      tracking-[0.18em]
      text-blue-100/60
    ">

                    {title}

                </p>

                <h3 className="
      mt-4
      text-3xl
      font-black
      tracking-[-0.05em]
      text-white
    ">

                    {value}

                </h3>

            </div>

        </div>


    );
}
