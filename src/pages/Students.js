import React, { useState, useEffect, useCallback } from "react";
import Table from "../components/Table";
import { getUsersList } from "../services/authService";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

function Students() {
  const navigate = useNavigate();

  const [studentsList, setStudentsList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStudents = useCallback(async (page = 1, limit = pageLimit) => {
    setIsLoading(true);
    try {
      const res = await getUsersList(page, limit);
      let data = [];
      let pages = 1;

      if (res && Array.isArray(res.data)) {
        data = res.data;
        pages = res.totalPages || 1;
      } else if (Array.isArray(res)) {
        data = res;
      }

      setStudentsList(data);
      setTotalPages(pages);
    } catch (err) {
      setStudentsList([]);
      setTotalPages(1);
      Swal.fire("Error", "Failed to fetch students", "error");
    }finally {
    setIsLoading(false);    
  }
  }, [pageLimit]);

  useEffect(() => {
    fetchStudents(currentPage, pageLimit);
  }, [currentPage, pageLimit, fetchStudents]);

  const handleRowClick = (student) => {
    localStorage.setItem("userId", student.userId);
    navigate(`/student/${student.userId}`);
  };

  const columns = [
    { header: "S.No",          accessor: "s_no"          },
    { header: "Name",          accessor: "name"          },
    { header: "Email",         accessor: "email"         },
    { header: "Mobile",        accessor: "mobile_number" },
    { header: "Referral Code", accessor: "referral_code" },
    { header: "Referred By",   accessor: "referred_by"   },
  ];

  const tableData = studentsList.map((student, index) => ({
    ...student,
    _rowonClick:   () => handleRowClick(student),
    s_no:          (currentPage - 1) * pageLimit + index + 1,
    name:          student.name          || "—",
    email:         student.email         || "—",
    mobile_number: student.mobile_number || "—",
    referral_code: student.referral_code || "—",
    referred_by:   student.referred_by   || "—",
  }));

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h2>STUDENTS LIST</h2>
        <div className="d-flex gap-2 align-items-center">
          <label>Records per page:</label>
          <select
            style={{
              border: "2px solid #872026",
              padding: "2px",
              cursor: "pointer",
            }}
            value={pageLimit}
            onChange={(e) => {
              const limit = parseInt(e.target.value, 10);
              setPageLimit(limit);
              setCurrentPage(1);
              fetchStudents(1, limit);
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <p
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "16px",
          fontWeight: "600",
          fontStyle: "italic",
          color: "#6f42c1",
          background: "#f0ebff",
          border: "1px solid #c9b8f5",
          borderRadius: "20px",
          padding: "4px 14px",
          marginBottom: "12px",
        }}
      >
        💡 Click on any row to view student details
      </p>

      <Table
        columns={columns}
        data={tableData}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        isLoading={isLoading}

      />
    </div>
  );
}

export default Students;