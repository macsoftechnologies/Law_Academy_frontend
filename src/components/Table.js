import React from "react";
import "./Table.css";

const Table = ({ columns, data, currentPage, totalPages, onPageChange }) => {
  return (
    <div className="table-container">

      {/* Show how many records */}
      <div className="table-info" style={{ marginBottom: "8px" }}>
        Showing{" "}
        <span style={{ color: "rgb(237, 22, 22)", fontWeight: "bold" }}>
          {data.length}
        </span>{" "}
        record{data.length !== 1 ? "s" : ""}
      </div>


      {/* Table */}
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.accessor}>{col.header}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length > 0 ? (
            data.map((row, index) => (
              <tr key={index}>
                {columns.map((col) => (
                  <td key={col.accessor}>{row[col.accessor]}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center" }}>
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button
          className="page-btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          ← Prev
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={`page-number ${currentPage === i + 1 ? "active" : ""}`}
            onClick={() => onPageChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button
          className="page-btn"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default Table;
