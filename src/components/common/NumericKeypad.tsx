import React from 'react';
import { Delete } from 'lucide-react';

interface NumericKeypadProps {
  value: string;
  onChange: (newValue: string) => void;
  onSubmit?: () => void;
  maxLength?: number;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  value,
  onChange,
  onSubmit,
  maxLength = 10,
}) => {
  const handleDigit = (digit: string) => {
    if (value.length < maxLength) {
      onChange(value + digit);
    }
  };

  const handleDelete = () => {
    if (value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleClear = () => {
    onChange('');
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0'];

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {digits.map((item) => {
          if (item === 'C') {
            return (
              <button
                key="clear"
                type="button"
                onClick={handleClear}
                className="h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-base flex items-center justify-center transition-colors active:scale-95"
              >
                Clear
              </button>
            );
          }

          return (
            <button
              key={item}
              type="button"
              onClick={() => handleDigit(item)}
              className="h-14 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-900 font-semibold text-xl flex items-center justify-center shadow-xs transition-colors active:scale-95"
            >
              {item}
            </button>
          );
        })}

        {/* Backspace Button */}
        <button
          key="backspace"
          type="button"
          onClick={handleDelete}
          className="h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors active:scale-95"
          title="Backspace"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
