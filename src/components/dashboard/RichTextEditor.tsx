'use client';

import { useState, useRef, useEffect } from 'react';
import { Bold, Italic, List, ListOrdered, Type } from 'lucide-react';

interface EditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: EditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Synchronize value from prop to editor only once on mount
    useEffect(() => {
        if (editorRef.current && isMounted) {
            if (editorRef.current.innerHTML !== value) {
                editorRef.current.innerHTML = value || '';
            }
        }
    }, [isMounted]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        handleInput();
    };

    if (!isMounted) return <div className="form-input" style={{ minHeight: '150px' }}></div>;

    return (
        <div className="rich-editor-container" style={{
            border: '1px solid #d1d5db',
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: '#fff',
            transition: 'border-color 0.2s'
        }}>
            {/* Toolbar */}
            <div className="editor-toolbar" style={{
                display: 'flex',
                gap: '8px',
                padding: '8px 12px',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb'
            }}>
                <button
                    type="button"
                    onClick={() => execCommand('bold')}
                    className="toolbar-btn"
                    title="Bold"
                    style={toolbarBtnStyle}
                >
                    <Bold size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('italic')}
                    className="toolbar-btn"
                    title="Italic"
                    style={toolbarBtnStyle}
                >
                    <Italic size={16} />
                </button>
                <div style={{ width: '1px', backgroundColor: '#e5e7eb', margin: '0 4px' }} />
                <button
                    type="button"
                    onClick={() => execCommand('insertUnorderedList')}
                    className="toolbar-btn"
                    title="Bullet List"
                    style={toolbarBtnStyle}
                >
                    <List size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('insertOrderedList')}
                    className="toolbar-btn"
                    title="Numbered List"
                    style={toolbarBtnStyle}
                >
                    <ListOrdered size={16} />
                </button>
                <div style={{ width: '1px', backgroundColor: '#e5e7eb', margin: '0 4px' }} />
                <button
                    type="button"
                    onClick={() => execCommand('formatBlock', 'H3')}
                    className="toolbar-btn"
                    title="Heading"
                    style={toolbarBtnStyle}
                >
                    <Type size={16} />
                </button>
            </div>

            {/* Editable Area */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                className="editor-content"
                style={{
                    minHeight: '200px',
                    padding: '16px',
                    outline: 'none',
                    color: '#111827',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    cursor: 'text'
                }}
                data-placeholder={placeholder}
            />

            <style jsx>{`
                .editor-content:empty:before {
                    content: attr(data-placeholder);
                    color: #9ca3af;
                    font-style: italic;
                }
                .toolbar-btn:hover {
                    background-color: #e5e7eb;
                    color: #111827;
                }
            `}</style>
        </div>
    );
}

const toolbarBtnStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'all 0.2s'
};
