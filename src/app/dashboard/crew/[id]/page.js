"use client";

import Layout from "@/components/Layout";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import api from "@/lib/api";

import progressToast from "@/lib/progressToast";

import {
    ArrowLeft,
    Phone,
    Mail,
    BadgeDollarSign,
    Briefcase,
} from "lucide-react";

export default function CrewDetail() {

    const { id } = useParams();

    const router = useRouter();

    const [crew, setCrew] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        if (id) {
            fetchCrew();
        }

    }, [id]);

    const fetchCrew = async () => {

        try {

            const res = await api.get(`/crew/${id}`);

            const data =
                res.data?.crew ??
                res.data?.data ??
                res.data;

            setCrew(data);

        } catch (err) {

            console.log(err?.response?.data || err);

            const id = progressToast.loading({ title: "Error", message: "" });
            progressToast.error(id, { title: "Error", message: "Failed to load crew" });

        } finally {

            setLoading(false);
        }
    };

    // ================= LOADING =================
    if (loading) {

        return (
            <Layout>
                <div className="p-6">
                    Loading crew details...
                </div>
            </Layout>
        );
    }

    // ================= NOT FOUND =================
    if (!crew) {

        return (
            <Layout>
                <div className="p-6">
                    Crew not found
                </div>
            </Layout>
        );
    }

    // ================= CALCULATIONS =================
    const totalAllowance =
        Number(crew.home_allowance || 0) +
        Number(crew.fuel_allowance || 0) +
        Number(crew.others || 0);

    const estimatedMonthly =
        Number(crew.basic_salary || 0) +
        totalAllowance;

    return (

        <Layout>

            <div className="space-y-6">

                {/* BACK */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
                >
                    <ArrowLeft size={16} />
                    Back to Crew
                </button>

                {/* HERO CARD */}
                <div className="bg-white border rounded-3xl p-8 shadow-sm">

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

                        {/* LEFT */}
                        <div className="flex items-start gap-5">

                           
                            {/* AVATAR */}
                            <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
  {(crew?.profile_photo_url || crew?.profile_photo) ? (
    <img
      src={crew.profile_photo_url || crew.profile_photo}
      alt={crew.name}
      className="w-full h-full object-cover"
      onError={(e) => {
        e.currentTarget.style.display = "none";
        e.currentTarget.parentElement.innerHTML = `
          <div class="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
            ${crew?.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
        `;
      }}
    />
  ) : (
    <span className="text-white text-3xl font-bold">
      {crew?.name?.charAt(0)?.toUpperCase()}
    </span>
  )}
</div>

                            {/* INFO */}
                            <div>

                                <h1 className="text-3xl font-bold text-gray-900">
                                    {crew.name}
                                </h1>

                                <p className="text-gray-500 mt-2">
                                    {crew.designation || "No designation"}
                                </p>

                                {/* CONTACT */}
                                <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">

                                    <div className="flex items-center gap-2">
                                        <Phone size={14} />
                                        {crew.phone || "No phone"}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Mail size={14} />
                                        {crew.email || "No email"}
                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* RIGHT */}
                        <div className="flex flex-wrap gap-3">

                            {/* EMPLOYMENT TYPE */}
                            <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium capitalize">
                                {crew.employment_type?.replace("_", " ") || "freelancer"}
                            </span>

                            {/* STATUS */}
                            <span
                                className={`px-4 py-2 rounded-full text-sm font-medium ${
                                    crew.is_active
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-200 text-gray-600"
                                }`}
                            >
                                {crew.is_active ? "Active" : "Inactive"}
                            </span>

                        </div>

                    </div>

                </div>

                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                    <InfoCard
                        icon={<BadgeDollarSign size={18} />}
                        title="Monthly Salary"
                        value={crew.basic_salary || 0}
                    />

                    <InfoCard
                        icon={<Briefcase size={18} />}
                        title="Hourly Rate"
                        value={crew.hourly_rate || 0}
                    />

                    <InfoCard
                        title="Shift Rate"
                        value={crew.rate_per_shift || 0}
                    />

                    <InfoCard
                        title="Total Allowance"
                        value={totalAllowance}
                    />

                </div>

                {/* PROFILE INFO */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border">

                    <h2 className="text-lg font-semibold mb-6">
                        Profile Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">

                        <Detail
                            label="Full Name"
                            value={crew.name}
                        />

                        <Detail
                            label="Designation"
                            value={crew.designation}
                        />

                        <Detail
                            label="Employment Type"
                            value={crew.employment_type}
                        />

                        <Detail
                            label="Phone"
                            value={crew.phone}
                        />

                        <Detail
                            label="Email"
                            value={crew.email}
                        />

                        <Detail
                            label="Status"
                            value={crew.is_active ? "Active" : "Inactive"}
                        />

                    </div>

                </div>

                {/* PAYROLL */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border">

                    <h2 className="text-lg font-semibold mb-6">
                        Payroll Structure
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">

                        <Detail
                            label="Basic Salary"
                            value={crew.basic_salary}
                        />

                        <Detail
                            label="Hourly Rate"
                            value={crew.hourly_rate}
                        />

                        <Detail
                            label="Rate Per Shift"
                            value={crew.rate_per_shift}
                        />

                        <Detail
                            label="Commission"
                            value={crew.commission}
                        />

                        <Detail
                            label="Home Allowance"
                            value={crew.home_allowance}
                        />

                        <Detail
                            label="Fuel Allowance"
                            value={crew.fuel_allowance}
                        />

                        <Detail
                            label="Other Allowance"
                            value={crew.others}
                        />

                        <Detail
                            label="Total Allowance"
                            value={totalAllowance}
                        />

                    </div>

                </div>

                {/* SKILLS */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border">

                    <h2 className="text-lg font-semibold mb-6">
                        Skills & Expertise
                    </h2>

                    <div className="flex flex-wrap gap-3">

                        {crew.skills?.length ? (

                            crew.skills.map((skill, index) => (

                                <span
                                    key={index}
                                    className="bg-black text-white px-4 py-2 rounded-full text-sm"
                                >
                                    {skill}
                                </span>

                            ))

                        ) : (

                            <p className="text-gray-400 text-sm">
                                No skills added yet
                            </p>
                        )}

                    </div>

                </div>

                {/* NOTES */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border">

                    <h2 className="text-lg font-semibold mb-4">
                        Internal Notes
                    </h2>

                    <p className="text-gray-600 leading-relaxed text-sm">
                        {crew.notes || "No notes available"}
                    </p>

                </div>

                {/* PAYROLL SUMMARY */}
                <div className="bg-black text-white rounded-3xl p-8 shadow-sm">

                    <h2 className="text-xl font-semibold mb-2">
                        Payroll Summary Preview
                    </h2>

                    <p className="text-sm text-white/70 mb-6">
                        Estimated monthly structure based on current payroll configuration
                    </p>

                    <div className="flex items-center justify-between border-t border-white/10 pt-6">

                        <div>

                            <p className="text-sm text-white/60">
                                Estimated Monthly Cost
                            </p>

                            <h3 className="text-4xl font-bold mt-2">
                                {estimatedMonthly}
                            </h3>

                        </div>

                        <div className="text-right">

                            <p className="text-sm text-white/60">
                                Includes salary + allowances
                            </p>

                        </div>

                    </div>

                </div>

                {/* FUTURE */}
                <div className="bg-white rounded-3xl p-10 shadow-sm border text-center">

                    <h3 className="font-semibold text-gray-800 mb-2">
                        Upcoming Modules
                    </h3>

                    <p className="text-gray-400 text-sm">
                        Event assignments, attendance records, payroll history & schedules will appear here.
                    </p>

                </div>

            </div>

        </Layout>
    );
}

// ================= INFO CARD =================
function InfoCard({ title, value, icon }) {

    return (

        <div className="bg-white border rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between mb-4">

                <p className="text-sm text-gray-500">
                    {title}
                </p>

                {icon && (
                    <div className="text-gray-400">
                        {icon}
                    </div>
                )}

            </div>

            <h3 className="text-2xl font-bold text-gray-900">
                {value || 0}
            </h3>

        </div>
    );
}

// ================= DETAIL =================
function Detail({ label, value }) {

    return (

        <div>

            <p className="text-xs text-gray-500 mb-1">
                {label}
            </p>

            <p className="font-medium text-gray-900 capitalize">
                {value || "-"}
            </p>

        </div>
    );
}