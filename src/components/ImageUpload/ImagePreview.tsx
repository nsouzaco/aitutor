import { X } from 'lucide-react'

interface ImagePreviewProps {
  imageUrl: string
  onRemove: () => void
}

export default function ImagePreview({ imageUrl, onRemove }: ImagePreviewProps) {
  return (
    <div className="relative inline-block">
      <img
        src={imageUrl}
        alt="Uploaded math problem"
        className="max-h-48 rounded-lg border-2 border-gray-200 object-contain shadow-sm"
      />
      <button
        onClick={onRemove}
        className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white shadow-md transition-colors hover:bg-red-600"
        aria-label="Remove image"
      >
        <X size={16} />
      </button>
    </div>
  )
}

