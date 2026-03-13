import React, { useEffect, useState } from "react";
import "../forms/form.css";
import { getMainsSubjectTestsById } from "../services/authService";

function MainsSubjectTestForm({ onClose, initialData, isEdit, onSubmit, testSeriesList = [] }) {
  const [title,             setTitle]             = useState("");
  const [noOfQos,           setNoOfQos]           = useState("");
  const [durationValue,     setDurationValue]     = useState("");
  const [durationUnit,      setDurationUnit]      = useState("mins");
  const [marks,             setMarks]             = useState("");
  const [questionPaperFile, setQuestionPaperFile] = useState("");
  const [mainsTestId,       setMainsTestId]       = useState("");
  const [fetching,          setFetching]          = useState(false);

  const mainsSubjectTestId = initialData?.mains_subject_test_id;

  useEffect(() => {
    if (!isEdit || !mainsSubjectTestId) return;
    setFetching(true);
    getMainsSubjectTestsById(mainsSubjectTestId)
      .then((res) => {
        const d = Array.isArray(res.data) ? res.data[0] : res.data || {};
        setTitle(d.title || "");
        setNoOfQos(d.no_of_qos || "");
        setMarks(d.marks || "");
        setQuestionPaperFile(d.question_paper_file || "");
        if (d.duration) {
          const [val, unit] = d.duration.split(" ");
          setDurationValue(val || "");
          setDurationUnit(unit || "mins");
        }
        const mid = Array.isArray(d.mains_test_id)
          ? d.mains_test_id[0]?.mains_test_id || ""
          : d.mains_test_id || "";
        setMainsTestId(mid);
      })
      .catch(() => {
        setTitle(initialData?.title || "");
        setNoOfQos(initialData?.no_of_qos || "");
        setMarks(initialData?.marks || "");
        setQuestionPaperFile(initialData?.question_paper_file || "");
        if (initialData?.duration) {
          const [val, unit] = initialData.duration.split(" ");
          setDurationValue(val || "");
          setDurationUnit(unit || "mins");
        }
        const mid = Array.isArray(initialData?.mains_test_id)
          ? initialData?.mains_test_id[0]?.mains_test_id || ""
          : initialData?.mains_test_id || "";
        setMainsTestId(mid);
      })
      .finally(() => setFetching(false));
  }, [
    isEdit, mainsSubjectTestId,
    initialData?.title, initialData?.no_of_qos, initialData?.duration,
    initialData?.marks, initialData?.question_paper_file, initialData?.mains_test_id,
  ]);

  /* ── submit as plain JSON (no file upload needed) ── */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!mainsTestId)    { alert("Please select a Test Series"); return; }
    if (!durationValue)  { alert("Duration is required");        return; }

    const payload = {
      title:               title,
      no_of_qos:           noOfQos,
      duration:            `${durationValue} ${durationUnit}`,
      marks:               marks,
      question_paper_file: questionPaperFile,
      mains_test_id:       mainsTestId,
    };
    if (isEdit && mainsSubjectTestId)
      payload.mains_subject_test_id = mainsSubjectTestId;

    onSubmit(payload);
    onClose();
  };

  if (fetching) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status" />
        <div className="mt-2 text-muted">Loading subject test details...</div>
      </div>
    );
  }

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="row">

        <div className="col-md-6 mb-3">
          <label className="form-label">Title</label>
          <input
            type="text" className="form-control" value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter Title" required
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Test Series</label>
          <select
            className="form-control"
            style={{ cursor: isEdit ? "not-allowed" : "pointer" }}
            value={mainsTestId}
            onChange={(e) => setMainsTestId(e.target.value)}
            disabled={isEdit}
            required
          >
            <option value="">Select Test Series</option>
            {testSeriesList.map((t) => (
              <option key={t.mains_test_id} value={t.mains_test_id}>{t.title}</option>
            ))}
          </select>
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">No. of Questions</label>
          <input
            type="number" className="form-control" value={noOfQos}
            onChange={(e) => setNoOfQos(e.target.value)}
            placeholder="Enter No. of Questions" required min={1}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Marks</label>
          <input
            type="number" className="form-control" value={marks}
            onChange={(e) => setMarks(e.target.value)}
            placeholder="Enter Marks" required min={1}
          />
        </div>

        {/* ── Duration col-md-6 | Unit col-md-6 ── */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Duration</label>
          <input
            type="number" className="form-control"
            placeholder="e.g. 30"
            value={durationValue}
            onChange={(e) => setDurationValue(e.target.value)}
            required min={1}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Unit</label>
          <select
            className="form-select"
            value={durationUnit}
            onChange={(e) => setDurationUnit(e.target.value)}
          >
            <option value="mins">Minutes</option>
            <option value="hrs">Hours</option>
          </select>
        </div>

        <div className="col-md-12 mb-3">
          <label className="form-label">Question Paper Link</label>
          <input
            type="url" className="form-control" value={questionPaperFile}
            onChange={(e) => setQuestionPaperFile(e.target.value)}
            placeholder="Enter Question Paper URL" required
          />
        </div>

      </div>

      <div className="text-end mt-3">
        <button type="button" className="btn btn-secondary me-2" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-success">
          {isEdit ? "Update Subject Test" : "Add Subject Test"}
        </button>
      </div>
    </form>
  );
}

export default MainsSubjectTestForm;