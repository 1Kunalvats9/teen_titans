import * as React from "react"
import { cn } from "@/lib/utils"

interface FileInputProps extends Omit<React.ComponentProps<"input">, "type"> {
  label?: string
  description?: string
  accept?: string
  onFileSelect?: (file: File | null) => void
}

function FileInput({ 
  className, 
  label, 
  description, 
  accept = "image/*", 
  onFileSelect,
  ...props 
}: FileInputProps) {
  const [dragActive, setDragActive] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleDrag = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
      onFileSelect?.(file)
    }
  }, [onFileSelect])

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
    onFileSelect?.(file)
  }, [onFileSelect])

  const handleClick = React.useCallback(() => {
    inputRef.current?.click()
  }, [])

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      {description && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
          "hover:border-primary/50 hover:bg-primary/5",
          dragActive ? "border-primary bg-primary/10" : "border-border",
          selectedFile ? "border-primary/30 bg-primary/5" : "",
          className
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          {...props}
        />
        
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          {selectedFile ? (
            <>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-sm font-medium text-foreground">
                {selectedFile.name}
              </div>
              <div className="text-xs text-muted-foreground">
                Click to change file
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="text-sm font-medium text-foreground">
                Drop file here or click to browse
              </div>
              <div className="text-xs text-muted-foreground">
                {accept === "image/*" ? "PNG, JPG, GIF up to 10MB" : "File upload"}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export { FileInput }
