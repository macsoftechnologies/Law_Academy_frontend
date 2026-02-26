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

  const fetchStudents = useCallback(async (page = 1, limit = pageLimit) => {
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
    { header: "S.No", accessor: "s_no" },
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Mobile", accessor: "mobile_number" },
    { header: "Referral Code", accessor: "referral_code" },
    { header: "Referred By", accessor: "referred_by" },
  ];

  const tableData = studentsList.map((student, index) => ({
    ...student,
    s_no: (
      <span
        style={{ cursor: "pointer", color: "#6f42c1", fontWeight: "700" }}
        onClick={() => handleRowClick(student)}
      >
        {(currentPage - 1) * pageLimit + index + 1}
      </span>
    ),
    name: (
      <span style={{ cursor: "pointer" }} onClick={() => handleRowClick(student)}>
        {student.name}
      </span>
    ),
    email: (
      <span style={{ cursor: "pointer" }} onClick={() => handleRowClick(student)}>
        {student.email}
      </span>
    ),
    mobile_number: (
      <span style={{ cursor: "pointer" }} onClick={() => handleRowClick(student)}>
        {student.mobile_number}
      </span>
    ),
    referral_code: (
      <span style={{ cursor: "pointer" }} onClick={() => handleRowClick(student)}>
        {student.referral_code}
      </span>
    ),
    referred_by: (
      <span style={{ cursor: "pointer" }} onClick={() => handleRowClick(student)}>
        {student.referred_by}
      </span>
    ),
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

      <p className="text-muted" style={{ fontSize: "13px" }}>
        💡 Click on any row to view student details
      </p>

      <Table
        columns={columns}
        data={tableData}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default Students;