import React from "react";
import "./Table.css";

function buildPageList(current, total, delta = 2) {
  if (total <= 0) return [];
  if (total === 1) return [1];
  const range = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);
  range.push(1);
  if (left > 2) range.push("...");
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push("...");
  if (total > 1) range.push(total);
  return range;
}

const Table = ({
  columns,
  data = [],
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}) => {
  const pages = buildPageList(currentPage, totalPages);

  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.accessor}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ textAlign: "center", padding: "40px 0" }}
              >
                <div className="table-spinner"></div>
              </td>
            </tr>
          ) : data.length > 0 ? (
            data.map((row, index) => (
              <tr
                key={row.id ?? index}
                onClick={row._rowonClick || undefined}
                style={row._rowonClick ? { cursor: "pointer" } : undefined}
                className={row._rowonClick ? "clickable-row" : ""}
              >
                {columns.map((col) => (
                  <td key={col.accessor}>{row[col.accessor]}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "#888",
                  fontSize: "15px",
                }}
              >
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages >= 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => onPageChange?.(currentPage - 1)}
          >
            ← Prev
          </button>

          {pages.map((page, i) =>
            page === "..." ? (
              <span
                key={`ellipsis-${i}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px 4px",
                  fontSize: "14px",
                  color: "#888",
                  letterSpacing: "2px",
                }}
              >
                ...
              </span>
            ) : (
              <button
                key={`page-${page}`}
                className={`page-number ${currentPage === page ? "active" : ""}`}
                onClick={() => onPageChange?.(page)}
              >
                {page}
              </button>
            )
          )}

          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange?.(currentPage + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Table;