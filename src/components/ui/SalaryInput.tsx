'use client';

import { useRef, useCallback } from 'react';

// ─── Formatting Helpers ───────────────────────────────────────────────────────

/**
 * Given a currency code, returns a locale string optimized for comma formatting.
 * INR uses Indian lakh comma style (1,00,000), others use international (1,000,000).
 */
function getLocale(currency: string): string {
    return currency === 'INR' ? 'en-IN' : 'en-US';
}

/**
 * Strip everything that is not a digit from a string.
 */
export function stripNonDigits(value: string): string {
    return value.replace(/\D/g, '');
}

/**
 * Format a raw numeric string (digits only) with locale-aware comma separators.
 * Returns empty string for empty input.
 */
export function formatSalary(rawDigits: string, currency = 'USD'): string {
    if (!rawDigits) return '';
    const n = parseInt(rawDigits, 10);
    if (isNaN(n)) return '';
    return n.toLocaleString(getLocale(currency));
}

/**
 * Given a formatted string like "1,00,000", return the raw numeric string "100000".
 */
export function unformatSalary(formatted: string): string {
    return stripNonDigits(formatted);
}

// ─── Component ───────────────────────────────────────────────────────────────

type SalaryInputProps = {
    /** The clean numeric value stored in state (digits only, e.g. "100000") */
    value: string;
    /**
     * Called with the NEW clean numeric string every time user changes the value.
     * Store this raw value in your state; pass it back into `value`.
     */
    onChange: (rawValue: string) => void;
    currency?: string;
    placeholder?: string;
    id?: string;
    name?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
    min?: number;
    max?: number;
};

/**
 * SalaryInput
 *
 * - Displays a formatted value (with commas) while the user types
 * - Accepts only numeric characters; silently drops letters / symbols
 * - Sanitizes paste events: strips non-digit characters before inserting
 * - Uses Indian lakh formatting for INR, international for everything else
 * - Calls onChange with the RAW numeric string (no commas) for clean storage
 * - Preserves cursor position correctly after formatting
 */
export default function SalaryInput({
    value,
    onChange,
    currency = 'USD',
    placeholder,
    id,
    name,
    required = false,
    disabled = false,
    className = '',
    style = {},
    min,
    max,
}: SalaryInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    // The displayed value is always the formatted version of the stored raw value
    const displayValue = formatSalary(value, currency);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const input = e.target;
            const rawInput = input.value;
            const cursorPos = input.selectionStart ?? rawInput.length;

            // Strip non-digits
            const digits = stripNonDigits(rawInput);

            // Optional max-digit guard (prevents absurd numbers, e.g. > 15 digits)
            if (digits.length > 15) return;

            // Optional numeric range validation
            if (digits && min !== undefined && parseInt(digits, 10) < min) {
                // Still allow — we don't block typing; server-side and blur validation handle this
            }

            // Compute the new formatted string
            const formatted = formatSalary(digits, currency);

            // Cursor-position correction:
            // Count how many commas were BEFORE the old cursor position, then adjust.
            const rawBeforeCursor = rawInput.slice(0, cursorPos);
            const digitsBeforeCursor = stripNonDigits(rawBeforeCursor).length;

            // Notify parent with clean digits
            onChange(digits);

            // Restore cursor AFTER React re-renders the input
            requestAnimationFrame(() => {
                if (!inputRef.current) return;
                // Walk through the new formatted string to find the cursor position
                // that corresponds to `digitsBeforeCursor` digits
                let digitCount = 0;
                let newCursor = 0;
                for (let i = 0; i < formatted.length; i++) {
                    if (/\d/.test(formatted[i])) {
                        digitCount++;
                    }
                    if (digitCount === digitsBeforeCursor) {
                        newCursor = i + 1;
                        break;
                    }
                }
                // If all digits accounted for but cursor not placed, put at end
                if (digitsBeforeCursor === 0) newCursor = 0;
                else if (newCursor === 0) newCursor = formatted.length;

                inputRef.current.setSelectionRange(newCursor, newCursor);
            });
        },
        [currency, onChange, min]
    );

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        // Allow: backspace, delete, tab, escape, enter, arrow keys, home, end
        const allowed = [
            'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
            'Home', 'End'
        ];
        if (allowed.includes(e.key)) return;

        // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
        if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase())) return;

        // Block any non-digit key
        if (!/^\d$/.test(e.key)) {
            e.preventDefault();
        }
    }, []);

    const handlePaste = useCallback(
        (e: React.ClipboardEvent<HTMLInputElement>) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData('text');
            const digitsOnly = stripNonDigits(pasted);
            if (!digitsOnly) return;

            // Insert pasted digits at cursor position in existing value
            const input = inputRef.current;
            if (!input) return;

            const start = input.selectionStart ?? 0;
            const end = input.selectionEnd ?? 0;

            // Current raw digits, spliced with pasted digits
            const currentDigits = value; // already raw
            // Calculate digit positions for start and end cursor
            const displayVal = input.value;
            const digitsBeforeStart = stripNonDigits(displayVal.slice(0, start)).length;
            const digitsBeforeEnd = stripNonDigits(displayVal.slice(0, end)).length;

            const newDigits =
                currentDigits.slice(0, digitsBeforeStart) +
                digitsOnly +
                currentDigits.slice(digitsBeforeEnd);

            if (newDigits.length > 15) return;

            onChange(newDigits);
        },
        [value, onChange]
    );

    return (
        <input
            ref={inputRef}
            id={id}
            name={name}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={displayValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={className}
            style={style}
            aria-label={name}
        />
    );
}
