import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Code,
  Pilcrow,
  Check,
} from 'lucide-react';

export const RichTextEditor = ({ value, onChange, placeholder = 'Write detailed, substantive local content...' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#E85B12] underline hover:text-[#c4490b]',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-4 border border-neutral-200 shadow-sm',
        },
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'min-h-[220px] max-h-[420px] overflow-y-auto px-4 py-3 text-xs text-neutral-800 leading-relaxed focus:outline-none prose prose-sm max-w-none prose-headings:text-neutral-900 prose-headings:font-bold prose-h2:text-base prose-h3:text-sm prose-p:my-1.5',
      },
    },
  });

  // Sync content when incoming value changes from external reset (e.g. edit modal opening)
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(value || '', false);
    }
  }, [value, editor]);

  if (!editor) {
    return <div className="p-4 text-xs text-neutral-400">Initializing editor...</div>;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter target URL (e.g. /locations/delhi or https://...):', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  // Word count calculation
  const text = editor.getText();
  const words = text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const chars = text ? text.length : 0;

  return (
    <div className="border border-neutral-300 rounded-lg overflow-hidden bg-white shadow-2xs focus-within:border-brand-orange transition-colors">
      {/* Toolbar */}
      <div className="bg-neutral-50 border-b border-neutral-200 px-3 py-2 flex flex-wrap items-center justify-between gap-1 select-none">
        <div className="flex flex-wrap items-center gap-1">
          {/* Paragraph */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`p-1.5 rounded text-xs transition-colors ${
              editor.isActive('paragraph') ? 'bg-neutral-200 text-neutral-900 font-bold' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
            title="Normal Paragraph"
          >
            <Pilcrow className="w-3.5 h-3.5" />
          </button>

          {/* Heading 2 */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded text-xs transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'bg-neutral-200 text-neutral-900 font-bold' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>

          {/* Heading 3 */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded text-xs transition-colors ${
              editor.isActive('heading', { level: 3 }) ? 'bg-neutral-200 text-neutral-900 font-bold' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-neutral-300 mx-1" />

          {/* Bold */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded text-xs transition-colors ${
              editor.isActive('bold') ? 'bg-neutral-200 text-neutral-900 font-bold' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded text-xs transition-colors ${
              editor.isActive('italic') ? 'bg-neutral-200 text-neutral-900 font-bold' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-neutral-300 mx-1" />

          {/* Bullet List */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded text-xs transition-colors ${
              editor.isActive('bulletList') ? 'bg-neutral-200 text-neutral-900 font-bold' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>

          {/* Ordered List */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded text-xs transition-colors ${
              editor.isActive('orderedList') ? 'bg-neutral-200 text-neutral-900 font-bold' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-neutral-300 mx-1" />

          {/* Link */}
          <button
            type="button"
            onClick={setLink}
            className={`p-1.5 rounded text-xs transition-colors ${
              editor.isActive('link') ? 'bg-orange-100 text-brand-orange font-bold' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
            title="Insert Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>

          {/* Image */}
          <button
            type="button"
            onClick={addImage}
            className="p-1.5 rounded text-xs text-neutral-600 hover:bg-neutral-100 transition-colors"
            title="Insert Image URL"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-neutral-300 mx-1" />

          {/* Undo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded text-xs text-neutral-600 hover:bg-neutral-100 disabled:opacity-30"
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          {/* Redo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded text-xs text-neutral-600 hover:bg-neutral-100 disabled:opacity-30"
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Word Counter & Quality Feedback */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500">
          <span>
            <strong>{words}</strong> words
          </span>
          <span>•</span>
          <span>{chars} chars</span>
          {words < 50 ? (
            <span className="text-amber-600 font-semibold">(Thin content)</span>
          ) : (
            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
              <Check className="w-3 h-3" /> Good depth
            </span>
          )}
        </div>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
