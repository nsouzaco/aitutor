import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Image as ImageIcon } from 'lucide-react'

interface ImageDropzoneProps {
  onImageUpload: (file: File) => void
  disabled?: boolean
}

export default function ImageDropzone({
  onImageUpload,
  disabled = false,
}: ImageDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onImageUpload(acceptedFiles[0])
      }
    },
    [onImageUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 1,
    disabled,
  })

  return (
    <div
      {...getRootProps()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
        isDragActive
          ? 'border-primary bg-primary/5'
          : 'border-gray-300 hover:border-primary hover:bg-gray-50'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="mb-4">
        {isDragActive ? (
          <Upload size={48} className="text-primary" />
        ) : (
          <ImageIcon size={48} className="text-gray-400" />
        )}
      </div>
      <p className="text-center text-base font-medium text-gray-700">
        {isDragActive
          ? 'Drop your image here'
          : 'Drag and drop an image, or click to select'}
      </p>
      <p className="mt-2 text-center text-sm text-gray-500">
        PNG, JPG, GIF, or WebP (max 10MB)
      </p>
    </div>
  )
}

