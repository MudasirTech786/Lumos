"use client";

import Layout from "@/components/Layout";

import {
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  BadgeDollarSign,
  MapPin,
  ShieldCheck,
  Building2,
  Sparkles,
  User2,
  Clock3,
} from "lucide-react";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import api from "@/lib/api";

import toast from "react-hot-toast";

export default function EmployeeDetail() {

  const { id } = useParams();

  const router = useRouter();

  const [employee, setEmployee] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    if (id) {
      fetchEmployee();
    }

  }, [id]);

  const fetchEmployee = async () => {

    try {

      const res = await api.get(
        `/employees/${id}`
      );

      setEmployee(
        res.data?.employee
      );

    } catch (err) {

      console.log(err.response?.data);

      toast.error(
        "Failed to load employee"
      );

    } finally {

      setLoading(false);
    }
  };

  if (loading) {

    return (

      <Layout>

        <div className="
          flex
          items-center
          justify-center
          py-32
        ">

          <div className="
            rounded-3xl
            border
            border-blue-100
            bg-white
            px-8
            py-6
            text-sm
            font-medium
            text-slate-500
            shadow-[0_20px_60px_rgba(37,99,235,0.08)]
          ">

            Loading employee profile...

          </div>

        </div>

      </Layout>
    );
  }

  if (!employee) {

    return (

      <Layout>

        <div className="
          flex
          items-center
          justify-center
          py-32
        ">

          <div className="
            rounded-3xl
            border
            border-red-100
            bg-red-50
            px-8
            py-6
            text-sm
            font-medium
            text-red-600
          ">

            Employee not found

          </div>

        </div>

      </Layout>
    );
  }

  return (

    <Layout>

      <div className="
        space-y-7
        pb-24
      ">

        {/* ===================================================== */}
        {/* TOP HEADER */}
        {/* ===================================================== */}

        <div className="
          flex
          flex-col
          gap-6
          xl:flex-row
          xl:items-center
          xl:justify-between
        ">

          <div>

            <button
              onClick={() => router.back()}
              className="
                inline-flex
                items-center
                gap-2
                rounded-2xl
                border
                border-blue-100
                bg-white
                px-4
                py-3
                text-sm
                font-semibold
                text-blue-700
                transition-all
                hover:bg-blue-50
              "
            >

              <ArrowLeft size={16} />

              Back to Employees

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

                Employee Profile

              </div>

              <h1 className="
                mt-4
                text-4xl
                md:text-5xl
                font-black
                tracking-[-0.06em]
                text-gray-900
              ">

                {employee.name}

              </h1>

              <p className="
                mt-4
                max-w-3xl
                text-base
                leading-relaxed
                text-gray-500
              ">

                Workforce profile, operational role,
                payroll structure and employee management overview.

              </p>

            </div>

          </div>

        </div>

        {/* ===================================================== */}
        {/* HERO PROFILE */}
        {/* ===================================================== */}

        <div className="
          relative
          overflow-hidden
          rounded-[36px]
          border
          border-blue-200/20
          bg-gradient-to-br
          from-[#071120]
          via-[#0f3ba8]
          to-[#2563eb]
          p-6
          shadow-[0_25px_120px_rgba(37,99,235,0.25)]
        ">

          {/* BACKGROUND */}

          <div className="
            absolute
            inset-0
            bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(125,211,252,0.10),transparent_30%)]
          " />

          {/* GRID */}

          <div className="
            absolute
            inset-0
            opacity-[0.05]
            [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)]
            [background-size:42px_42px]
          " />

          {/* GLOW */}

          <div className="
            absolute
            top-[-120px]
            right-[-100px]
            h-[320px]
            w-[320px]
            rounded-full
            bg-cyan-300/20
            blur-[120px]
          " />

          <div className="
            absolute
            bottom-[-140px]
            left-[-100px]
            h-[280px]
            w-[280px]
            rounded-full
            bg-blue-500/20
            blur-[120px]
          " />

          {/* CONTENT */}

          <div className="
            relative
            z-10
            flex
            flex-col
            gap-8
            xl:flex-row
            xl:items-center
            xl:justify-between
          ">

            {/* LEFT */}

            <div className="
              flex
              flex-col
              gap-6
              md:flex-row
              md:items-center
            ">

              {/* AVATAR */}

              <div className="
                flex
                h-32
                w-32
                items-center
                justify-center
                overflow-hidden
                rounded-[32px]
                border
                border-white/10
                bg-white/10
                text-5xl
                font-black
                text-white
                backdrop-blur-2xl
                shadow-[0_0_40px_rgba(255,255,255,0.08)]
              ">

                {employee.profile_photo ? (

                  <img
                    src={employee.profile_photo}
                    alt={employee.name}
                    className="
                      h-full
                      w-full
                      object-cover
                    "
                  />

                ) : (

                  employee.name?.charAt(0)

                )}

              </div>

              {/* INFO */}

              <div>

                <div className={`
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  px-4
                  py-2
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.22em]

                  ${employee.status === "active"
                    ? "bg-emerald-400/20 text-emerald-100"
                    : "bg-white/10 text-white"
                  }
                `}>

                  <div className="
                    h-2
                    w-2
                    rounded-full
                    bg-current
                  " />

                  {employee.status || "inactive"}

                </div>

                <h2 className="
                  mt-5
                  text-4xl
                  font-black
                  tracking-[-0.05em]
                  text-white
                ">

                  {employee.name}

                </h2>

                <p className="
                  mt-2
                  text-lg
                  text-blue-100/80
                ">

                  {employee.designation || "No designation"}

                </p>

                <div className="
                  mt-5
                  flex
                  flex-wrap
                  items-center
                  gap-3
                ">

                  <HeroBadge
                    icon={<Building2 size={14} />}
                    label={employee.department || "No department"}
                  />

                  <HeroBadge
                    icon={<ShieldCheck size={14} />}
                    label={employee.employee_code || "No code"}
                  />

                </div>

              </div>

            </div>

            {/* RIGHT */}

            <div className="
              grid
              grid-cols-2
              gap-4
              xl:w-[420px]
            ">

              <ProfileMetric
                title="Status"
                value={employee.status || "-"}
                icon={<User2 size={16} />}
              />

              <ProfileMetric
                title="Department"
                value={employee.department || "-"}
                icon={<Building2 size={16} />}
              />

              <ProfileMetric
                title="Hire Date"
                value={employee.hire_date || "-"}
                icon={<Calendar size={16} />}
              />

              <ProfileMetric
                title="Payroll"
                value={employee.base_salary || "-"}
                icon={<BadgeDollarSign size={16} />}
              />

            </div>

          </div>

        </div>

        {/* ===================================================== */}
        {/* INFO GRID */}
        {/* ===================================================== */}

        <div className="
          grid
          grid-cols-1
          gap-6
          xl:grid-cols-2
        ">

          {/* CONTACT */}

          <InfoCard
            title="Contact Information"
            icon={<Phone size={18} />}
          >

            <Detail
              icon={<Mail size={16} />}
              label="Email Address"
              value={employee.email}
            />

            <Detail
              icon={<Phone size={16} />}
              label="Phone Number"
              value={employee.phone}
            />

            <Detail
              icon={<Phone size={16} />}
              label="Emergency Contact"
              value={employee.emergency_contact}
            />

          </InfoCard>

          {/* EMPLOYMENT */}

          <InfoCard
            title="Employment Information"
            icon={<Briefcase size={18} />}
          >

            <Detail
              icon={<Building2 size={16} />}
              label="Department"
              value={employee.department}
            />

            <Detail
              icon={<Briefcase size={16} />}
              label="Designation"
              value={employee.designation}
            />

            <Detail
              icon={<Calendar size={16} />}
              label="Hire Date"
              value={employee.hire_date}
            />

            <Detail
              icon={<BadgeDollarSign size={16} />}
              label="Base Salary"
              value={employee.base_salary}
            />

          </InfoCard>

        </div>

        {/* ===================================================== */}
        {/* PERSONAL */}
        {/* ===================================================== */}

        <InfoCard
          title="Personal Information"
          icon={<User2 size={18} />}
        >

          <div className="
            grid
            grid-cols-1
            gap-6
            md:grid-cols-2
          ">

            <Detail
              icon={<ShieldCheck size={16} />}
              label="CNIC"
              value={employee.cnic}
            />

            <Detail
              icon={<MapPin size={16} />}
              label="Address"
              value={employee.address}
            />

          </div>

        </InfoCard>

      </div>

    </Layout>
  );
}

