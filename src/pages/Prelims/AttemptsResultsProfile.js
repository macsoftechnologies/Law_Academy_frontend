import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getAttemptsResults } from "../../services/authService";

const optionLabels = ["A", "B", "C", "D", "E"];

function AttemptsResultsProfile() {
  const { attempt_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [attempt, setAttempt] = useState(location.state?.attempt || null);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Same pattern as QuizProfile — use param first, fallback to localStorage
  const attemptId = attempt_id || localStorage.getItem("attempt_id");

  // Only fetch if no state was passed (direct URL open / refresh)
  useEffect(() => {
    if (attempt) return;
    if (!attemptId) return;

    const fetchAttempt = async () => {
      setIsLoading(true);
      try {
        const res = await getAttemptsResults(1, 1000);
        const all = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
        // ✅ Match by prelimes_attempt_id — same as QuizProfile matches prelimes_test_id
        const found = all.find(
          (a) =>
            String(a.prelimes_attempt_id) === String(attemptId) ||
            String(a._id) === String(attemptId),
        );
        setAttempt(found || null);
      } catch (err) {
        console.error("Fetch Attempt Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttempt();
  }, [attemptId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="p-3 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Loading attempt profile...</p>
      </div>
    );
  }

  // ── Not found ──
  if (!attempt) {
    return (
      <div className="p-3 text-center text-muted">
        <p>No attempt data found.</p>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>
    );
  }

  const {
    userId,
    testId,
    result,
    answers = [],
    questions = [],
    startedAt,
    submittedAt,
    attemptNumber,
  } = attempt;

  return (
    <div className="container mt-3">
      {/* ── Page Header ── */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>ATTEMPT PROFILE</h2>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/attemptsresults")}
        >
          ← Back
        </button>
      </div>

      {/* ── Student Information ── */}
      <div className="card p-3 shadow-sm mb-4">
        <h4>Student Information</h4>
        <div className="row mt-3">
          <div className="col-md-4 mb-2">
            <p>
              <b>Name:</b> {userId?.name || "N/A"}
            </p>
            <p>
              <b>Email:</b> {userId?.email || "N/A"}
            </p>
            <p>
              <b>Mobile:</b> {userId?.mobile_number || "N/A"}
            </p>
          </div>
          <div className="col-md-4 mb-2">
            <p>
              <b>Gender:</b> {userId?.gender || "N/A"}
            </p>
            <p>
              <b>Date of Birth:</b> {userId?.date_of_birth || "N/A"}
            </p>
            <p>
              <b>Role:</b> {userId?.role || "N/A"}
            </p>
          </div>
          <div className="col-md-4 mb-2">
            <p>
              <b>Referral Code:</b> {userId?.referral_code || "N/A"}
            </p>
            <p>
              <b>Address:</b> {userId?.permanent_address || "N/A"}
            </p>
            <p>
              <b>Corresponding Address:</b>{" "}
              {userId?.corresponding_address || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Test Information ── */}
      <div className="card p-3 shadow-sm mb-4">
        <h4>Test Information</h4>
        <div className="row mt-3">
          <div className="col-md-4 mb-2">
            <p>
              <b>Title:</b> {testId?.title || "N/A"}
            </p>
            <p>
              <b>Test Type:</b> {testId?.test_type || "N/A"}
            </p>
            <p>
              <b>Test Number:</b> {testId?.test_number || "N/A"}
            </p>
          </div>
          <div className="col-md-4 mb-2">
            <p>
              <b>No. of Questions:</b> {testId?.no_of_qos || "N/A"}
            </p>
            <p>
              <b>Duration:</b> {testId?.duration || "N/A"} mins
            </p>
            <p>
              <b>Attempt Number:</b> {attemptNumber || "N/A"}
            </p>
          </div>
          <div className="col-md-4 mb-2">
            <p>
              <b>Started At:</b>{" "}
              {startedAt ? new Date(startedAt).toLocaleString() : "N/A"}
            </p>
            <p>
              <b>Submitted At:</b>{" "}
              {submittedAt ? new Date(submittedAt).toLocaleString() : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Result Summary ── */}
      {result && (
        <div className="card p-3 shadow-sm mb-4">
          <h4>Result Summary</h4>

          {/* Score Stat Cards */}
          <div className="row g-3 mt-1 mb-3">
            {[
              {
                label: "Total Questions",
                value: result.totalQuestions,
                color: "#2b377b",
                bg: "#eef2ff",
              },
              {
                label: "Attempted",
                value: result.attempted,
                color: "#0d6efd",
                bg: "#e7f0ff",
              },
              {
                label: "Correct",
                value: result.correct,
                color: "#198754",
                bg: "#d1f0e0",
              },
              {
                label: "Wrong",
                value: result.wrong,
                color: "#dc3545",
                bg: "#fde8ea",
              },
              {
                label: "Skipped",
                value: result.skipped,
                color: "#6c757d",
                bg: "#f0f0f0",
              },
              {
                label: "Score",
                value: result.score,
                color: "#ff7a00",
                bg: "#fff3e0",
              },
            ].map((card) => (
              <div className="col-6 col-md-4 col-lg-2" key={card.label}>
                <div
                  className="text-center p-3 rounded"
                  style={{
                    background: card.bg,
                    border: `1px solid ${card.color}33`,
                  }}
                >
                  <div
                    style={{
                      fontSize: "26px",
                      fontWeight: "800",
                      color: card.color,
                    }}
                  >
                    {card.value}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "4px",
                    }}
                  >
                    {card.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="row">
            <div className="col-md-4 mb-2">
              <p>
                <b>Percentage:</b> {result.percentage}%
              </p>
              <p>
                <b>Accuracy:</b> {result.accuracy?.toFixed(2)}%
              </p>
            </div>
            <div className="col-md-4 mb-2">
              <p>
                <b>Time Spent:</b> {result.timeSpent?.toFixed(1)}s
              </p>
              <p>
                <b>Total Time:</b> {result.totalTime} mins
              </p>
            </div>
            <div className="col-md-4 mb-2">
              <p>
                <b>Rank:</b> {result.rank}
              </p>
              <p>
                <b>Percentile:</b> {result.percentile}
              </p>
              <p>
                <b>Total Participants:</b> {result.totalParticipants}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Questions Review */}
      {questions.length > 0 && (
        <div className="card p-3 shadow-sm mb-4">
          <h4>Questions Review</h4>

          {/* Legend */}
          <div className="d-flex gap-3 mt-2 mb-3 flex-wrap">
            {[
              { color: "#198754", bg: "#d1f0e0", label: "Correct Answer" },
              { color: "#dc3545", bg: "#fde8ea", label: "Wrong Selection" },
              { color: "#6c757d", bg: "#f0f0f0", label: "Skipped" },
            ].map((l) => (
              <span key={l.label} className="d-flex align-items-center gap-1">
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    background: l.bg,
                    border: `1.5px solid ${l.color}`,
                    display: "inline-block",
                  }}
                />
                <small style={{ color: "#555" }}>{l.label}</small>
              </span>
            ))}
          </div>

          {/* ✅ row is OUTSIDE map — 2 questions per row */}
          <div className="row g-3">
            {questions.map((q) => {
              const answerObj = answers.find(
                (a) => a.questionId === q.questionId,
              );
              const selectedAnswer = answerObj?.selectedAnswer ?? null;
              const correctAnswer = q.correctAnswer;

              const isSkipped = selectedAnswer === null;
              const isCorrect = !isSkipped && selectedAnswer === correctAnswer;

              let statusBadge;
              if (isSkipped)
                statusBadge = (
                  <span className="badge bg-secondary">Skipped</span>
                );
              else if (isCorrect)
                statusBadge = <span className="badge bg-success">Correct</span>;
              else statusBadge = <span className="badge bg-danger">Wrong</span>;

              return (
                // ✅ col-md-6 = 2 per row
                <div className="col-md-6" key={q.questionId}>
                  <div
                    className="p-3 h-100 rounded border"
                    style={{ background: "#fafafa" }}
                  >
                    {/* Question Header */}
                    <div className="d-flex align-items-start justify-content-between mb-2 gap-2">
                      <p
                        className="mb-0 fw-semibold"
                        style={{ flex: 1, fontSize: "14px" }}
                      >
                        <span className="text-muted me-1">
                          Q{q.question_number}.
                        </span>
                        {q.question}
                      </p>
                      {statusBadge}
                    </div>

                    {/* Options */}
                    <div className="row g-2 mt-1">
                      {q.options.map((option, optIdx) => {
                        const optionNumber = optIdx + 1;
                        const isCorrectOpt = optionNumber === correctAnswer;
                        const isSelectedOpt = optionNumber === selectedAnswer;
                        const isWrongSelect = isSelectedOpt && !isCorrectOpt;

                        let optBg = "#ffffff",
                          optBorder = "#dee2e6",
                          circleBg = "#e9ecef",
                          circleClr = "#495057";
                        if (isCorrectOpt) {
                          optBg = "#d1f0e0";
                          optBorder = "#198754";
                          circleBg = "#198754";
                          circleClr = "#fff";
                        }
                        if (isWrongSelect) {
                          optBg = "#fde8ea";
                          optBorder = "#dc3545";
                          circleBg = "#dc3545";
                          circleClr = "#fff";
                        }

                        return (
                          <div className="col-6" key={optIdx}>
                            <div
                              style={{
                                padding: "6px 10px",
                                borderRadius: "8px",
                                border: `1px solid ${optBorder}`,
                                background: optBg,
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontSize: "13px",
                              }}
                            >
                              <span
                                style={{
                                  width: 22,
                                  height: 22,
                                  borderRadius: "50%",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  flexShrink: 0,
                                  background: circleBg,
                                  color: circleClr,
                                }}
                              >
                                {optionLabels[optIdx]}
                              </span>
                              <span style={{ flex: 1 }}>{option}</span>
                              {isCorrectOpt && isSelectedOpt && (
                                <span
                                  style={{
                                    fontSize: "11px",
                                    color: "#198754",
                                    fontWeight: "700",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  ✓ Your Answer
                                </span>
                              )}
                              {isCorrectOpt && !isSelectedOpt && (
                                <span
                                  style={{
                                    fontSize: "11px",
                                    color: "#198754",
                                    fontWeight: "700",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  ✓ Correct
                                </span>
                              )}
                              {isWrongSelect && (
                                <span
                                  style={{
                                    fontSize: "11px",
                                    color: "#dc3545",
                                    fontWeight: "700",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  ✗ Your Answer
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Skipped note */}
                    {isSkipped && (
                      <p
                        className="text-muted mt-2 mb-0"
                        style={{ fontSize: "13px" }}
                      >
                        <i>This question was not attempted.</i>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default AttemptsResultsProfile;
