"use client";

import Layout from "@/components/Layout";

import {
    ArrowLeft,
    Mail,
    Phone,
    Briefcase,
    Calendar,
    BadgeDollarSign,
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
                <div className="p-6">
                    Loading...
                </div>
            </Layout>
        );
    }

    if (!employee) {

        return (
            <Layout>
                <div className="p-6">
                    Employee not found
                </div>
            </Layout>
        );
    }

    return (

        <Layout>

            <div className="space-y-6 pb-10">

                {/* HEADER */}
                <div className="flex items-center gap-3">

                    <button
                        onClick={() => router.back()}
                        className="w-11 h-11 rounded-2xl border border-gray-200 hover:bg-gray-100 transition flex items-center justify-center"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div>

                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                            {employee.name}
                        </h1>

                        <p className="text-gray-500 mt-1">
                            Employee Details
                        </p>

                    </div>

                </div>

                {/* PROFILE */}
                <div className="bg-white rounded-3xl border border-blue-100 shadow-sm p-6 md:p-8">

                    <div className="flex flex-col md:flex-row md:items-center gap-6">

                        <div className="w-24 h-24 rounded-3xl bg-blue-100 overflow-hidden flex items-center justify-center text-2xl font-bold text-blue-700">

                            {employee.profile_photo ? (

                                <img
                                    src={employee.profile_photo}
                                    alt={employee.name}
                                    className="w-full h-full object-cover"
                                />

                            ) : (

                                employee.name?.charAt(0)

                            )}

                        </div>

                        <div className="space-y-2">

                            <div className="flex flex-wrap items-center gap-3">

                                <h2 className="text-2xl font-bold text-gray-900">
                                    {employee.name}
                                </h2>

                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        employee.status === "active"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-600"
                                    }`}
                                >
                                    {employee.status}
                                </span>

                            </div>

                            <p className="text-gray-500">
                                {employee.designation}
                            </p>

                            <p className="text-sm text-gray-400">
                                {employee.employee_code}
                            </p>

                        </div>

                    </div>

                </div>

                {/* GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* CONTACT */}
                    <div className="bg-white rounded-3xl border border-blue-100 shadow-sm p-6 space-y-5">

                        <h3 className="text-lg font-semibold text-gray-900">
                            Contact Information
                        </h3>

                        <Detail
                            icon={<Mail size={16} />}
                            label="Email"
                            value={employee.email}
                        />

                        <Detail
                            icon={<Phone size={16} />}
                            label="Phone"
                            value={employee.phone}
                        />

                        <Detail
                            icon={<Phone size={16} />}
                            label="Emergency Contact"
                            value={employee.emergency_contact}
                        />

                    </div>

                    {/* JOB */}
                    <div className="bg-white rounded-3xl border border-blue-100 shadow-sm p-6 space-y-5">

                        <h3 className="text-lg font-semibold text-gray-900">
                            Employment Information
                        </h3>

                        <Detail
                            icon={<Briefcase size={16} />}
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

                    </div>

                </div>

                {/* PERSONAL */}
                <div className="bg-white rounded-3xl border border-blue-100 shadow-sm p-6 space-y-5">

                    <h3 className="text-lg font-semibold text-gray-900">
                        Personal Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <Detail
                            label="CNIC"
                            value={employee.cnic}
                        />

                        <Detail
                            label="Address"
                            value={employee.address}
                        />

                    </div>

                </div>

            </div>

        </Layout>
    );
}

function Detail({
    icon,
    label,
    value,
}) {

    return (

        <div className="flex items-start gap-3">

            {icon && (
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    {icon}
                </div>
            )}

            <div>

                <p className="text-sm text-gray-400">
                    {label}
                </p>

                <p className="font-medium text-gray-900 mt-1 break-words">
                    {value || "-"}
                </p>

            </div>

        </div>
    );
}