import { useState, useRef, KeyboardEvent } from 'react'
import { Send, ImagePlus } from 'lucide-react'
import { ImagePreview } from '../ImageUpload'

interface InputAreaProps {
  onSend: (message: string, imageUrl?: string) => void
  disabled?: boolean
  placeholder?: string
}

export default function InputArea({
  onSend,
  disabled = false,
  placeholder = 'Type your math problem or question...',
}: InputAreaProps) {
  const [input, setInput] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    const trimmedInput = input.trim()
    if ((trimmedInput || selectedImage) && !disabled) {
      onSend(trimmedInput || 'Please help me with this problem:', selectedImage || undefined)
      setInput('')
      setSelectedImage(null)
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image must be less than 10MB')
        return
      }

      // Convert to base64 and preview
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setSelectedImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    // Auto-expand textarea
    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  return (
    <div className="sticky bottom-0 border-t border-gray-200 bg-white shadow-lg">
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
        {/* Image Preview */}
        {selectedImage && (
          <div className="mb-3">
            <ImagePreview imageUrl={selectedImage} onRemove={handleRemoveImage} />
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Image Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            aria-label="Upload image file"
          />
          <button
            onClick={handleImageClick}
            disabled={disabled || !!selectedImage}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Upload image"
            title="Upload a photo of your math problem"
          >
            <ImagePlus size={20} />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-base text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-50 disabled:cursor-not-allowed"
            style={{ maxHeight: '200px' }}
            aria-label="Message input"
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={disabled || (!input.trim() && !selectedImage)}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-white transition-all hover:bg-primary-dark hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none active:scale-95"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>

        {/* Hint text */}
        <p className="mt-2 text-xs text-gray-500">
          Press <kbd className="rounded bg-gray-100 px-1.5 py-0.5">Enter</kbd> to send,{' '}
          <kbd className="rounded bg-gray-100 px-1.5 py-0.5">Shift + Enter</kbd> for new line
          {!selectedImage && ' • Click 📷 to upload an image'}
        </p>
      </div>
    </div>
  )
}

