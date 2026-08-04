import React from 'react';
import { Check } from 'lucide-react';

export interface CardOption {
  id: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  badge?: string;
}

interface CardSelectProps {
  options: CardOption[];
  selectedId?: string | string[];
  onSelect: (optionId: string) => void;
  multiSelect?: boolean;
  columns?: 1 | 2 | 3 | 4;
}

export const CardSelect: React.FC<CardSelectProps> = ({
  options,
  selectedId,
  onSelect,
  multiSelect = false,
  columns = 2,
}) => {
  const isSelected = (id: string) => {
    if (multiSelect && Array.isArray(selectedId)) {
      return selectedId.includes(id);
    }
    return selectedId === id;
  };

  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
  }[columns];

  return (
    <div className={`grid ${gridColsClass} gap-3 sm:gap-4 w-full`}>
      {options.map((opt) => {
        const selected = isSelected(opt.id);

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            className={`relative group w-full text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[88px] ${
              selected
                ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.01]'
                : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between w-full gap-3">
              <div className="flex items-center gap-3">
                {opt.icon && (
                  <div
                    className={`text-xl flex-shrink-0 ${
                      selected ? 'text-white' : 'text-slate-600'
                    }`}
                  >
                    {opt.icon}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-base sm:text-lg leading-snug">
                      {opt.label}
                    </span>
                    {opt.badge && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          selected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  {opt.sublabel && (
                    <p
                      className={`text-xs sm:text-sm mt-1 font-normal ${
                        selected ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {opt.sublabel}
                    </p>
                  )}
                </div>
              </div>

              {/* Selection Checkmark Badge */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  selected
                    ? 'bg-white text-slate-900 scale-100'
                    : 'border border-slate-300 text-transparent opacity-0 group-hover:opacity-40'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
