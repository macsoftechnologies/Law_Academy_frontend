import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import {
  addPrelimesSubjectWiseTests,
  getPrelims,
  getMockTestSubject,
} from "../services/authService";

const PrelimsSWMockTestsForm = ({ onClose, onSubmit }) => {
  const [prelims, setPrelims] = useState([]);
  const [mockTestSubjects, setMockTestSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);

  const [prelimsId, setPrelimsId] = useState("");
  const [mocktestSubjectId, setMocktestSubjectId] = useState("");
  const [testNumber, setTestNumber] = useState("");
  const [title, setTitle] = useState("");
  const [noOfQos, setNoOfQos] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch all prelims and mock test subjects on mount
  const fetchPrelims = useCallback(async () => {
    try {
      const res = await getPrelims(1, 1000);
      return res.data || [];
    } catch (err) {
      console.error("Failed to fetch prelims", err);
      return [];
    }
  }, []);

  const fetchMockTestSubjects = useCallback(async () => {
    try {
      const res = await getMockTestSubject(1, 1000);
      return res.data || [];
    } catch (err) {
      console.error("Failed to fetch mock test subjects", err);
      return [];
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const [prelimsList, subjectsList] = await Promise.all([
        fetchPrelims(),
        fetchMockTestSubjects(),
      ]);
      setPrelims(prelimsList);
      setMockTestSubjects(subjectsList);
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When prelims changes — filter mock test subjects by matching prelimes_id
  useEffect(() => {
    if (prelimsId && mockTestSubjects.length > 0) {
      const matched = mockTestSubjects.filter(
        (s) => s.prelimes_id === prelimsId
      );
      setFilteredSubjects(matched.length > 0 ? matched : mockTestSubjects);
      setMocktestSubjectId("");
      setTitle("");
      setNoOfQos("");
      setDuration("");
    } else {
      setFilteredSubjects([]);
    }
  }, [prelimsId, mockTestSubjects]);

  // When mocktest subject changes — auto-fill title, no_of_qos, duration
  useEffect(() => {
    if (mocktestSubjectId && filteredSubjects.length > 0) {
      const found = filteredSubjects.find(
        (s) => s.mocktest_subject_id === mocktestSubjectId
      );
      if (found) {
        setTitle(found.title || "");
        setNoOfQos(found.no_of_qos || "");
        setDuration(found.duration || "");
      }
    }
  }, [mocktestSubjectId, filteredSubjects]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      prelimes_id: prelimsId,
      mocktest_subject_id: mocktestSubjectId,
      test_type: "SMT",
      test_number: testNumber,
      title,
      no_of_qos: noOfQos,
      duration,
    };

    try {
      setLoading(true);
      const response = await addPrelimesSubjectWiseTests(payload);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: response.message || "Added successfully",
        showConfirmButton: false,
        timer: 6000,
        timerProgressBar: true,
        color: "#ffffff",
        background: "#35a542",
      });

      onSubmit();
      onClose();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Save failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="row">

        {/* Prelims Dropdown */}
        <div className="col-md-6 mb-3">
          <label>Prelims</label>
          <select
            style={{ cursor: "pointer" }}
            className="form-control form-select"
            value={prelimsId}
            onChange={(e) => setPrelimsId(e.target.value)}
            required
          >
            <option value="">Select Prelims</option>
            {prelims.map((p) => (
              <option key={p.prelimes_id || p._id} value={p.prelimes_id || p._id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        {/* Mock Test Subject Dropdown */}
        <div className="col-md-6 mb-3">
          <label>Mock Test Subject</label>
          <select
            style={{ cursor: "pointer" }}
            className="form-control form-select"
            value={mocktestSubjectId}
            onChange={(e) => setMocktestSubjectId(e.target.value)}
            disabled={!prelimsId}
            required
          >
            <option value="">
              {prelimsId ? "Select Mock Test Subject" : "Select Prelims first"}
            </option>
            {filteredSubjects.map((s) => (
              <option key={s.mocktest_subject_id} value={s.mocktest_subject_id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

        {/* Test Number */}
        <div className="col-md-6 mb-3">
          <label>Test Number</label>
          <input
            type="number"
            className="form-control"
            value={testNumber}
            onChange={(e) => setTestNumber(e.target.value)}
            required
            min={1}
          />
        </div>

        {/* Title — auto-filled from subject */}
        <div className="col-md-6 mb-3">
          <label>Title</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* No. of Questions — auto-filled */}
        <div className="col-md-6 mb-3">
          <label>No. of Questions</label>
          <input
            type="number"
            className="form-control"
            value={noOfQos}
            onChange={(e) => setNoOfQos(e.target.value)}
            required
            min={1}
          />
        </div>

        {/* Duration — auto-filled */}
        <div className="col-md-6 mb-3">
          <label>Duration (mins)</label>
          <input
            type="number"
            className="form-control"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            min={1}
          />
        </div>

        {/* Test Type — fixed, read-only */}
        <div className="col-md-6 mb-3">
          <label>Test Type</label>
          <input
            type="text"
            className="form-control"
            value="SMT"
            readOnly
            style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
          />
        </div>

      </div>

      <div className="text-end">
        <button
          type="button"
          className="btn btn-secondary me-2"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};

export default PrelimsSWMockTestsForm;