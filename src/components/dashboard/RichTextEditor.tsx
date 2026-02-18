'use client';

import { useEffect, useRef, useState } from 'react';

export default function RichTextEditor({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder?: string }) {
    const editorRef = useRef<any>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const initEditor = async () => {
            const EditorJS = (await import('@editorjs/editorjs')).default;
            // @ts-ignore
            const Header = (await import('@editorjs/header')).default;
            // @ts-ignore
            const List = (await import('@editorjs/list')).default;
            // @ts-ignore
            const Quote = (await import('@editorjs/quote')).default;
            // @ts-ignore
            const Delimiter = (await import('@editorjs/delimiter')).default;
            // @ts-ignore
            const Marker = (await import('@editorjs/marker')).default;
            // @ts-ignore
            const InlineCode = (await import('@editorjs/inline-code')).default;

            if (editorRef.current) return;

            const editor = new EditorJS({
                holder: 'editorjs-container',
                placeholder: placeholder || 'Start typing...',
                tools: {
                    header: Header,
                    list: List,
                    quote: Quote,
                    delimiter: Delimiter,
                    marker: Marker,
                    inlineCode: InlineCode,
                },
                data: value ? tryParseJSON(value) : undefined,
                onReady: () => {
                    editorRef.current = editor;
                },
                onChange: async () => {
                    const data = await editor.save();
                    onChange(JSON.stringify(data));
                },
                autofocus: true,
            });
        };

        initEditor();

        return () => {
            if (editorRef.current && editorRef.current.destroy) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, [isMounted]);

    const tryParseJSON = (jsonString: string) => {
        try {
            const o = JSON.parse(jsonString);
            if (o && typeof o === "object" && o.blocks) {
                return o;
            }
        } catch (e) { }
        return undefined;
    };

    if (!isMounted) {
        return <div className="form-input" style={{ minHeight: '150px' }}>Loading editor...</div>;
    }

    return (
        <div className="rich-editor-container" style={{
            border: '1px solid #d1d5db',
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: '#fff',
            padding: '12px'
        }}>
            <style jsx global>{`
                .codex-editor__redactor { padding-bottom: 20px !important; }
                .ce-block__content { max-width: 100% !important; margin: 0; }
                .ce-toolbar__content { max-width: 100% !important; margin: 0; }
                .cdx-block { max-width: 100% !important; }
                h1.ce-header { font-size: 2em; font-weight: bold; }
                h2.ce-header { font-size: 1.5em; font-weight: bold; }
                h3.ce-header { font-size: 1.17em; font-weight: bold; }
                .ce-header { padding: 0.5em 0; margin-bottom: 0.5em; }
            `}</style>
            <div id="editorjs-container" style={{ minHeight: '200px' }} />
        </div>
    );
}
