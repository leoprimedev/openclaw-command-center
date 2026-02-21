/** DataTable — table with column headers and rows. Agent-pushed. */

interface DataTableProps {
  title?: string;
  columns: string[];
  rows: (string | number)[][];
}

export function DataTable({ title, columns, rows }: DataTableProps): React.JSX.Element {
  return (
    <div className="canvas-data-table">
      {title && <div className="canvas-section-label">{title}</div>}
      <div className="canvas-data-table-wrap">
        <table className="canvas-data-table-el">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="canvas-data-table-th">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="canvas-data-table-tr">
                {row.map((cell, ci) => (
                  <td key={ci} className="canvas-data-table-td">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
