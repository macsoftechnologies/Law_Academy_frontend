import React, { useState, useEffect, useCallback } from "react";
import Table from "../../components/Table";
import { getUsersList } from "../../services/authService";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import CommonHeader from "../../components/CommonHeader";

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
     <CommonHeader
  title="STUDENTS LIST"
  count={studentsList.length}
  totalPages={totalPages}
  pageLimit={pageLimit}
  setPageLimit={setPageLimit}
  setCurrentPage={setCurrentPage}
  onChange={(page, limit) => fetchStudents(page, limit)}
  infoText="💡 Click on any row to view student details"   // ✅ HERE
/>

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