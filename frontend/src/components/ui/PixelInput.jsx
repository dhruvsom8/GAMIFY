/**
 * Retro pixel-styled input field.
 */
export default function PixelInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  className = '',
  as = 'input',
  rows = 3,
  options = [],
}) {
  const inputClass = `pixel-input ${className}`

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="font-pixel text-[9px] text-rpg-gray-light uppercase tracking-widest">
          {label} {required && <span className="text-rpg-red">*</span>}
        </label>
      )}
      {as === 'textarea' ? (
        <textarea
          className={inputClass}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          style={{ resize: 'none' }}
        />
      ) : as === 'select' ? (
        <select
          className={inputClass}
          value={value}
          onChange={onChange}
          style={{ cursor: 'pointer' }}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ background: '#0a0a0f' }}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          className={inputClass}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  )
}
