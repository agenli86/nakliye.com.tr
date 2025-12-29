'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import { 
  FaBold, FaItalic, FaUnderline, FaStrikethrough,
  FaHeading, FaListUl, FaListOl, FaQuoteRight,
  FaLink, FaUnlink, FaImage, FaAlignLeft, FaAlignCenter, 
  FaAlignRight, FaAlignJustify, FaUndo, FaRedo,
  FaHighlighter, FaPalette, FaCode
} from 'react-icons/fa'
import { useState, useEffect, useCallback } from 'react'

const MenuButton = ({ onClick, isActive, disabled, children, title }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded hover:bg-gray-200 transition-colors ${
      isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {children}
  </button>
)

const MenuBar = ({ editor }) => {
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  if (!editor) return null

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl, target: '_blank' }).run()
    }
    setLinkUrl('')
    setShowLinkModal(false)
  }

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
    }
    setImageUrl('')
    setShowImageModal(false)
  }

  const colors = [
    '#000000', '#374151', '#6b7280', '#dc2626', '#ea580c', 
    '#d97706', '#16a34a', '#0891b2', '#2563eb', '#7c3aed', '#db2777'
  ]

  return (
    <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1 bg-gray-50 rounded-t-lg">
      {/* Geri/İleri */}
      <MenuButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Geri Al">
        <FaUndo size={14} />
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="İleri Al">
        <FaRedo size={14} />
      </MenuButton>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

      {/* Başlıklar */}
      <select
        onChange={(e) => {
          const level = parseInt(e.target.value)
          if (level === 0) {
            editor.chain().focus().setParagraph().run()
          } else {
            editor.chain().focus().toggleHeading({ level }).run()
          }
        }}
        className="px-2 py-1 border rounded text-sm bg-white"
        value={
          editor.isActive('heading', { level: 1 }) ? 1 :
          editor.isActive('heading', { level: 2 }) ? 2 :
          editor.isActive('heading', { level: 3 }) ? 3 :
          editor.isActive('heading', { level: 4 }) ? 4 : 0
        }
      >
        <option value={0}>Normal</option>
        <option value={1}>Başlık 1</option>
        <option value={2}>Başlık 2</option>
        <option value={3}>Başlık 3</option>
        <option value={4}>Başlık 4</option>
      </select>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

      {/* Metin Stilleri */}
      <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Kalın">
        <FaBold size={14} />
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="İtalik">
        <FaItalic size={14} />
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Altı Çizili">
        <FaUnderline size={14} />
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Üstü Çizili">
        <FaStrikethrough size={14} />
      </MenuButton>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

      {/* Renk */}
      <div className="relative">
        <MenuButton onClick={() => setShowColorPicker(!showColorPicker)} title="Metin Rengi">
          <FaPalette size={14} />
        </MenuButton>
        {showColorPicker && (
          <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded-lg shadow-lg z-50 flex flex-wrap gap-1 w-32">
            {colors.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  editor.chain().focus().setColor(color).run()
                  setShowColorPicker(false)
                }}
                className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
      </div>

      <MenuButton onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()} isActive={editor.isActive('highlight')} title="Vurgula">
        <FaHighlighter size={14} />
      </MenuButton>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

      {/* Hizalama */}
      <MenuButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Sola Hizala">
        <FaAlignLeft size={14} />
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Ortala">
        <FaAlignCenter size={14} />
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Sağa Hizala">
        <FaAlignRight size={14} />
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="İki Yana Yasla">
        <FaAlignJustify size={14} />
      </MenuButton>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

      {/* Listeler */}
      <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Madde İşaretli Liste">
        <FaListUl size={14} />
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numaralı Liste">
        <FaListOl size={14} />
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Alıntı">
        <FaQuoteRight size={14} />
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Kod Bloğu">
        <FaCode size={14} />
      </MenuButton>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

      {/* Link */}
      <MenuButton onClick={() => setShowLinkModal(true)} isActive={editor.isActive('link')} title="Link Ekle">
        <FaLink size={14} />
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive('link')} title="Link Kaldır">
        <FaUnlink size={14} />
      </MenuButton>

      {/* Resim */}
      <MenuButton onClick={() => setShowImageModal(true)} title="Resim Ekle">
        <FaImage size={14} />
      </MenuButton>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-96">
            <h3 className="font-bold mb-3">Link Ekle</h3>
            <input
              type="url"
              placeholder="https://ornek.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-3"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowLinkModal(false)} className="px-4 py-2 text-gray-600">İptal</button>
              <button type="button" onClick={addLink} className="px-4 py-2 bg-blue-600 text-white rounded">Ekle</button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-96">
            <h3 className="font-bold mb-3">Resim Ekle</h3>
            <input
              type="url"
              placeholder="https://ornek.com/resim.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-3"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowImageModal(false)} className="px-4 py-2 text-gray-600">İptal</button>
              <button type="button" onClick={addImage} className="px-4 py-2 bg-blue-600 text-white rounded">Ekle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function RichTextEditor({ value, onChange, placeholder = 'İçerik yazın...' }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' }
      }),
      Image.configure({
        HTMLAttributes: { class: 'max-w-full h-auto rounded-lg my-4' }
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true })
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose max-w-none focus:outline-none min-h-[200px] p-4'
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    }
  })

  // Dışarıdan gelen değer değişince editörü güncelle
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '')
    }
  }, [value, editor])

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      <style jsx global>{`
        .ProseMirror {
          min-height: 200px;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: '${placeholder}';
          color: #9ca3af;
          float: left;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror h1 { font-size: 2em; font-weight: bold; margin: 0.5em 0; }
        .ProseMirror h2 { font-size: 1.5em; font-weight: bold; margin: 0.5em 0; }
        .ProseMirror h3 { font-size: 1.25em; font-weight: bold; margin: 0.5em 0; }
        .ProseMirror h4 { font-size: 1.1em; font-weight: bold; margin: 0.5em 0; }
        .ProseMirror ul { list-style: disc; padding-left: 1.5em; }
        .ProseMirror ol { list-style: decimal; padding-left: 1.5em; }
        .ProseMirror blockquote { border-left: 3px solid #d1d5db; padding-left: 1em; margin: 1em 0; color: #6b7280; }
        .ProseMirror pre { background: #1f2937; color: #e5e7eb; padding: 1em; border-radius: 0.5em; overflow-x: auto; }
        .ProseMirror code { background: #f3f4f6; padding: 0.2em 0.4em; border-radius: 0.25em; font-size: 0.9em; }
        .ProseMirror a { color: #2563eb; text-decoration: underline; }
        .ProseMirror img { max-width: 100%; height: auto; border-radius: 0.5em; margin: 1em 0; }
        .ProseMirror mark { background-color: #fef08a; padding: 0.1em 0.2em; }
      `}</style>
    </div>
  )
}
