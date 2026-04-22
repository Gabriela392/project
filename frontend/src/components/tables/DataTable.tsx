'use client';
import { useState } from 'react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  searchValue?: string;
  onSearch?: (v: string) => void;
  searchPlaceholder?: string;
  actions?: (row: T) => React.ReactNode;
  filters?: React.ReactNode;
}

export default function DataTable<T extends { id: string }>({
  columns, data, total, page, limit, onPageChange,
  loading, searchValue, onSearch, searchPlaceholder = 'Pesquisar...',
  actions, filters,
}: DataTableProps<T>) {
  const lastPage = Math.ceil(total / limit);

  return (
    <div>
      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {onSearch && (
          <input
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            style={{
              padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4,
              fontSize: 14, minWidth: 240, flex: '1 1 240px',
            }}
          />
        )}
        {filters}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              {columns.map((col) => (
                <th key={String(col.key)} style={{
                  padding: '12px 16px', textAlign: 'left',
                  fontWeight: 600, color: '#495057', whiteSpace: 'nowrap',
                }}>
                  {col.label}
                </th>
              ))}
              {actions && <th style={{ padding: '12px 16px', textAlign: 'right' }}>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)}
                  style={{ textAlign: 'center', padding: 40, color: '#6c757d' }}>
                  Carregando...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)}
                  style={{ textAlign: 'center', padding: 40, color: '#6c757d' }}>
                  Nenhum registro encontrado
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={row.id} style={{
                  borderBottom: '1px solid #dee2e6',
                  background: i % 2 === 0 ? '#fff' : '#fafafa',
                }}>
                  {columns.map((col) => (
                    <td key={String(col.key)} style={{ padding: '11px 16px', color: '#212529' }}>
                      {col.render
                        ? col.render(row)
                        : String((row as any)[col.key] ?? '')}
                    </td>
                  ))}
                  {actions && (
                    <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 16, fontSize: 14, color: '#6c757d', flexWrap: 'wrap', gap: 8,
      }}>
        <span>Total: {total} registro(s)</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button onClick={() => onPageChange(1)} disabled={page === 1} style={btnStyle(page === 1)}>«</button>
          <button onClick={() => onPageChange(page - 1)} disabled={page === 1} style={btnStyle(page === 1)}>‹</button>
          <span style={{ padding: '0 8px', fontWeight: 500 }}>{page} / {lastPage || 1}</span>
          <button onClick={() => onPageChange(page + 1)} disabled={page >= lastPage} style={btnStyle(page >= lastPage)}>›</button>
          <button onClick={() => onPageChange(lastPage)} disabled={page >= lastPage} style={btnStyle(page >= lastPage)}>»</button>
        </div>
      </div>
    </div>
  );
}

const btnStyle = (disabled: boolean) => ({
  padding: '5px 10px', border: '1px solid #dee2e6', borderRadius: 4,
  background: disabled ? '#f8f9fa' : '#fff', color: disabled ? '#adb5bd' : '#212529',
  cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 14,
});
