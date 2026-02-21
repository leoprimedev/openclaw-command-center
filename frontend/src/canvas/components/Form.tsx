/** Form — agent-generated form. Agent-pushed. */

import { useState } from 'react';
import { sendCallback } from '../callback.js';

interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'textarea' | 'select';
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

interface FormProps {
  surfaceId: string;
  title?: string;
  fields: FormField[];
  submitLabel?: string;
  onSubmit?: string;
}

export function Form({ surfaceId, title, fields, submitLabel = 'Submit', onSubmit }: FormProps): React.JSX.Element {
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const set = (name: string, value: string): void => setValues((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setSubmitted(true);
    if (onSubmit) void sendCallback(surfaceId, onSubmit, values);
  };

  if (submitted) {
    return (
      <div className="canvas-form">
        <div style={{ textAlign: 'center', color: 'var(--apex-green)', fontFamily: 'var(--font-mono)', fontSize: '12px', padding: '12px' }}>
          ✓ Submitted
        </div>
      </div>
    );
  }

  return (
    <div className="canvas-form">
      {title && <div className="canvas-section-label">{title}</div>}
      <form onSubmit={handleSubmit}>
        {fields.map((f) => (
          <div key={f.name} className="canvas-form-field">
            <label className="canvas-form-label">{f.label}{f.required && ' *'}</label>
            {f.type === 'textarea' ? (
              <textarea
                className="canvas-form-input canvas-form-textarea"
                placeholder={f.placeholder}
                required={f.required}
                value={values[f.name] ?? ''}
                onChange={(e) => set(f.name, e.target.value)}
              />
            ) : f.type === 'select' && f.options ? (
              <select
                className="canvas-form-input canvas-form-select"
                required={f.required}
                value={values[f.name] ?? ''}
                onChange={(e) => set(f.name, e.target.value)}
              >
                <option value="">— select —</option>
                {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input
                className="canvas-form-input"
                type={f.type ?? 'text'}
                placeholder={f.placeholder}
                required={f.required}
                value={values[f.name] ?? ''}
                onChange={(e) => set(f.name, e.target.value)}
              />
            )}
          </div>
        ))}
        <button type="submit" className="canvas-form-submit">{submitLabel}</button>
      </form>
    </div>
  );
}
