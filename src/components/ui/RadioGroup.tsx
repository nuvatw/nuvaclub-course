'use client'

interface RadioOption {
  value: string
  label: string
}

interface RadioGroupProps {
  name: string
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  label?: string
  error?: string
}

export function RadioGroup({ name, options, value, onChange, label, error }: RadioGroupProps) {
  return (
    <div>
      {label && (
        <p className="block text-sm font-medium text-foreground mb-2">{label}</p>
      )}
      <div className="flex gap-4">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center cursor-pointer"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="sr-only"
            />
            <span
              className={`w-5 h-5 rounded-full border-2 mr-2 flex items-center justify-center transition-colors ${
                value === option.value
                  ? 'border-primary bg-primary'
                  : 'border-border bg-card'
              }`}
            >
              {value === option.value && (
                <span className="w-2 h-2 rounded-full bg-white" />
              )}
            </span>
            <span className="text-foreground">{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
