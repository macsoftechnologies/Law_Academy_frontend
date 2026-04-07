import React, { useEffect, useState } from "react";
import "../forms/form.css";

const TEST_TYPE_OPTIONS = [
  { value: "QZ",  label: "Quiz",              icon: "❓" },
  { value: "GT",  label: "Grand Test",        icon: "🏆" },
  { value: "MT",  label: "Mains Test Series", icon: "📝" },
  { value: "SMT", label: "Subject Mock Test", icon: "📚" },
];

function TestTermsandConditionsForm({ onClose, initialData, isEdit, onSubmit }) {
  const [testType,        setTestType]        = useState("");
  const [termsConditions, setTermsConditions] = useState([""]);
  const [instructions,    setInstructions]    = useState([""]);

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
    setTestType(initialData.testType || "");
    const terms = Array.isArray(initialData.terms_conditions) ? initialData.terms_conditions : [];
    setTermsConditions(terms.length > 0 ? terms : [""]);
    const insts = Array.isArray(initialData.instructions) ? initialData.instructions : [];
    setInstructions(insts.length > 0 ? insts : [""]);
  }, [initialData, isEdit]);

  const addTerm    = ()         => setTermsConditions([...termsConditions, ""]);
  const removeTerm = (idx)      => setTermsConditions(termsConditions.filter((_, i) => i !== idx));
  const updateTerm = (idx, val) => setTermsConditions(termsConditions.map((t, i) => (i === idx ? val : t)));

  const addInstruction    = ()         => setInstructions([...instructions, ""]);
  const removeInstruction = (idx)      => setInstructions(instructions.filter((_, i) => i !== idx));
  const updateInstruction = (idx, val) => setInstructions(instructions.map((t, i) => (i === idx ? val : t)));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      testType,
      terms_conditions: termsConditions.filter((t) => t.trim() !== ""),
      instructions:     instructions.filter((t) => t.trim() !== ""),
    };
    if (isEdit && initialData?.test_term_id) {
      payload.test_term_id = initialData.test_term_id;
    }
    onSubmit(payload);
    onClose();
  };

  const selectedOption = TEST_TYPE_OPTIONS.find((o) => o.value === testType);

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="row">

        {/* ── Test Type Custom Dropdown ── */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Test Type</label>

          {/* Wrapper gives us the custom arrow */}
          <div style={{ position: "relative" }}>
            <select
              className="form-control"
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              disabled={isEdit}
              required
              style={{
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                paddingRight: "36px",          /* room for the arrow */
                cursor: isEdit ? "not-allowed" : "pointer",
                background: isEdit ? "#f5f5f5" : "#fff",
              }}
            >
              <option value="">Select Test Type</option>
              {TEST_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.icon}  {opt.value} — {opt.label}
                </option>
              ))}
            </select>

            {/* Custom arrow icon */}
            <span
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: isEdit ? "#aaa" : "#872026",
                fontSize: "16px",
                lineHeight: 1,
              }}
            >
              ▼
            </span>
          </div>

          {/* Hint when editing */}
          {isEdit && selectedOption && (
            <div className="mt-1" style={{ fontSize: "12px", color: "#6c757d" }}>
              {selectedOption.icon} {selectedOption.value} — {selectedOption.label}
              <span
                className="ms-2 badge"
                style={{ background: "#872026", color: "#fff", fontSize: "10px" }}
              >
                Cannot be changed
              </span>
            </div>
          )}
        </div>

        {/* ── Terms & Conditions ── */}
        <div className="col-md-12 mb-3">
          <div className="d-flex align-items-center mb-2 gap-2">
            <label className="form-label mb-0 fw-semibold">Terms &amp; Conditions</label>
            <button type="button" style={plusBtn} onClick={addTerm} title="Add Term">+</button>
          </div>
          {termsConditions.map((term, idx) => (
            <div key={idx} className="d-flex align-items-center mb-2 gap-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder={`Term ${idx + 1}`}
                value={term}
                onChange={(e) => updateTerm(idx, e.target.value)}
                required
              />
              {termsConditions.length > 1 && (
                <button type="button" style={minusBtn} onClick={() => removeTerm(idx)} title="Remove term">−</button>
              )}
            </div>
          ))}
        </div>

        {/* ── Instructions ── */}
        <div className="col-md-12 mb-3">
          <div className="d-flex align-items-center mb-2 gap-2">
            <label className="form-label mb-0 fw-semibold">Instructions</label>
            <button type="button" style={plusBtn} onClick={addInstruction} title="Add Instruction">+</button>
          </div>
          {instructions.map((inst, idx) => (
            <div key={idx} className="d-flex align-items-center mb-2 gap-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder={`Instruction ${idx + 1}`}
                value={inst}
                onChange={(e) => updateInstruction(idx, e.target.value)}
                required
              />
              {instructions.length > 1 && (
                <button type="button" style={minusBtn} onClick={() => removeInstruction(idx)} title="Remove instruction">−</button>
              )}
            </div>
          ))}
        </div>

      </div>

      <div className="text-end mt-3">
        <button type="button" className="btn btn-secondary me-2" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-success">
          {isEdit ? "Update Test Term" : "Add Test Term"}
        </button>
      </div>
    </form>
  );
}

export default TestTermsandConditionsForm;