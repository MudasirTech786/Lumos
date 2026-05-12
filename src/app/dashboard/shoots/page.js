"use client";

import Layout from "@/components/Layout";

import {
  Briefcase,
  CalendarDays,
  Users,
  MapPin,
  Clock3,
} from "lucide-react";

export default function ShootsPage() {

  return (

    <Layout>

      <div className="space-y-6 pb-24">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

          <div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Productions
            </h1>

            <p className="text-gray-500 mt-2">
              Manage active shoots, schedules and production operations
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
            font-medium
            text-blue-700
          ">

            <Clock3 size={16} />

            Module In Development

          </div>

        </div>

        {/* HERO */}
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
          shadow-[0_30px_100px_rgba(37,99,235,0.18)]
        ">

          <div className="
            absolute
            inset-0
            opacity-[0.06]
            [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)]
            [background-size:42px_42px]
          " />

          <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-10 items-center">

            <div>

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

                <div className="w-2 h-2 rounded-full bg-emerald-400" />

                PRODUCTION OPERATIONS

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

                Shoot management
                <br />
                coming soon.

              </h2>

              <p className="
                mt-6
                max-w-2xl
                text-base
                leading-relaxed
                text-blue-100/80
              ">

                Manage productions, schedules, locations,
                crew operations and shoot workflows from
                one centralized system.

              </p>

            </div>

            <div className="
              rounded-[30px]
              border
              border-white/10
              bg-white/10
              backdrop-blur-2xl
              p-6
              space-y-4
            ">

              <MiniFeature
                icon={<CalendarDays size={16} />}
                title="Production Scheduling"
              />

              <MiniFeature
                icon={<Users size={16} />}
                title="Crew Operations"
              />

              <MiniFeature
                icon={<MapPin size={16} />}
                title="Shoot Locations"
              />

              <MiniFeature
                icon={<Briefcase size={16} />}
                title="Production Workflow"
              />

            </div>

          </div>

        </div>

      </div>

    </Layout>
  );
}

function MiniFeature({ icon, title }) {

  return (

    <div className="
      flex
      items-center
      gap-3
      rounded-2xl
      border
      border-white/10
      bg-black/10
      px-4
      py-4
    ">

      <div className="
        w-10
        h-10
        rounded-2xl
        bg-white/10
        flex
        items-center
        justify-center
        text-white
      ">
        {icon}
      </div>

      <span className="text-sm font-medium text-white">
        {title}
      </span>

    </div>

  );
}