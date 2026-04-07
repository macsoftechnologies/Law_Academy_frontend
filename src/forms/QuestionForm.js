import React, { useEffect, useState } from "react";
import "../forms/form.css";

function QuestionForm({ onClose, initialData, isEdit, onSubmit, prelimes_test_id }) {
  const [questionNumber, setQuestionNumber] = useState("");
  const [question,       setQuestion]       = useState("");
  const [option1,        setOption1]        = useState("");
  const [option2,        setOption2]        = useState("");
  const [option3,        setOption3]        = useState("");
  const [option4,        setOption4]        = useState("");
  const [correctAnswer,  setCorrectAnswer]  = useState("");
  const [marks,          setMarks]          = useState(1);
  const [summary,        setSummary]        = useState([""]);

  const plusBtn = {
    border: "none", background: "none", color: "#28a745",
    fontWeight: "bold", fontSize: "20px", cursor: "pointer", lineHeight: 1, padding: "0 4px",
  };
  const minusBtn = {
    border: "none", background: "none", color: "#dc3545",
    fontWeight: "bold", fontSize: "20px", cursor: "pointer", lineHeight: 1, padding: "0 4px",
  };

  useEffect(() => {
    if (!isEdit || !initialData) return;
    setQuestionNumber(initialData.question_number ?? "");
    setQuestion(initialData.question || "");
    const opts = initialData.options || [];
    setOption1(opts[0] || "");
    setOption2(opts[1] || "");
    setOption3(opts[2] || "");
    setOption4(opts[3] || "");
    setCorrectAnswer(initialData.correctAnswer ?? "");
    setMarks(initialData.marks ?? 1);
    const sum = Array.isArray(initialData.summary) ? initialData.summary : [];
    setSummary(sum.length > 0 ? sum : [""]);
  }, [initialData, isEdit]);

  const addSummary    = ()         => setSummary([...summary, ""]);
  const removeSummary = (idx)      => setSummary(summary.filter((_, i) => i !== idx));
  const updateSummary = (idx, val) => setSummary(summary.map((s, i) => (i === idx ? val : s)));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      prelimes_test_id,
      question_number: Number(questionNumber),
      question,
      options: [option1, option2, option3, option4],
      correctAnswer: Number(correctAnswer),
      marks: Number(marks),
      summary: summary.filter((s) => s.trim() !== ""),
    };
    if (isEdit && initialData?.questionId) {
      payload.questionId = initialData.questionId;
    }
    onSubmit(payload);
    onClose();
  };

  const correctOptions = [
    { value: 0, label: "Option A" },
    { value: 1, label: "Option B" },
    { value: 2, label: "Option C" },
    { value: 3, label: "Option D" },
  ];

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="row">

        {/* ── Question Number ── */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Question Number</label>
          <input
            type="number"
            className="form-control"
            placeholder="e.g. 1"
            value={questionNumber}
            min={1}
            onChange={(e) => setQuestionNumber(e.target.value)}
            required
          />
        </div>

        {/* ── Marks ── */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Marks</label>
          <input
            type="number"
            className="form-control"
            placeholder="Marks"
            value={marks}
            min={1}
            onChange={(e) => setMarks(e.target.value)}
            required
          />
        </div>

        {/* ── Question ── */}
        <div className="col-md-12 mb-3">
          <label className="form-label">Question</label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Enter question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
        </div>

        {/* ── Options (fixed 4) ── */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Option A</label>
          <input
            type="text"
            className="form-control"
            placeholder="Option A"
            value={option1}
            onChange={(e) => setOption1(e.target.value)}
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Option B</label>
          <input
            type="text"
            className="form-control"
            placeholder="Option B"
            value={option2}
            onChange={(e) => setOption2(e.target.value)}
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Option C</label>
          <input
            type="text"
            className="form-control"
            placeholder="Option C"
            value={option3}
            onChange={(e) => setOption3(e.target.value)}
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Option D</label>
          <input
            type="text"
            className="form-control"
            placeholder="Option D"
            value={option4}
            onChange={(e) => setOption4(e.target.value)}
            required
          />
        </div>

        {/* ── Correct Answer ── */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Correct Answer</label>
          <div style={{ position: "relative" }}>
            <select
              className="form-control"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              required
              style={{
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                paddingRight: "36px",
                cursor: "pointer",
              }}
            >
              <option value="">Select Correct Answer</option>
              {correctOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span
              style={{
                position: "absolute", right: "12px", top: "50%",
                transform: "translateY(-50%)", pointerEvents: "none",
                color: "#872026", fontSize: "16px", lineHeight: 1,
              }}
            >
              ▼
            </span>
          </div>
        </div>

        {/* ── Summary (dynamic +/-) ── */}
        <div className="col-md-12 mb-3">
          <div className="d-flex align-items-center mb-2 gap-2">
            <label className="form-label mb-0 fw-semibold">Summary</label>
            <button type="button" style={plusBtn} onClick={addSummary} title="Add Summary">+</button>
          </div>
          {summary.map((s, idx) => (
            <div key={idx} className="d-flex align-items-center mb-2 gap-2">
              <textarea
                className="form-control form-control-sm"
                rows={2}
                placeholder={`Summary ${idx + 1}`}
                value={s}
                onChange={(e) => updateSummary(idx, e.target.value)}
              />
              {summary.length > 1 && (
                <button type="button" style={minusBtn} onClick={() => removeSummary(idx)} title="Remove">−</button>
              )}
            </div>
          ))}
        </div>

      </div>

      <div className="text-end mt-3">
        <button type="button" className="btn btn-secondary me-2" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-success">
          {isEdit ? "Update Question" : "Add Question"}
        </button>
      </div>
    </form>
  );
}

export default QuestionForm;