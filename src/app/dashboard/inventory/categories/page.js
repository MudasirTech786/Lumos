"use client";

import Layout from "@/components/Layout";

import {
  FolderTree,
  Boxes,
  Layers3,
  PackageSearch,
  Clock3,
  ArrowRight,
} from "lucide-react";

export default function CategoriesComingSoonPage() {

  return (

    <Layout>

      <div className="space-y-6 pb-24">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

          <div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Inventory Categories
            </h1>

            <p className="text-gray-500 mt-2">
              Organize production inventory and equipment structures
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

          {/* GRID */}
          <div className="
            absolute
            inset-0
            opacity-[0.06]
            [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)]
            [background-size:42px_42px]
          " />

          {/* GLOW */}
          <div className="
            absolute
            top-[-80px]
            right-[-40px]
            w-[260px]
            h-[260px]
            rounded-full
            bg-cyan-300/20
            blur-3xl
          " />

          <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-10 items-center">

            {/* LEFT */}
            <div>

              {/* BADGE */}
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
                backdrop-blur-xl
              ">

                <div className="
                  w-2
                  h-2
                  rounded-full
                  bg-emerald-400
                  shadow-[0_0_12px_rgba(74,222,128,0.8)]
                " />

                INVENTORY STRUCTURE

              </div>

              {/* TITLE */}
              <h2 className="
                mt-7
                text-5xl
                md:text-6xl
                font-black
                leading-[0.98]
                tracking-[-0.06em]
                text-white
              ">

                Category module
                <br />
                coming soon.

              </h2>

              {/* DESC */}
              <p className="
                mt-6
                max-w-2xl
                text-base
                leading-relaxed
                text-blue-100/80
              ">

                Create organized inventory structures for cameras,
                lighting, audio, accessories and production equipment
                management workflows.

              </p>

              {/* TAGS */}
              <div className="mt-8 flex flex-wrap gap-3">

                <FeatureTag label="Equipment Categories" />

                <FeatureTag label="Inventory Structure" />

                <FeatureTag label="Asset Organization" />

              </div>

            </div>

            {/* RIGHT */}
            <div className="
              rounded-[30px]
              border
              border-white/10
              bg-white/10
              backdrop-blur-2xl
              p-6
            ">

              <div className="flex items-center justify-between">

                <div>

                  <p className="
                    text-xs
                    uppercase
                    tracking-[0.2em]
                    text-blue-100
                  ">
                    Planned Features
                  </p>

                  <h3 className="
                    mt-2
                    text-4xl
                    font-black
                    tracking-tight
                    text-white
                  ">
                    Smart Categorization
                  </h3>

                </div>

                <div className="
                  w-16
                  h-16
                  rounded-3xl
                  bg-white/10
                  flex
                  items-center
                  justify-center
                  text-white
                ">

                  <FolderTree size={30} />

                </div>

              </div>

              {/* FEATURE LIST */}
              <div className="mt-8 space-y-4">

                <MiniFeature
                  icon={<Boxes size={16} />}
                  title="Equipment Groups"
                />

                <MiniFeature
                  icon={<Layers3 size={16} />}
                  title="Nested Categories"
                />

                <MiniFeature
                  icon={<PackageSearch size={16} />}
                  title="Quick Classification"
                />

                <MiniFeature
                  icon={<FolderTree size={16} />}
                  title="Inventory Hierarchy"
                />

              </div>

            </div>

          </div>

        </div>

        {/* FEATURE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <InfoCard
            title="Equipment Organization"
            desc="Organize cameras, lighting, audio and production assets into structured inventory groups."
          />

          <InfoCard
            title="Category Hierarchy"
            desc="Build scalable parent-child inventory structures for operational workflows."
          />

          <InfoCard
            title="Operational Visibility"
            desc="Improve asset discoverability and inventory management efficiency."
          />

        </div>

        {/* STATUS PANEL */}
        <div className="
          bg-white
          rounded-[32px]
          border
          border-blue-100
          p-8
          shadow-sm
        ">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div className="flex items-start gap-4">

              <div className="
                w-14
                h-14
                rounded-2xl
                bg-blue-100
                text-blue-700
                flex
                items-center
                justify-center
              ">

                <Clock3 size={24} />

              </div>

              <div>

                <h3 className="text-2xl font-bold text-gray-900">
                  Category System Under Development
                </h3>

                <p className="text-gray-500 mt-2 max-w-2xl">
                  Inventory category structures, grouping workflows
                  and organizational management interfaces are currently
                  being implemented.
                </p>

              </div>

            </div>

            <button className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-blue-600
              hover:bg-blue-700
              transition
              text-white
              px-5
              py-3
              font-medium
              shadow-lg
              shadow-blue-200
            ">

              Module Pending

              <ArrowRight size={16} />

            </button>

          </div>

        </div>

      </div>

    </Layout>
  );
}

/* ========================================
   FEATURE TAG
======================================== */

function FeatureTag({ label }) {

  return (

    <div className="
      inline-flex
      items-center
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
      {label}
    </div>

  );
}

/* ========================================
   MINI FEATURE
======================================== */

function MiniFeature({
  icon,
  title,
}) {

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

      <span className="
        text-sm
        font-medium
        text-white
      ">
        {title}
      </span>

    </div>

  );
}

/* ========================================
   INFO CARD
======================================== */

function InfoCard({
  title,
  desc,
}) {

  return (

    <div className="
      bg-white
      rounded-[30px]
      border
      border-blue-100
      p-6
      shadow-sm
    ">

      <div className="
        w-12
        h-12
        rounded-2xl
        bg-blue-100
        text-blue-700
        flex
        items-center
        justify-center
      ">

        <FolderTree size={18} />

      </div>

      <h3 className="
        mt-5
        text-xl
        font-bold
        text-gray-900
      ">
        {title}
      </h3>

      <p className="
        mt-3
        text-sm
        leading-relaxed
        text-gray-500
      ">
        {desc}
      </p>

    </div>

  );
}