/** TextBlock — text display (body/code/quote). Agent-pushed. */

interface TextBlockProps {
  text: string;
  heading?: string;
  variant?: 'body' | 'code' | 'quote';
}

export function TextBlock({ text, heading, variant = 'body' }: TextBlockProps): React.JSX.Element {
  return (
    <div className={`canvas-text-block canvas-text-block--${variant}`}>
      {heading && <div className="canvas-text-block-heading">{heading}</div>}
      {variant === 'code' ? (
        <pre className="canvas-text-block-code"><code>{text}</code></pre>
      ) : variant === 'quote' ? (
        <blockquote className="canvas-text-block-quote">{text}</blockquote>
      ) : (
        <p className="canvas-text-block-body">{text}</p>
      )}
    </div>
  );
}
