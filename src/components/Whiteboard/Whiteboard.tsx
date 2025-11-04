import { useRef, useEffect, useState } from 'react'
import { Pencil, Eraser, Trash2, Undo, Download } from 'lucide-react'

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

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gridCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser'>('pen')
  const [currentColor, setCurrentColor] = useState('#000000')
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [history, setHistory] = useState<DrawingAction[]>([])
  const [currentAction, setCurrentAction] = useState<Point[]>([])

  // Initialize canvases
  useEffect(() => {
    const canvas = canvasRef.current
    const gridCanvas = gridCanvasRef.current
    if (!canvas || !gridCanvas) return

    const ctx = canvas.getContext('2d')
    const gridCtx = gridCanvas.getContext('2d')
    if (!ctx || !gridCtx) return

    // Set canvas sizes
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      
      // Set both canvases to same size
      canvas.width = rect.width
      canvas.height = rect.height
      gridCanvas.width = rect.width
      gridCanvas.height = rect.height
      
      // Fill grid canvas with white background
      gridCtx.fillStyle = '#ffffff'
      gridCtx.fillRect(0, 0, gridCanvas.width, gridCanvas.height)
      
      // Draw grid on background canvas (once, never redrawn)
      drawGrid(gridCtx, gridCanvas.width, gridCanvas.height)
      
      // Drawing canvas should have transparent background (no fill)
      // Clear the drawing canvas to make it transparent
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Redraw drawing history
      redrawCanvas()
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  // Draw grid on canvas
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 25 // Grid spacing in pixels
    
    ctx.strokeStyle = '#e5e7eb' // Very light gray (Tailwind gray-200)
    ctx.lineWidth = 0.5
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
  }

  // Redraw canvas from history
  const redrawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear drawing canvas (transparent background)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Redraw all actions (grid is on separate background canvas)
    history.forEach(action => {
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
      action.points.forEach((point, index) => {
        if (index === 0) {
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

  useEffect(() => {
    redrawCanvas()
  }, [history])

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
    setHistory([])
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear drawing canvas (transparent background, grid is on separate background canvas)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = 'whiteboard.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="flex h-full flex-col bg-gray-50">
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
      <div className="border-b border-gray-200 bg-white px-4 py-3">
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

          {/* Color Picker - Always visible */}
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
                e.target.blur() // Remove focus after selection
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
          </div>
        </div>
      </div>

      {/* Canvas - Two layers: background grid + foreground drawings */}
      <div className="relative flex-1 overflow-hidden">
        {/* Background Grid Canvas */}
        <canvas
          ref={gridCanvasRef}
          className="absolute inset-0 h-full w-full pointer-events-none"
        />
        {/* Foreground Drawing Canvas */}
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
          style={{ touchAction: 'none' }}
        />
      </div>
    </div>
  )
}

