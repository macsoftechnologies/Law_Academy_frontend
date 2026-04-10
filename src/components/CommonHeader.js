import React from "react";
import "./CommonHeader.css";

import Button from "./Button";

const CommonHeader = ({
  title,
  count,
  totalPages,
  pageLimit,
  setPageLimit,
  setCurrentPage,
  onChange,
  buttonText,
  onButtonClick,
  buttonColor = "orange",
  buttonClass = "",    
  infoText,  
}) => {
  return (
    <div
      style={{
        background: "rgb(255 247 224)",
        padding: "15px",
        borderRadius: "12px",
        boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
        marginBottom: "15px",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 style={{ margin: 0, color: "#2b377b", fontWeight: "600" }}>
          {title}
        </h2>

        {buttonText && (
          <Button
            text={buttonText}
            color={buttonColor}
            className={buttonClass}
            onClick={onButtonClick}
          />
        )}
      </div>

      <div
        className="d-flex justify-content-between align-items-center"
        style={{
          background: "#f8f9fb",
          padding: "10px 12px",
          borderRadius: "8px",
        }}
      >
        <span style={{ fontSize: "18px", fontWeight: "600" }}>
          Showing{" "}
          <strong style={{ color: "rgb(108 30 30)" }}>{count}</strong>{" "}
          {totalPages > 1 && (
            <>
              of <strong>{totalPages * pageLimit}</strong>
            </>
          )}{" "}
          Records
        </span>

        <div className="d-flex align-items-center gap-2">
          <label style={{ fontSize: "14px", color: "#666" }}>
            Records per page:
          </label>

          <select
            className="form-select form-select-sm"
            style={{
              border: "2px solid #ff7a00",
              padding: "4px",
              width: "70px",
              borderRadius: "6px",
            }}
            value={pageLimit}
            onChange={(e) => {
              const limit = parseInt(e.target.value, 10);
              setPageLimit(limit);
              setCurrentPage(1);
              onChange(1, limit);
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
      {infoText && (
        <div style={{ marginTop: "10px" }}>
          <p className="info-text">{infoText}</p>
        </div>
      )}
    </div>
  );
};

export default CommonHeader;