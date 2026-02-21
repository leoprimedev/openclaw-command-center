/** ListCard — list with optional title. Agent-pushed. */

interface ListItem {
  text: string;
  icon?: string;
  color?: string;
}

interface ListCardProps {
  title?: string;
  items: ListItem[];
  ordered?: boolean;
}

export function ListCard({ title, items, ordered = false }: ListCardProps): React.JSX.Element {
  const Tag = ordered ? 'ol' : 'ul';

  return (
    <div className="canvas-list-card">
      {title && <div className="canvas-section-label">{title}</div>}
      <Tag className={`canvas-list canvas-list--${ordered ? 'ordered' : 'unordered'}`}>
        {items.map((item, i) => (
          <li key={i} className="canvas-list-item" style={{ color: item.color }}>
            {item.icon && <span className="canvas-list-item-icon">{item.icon}</span>}
            <span>{item.text}</span>
          </li>
        ))}
      </Tag>
    </div>
  );
}
