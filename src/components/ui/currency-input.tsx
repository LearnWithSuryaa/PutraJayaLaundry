import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
  > {
  value: number;
  onChange: (value: number) => void;
}

export const CurrencyInput = React.forwardRef<
  HTMLInputElement,
  CurrencyInputProps
>(({ value, onChange, className, ...props }, ref) => {
  const [displayValue, setDisplayValue] = React.useState("");

  // Sync external value to display value
  React.useEffect(() => {
    if (value === 0 && displayValue === "") return; // Allow empty state
    if (!isNaN(value)) {
      setDisplayValue(new Intl.NumberFormat("id-ID").format(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\./g, ""); // Remove dots

    if (rawValue === "") {
      setDisplayValue("");
      onChange(0);
      return;
    }

    // Allow only numbers
    if (/^\d*$/.test(rawValue)) {
      const numericValue = parseInt(rawValue, 10);
      onChange(numericValue);
      // We rely on useEffect to update displayValue to ensure it matches 'value'
      // But for smoother typing, we might update parsing here too
    }
  };

  return (
    <Input
      {...props}
      ref={ref}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      className={cn("font-mono", className)}
    />
  );
});

CurrencyInput.displayName = "CurrencyInput";