/* ========================================================= */
/* INFO CARD */
/* ========================================================= */

function InfoCard({
  title,
  icon,
  children,
}) {

  return (

    <div className="
      rounded-[32px]
      border
      border-blue-100/70
      bg-white/70
      p-6
      backdrop-blur-2xl
      shadow-[0_20px_80px_rgba(37,99,235,0.06)]
    ">

      <div className="
        mb-6
        flex
        items-center
        gap-3
      ">

        <div className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          bg-blue-50
          text-blue-600
        ">

          {icon}

        </div>

        <h3 className="
          text-lg
          font-bold
          text-slate-900
        ">

          {title}

        </h3>

      </div>

      <div className="space-y-5">

        {children}

      </div>

    </div>
  );
}

/* ========================================================= */
/* DETAIL */
/* ========================================================= */

function Detail({
  icon,
  label,
  value,
}) {

  return (

    <div className="
      flex
      items-start
      gap-4
    ">

      {icon && (

        <div className="
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-2xl
          bg-blue-50
          text-blue-600
        ">

          {icon}

        </div>

      )}

      <div>

        <p className="
          text-xs
          font-semibold
          uppercase
          tracking-[0.18em]
          text-slate-400
        ">

          {label}

        </p>

        <p className="
          mt-2
          break-words
          text-base
          font-semibold
          text-slate-900
        ">

          {value || "-"}

        </p>

      </div>

    </div>
  );
}

/* ========================================================= */
/* HERO BADGE */
/* ========================================================= */

function HeroBadge({
  icon,
  label,
}) {

  return (

    <div className="
      inline-flex
      items-center
      gap-2
      rounded-2xl
      border
      border-white/10
      bg-white/10
      px-4
      py-3
      text-sm
      font-medium
      text-white
      backdrop-blur-xl
    ">

      {icon}

      {label}

    </div>
  );
}

/* ========================================================= */
/* PROFILE METRIC */
/* ========================================================= */

function ProfileMetric({
  title,
  value,
  icon,
}) {

  return (

    <div className="
      rounded-[24px]
      border
      border-white/10
      bg-white/10
      p-5
      backdrop-blur-2xl
    ">

      <div className="
        flex
        items-center
        justify-between
      ">

        <p className="
          text-[11px]
          font-semibold
          uppercase
          tracking-[0.18em]
          text-blue-100/70
        ">

          {title}

        </p>

        <div className="text-cyan-200">

          {icon}

        </div>

      </div>

      <h3 className="
        mt-4
        text-lg
        font-bold
        tracking-[-0.03em]
        text-white
      ">

        {value}

      </h3>

    </div>
  );
}