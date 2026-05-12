"use client";

import Layout from "@/components/Layout";

import {
  Users,
  UserCheck,
  Briefcase,
  Clock3,
} from "lucide-react";

export default function ShootCrewPage() {

  return (

    <Layout>

      <div className="space-y-6 pb-24">

        <div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Crew Assignments
          </h1>

          <p className="text-gray-500 mt-2">
            Assign production crew members to active shoots
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

          <div className="
            absolute
            inset-0
            opacity-[0.06]
            [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)]
            [background-size:42px_42px]
          " />

          <div className="relative z-10 max-w-4xl">

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

              <Users size={12} />

              CREW OPERATIONS

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

              Crew assignment
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

              Assign camera operators, production staff,
              assistants and operational crew members
              to production workflows.

            </p>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">

              <CrewCard
                icon={<UserCheck size={18} />}
                title="Assign Crew"
              />

              <CrewCard
                icon={<Briefcase size={18} />}
                title="Production Roles"
              />

              <CrewCard
                icon={<Clock3 size={18} />}
                title="Shift Scheduling"
              />

            </div>

          </div>

        </div>

      </div>

    </Layout>
  );
}

function CrewCard({ icon, title }) {

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