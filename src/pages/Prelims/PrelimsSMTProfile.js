import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import QuestionForm from "../../forms/Prelims/QuestionForm";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import {
  getPrelimesSubjectWiseTests,  // ✅ correct — not getGrandTest
  getPrelims,
  getMockTestSubject,
  getQuestion,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from "../../services/authService";
import Button from "../../components/Button";

function PrelimsSMTProfile() {
  // Route: /prelims-swmt/:prelimes_test_id
  const { prelimes_test_id } = useParams();
  const navigate = useNavigate();

  // ── Test meta ──────────────────────────────────────
  const [testData,    setTestData]    = useState(null);
  const [prelimName,  setPrelimsName] = useState("—");
  const [subjectName, setSubjectName] = useState("—");

  // ── Questions table ────────────────────────────────
  const [questions,   setQuestions]   = useState([]);
  const [totalCount,  setTotalCount]  = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [pageLimit,   setPageLimit]   = useState(10);
  // ✅ Start true so spinner shows immediately
  const [isLoading,   setIsLoading]   = useState(true);

  // ── Modals ─────────────────────────────────────────
  const [addOpen,   setAddOpen]   = useState(false);
  const [editOpen,  setEditOpen]  = useState(false);
  const [viewOpen,  setViewOpen]  = useState(false);
  const [selectedQ, setSelectedQ] = useState(null);

  // Use route param first, fallback to localStorage
  const testId = prelimes_test_id || localStorage.getItem("prelims_swmt_prelimes_test_id");

  // ── Fetch test meta ────────────────────────────────
  useEffect(() => {
    if (!testId) return;
    const fetchTestData = async () => {
      try {
        const res = await getPrelimesSubjectWiseTests(1, 1000); // ✅ correct API
        const all = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        // ✅ Match using prelimes_test_id — the actual key from API
        const found = all.find((t) => String(t.prelimes_test_id) === String(testId));
        setTestData(found || null);
      } catch (err) {
        console.error("Fetch Test Error:", err);
      }
    };
    fetchTestData();
  }, [testId]);

  // ── Resolve prelims name ───────────────────────────
  useEffect(() => {
    if (!testData?.prelimes_id) return;
    const fetchPrelims = async () => {
      try {
        const res = await getPrelims(1, 1000);
        const list = res?.data || [];
        const found = list.find((p) => (p.prelimes_id || p._id) === testData.prelimes_id);
        setPrelimsName(found?.title || testData.prelimes_id);
      } catch (err) {
        console.error("Fetch Prelims Error:", err);
      }
    };
    fetchPrelims();
  }, [testData?.prelimes_id]);

  // ── Resolve subject name ───────────────────────────
  useEffect(() => {
    if (!testData?.mocktest_subject_id) return;
    const fetchSubject = async () => {
      try {
        const res = await getMockTestSubject(1, 1000);
        const list = res?.data || [];
        const found = list.find((s) => s.mocktest_subject_id === testData.mocktest_subject_id);
        setSubjectName(found?.title || testData.mocktest_subject_id);
      } catch (err) {
        console.error("Fetch Subject Error:", err);
      }
    };
    fetchSubject();
  }, [testData?.mocktest_subject_id]);

  // ── Fetch questions ────────────────────────────────
  const fetchQuestions = useCallback(
    async (page = 1, limit = pageLimit) => {
      if (!testId) return;
      setIsLoading(true);
      try {
        const res = await getQuestion(page, limit, testId);
        const data  = Array.isArray(res?.data) ? res.data : [];
        const pages = res?.totalPages || 1;
        const total = res?.totalCount || data.length;
        setQuestions(data);
        setTotalPages(pages);
        setTotalCount(total);
      } catch (err) {
        console.error("Fetch Questions Error:", err);
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [testId, pageLimit]
  );

  useEffect(() => {
    fetchQuestions(currentPage, pageLimit);
  }, [currentPage, pageLimit, fetchQuestions]);

  // ── Add question ───────────────────────────────────
  const handleAdd = async (payload) => {
    try {
      await addQuestion(payload);
      setAddOpen(false);
      fetchQuestions(currentPage, pageLimit);
      Swal.fire({
        title: "Added!", text: "Question added successfully", icon: "success",
        toast: true, position: "top-end", timer: 5000,
        showConfirmButton: false, timerProgressBar: true,
        background: "#28a745", color: "#ffffff",
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to add question", "error");
    }
  };

  // ── Edit question ──────────────────────────────────
  const handleEdit = async (payload) => {
    try {
      await updateQuestion(payload);
      setEditOpen(false);
      setSelectedQ(null);
      fetchQuestions(currentPage, pageLimit);
      Swal.fire({
        title: "Updated!", text: "Question updated successfully", icon: "success",
        toast: true, position: "top-end", timer: 5000,
        showConfirmButton: false, timerProgressBar: true,
        background: "#28a745", color: "#ffffff",
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update question", "error");
    }
  };

  // ── Delete question ────────────────────────────────
  const handleDelete = async (questionId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This question will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#6c1e1e",
      cancelButtonColor: "#6c757d",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteQuestion(questionId);
      fetchQuestions(currentPage, pageLimit);
      Swal.fire({
        title: "Deleted!", text: "Question deleted successfully", icon: "success",
        toast: true, position: "top-end", timer: 4000,
        showConfirmButton: false, timerProgressBar: true,
        background: "#6c1e1e", color: "#ffffff",
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to delete question", "error");
    }
  };

  // ── Table columns ──────────────────────────────────
  const qColumns = [
    { header: "S.No",           accessor: "sno"            },
    { header: "Q.No",           accessor: "question_number" },
    { header: "Question",       accessor: "question"        },
    { header: "Correct Answer", accessor: "correctAnswer"   },
    { header: "Marks",          accessor: "marks"           },
    { header: "Actions",        accessor: "actions"         },
  ];

  const optionLabel = (idx) => ["A", "B", "C", "D"][idx] ?? idx;

  const qTableData = questions.map((q, index) => ({
    ...q,
    sno:             (currentPage - 1) * pageLimit + index + 1,
    question_number: q.question_number || "—",
    question: q.question
      ? q.question.length > 60 ? q.question.slice(0, 60) + "…" : q.question
      : "—",
    correctAnswer: q.options?.[q.correctAnswer]
      ? `(${optionLabel(q.correctAnswer)}) ${q.options[q.correctAnswer]}`
      : q.correctAnswer ?? "—",
    marks: q.marks ?? "—",
    actions: (
      <div className="actions d-flex">
        <button className="icon-btn view me-2" title="View"
          onClick={() => { setSelectedQ(q); setViewOpen(true); }}>
          <FaEye />
        </button>
        <button className="icon-btn edit me-2" title="Edit"
          onClick={() => { setSelectedQ(q); setEditOpen(true); }}>
          <FaEdit />
        </button>
        <button className="icon-btn delete" title="Delete"
          onClick={() => handleDelete(q.questionId)}>
          <FaTrash />
        </button>
      </div>
    ),
  }));

  // ── Loading ────────────────────────────────────────
  if (!testData) {
    return (
      <div className="p-3 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Loading test profile...</p>
      </div>
    );
  }

  return (
    <div className="container mt-3">

      {/* ── Header ── */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>PRELIMS SW MOCK TEST PROFILE</h2>
        <button className="btn btn-secondary" onClick={() => navigate("/pswmocktests")}>
          ← Back
        </button>
      </div>

      {/* ── Test Details Card ── */}
      <div className="card p-3 shadow-sm mb-4">
        <h4>Test Details</h4>
        <div className="row mt-3 align-items-start">
          <div className="col-md-4 mb-3">
            <p><b>Title:</b>       {testData.title       || "N/A"}</p>
            <p><b>Test Number:</b> {testData.test_number || "N/A"}</p>
            <p><b>Test Type:</b>   {testData.test_type   || "N/A"}</p>
          </div>
          <div className="col-md-4 mb-3">
            <p><b>No. of Questions:</b> {testData.no_of_qos || "N/A"}</p>
            <p><b>Duration (mins):</b>  {testData.duration  || "N/A"}</p>
            <p><b>Prelims:</b>          {prelimName}</p>
          </div>
          <div className="col-md-4 mb-3">
            <p><b>Mock Test Subject:</b> {subjectName}</p>
            <p>
              <b>Created At:</b>{" "}
              {testData.createdAt ? new Date(testData.createdAt).toLocaleString() : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Questions Section ── */}
      <div className="card p-3 shadow-sm mb-4">

        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h4 style={{ margin: 0 }}>Questions</h4>
          <Button text="+ Add Question" onClick={() => setAddOpen(true)} />
        </div>

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <span style={{ fontSize: "14px" }}>
            Showing{" "}
            <strong style={{ color: "#ff7a00" }}>{questions.length}</strong>
            {totalCount > questions.length && (
              <> of <strong>{totalCount}</strong></>
            )}{" "}
            records
          </span>
          <div className="d-flex align-items-center gap-2">
            <label style={{ marginBottom: 0, color: "#2b377b" }}>Records per page:</label>
            <select
              style={{ border: "2px solid #872026", padding: "2px", cursor: "pointer" }}
              value={pageLimit}
              onChange={(e) => {
                const limit = parseInt(e.target.value, 10);
                setPageLimit(limit);
                setCurrentPage(1);
                fetchQuestions(1, limit);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <Table
          columns={qColumns}
          data={qTableData}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          isLoading={isLoading}
        />
      </div>

      {/* ── Add Question Modal ── */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Question" size="lg">
        <QuestionForm
          prelimes_test_id={testId}
          onClose={() => setAddOpen(false)}
          onSubmit={handleAdd}
          isEdit={false}
        />
      </Modal>

      {/* ── Edit Question Modal ── */}
      <Modal
        open={editOpen}
        onClose={() => { setEditOpen(false); setSelectedQ(null); }}
        title="Edit Question"
        size="lg"
      >
        {selectedQ && (
          <QuestionForm
            prelimes_test_id={testId}
            initialData={selectedQ}
            isEdit={true}
            onClose={() => { setEditOpen(false); setSelectedQ(null); }}
            onSubmit={handleEdit}
          />
        )}
      </Modal>

      {/* ── View Question Modal ── */}
      <Modal
        open={viewOpen}
        onClose={() => { setViewOpen(false); setSelectedQ(null); }}
        title="Question Details"
        size="lg"
      >
        {selectedQ && (
          <div className="container">
            <div className="row mb-3">
              <div className="col-md-6">
                <b>Question No:</b>
                <div className="mt-1">{selectedQ.question_number || "—"}</div>
              </div>
              <div className="col-md-6">
                <b>Marks:</b>
                <div className="mt-1">{selectedQ.marks ?? "—"}</div>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-12">
                <b>Question:</b>
                <div className="mt-1" style={{ fontSize: "14px" }}>{selectedQ.question || "—"}</div>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <b>Options:</b>
                <div className="mt-2 p-2"
                  style={{ background: "#f8f9fa", borderRadius: "6px", border: "1px solid #e9ecef" }}>
                  {(selectedQ.options || []).map((opt, i) => (
                    <p key={i} style={{ marginBottom: "6px" }}>
                      <span style={{
                        display: "inline-block", width: "22px", height: "22px",
                        lineHeight: "22px", textAlign: "center", borderRadius: "50%",
                        background: i === selectedQ.correctAnswer ? "#28a745" : "#e0e0e0",
                        color: i === selectedQ.correctAnswer ? "#fff" : "#333",
                        fontSize: "12px", fontWeight: "700", marginRight: "8px",
                      }}>
                        {optionLabel(i)}
                      </span>
                      {opt}
                      {i === selectedQ.correctAnswer && (
                        <span className="badge bg-success ms-2" style={{ fontSize: "10px" }}>✓ Correct</span>
                      )}
                    </p>
                  ))}
                </div>
              </div>
              {selectedQ.summary?.length > 0 && (
                <div className="col-md-6">
                  <b>Summary:</b>
                  <div className="mt-2 p-2"
                    style={{ background: "#f8f9fa", borderRadius: "6px", border: "1px solid #e9ecef" }}>
                    {selectedQ.summary.map((s, i) => (
                      <p key={i} style={{ fontSize: "13px", color: "#444", marginBottom: "6px" }}>
                        {i + 1}. {s}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <hr />
            <div className="text-end">
              <button className="btn btn-secondary"
                onClick={() => { setViewOpen(false); setSelectedQ(null); }}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}

export default PrelimsSMTProfile;