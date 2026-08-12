'use client';

import { useState } from 'react';

interface JournalCalendarProps {
  entryDates: Set<string>; // Tanggal dalam format YYYY-MM-DD
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

const DAYS_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function JournalCalendar({
  entryDates,
  selectedDate,
  onSelectDate,
}: JournalCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month & total days in month
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    const todayStr = getLocalDateStr(today);
    if (entryDates.has(todayStr)) {
      onSelectDate(todayStr);
    }
  };

  const getLocalDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayStr = getLocalDateStr(new Date());

  // Generate calendar grid cells
  const calendarCells = [];
  
  // Padding cells for days before the 1st
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= totalDays; day++) {
    const dateObj = new Date(year, month, day);
    const dateStr = getLocalDateStr(dateObj);
    calendarCells.push({ day, dateStr });
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
      {/* Header Month & Nav */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <span>📅 Journal Calendar</span>
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 text-sm font-semibold transition"
            title="Previous Month"
          >
            &lt;
          </button>
          <span className="text-xs font-semibold text-slate-700 min-w-[110px] text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 text-sm font-semibold transition"
            title="Next Month"
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {DAYS_OF_WEEK.map((d, idx) => (
          <span
            key={d}
            className={`text-[11px] font-bold ${
              idx === 0 || idx === 6 ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {d}
          </span>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarCells.map((cell, index) => {
          if (!cell) {
            return <div key={`empty-${index}`} className="h-8" />;
          }

          const hasEntry = entryDates.has(cell.dateStr);
          const isSelected = selectedDate === cell.dateStr;
          const isToday = cell.dateStr === todayStr;

          let btnStyle = 'hover:bg-slate-100 text-slate-700';

          if (isSelected) {
            btnStyle = 'bg-indigo-600 text-white font-bold shadow-sm scale-105';
          } else if (hasEntry) {
            btnStyle = 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 hover:bg-indigo-100';
          } else if (isToday) {
            btnStyle = 'bg-slate-100 text-slate-900 font-bold border border-slate-300';
          }

          return (
            <button
              key={cell.dateStr}
              type="button"
              onClick={() => {
                if (isSelected) {
                  onSelectDate(null); // Toggle off if clicked again
                } else {
                  onSelectDate(cell.dateStr);
                }
              }}
              className={`relative h-8 w-full rounded-lg text-xs flex flex-col items-center justify-center transition-all ${btnStyle}`}
              title={`${cell.day} ${MONTH_NAMES[month]} ${year}${
                hasEntry ? ' (Ada Jurnal)' : ''
              }`}
            >
              <span>{cell.day}</span>
              {hasEntry && !isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-0.5" />
              )}
              {hasEntry && isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-white mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend & Footer Action */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-50 border border-indigo-200" />
            <span className="text-[11px]">Ada Jurnal</span>
          </span>
          {selectedDate && (
            <button
              type="button"
              onClick={() => onSelectDate(null)}
              className="text-[11px] text-indigo-600 hover:underline font-medium"
            >
              Hapus Filter
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleToday}
          className="text-[11px] font-semibold text-slate-600 hover:text-indigo-600 transition"
        >
          Hari Ini
        </button>
      </div>
    </div>
  );
}
