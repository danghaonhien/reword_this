import React from 'react'

interface RewriteInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  className?: string
}

const RewriteInput: React.FC<RewriteInputProps> = ({ value, onChange, className = '' }) => {
  return (
    <div className="mb-4">
      <label 
        htmlFor="text-input" 
        className="block text-sm font-medium mb-1 flex items-center gap-1"
      >
        <span className="w-2 h-2 rounded-full bg-accent"></span>
        Text to Rewrite
      </label>
      <textarea
        id="text-input"
        value={value}
        onChange={onChange}
        placeholder="Paste or type the text you want to rewrite..."
        className={`w-full p-3 border border-input rounded-md bg-card text-card-foreground
                  focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                  placeholder:text-muted-foreground/60 transition-colors ${className}`}
      />
    </div>
  )
}

export default RewriteInput 