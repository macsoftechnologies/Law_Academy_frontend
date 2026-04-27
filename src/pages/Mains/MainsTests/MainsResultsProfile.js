import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getMainsTestsAttemptsById, addMainsResults } from "../../../services/authService";

const MainsResultsProfile = () => {
  const { attemptId } = useParams();
  const navigate      = useNavigate();

  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [attempt,     setAttempt]     = useState(null);
  const [showForm,    setShowForm]    = useState(false);

  const [marksScored, setMarksScored] = useState("");
  const [feedback,    setFeedback]    = useState("");
  const [strengths,   setStrengths]   = useState([""]);
  const [toImprove,   setToImprove]   = useState([""]);

  const plusBtn = {
    border: "none", background: "none", color: "#28a745",
    fontWeight: "bold", fontSize: "22px", cursor: "pointer", lineHeight: 1, padding: "0 4px",
  };
  const minusBtn = {
    border: "none", background: "none", color: "#dc3545",
    fontWeight: "bold", fontSize: "22px", cursor: "pointer", lineHeight: 1, padding: "0 4px",
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await getMainsTestsAttemptsById(attemptId);
        const d   = Array.isArray(res.data) ? res.data[0] : res.data || {};
        setAttempt(d);
      } catch {
        Swal.fire("Error", "Failed to load attempt details", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [attemptId]);

  const addStrength    = ()         => setStrengths([...strengths, ""]);
  const removeStrength = (idx)      => setStrengths(strengths.filter((_, i) => i !== idx));
  const updateStrength = (idx, val) => setStrengths(strengths.map((s, i) => (i === idx ? val : s)));

  const addImprove    = ()         => setToImprove([...toImprove, ""]);
  const removeImprove = (idx)      => setToImprove(toImprove.filter((_, i) => i !== idx));
  const updateImprove = (idx, val) => setToImprove(toImprove.map((s, i) => (i === idx ? val : s)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!marksScored) {
      Swal.fire("Warning", "Marks Scored is required.", "warning");
      return;
    }
    setSaving(true);
    try {
      await addMainsResults({
        mains_attempt_id: attemptId,
        marks_scored:     Number(marksScored),
        feedback,
        strengths:  strengths.filter((s) => s.trim() !== ""),
        to_improve: toImprove.filter((s) => s.trim() !== ""),
      });
      Swal.fire("Success", "Result added successfully!", "success").then(() =>
        navigate("/mainstestsattempts")
      );
    } catch {
      Swal.fire("Error", "Failed to add result.", "error");
    } finally {
      setSaving(false);
    }
  };

  const statusBadge = (status) => {
    const map = { result: "success", pending: "warning", reviewed: "info" };
    const color = map[status?.toLowerCase()] || "secondary";
    return (
      <span className={`badge bg-${color}`} style={{ fontSize: "13px" }}>
        {status || "N/A"}
      </span>
    );
  };

  const card = {
    background: "#fff", borderRadius: "10px", padding: "24px",
    marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", border: "1px solid #e9ecef",
  };
  const lbl = { fontWeight: "600", fontSize: "15px", color: "#2b377b", marginBottom: "5px", display: "block" };
  const val = { fontSize: "15px", color: "#444", marginTop: "3px" };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-danger" role="status" />
      <p className="mt-2 text-muted">Loading attempt details…</p>
    </div>
  );

  if (!attempt) return (
    <p className="text-center text-muted py-5">No data found.</p>
  );

  const hasResult = !!attempt.result;

  return (
    <div style={{ padding: "20px" }}>

      {/* ── Header ── */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h4 style={{ color: "#2b377b", fontWeight: "700", margin: 0, fontSize: "22px" }}>
            Mains Result Profile
          </h4>
        </div>
        {!hasResult && (
          <button
            className="btn btn-success btn-sm"
            onClick={() => setShowForm((prev) => !prev)}
          >
            {showForm ? "− Hide Form" : "+ Add Result"}
          </button>
        )}
      </div>

      {/* ── Add Result Form — ABOVE all cards ── */}
      {!hasResult && showForm && (
        <div style={{ ...card, border: "2px solid #2b377b" }}>
          <h6 style={{ color: "#2b377b", fontWeight: "700", marginBottom: "18px", fontSize: "17px" }}>📝 Add Result</h6>
          <form className="custom-form" onSubmit={handleSubmit}>
            <div className="row">

              <div className="col-md-6 mb-3">
                <label className="form-label">Marks Scored <span style={{ color: "#872026" }}>*</span></label>
                <input
                  type="number"
                  className="form-control"
                  value={marksScored}
                  onChange={(e) => setMarksScored(e.target.value)}
                  placeholder="Enter marks scored"
                  required
                />
              </div>

              <div className="col-md-12 mb-3">
                <label className="form-label">Feedback</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter feedback…"
                />
              </div>

              <div className="col-md-6 mb-3">
                <div className="d-flex align-items-center mb-2 gap-2">
                  <label className="form-label mb-0 fw-semibold">Strengths</label>
                  <button type="button" style={plusBtn} onClick={addStrength} title="Add Strength">+</button>
                </div>
                {strengths.map((s, idx) => (
                  <div key={idx} className="d-flex align-items-center mb-2 gap-2">
                    <input
                      className="form-control form-control-sm"
                      placeholder={`Strength ${idx + 1}`}
                      value={s}
                      onChange={(e) => updateStrength(idx, e.target.value)}
                    />
                    {strengths.length > 1 && (
                      <button type="button" style={minusBtn} onClick={() => removeStrength(idx)} title="Remove">−</button>
                    )}
                  </div>
                ))}
              </div>

              <div className="col-md-6 mb-3">
                <div className="d-flex align-items-center mb-2 gap-2">
                  <label className="form-label mb-0 fw-semibold">To Improve</label>
                  <button type="button" style={plusBtn} onClick={addImprove} title="Add Item">+</button>
                </div>
                {toImprove.map((s, idx) => (
                  <div key={idx} className="d-flex align-items-center mb-2 gap-2">
                    <input
                      className="form-control form-control-sm"
                      placeholder={`Improvement ${idx + 1}`}
                      value={s}
                      onChange={(e) => updateImprove(idx, e.target.value)}
                    />
                    {toImprove.length > 1 && (
                      <button type="button" style={minusBtn} onClick={() => removeImprove(idx)} title="Remove">−</button>
                    )}
                  </div>
                ))}
              </div>

              <div className="col-12 text-end mt-2">
                <button type="button" className="btn btn-secondary me-2" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success" disabled={saving}>
                  {saving
                    ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</>
                    : "Submit Result"
                  }
                </button>
              </div>

            </div>
          </form>
        </div>
      )}

      {/* ── Student Info ── */}
      <div style={card}>
        <h6 style={{ color: "#2b377b", fontWeight: "700", marginBottom: "16px", fontSize: "17px" }}>👤 Student Info</h6>
        <div className="row">
          <div className="col-md-4 mb-3">
            <span style={lbl}>Name</span>
            <div style={val}>{attempt.user?.name || "N/A"}</div>
          </div>
          <div className="col-md-4 mb-3">
            <span style={lbl}>Email</span>
            <div style={val}>{attempt.user?.email || "N/A"}</div>
          </div>
          <div className="col-md-4 mb-3">
            <span style={lbl}>Mobile</span>
            <div style={val}>{attempt.user?.mobile_number || "N/A"}</div>
          </div>
          <div className="col-md-4 mb-2">
            <span style={lbl}>Status</span>
            <div className="mt-1">{statusBadge(attempt.status)}</div>
          </div>
        </div>
      </div>

      {/* ── Attempt Info ── */}
      <div style={card}>
        <h6 style={{ color: "#2b377b", fontWeight: "700", marginBottom: "16px", fontSize: "17px" }}>📋 Attempt Info</h6>
        <div className="row">
          <div className="col-md-3 mb-3">
            <span style={lbl}>Date</span>
            <div style={val}>{attempt.date || "N/A"}</div>
          </div>
          <div className="col-md-3 mb-3">
            <span style={lbl}>Time</span>
            <div style={val}>{attempt.time || "N/A"}</div>
          </div>
          <div className="col-md-3 mb-3">
            <span style={lbl}>Attempt No</span>
            <div style={val}>{attempt.attempt_no || "N/A"}</div>
          </div>
          <div className="col-md-12 mb-2">
            <span style={lbl}>Answer Script</span>
            <div className="mt-1">
              {attempt.answer_script_file ? (
                <a
                  href={attempt.answer_script_file}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#872026", wordBreak: "break-all", fontSize: "15px" }}
                >
                  {attempt.answer_script_file}
                </a>
              ) : (
                <span style={val}>N/A</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Subject & Test Info ── */}
      <div style={card}>
        <h6 style={{ color: "#2b377b", fontWeight: "700", marginBottom: "16px", fontSize: "17px" }}>📝 Subject & Test Info</h6>
        <div className="row">
          <div className="col-md-6 mb-3">
            <span style={lbl}>Subject Title</span>
            <div style={val}>{attempt.subject?.title || "N/A"}</div>
          </div>
          <div className="col-md-2 mb-3">
            <span style={lbl}>No of Qs</span>
            <div style={val}>{attempt.subject?.no_of_qos || "N/A"}</div>
          </div>
          <div className="col-md-2 mb-3">
            <span style={lbl}>Duration</span>
            <div style={val}>{attempt.subject?.duration || "N/A"}</div>
          </div>
          <div className="col-md-2 mb-3">
            <span style={lbl}>Marks</span>
            <div style={val}>{attempt.subject?.marks || "N/A"}</div>
          </div>
          <div className="col-md-6 mb-3">
            <span style={lbl}>Test Title</span>
            <div style={val}>{attempt.mainsTest?.title || "N/A"}</div>
          </div>
          <div className="col-md-3 mb-3">
            <span style={lbl}>No of Questions</span>
            <div style={val}>{attempt.mainsTest?.no_of_qs || "N/A"}</div>
          </div>
          <div className="col-md-3 mb-3">
            <span style={lbl}>No of Subjects</span>
            <div style={val}>{attempt.mainsTest?.no_of_subjects || "N/A"}</div>
          </div>
          {attempt.mainsTest?.presentation_image && (
            <div className="col-md-6 mb-2">
              <span style={lbl}>Presentation Image</span>
              <div className="mt-2">
                <img
                  src={`${process.env.REACT_APP_API_BASE_URL}/${attempt.mainsTest.presentation_image}`}
                  alt="Presentation"
                  style={{ maxHeight: "120px", borderRadius: "8px", border: "1px solid #ddd", maxWidth: "100%" }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Result Info ── */}
      {hasResult && (
        <div style={card}>
          <h6 style={{ color: "#2b377b", fontWeight: "700", marginBottom: "16px", fontSize: "17px" }}>🏆 Result Info</h6>
          <div className="row">
            <div className="col-md-4 mb-3">
              <span style={lbl}>Marks Scored</span>
              <div style={val}>{attempt.result.marks_scored ?? "N/A"}</div>
            </div>
            <div className="col-md-4 mb-3">
              <span style={lbl}>Overall %</span>
              <div style={val}>
                {attempt.result.overall_percentage != null
                  ? `${attempt.result.overall_percentage}%`
                  : "N/A"}
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <span style={lbl}>Date of Submission</span>
              <div style={val}>{attempt.result.date_of_submission || "N/A"}</div>
            </div>
            <div className="col-md-4 mb-3">
              <span style={lbl}>Date of Evaluation</span>
              <div style={val}>{attempt.result.date_of_evaluation || "N/A"}</div>
            </div>
            <div className="col-md-12 mb-3">
              <span style={lbl}>Feedback</span>
              <div
                className="mt-1 p-2"
                style={{ fontSize: "15px", whiteSpace: "pre-wrap", background: "#f8f9fa", borderRadius: "6px", border: "1px solid #e9ecef" }}
              >
                {attempt.result.feedback || "N/A"}
              </div>
            </div>
            <div className="col-md-6 mb-2">
              <span style={lbl}>Strengths</span>
              <div className="mt-1 p-2" style={{ background: "#f0fff4", borderRadius: "6px", border: "1px solid #d4edda" }}>
                {Array.isArray(attempt.result.strengths) && attempt.result.strengths.length > 0 ? (
                  <ul className="mb-0 ps-3">
                    {attempt.result.strengths.map((s, i) => (
                      <li key={i} style={{ fontSize: "15px", color: "#155724" }}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-muted" style={{ fontSize: "15px" }}>N/A</span>
                )}
              </div>
            </div>
            <div className="col-md-6 mb-2">
              <span style={lbl}>To Improve</span>
              <div className="mt-1 p-2" style={{ background: "#fff8f0", borderRadius: "6px", border: "1px solid #fde8c8" }}>
                {Array.isArray(attempt.result.to_improve) && attempt.result.to_improve.length > 0 ? (
                  <ul className="mb-0 ps-3">
                    {attempt.result.to_improve.map((s, i) => (
                      <li key={i} style={{ fontSize: "15px", color: "#856404" }}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-muted" style={{ fontSize: "15px" }}>N/A</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-end mt-2">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Close
        </button>
      </div>

    </div>
  );
};

export default MainsResultsProfile;