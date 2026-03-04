import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
// YouTube extension temporarily disabled due to module resolution issues
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Underline as UnderlineIcon,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Upload,
  Video,
  Loader2,
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder = '내용을 입력하세요...' }: RichTextEditorProps) {
  const uploadImageMutation = trpc.images.upload.useMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-primary underline',
          },
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4 cursor-grab active:cursor-grabbing',
        },
        allowBase64: true,
      }),
      // YouTube extension disabled
      Placeholder.configure({
        placeholder,
      }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4',
      },
      // Preserve HTML attributes when pasting
      transformPastedHTML(html) {
        return html;
      },
      // Handle image paste from clipboard
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          
          // Handle image paste
          if (item.type.indexOf('image') === 0) {
            const file = item.getAsFile();
            if (file) {
              handleImageFile(file);
              return true;
            }
          }
        }
        return false;
      },
    },
  });

  const handleImageFile = useCallback(async (file: File) => {
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string)?.split(',')[1];
        if (!base64 || !editor) return;

        uploadImageMutation.mutate(
          {
            fileName: file.name,
            fileData: base64,
            mimeType: file.type,
          },
          {
            onSuccess: (result) => {
              editor.chain().focus().setImage({ src: result.fileUrl }).run();
              setIsUploading(false);
            },
            onError: () => {
              alert('이미지 업로드 실패');
              setIsUploading(false);
            },
          }
        );
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Image upload error:', error);
      setIsUploading(false);
    }
  }, [editor, uploadImageMutation]);

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const toggleBold = () => {
    editor?.chain().focus().toggleBold().run();
  };

  const toggleItalic = () => {
    editor?.chain().focus().toggleItalic().run();
  };

  const toggleUnderline = () => {
    editor?.chain().focus().toggleUnderline().run();
  };

  const toggleStrike = () => {
    editor?.chain().focus().toggleStrike().run();
  };

  const toggleBulletList = () => {
    editor?.chain().focus().toggleBulletList().run();
  };

  const toggleOrderedList = () => {
    editor?.chain().focus().toggleOrderedList().run();
  };

  const toggleBlockquote = () => {
    editor?.chain().focus().toggleBlockquote().run();
  };

  const toggleCodeBlock = () => {
    editor?.chain().focus().toggleCodeBlock().run();
  };

  const setHeading = (level: 1 | 2 | 3) => {
    editor?.chain().focus().toggleHeading({ level }).run();
  };

  const insertLink = () => {
    const url = window.prompt('링크 주소를 입력하세요:');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  const insertYoutubeVideo = () => {
    alert('YouTube 기능은 현재 준비 중입니다.');
  };

  const setColor = () => {
    const color = window.prompt('색상 코드를 입력하세요 (예: #ff0000):');
    if (color) {
      editor?.chain().focus().setColor(color).run();
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Toolbar */}
      <div className="bg-muted p-3 border-b border-border flex flex-wrap gap-1">
        <Button
          size="sm"
          variant={editor?.isActive('bold') ? 'default' : 'outline'}
          onClick={toggleBold}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant={editor?.isActive('italic') ? 'default' : 'outline'}
          onClick={toggleItalic}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant={editor?.isActive('underline') ? 'default' : 'outline'}
          onClick={toggleUnderline}
          className="h-8 w-8 p-0"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant={editor?.isActive('strike') ? 'default' : 'outline'}
          onClick={toggleStrike}
          className="h-8 w-8 p-0"
        >
          <span className="text-sm font-bold">S</span>
        </Button>

        <div className="w-px bg-border mx-1" />

        <Button
          size="sm"
          variant={editor?.isActive('heading', { level: 1 }) ? 'default' : 'outline'}
          onClick={() => setHeading(1)}
          className="h-8 w-8 p-0"
        >
          <Heading1 className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant={editor?.isActive('heading', { level: 2 }) ? 'default' : 'outline'}
          onClick={() => setHeading(2)}
          className="h-8 w-8 p-0"
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant={editor?.isActive('heading', { level: 3 }) ? 'default' : 'outline'}
          onClick={() => setHeading(3)}
          className="h-8 w-8 p-0"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px bg-border mx-1" />

        <Button
          size="sm"
          variant={editor?.isActive('bulletList') ? 'default' : 'outline'}
          onClick={toggleBulletList}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant={editor?.isActive('orderedList') ? 'default' : 'outline'}
          onClick={toggleOrderedList}
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant={editor?.isActive('blockquote') ? 'default' : 'outline'}
          onClick={toggleBlockquote}
          className="h-8 w-8 p-0"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant={editor?.isActive('codeBlock') ? 'default' : 'outline'}
          onClick={toggleCodeBlock}
          className="h-8 w-8 p-0"
        >
          <span className="text-sm font-bold">{'</>'}</span>
        </Button>

        <div className="w-px bg-border mx-1" />

        <Button
          size="sm"
          variant={editor?.isActive('link') ? 'default' : 'outline'}
          onClick={insertLink}
          className="h-8 w-8 p-0"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleImageUpload}
          disabled={isUploading}
          className="h-8 w-8 p-0"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={insertYoutubeVideo}
          className="h-8 w-8 p-0"
        >
          <Video className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={setColor}
          className="h-8 w-8 p-0"
        >
          <Palette className="h-4 w-4" />
        </Button>

        <div className="w-px bg-border mx-1" />

        <Button
          size="sm"
          variant="outline"
          onClick={() => editor?.chain().focus().setTextAlign('left').run()}
          className="h-8 w-8 p-0"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => editor?.chain().focus().setTextAlign('center').run()}
          className="h-8 w-8 p-0"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => editor?.chain().focus().setTextAlign('right').run()}
          className="h-8 w-8 p-0"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
          className="h-8 w-8 p-0"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>

        <div className="w-px bg-border mx-1" />

        <Button
          size="sm"
          variant="outline"
          onClick={() => editor?.chain().focus().undo().run()}
          className="h-8 w-8 p-0"
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => editor?.chain().focus().redo().run()}
          className="h-8 w-8 p-0"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
