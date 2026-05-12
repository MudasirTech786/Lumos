"use client";

import Layout from "@/components/Layout";

import {
  PlusCircle,
  CalendarPlus,
  MapPin,
  Clock3,
} from "lucide-react";

export default function CreateShootPage() {

  return (

    <Layout>

      <div className="space-y-6 pb-24">

        <div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            New Shoot
          </h1>

          <p className="text-gray-500 mt-2">
            Create and configure new production workflows
          </p>

        </div>

        <div className="
          relative
          overflow-hidden
          rounded-[36px]
          border
          border-blue-100
          bg-gradient-to-br
          from-[#0b1324]
          via-[#123b89]
          to-[#2563eb]
          p-8
          md:p-10
        ">

          <div className="relative z-10 max-w-3xl">

            <div className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-white/10
              bg-white/10
              px-4
              py-2
              text-[11px]
              uppercase
              tracking-[0.22em]
              text-white
            ">

              <PlusCircle size={12} />

              CREATE PRODUCTION

            </div>

            <h2 className="
              mt-7
              text-5xl
              md:text-6xl
              font-black
              leading-[0.98]
              tracking-[-0.06em]
              text-white
            ">

              Shoot creation
              <br />
              coming soon.

            </h2>

            <p className="
              mt-6
              text-base
              leading-relaxed
              text-blue-100/80
            ">

              Configure schedules, assign locations,
              define production timelines and initialize
              operational shoot workflows.

            </p>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">

              <FeatureCard
                icon={<CalendarPlus size={18} />}
                title="Scheduling"
              />

              <FeatureCard
                icon={<MapPin size={18} />}
                title="Locations"
              />

              <FeatureCard
                icon={<Clock3 size={18} />}
                title="Timeline Setup"
              />

            </div>

          </div>

        </div>

      </div>

    </Layout>
  );
}

function FeatureCard({ icon, title }) {

  return (

    <div className="
      rounded-2xl
      border
      border-white/10
      bg-white/10
      backdrop-blur-xl
      p-5
    ">

      <div className="
        w-11
        h-11
        rounded-2xl
        bg-white/10
        flex
        items-center
        justify-center
        text-white
      ">
        {icon}
      </div>

      <h3 className="mt-4 text-white font-semibold">
        {title}
      </h3>

    </div>

  );
}