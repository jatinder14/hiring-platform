'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

type SearchableSelectProps = {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    id?: string;
    icon?: React.ReactNode;
    noResultsText?: string;
};

export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Select an option',
    disabled = false,
    id,
    icon,
    noResultsText = 'No results found'
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const filteredOptions = query.trim()
        ? options.filter(opt => opt.toLowerCase().includes(query.toLowerCase()))
        : options;

    const openDropdown = useCallback(() => {
        if (disabled) return;
        setIsOpen(true);
        setQuery('');
        setHighlightedIndex(0);
        setTimeout(() => inputRef.current?.focus(), 10);
    }, [disabled]);

    const closeDropdown = useCallback(() => {
        setIsOpen(false);
        setQuery('');
    }, []);

    const selectOption = useCallback((opt: string) => {
        onChange(opt);
        closeDropdown();
    }, [onChange, closeDropdown]);

    const clearValue = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
    }, [onChange]);

    // Close on outside click
    useEffect(() => {
        const handleOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                closeDropdown();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleOutside);
        }
        return () => document.removeEventListener('mousedown', handleOutside);
    }, [isOpen, closeDropdown]);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') openDropdown();
            return;
        }
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(i => Math.min(i + 1, filteredOptions.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(i => Math.max(i - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredOptions[highlightedIndex]) selectOption(filteredOptions[highlightedIndex]);
                break;
            case 'Escape':
                closeDropdown();
                break;
        }
    };

    // Scroll highlighted item into view
    useEffect(() => {
        if (!listRef.current) return;
        const item = listRef.current.children[highlightedIndex] as HTMLElement;
        if (item) item.scrollIntoView({ block: 'nearest' });
    }, [highlightedIndex]);

    // Reset highlight when query changes
    useEffect(() => {
        setHighlightedIndex(0);
    }, [query]);

    const displayLabel = value || placeholder;
    const hasValue = !!value;

    return (
        <div
            ref={containerRef}
            style={{ position: 'relative', width: '100%' }}
            onKeyDown={handleKeyDown}
        >
            {/* Trigger Button */}
            <div
                id={id}
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                tabIndex={disabled ? -1 : 0}
                onClick={openDropdown}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0 12px',
                    height: '44px',
                    border: `1px solid ${isOpen ? '#3b82f6' : '#d1d5db'}`,
                    borderRadius: '10px',
                    backgroundColor: disabled ? '#f9fafb' : 'white',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    userSelect: 'none',
                    fontSize: '14px',
                    color: hasValue ? '#111827' : '#9ca3af',
                    transition: 'border-color 0.15s',
                    boxShadow: isOpen ? '0 0 0 3px rgba(59,130,246,0.1)' : 'none',
                    outline: 'none'
                }}
            >
                {icon && (
                    <span style={{ color: isOpen ? '#3b82f6' : '#9ca3af', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                        {icon}
                    </span>
                )}
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayLabel}
                </span>
                {hasValue && !disabled && (
                    <button
                        type="button"
                        onClick={clearValue}
                        style={{
                            border: 'none', background: 'none', padding: '2px', cursor: 'pointer',
                            color: '#9ca3af', display: 'flex', alignItems: 'center', borderRadius: '4px',
                            flexShrink: 0
                        }}
                        title="Clear"
                    >
                        <X size={14} />
                    </button>
                )}
                <ChevronDown
                    size={16}
                    style={{
                        color: '#9ca3af', flexShrink: 0,
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                    }}
                />
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '4px',
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                        zIndex: 10000,
                        overflow: 'hidden'
                    }}
                >
                    {/* Search Input */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        borderBottom: '1px solid #f1f5f9',
                    }}>
                        <Search size={14} style={{ color: '#9ca3af', flexShrink: 0 }} />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder={`Search ${options.length} options...`}
                            style={{
                                flex: 1,
                                border: 'none',
                                outline: 'none',
                                fontSize: '13px',
                                color: '#111827',
                                background: 'transparent'
                            }}
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery('')}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', padding: '2px' }}
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* Options List */}
                    <ul
                        ref={listRef}
                        role="listbox"
                        style={{
                            listStyle: 'none',
                            margin: 0,
                            padding: '4px 0',
                            maxHeight: '240px',
                            overflow: 'auto',
                            scrollbarWidth: 'thin'
                        }}
                    >
                        {filteredOptions.length === 0 ? (
                            <li style={{
                                padding: '12px 16px',
                                color: '#9ca3af',
                                fontSize: '13px',
                                textAlign: 'center'
                            }}>
                                {noResultsText}
                            </li>
                        ) : (
                            filteredOptions.map((opt, i) => (
                                <li
                                    key={opt}
                                    role="option"
                                    aria-selected={opt === value}
                                    onMouseDown={(e) => { e.preventDefault(); selectOption(opt); }}
                                    onMouseEnter={() => setHighlightedIndex(i)}
                                    style={{
                                        padding: '9px 16px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        backgroundColor: i === highlightedIndex
                                            ? '#eff6ff'
                                            : opt === value
                                                ? '#f0fdf4'
                                                : 'transparent',
                                        color: opt === value ? '#059669' : '#111827',
                                        fontWeight: opt === value ? '600' : '400',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    {opt}
                                    {opt === value && <span style={{ fontSize: '10px', color: '#059669' }}>✓</span>}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
