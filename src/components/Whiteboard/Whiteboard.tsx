import { useRef, useEffect, useState } from 'react'
import { Pencil, Eraser, Trash2, Undo, Download, Send } from 'lucide-react'

interface Point {
  x: number
  y: number
}

interface DrawingAction {
  tool: 'pen' | 'eraser'
  points: Point[]
  color: string
  width: number
}

interface WhiteboardProps {
  onEvaluate?: (imageDataUrl: string) => void
}

export default function Whiteboard({ onEvaluate }: WhiteboardProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser'>('pen')
  const [currentColor, setCurrentColor] = useState('#000000')
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [history, setHistory] = useState<DrawingAction[]>([])
  const [currentAction, setCurrentAction] = useState<Point[]>([])
  const [canvasReady, setCanvasReady] = useState(false)

  // Initialize canvas on mount
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    
    if (!canvas || !container) {
      console.error('❌ [Whiteboard] Canvas or container ref is null!')
      return
    }

    const initializeCanvas = () => {
      const rect = container.getBoundingClientRect()

      if (rect.width === 0 || rect.height === 0) {
        console.warn('⚠️ [Whiteboard] Container has zero dimensions, retrying in 100ms...')
        setTimeout(initializeCanvas, 100)
        return
      }

      const width = Math.floor(rect.width)
      const height = Math.floor(rect.height)
      
      canvas.width = width
      canvas.height = height
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        console.error('❌ [Whiteboard] Failed to get 2D context!')
        return
      }

      // Fill with white background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)

      // Draw grid
      drawGrid(ctx, width, height)

      setCanvasReady(true)
    }

    // Use requestAnimationFrame to ensure DOM is ready
    const rafId = requestAnimationFrame(initializeCanvas)

    // Handle window resize
    const handleResize = () => {
      initializeCanvas()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Draw grid on canvas
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 25 // Grid spacing in pixels
    
    ctx.save()
    ctx.strokeStyle = '#e5e7eb' // Light gray
    ctx.lineWidth = 1
    ctx.globalCompositeOperation = 'source-over'

    // Draw vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Draw horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    
    ctx.restore()
  }

  // Redraw canvas from history
  const redrawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear and fill with white
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid first (behind everything)
    drawGrid(ctx, canvas.width, canvas.height)

    // Redraw all actions
    history.forEach((action) => {
      ctx.strokeStyle = action.color
      ctx.lineWidth = action.width
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      if (action.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out'
      } else {
        ctx.globalCompositeOperation = 'source-over'
      }

      ctx.beginPath()
      action.points.forEach((point, idx) => {
        if (idx === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          ctx.lineTo(point.x, point.y)
        }
      })
      ctx.stroke()
    })

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over'
  }

  // Redraw when history changes
  useEffect(() => {
    if (canvasReady) {
      redrawCanvas()
    }
  }, [history, canvasReady])

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    
    if ('touches' in e) {
      // Touch event
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      }
    } else {
      // Mouse event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setIsDrawing(true)
    const point = getCoordinates(e)
    setCurrentAction([point])

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.strokeStyle = currentColor
    ctx.lineWidth = strokeWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = strokeWidth * 3 // Eraser is wider
    } else {
      ctx.globalCompositeOperation = 'source-over'
    }

    ctx.beginPath()
    ctx.moveTo(point.x, point.y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const point = getCoordinates(e)
    setCurrentAction(prev => [...prev, point])

    ctx.lineTo(point.x, point.y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    
    setIsDrawing(false)
    
    if (currentAction.length > 0) {
      const action: DrawingAction = {
        tool: currentTool,
        points: currentAction,
        color: currentColor,
        width: currentTool === 'eraser' ? strokeWidth * 3 : strokeWidth
      }
      setHistory(prev => [...prev, action])
      setCurrentAction([])
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.globalCompositeOperation = 'source-over'
  }

  const handleUndo = () => {
    setHistory(prev => prev.slice(0, -1))
  }

  const handleClear = () => {
    console.log('🗑️ [Whiteboard] Clearing canvas')
    setHistory([])
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Redraw grid after clearing
    drawGrid(ctx, canvas.width, canvas.height)
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = 'whiteboard.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  const handleEvaluate = () => {
    const canvas = canvasRef.current
    if (!canvas || !onEvaluate) return

    // Get canvas as data URL
    const imageDataUrl = canvas.toDataURL('image/png')
    console.log('📤 [Whiteboard] Sending canvas for evaluation')
    onEvaluate(imageDataUrl)
  }

  return (
    <div className="flex h-full w-full flex-col bg-gray-50" style={{ height: '100%' }}>
      <style>{`
        input[type='color']::-webkit-color-swatch-wrapper {
          padding: 2px;
          border-radius: 9999px;
        }
        input[type='color']::-webkit-color-swatch {
          border: none;
          border-radius: 9999px;
        }
        input[type='color'] {
          box-sizing: border-box;
        }
      `}</style>
      
      {/* Toolbar */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-4">
          {/* Drawing Tools */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setCurrentTool('pen')}
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors cursor-pointer border-2 shrink-0 ${
                currentTool === 'pen'
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-400'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent'
              }`}
              title="Pen"
            >
              <Pencil size={16} className="shrink-0" />
              <span className="inline">Pen</span>
            </button>
            <button
              onClick={() => setCurrentTool('eraser')}
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors cursor-pointer border-2 shrink-0 ${
                currentTool === 'eraser'
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-400'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent'
              }`}
              title="Eraser"
            >
              <Eraser size={16} className="shrink-0" />
              <span className="inline">Eraser</span>
            </button>
          </div>

          {/* Color Picker */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Color:
            </label>
            <input
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              className="h-10 w-10 cursor-pointer rounded-full border border-gray-300 p-1 transition-all hover:border-gray-400"
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
              }}
              title="Pick a color"
            />
          </div>

          {/* Stroke Width Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Size:
            </label>
            <select
              value={strokeWidth}
              onChange={(e) => {
                setStrokeWidth(Number(e.target.value))
                e.target.blur()
              }}
              className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:border-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="1">1px - Very Thin</option>
              <option value="2">2px - Thin</option>
              <option value="3">3px - Normal</option>
              <option value="4">4px - Medium</option>
              <option value="6">6px - Thick</option>
              <option value="8">8px - Very Thick</option>
              <option value="10">10px - Extra Thick</option>
            </select>
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo"
            >
              <Undo size={16} />
              <span className="hidden sm:inline">Undo</span>
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
              title="Clear"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Clear</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
              title="Download"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Save</span>
            </button>
            <button
              onClick={handleEvaluate}
              className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
              title="Get feedback on your work"
            >
              <Send size={16} />
              <span className="hidden sm:inline">Evaluate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="relative flex-1 bg-white"
        style={{ minHeight: 0, flex: 1 }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 h-full w-full cursor-crosshair touch-none"
          style={{ 
            touchAction: 'none',
            display: 'block'
          }}
        />
        {!canvasReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <p className="text-gray-500">Initializing canvas...</p>
          </div>
        )}
      </div>
    </div>
  )
}
