import React, { useMemo, useState } from 'react';
import Button from './Button';

const compareValues = (a, b) => {
  if (a === b) return 0;
  if (a === undefined || a === null) return 1;
  if (b === undefined || b === null) return -1;
  const numA = Number(a);
  const numB = Number(b);
  const bothNumbers = !Number.isNaN(numA) && !Number.isNaN(numB);
  if (bothNumbers) return numA - numB;
  return String(a).localeCompare(String(b));
};

export default function Table({ columns, data, actions, pageSize = 10, enableSort = true, externalPagination }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [page, setPage] = useState(1);

  const usingExternal = Boolean(externalPagination);

  const sortedData = useMemo(() => {
    const items = [...(data || [])];
    if (!usingExternal && enableSort && sortConfig.key) {
      items.sort((a, b) => {
        const result = compareValues(a[sortConfig.key], b[sortConfig.key]);
        return sortConfig.direction === 'asc' ? result : -result;
      });
    }
    return items;
  }, [data, sortConfig, enableSort, usingExternal]);

  const totalPages = usingExternal
    ? externalPagination.totalPages || 1
    : Math.max(1, Math.ceil(sortedData.length / pageSize));
  const currentPage = usingExternal
    ? externalPagination.page || 1
    : Math.min(page, totalPages);
  const paginated = useMemo(() => {
    if (usingExternal) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, usingExternal]);

  const requestSort = (accessor) => {
    if (!enableSort || usingExternal) return;
    setPage(1);
    setSortConfig((prev) => {
      if (prev.key === accessor) {
        const nextDir = prev.direction === 'asc' ? 'desc' : 'asc';
        return { key: accessor, direction: nextDir };
      }
      return { key: accessor, direction: 'asc' };
    });
  };

  return (
    <div className="card">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => {
              const isSortable = enableSort && col.sortable !== false;
              const isActive = sortConfig.key === col.accessor;
              const arrow = !isActive ? '' : sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
              return (
                <th
                  key={col.accessor}
                  onClick={isSortable ? () => requestSort(col.accessor) : undefined}
                  style={isSortable ? { cursor: 'pointer' } : undefined}
                >
                  {col.label}{isSortable && <span>{arrow}</span>}
                </th>
              );
            })}
            {actions && <th>Hành động</th>}
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 && (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} style={{ textAlign: 'center' }}>
                Không có dữ liệu
              </td>
            </tr>
          )}
          {paginated.map((row) => (
            <tr key={row.id || row._id}>
              {columns.map((col) => (
                <td key={col.accessor}>
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
              {actions && (
                <td className="action-cell">
                  {actions.map((action) => (
                    <Button
                      key={action.label}
                      variant={action.variant || 'primary'}
                      onClick={() => action.onClick(row)}
                    >
                      {action.label}
                    </Button>
                  ))}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="table-pagination">
          <Button
            variant="ghost"
            onClick={() => {
              if (usingExternal && externalPagination.onPrev) {
                externalPagination.onPrev();
              } else {
                setPage((p) => Math.max(1, p - 1));
              }
            }}
            disabled={currentPage === 1}
          >
            Trang trước
          </Button>
          <span className="pagination-info">Trang {currentPage} / {totalPages}</span>
          <Button
            variant="ghost"
            onClick={() => {
              if (usingExternal && externalPagination.onNext) {
                externalPagination.onNext();
              } else {
                setPage((p) => Math.min(totalPages, p + 1));
              }
            }}
            disabled={currentPage === totalPages}
          >
            Trang sau
          </Button>
        </div>
      )}
    </div>
  );
}
