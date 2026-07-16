"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { CalendarDays } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function parseDateString(str) {
  if (!str) return null;
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  return new Date(y, m - 1, d);
}

function parseDatetimeString(str) {
  if (!str) return null;
  const parts = str.includes("T") ? str.split("T") : str.split(" ");
  const datePart = parts[0];
  const timePart = parts[1];
  if (!datePart) return null;
  const [year, month, day] = datePart.split("-").map(Number);
  if ([year, month, day].some(isNaN)) return null;
  if (!timePart) return new Date(year, month - 1, day);
  const [hours, minutes] = timePart.split(":").map(Number);
  if ([hours, minutes].some(isNaN)) return new Date(year, month - 1, day);
  return new Date(year, month - 1, day, hours, minutes);
}

function toDateString(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toDatetimeString(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}`;
}

function formatDateDisplay(date) {
  if (!date) return "";
  const day = date.getDate();
  const month = SHORT_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function formatDatetimeDisplay(date) {
  if (!date) return "";
  const day = date.getDate();
  const month = SHORT_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${day} ${month} ${year}  ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
}

function getHour12(date) {
  return date.getHours() % 12 || 12;
}

function getAmPm(date) {
  return date.getHours() >= 12 ? "PM" : "AM";
}

export default function DateTimePicker({
  label,
  value,
  onChange,
  icon,
  placeholder = "Select date & time",
  dateOnly = false,
}) {
  const [open, setOpen] = useState(false);

  const [viewYear, setViewYear] = useState(() => {
    const parsed = dateOnly ? parseDateString(value) : parseDatetimeString(value);
    return parsed ? parsed.getFullYear() : new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const parsed = dateOnly ? parseDateString(value) : parseDatetimeString(value);
    return parsed ? parsed.getMonth() : new Date().getMonth();
  });

  const [selectedDate, setSelectedDate] = useState(() =>
    dateOnly ? parseDateString(value) : parseDatetimeString(value)
  );
  const [selectedHour, setSelectedHour] = useState(() => {
    const d = parseDatetimeString(value);
    return d ? getHour12(d) : 9;
  });
  const [selectedMinute, setSelectedMinute] = useState(() => {
    const d = parseDatetimeString(value);
    return d ? String(d.getMinutes()).padStart(2, "0") : "00";
  });
  const [selectedAmPm, setSelectedAmPm] = useState(() => {
    const d = parseDatetimeString(value);
    return d ? getAmPm(d) : "AM";
  });
  const [activeTab, setActiveTab] = useState("date");

  const containerRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    const parsed = dateOnly ? parseDateString(value) : parseDatetimeString(value);
    if (parsed) {
      setSelectedDate(parsed);
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
      if (!dateOnly) {
        setSelectedHour(getHour12(parsed));
        setSelectedMinute(String(parsed.getMinutes()).padStart(2, "0"));
        setSelectedAmPm(getAmPm(parsed));
      }
    }
  }, [value, dateOnly]);

  const commitChange = useCallback((date, h, min, ampm) => {
    if (!date) {
      onChange("");
      return;
    }
    if (dateOnly) {
      onChange(toDateString(date));
      return;
    }
    let hours24 = h;
    if (ampm === "AM" && h === 12) hours24 = 0;
    else if (ampm === "PM" && h !== 12) hours24 = h + 12;

    const result = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours24,
      parseInt(min, 10)
    );
    onChange(toDatetimeString(result));
  }, [onChange, dateOnly]);

  const handleDayClick = (day) => {
    const newDate = new Date(viewYear, viewMonth, day);
    setSelectedDate(newDate);
    commitChange(newDate, selectedHour, selectedMinute, selectedAmPm);
  };

  const handleHourChange = (h) => {
    setSelectedHour(h);
    commitChange(selectedDate, h, selectedMinute, selectedAmPm);
  };

  const handleMinuteChange = (m) => {
    setSelectedMinute(m);
    commitChange(selectedDate, selectedHour, m, selectedAmPm);
  };

  const handleAmPmChange = (ap) => {
    setSelectedAmPm(ap);
    commitChange(selectedDate, selectedHour, selectedMinute, ap);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") setOpen(false);
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        popupRef.current &&
        !popupRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", handler);
    };
  }, [open]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const today = new Date();
  const isToday = (d) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === d;
  const isSelected = (d) =>
    selectedDate &&
    selectedDate.getFullYear() === viewYear &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getDate() === d;

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDate(now);
    if (dateOnly) {
      commitChange(now, 0, "00", "AM");
    } else {
      const h = getHour12(now);
      const m = String(now.getMinutes()).padStart(2, "0");
      const ap = getAmPm(now);
      setSelectedHour(h);
      setSelectedMinute(m);
      setSelectedAmPm(ap);
      commitChange(now, h, m, ap);
    }
  };

  const displayValue = dateOnly
    ? (selectedDate ? formatDateDisplay(selectedDate) : "")
    : (selectedDate ? formatDatetimeDisplay(selectedDate) : "");

  return (
    <div ref={containerRef}>
      <label className="text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative mt-3">
        {icon && (
          <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-blue-600">
            {icon}
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`
            w-full flex items-center gap-2
            rounded-[28px] border bg-white/80
            backdrop-blur-xl transition-all
            pl-14 pr-5 py-5 text-sm text-left
            outline-none resize-none
            ${open
              ? "border-blue-300 ring-4 ring-blue-500/10"
              : "border-blue-100 hover:border-blue-200"
            }
            ${displayValue ? "text-slate-700" : "text-slate-400"}
          `}
          aria-label={label}
          aria-expanded={open}
        >
          {displayValue || placeholder}
        </button>
      </div>

      {open && (
        <div
          ref={popupRef}
          className="
            z-50 mt-2
            rounded-2xl border border-blue-100
            bg-white/95 backdrop-blur-2xl
            shadow-[0_25px_60px_rgba(37,99,235,0.12)]
            p-4
            w-full max-w-[340px]
          "
          style={{
            animation: "pickerIn 0.2s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <style>{`
            @keyframes pickerIn {
              from { opacity: 0; transform: scale(0.95) translateY(-4px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>

          {/* TABS */}
          {!dateOnly && (
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab("date")}
                className={`
                  flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all
                  ${activeTab === "date"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                  }
                `}
              >
                <CalendarDays size={14} className="inline mr-1.5 -mt-0.5" />
                Date
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("time")}
                className={`
                  flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all
                  ${activeTab === "time"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                  }
                `}
              >
                <span className="mr-1">🕒</span>
                Time
              </button>
            </div>
          )}

          {/* DATE CALENDAR — always shown in dateOnly, or when date tab active */}
          {(dateOnly || activeTab === "date") && (
            <>
              {/* MONTH / YEAR NAV */}
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="
                    w-8 h-8 rounded-lg flex items-center justify-center
                    text-slate-400 hover:bg-slate-100 hover:text-slate-700
                    transition-all text-sm
                  "
                  aria-label="Previous month"
                >
                  ‹
                </button>

                <div className="flex items-center gap-2">
                  <select
                    value={viewMonth}
                    onChange={(e) => setViewMonth(parseInt(e.target.value))}
                    className="
                      text-sm font-semibold text-slate-800
                      bg-transparent border-none outline-none
                      cursor-pointer
                    "
                    aria-label="Month"
                  >
                    {MONTHS.map((m, i) => (
                      <option key={i} value={i}>{m}</option>
                    ))}
                  </select>

                  <select
                    value={viewYear}
                    onChange={(e) => setViewYear(parseInt(e.target.value))}
                    className="
                      text-sm font-semibold text-slate-800
                      bg-transparent border-none outline-none
                      cursor-pointer
                    "
                    aria-label="Year"
                  >
                    {Array.from({ length: 21 }, (_, i) => today.getFullYear() - 5 + i).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={nextMonth}
                  className="
                    w-8 h-8 rounded-lg flex items-center justify-center
                    text-slate-400 hover:bg-slate-100 hover:text-slate-700
                    transition-all text-sm
                  "
                  aria-label="Next month"
                >
                  ›
                </button>
              </div>

              {/* WEEKDAYS */}
              <div className="grid grid-cols-7 gap-0 mb-1">
                {WEEKDAYS.map((d) => (
                  <div
                    key={d}
                    className="
                      text-center text-[10px] font-semibold
                      uppercase tracking-wider text-slate-400
                      py-1
                    "
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* DAYS GRID */}
              <div className="grid grid-cols-7 gap-0">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const selected = isSelected(day);
                  const todayFlag = isToday(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayClick(day)}
                      className={`
                        relative w-full aspect-square flex items-center justify-center
                        text-sm rounded-xl transition-all duration-150
                        ${selected
                          ? "bg-blue-600 text-white font-semibold shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
                          : todayFlag
                            ? "bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100"
                            : "text-slate-700 hover:bg-slate-100"
                        }
                      `}
                      aria-label={`${MONTHS[viewMonth]} ${day}, ${viewYear}`}
                      aria-selected={selected}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* TODAY */}
              <button
                type="button"
                onClick={handleToday}
                className="
                  w-full mt-3 rounded-xl border border-blue-100 bg-blue-50/50
                  py-2 text-xs font-semibold text-blue-600
                  hover:bg-blue-100 transition-all
                "
              >
                Today
              </button>
            </>
          )}

          {/* TIME PICKER — only in datetime mode */}
          {!dateOnly && activeTab === "time" && (
            <div className="space-y-4">
              {/* HOUR */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Hour
                </p>
                <div className="grid grid-cols-6 gap-1.5">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const h = i + 1;
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => handleHourChange(h)}
                        className={`
                          rounded-xl py-2.5 text-sm font-semibold transition-all duration-150
                          ${selectedHour === h
                            ? "bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }
                        `}
                      >
                        {String(h).padStart(2, "0")}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MINUTE */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Minute
                </p>
                <div className="grid grid-cols-6 gap-1.5">
                  {MINUTES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleMinuteChange(m)}
                      className={`
                        rounded-xl py-2.5 text-sm font-semibold transition-all duration-150
                        ${selectedMinute === m
                          ? "bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }
                      `}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* AM / PM */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  AM / PM
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {["AM", "PM"].map((ap) => (
                    <button
                      key={ap}
                      type="button"
                      onClick={() => handleAmPmChange(ap)}
                      className={`
                        rounded-xl py-3 text-sm font-semibold transition-all duration-150
                        ${selectedAmPm === ap
                          ? "bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }
                      `}
                    >
                      {ap}
                    </button>
                  ))}
                </div>
              </div>

              {/* NOW */}
              <button
                type="button"
                onClick={handleToday}
                className="
                  w-full rounded-xl border border-blue-100 bg-blue-50/50
                  py-2 text-xs font-semibold text-blue-600
                  hover:bg-blue-100 transition-all
                "
              >
                Now
              </button>
            </div>
          )}

          {/* CONFIRM */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="
              w-full mt-3 rounded-xl bg-blue-600
              py-2.5 text-sm font-semibold text-white
              shadow-[0_4px_12px_rgba(37,99,235,0.25)]
              hover:bg-blue-700 active:scale-[0.98]
              transition-all duration-150
            "
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
}
