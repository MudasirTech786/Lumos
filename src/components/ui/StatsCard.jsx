"use client";

import { useEffect, useRef, useState } from "react";

export default function StatsCard({
  icon,
  iconBg = "bg-blue-100",
  iconColor = "text-blue-600",
  accentColor = "bg-blue-500",
  value,
  label,
  chip,
  index = 0,
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), index * 80);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-[3px] hover:shadow-xl ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      <div className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-[28px] ${accentColor}`} />
      <div className="p-5 pt-6">
        <div className="flex items-start justify-between">
          <div className={`flex items-center justify-center w-12 h-12 rounded-2xl ${iconBg} ${iconColor} transition-transform duration-300 group-hover:scale-110`}>
            {icon}
          </div>
          {chip && (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${chip.bg || "bg-slate-100"} ${chip.color || "text-slate-600"}`}>
              {chip.text || chip}
            </span>
          )}
        </div>
        <h3 className="mt-4 text-[36px] font-bold tracking-tight text-slate-900 leading-none">{value}</h3>
        <p className="mt-2 text-sm font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}
