"use client";

import Layout from "@/components/Layout";

export default function Dashboard() {
  return (
    <Layout>
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        <div className="bg-white p-5 rounded mt-4 shadow">
          <p>Welcome to dashboard 🚀</p>
        </div>
      </div>
    </Layout>
  );
}