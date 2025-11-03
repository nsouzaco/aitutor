import { useState, useRef, KeyboardEvent } from 'react'
import { Send, ImagePlus, Mic } from 'lucide-react'
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
  const [isListening, setIsListening] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

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

  const handleMicClick = () => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please try Chrome or Edge.')
      return
    }

    if (isListening) {
      // Stop listening
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    // Start listening
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput((prev) => prev + (prev ? ' ' : '') + transcript)
      
      // Auto-expand textarea after adding voice input
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      if (event.error === 'no-speech') {
        alert('No speech detected. Please try again.')
      } else if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone access in your browser settings.')
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
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

          {/* Textarea - wider to fill space */}
          <div className="flex flex-1 items-end gap-2">
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

            {/* Mic Button */}
            <button
              onClick={handleMicClick}
              disabled={disabled}
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isListening
                  ? 'border-red-500 bg-red-500 text-white animate-pulse'
                  : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
              }`}
              aria-label="Voice input"
              title={isListening ? 'Listening... Click to stop' : 'Click to speak'}
            >
              <Mic size={20} />
            </button>

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
        </div>
      </div>
    </div>
  )
}

