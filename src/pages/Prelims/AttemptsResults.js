import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

import Table from "../../components/Table";
import CommonHeader from "../../components/CommonHeader";

import { getAttemptsResults } from "../../services/authService";

const TEST_TYPE_OPTIONS = [
  { label: "All", value: "" },
  { label: "SUBJECT WISE MOCK TEST", value: "SMT" },
  { label: "GRAND TESTS",  value: "GT"  },
  { label: "QUIZZ",  value: "QZ"  },
];

const AttemptsResults = () => {
  const navigate = useNavigate();

  const [attemptList, setAttemptList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [pageLimit,   setPageLimit]   = useState(10);
  const [isLoading,   setIsLoading]   = useState(false);
  const [testType,    setTestType]    = useState("");

  const fetchAttempts = useCallback(
    async (page = 1, limit = pageLimit, type = testType) => {
      setIsLoading(true);
      try {
        const res = await getAttemptsResults(page, limit, type);
        setAttemptList(res.data || []);
        setTotalPages(res.totalPages || 1);
      } catch (err) {
        Swal.fire("Error", "Failed to fetch attempts", "error");
        setAttemptList([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    },
    [pageLimit, testType]
  );

  useEffect(() => {
    fetchAttempts(currentPage, pageLimit, testType);
  }, [currentPage, pageLimit, testType, fetchAttempts]);

  const handleTestTypeChange = (e) => {
    setTestType(e.target.value);
    setCurrentPage(1);
  };

  // ✅ Same pattern as QUIZZ.jsx — store id in localStorage + navigate with state
  const handleRowClick = (item) => {
    localStorage.setItem("attempt_id", item.prelimes_attempt_id);
    navigate(`/attempts/${item.prelimes_attempt_id}`, { state: { attempt: item } });
  };

  const columns = [
    { header: "S.No",         accessor: "serial"        },
    { header: "Student Name", accessor: "studentName"   },
    { header: "Email",        accessor: "email"         },
    { header: "Test Title",   accessor: "testTitle"     },
    { header: "Test Type",    accessor: "testType"      },
    { header: "Attempt No",   accessor: "attemptNumber" },
    { header: "Score",        accessor: "score"         },
    { header: "Percentage",   accessor: "percentage"    },
    { header: "Status",       accessor: "status"        },
    { header: "Submitted At", accessor: "submittedAt"   },
  ];

  const tableData = attemptList.map((item, index) => ({
    ...item,
    _rowonClick: () => handleRowClick(item),   // 
    serial:        (currentPage - 1) * pageLimit + index + 1,
    studentName:   item.userId?.name      || "—",
    email:         item.userId?.email     || "—",
    testTitle:     item.testId?.title     || "—",
    testType:      item.testId?.test_type === "SMT"
    ? "SUBJECT WISE MOCK TEST"
    : item.testId?.test_type === "GT"
    ? "GRAND TESTS"
    : item.testId?.test_type === "QZ"
    ? "QUIZZ"
    : "—",
    attemptNumber: item.attemptNumber     || "—",
    score:         item.result ? `${item.result.score} / ${item.result.totalQuestions}` : "—",
    percentage:    item.result ? `${item.result.percentage}%` : "—",
    status: item.submittedAt
      ? <span className="badge bg-success">Submitted</span>
      : <span className="badge bg-warning text-dark">In Progress</span>,
    submittedAt: item.submittedAt ? item.submittedAt.split("T")[0] : "—",
  }));

  return (
    <div>
      <CommonHeader
        title="ATTEMPTS & RESULTS"
        count={attemptList.length}
        totalPages={totalPages}
        pageLimit={pageLimit}
        setPageLimit={(limit) => {
          setPageLimit(limit);
          setCurrentPage(1);
          fetchAttempts(1, limit);
        }}
        setCurrentPage={setCurrentPage}
        onChange={(page, limit) => fetchAttempts(page, limit)}
        infoText="💡 Click on any row to view attempt details"
      />

      {/* Test Type Filter */}
      <div className="d-flex align-items-center mb-3 px-1 gap-3">
        <label className="fw-semibold mb-0" style={{ whiteSpace: "nowrap" }}>
          Filter by Test Type:
        </label>
        <select
          className="form-select w-auto"
          value={testType}
          onChange={handleTestTypeChange}
        >
          {TEST_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

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
};

export default AttemptsResults;