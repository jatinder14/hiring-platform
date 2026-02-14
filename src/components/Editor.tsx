'use client';

import React, { useEffect, useRef } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';

interface EditorProps {
    data?: OutputData;
    onChange?: (data: OutputData) => void;
    readOnly?: boolean;
    placeholder?: string;
}

const Editor: React.FC<EditorProps> = ({ data, onChange, readOnly = false, placeholder = 'Start typing...' }) => {
    const editorRef = useRef<EditorJS | null>(null);
    const containerId = useRef(`editorjs-${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        if (!editorRef.current) {
            const initEditor = async () => {
                const EditorJS = (await import('@editorjs/editorjs')).default;
                const Header = (await import('@editorjs/header')).default;
                const List = (await import('@editorjs/list')).default;
                const Embed = (await import('@editorjs/embed')).default;
                const Table = (await import('@editorjs/table')).default;
                const Checklist = (await import('@editorjs/checklist')).default;
                const Marker = (await import('@editorjs/marker')).default;
                const InlineCode = (await import('@editorjs/inline-code')).default;

                const editor = new EditorJS({
                    holder: containerId.current,
                    data: data,
                    readOnly: readOnly,
                    placeholder: placeholder,
                    tools: {
                        header: {
                            class: Header,
                            shortcut: 'CMD+SHIFT+H',
                            config: {
                                placeholder: 'Enter a header',
                                levels: [2, 3, 4],
                                defaultLevel: 3,
                            },
                        },
                        list: {
                            class: List,
                            inlineToolbar: true,
                        },
                        checklist: {
                            class: Checklist,
                            inlineToolbar: true,
                        },
                        table: {
                            class: Table,
                            inlineToolbar: true,
                        },
                        marker: Marker,
                        inlineCode: InlineCode,
                        embed: Embed,
                    },
                    onChange: async () => {
                        if (onChange) {
                            const savedData = await editor.save();
                            onChange(savedData);
                        }
                    },
                });

                editorRef.current = editor;
            };

            initEditor();
        }

        return () => {
            if (editorRef.current && editorRef.current.destroy) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, []);

    return (
        <div
            id={containerId.current}
            className="editorjs-container"
            style={{
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                padding: '20px',
                minHeight: '200px',
                backgroundColor: '#fff',
                color: '#111827',
            }}
        />
    );
};

export default Editor;
