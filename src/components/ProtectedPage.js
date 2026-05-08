"use client";

import useAuth from "@/hooks/useAuth";

import Layout from "./Layout";

import { ShieldAlert } from "lucide-react";

export default function ProtectedPage({
  permission,
  children,
}) {

  const {
    can,
    ready,
  } = useAuth();

  // LOADING
  if (!ready) {

    return (

      <Layout>

        <div className="p-10 text-blue-600">
          Loading...
        </div>

      </Layout>
    );
  }

  // ACCESS DENIED
  if (!can(permission)) {

    return (

      <Layout>

        <div className="
          bg-white
          rounded-3xl
          border
          border-red-100
          p-10
          text-center
          shadow-sm
        ">

          <div className="
            w-20
            h-20
            rounded-full
            bg-red-100
            text-red-600
            flex
            items-center
            justify-center
            mx-auto
            mb-5
          ">

            <ShieldAlert size={34} />

          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            Access Denied
          </h2>

          <p className="text-gray-500 mt-2">
            You do not have permission to access this page.
          </p>

        </div>

      </Layout>
    );
  }

  return children;
}