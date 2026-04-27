import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { addQuiz, getPrelims } from "../../services/authService";

const QuizzesForm = ({ onClose, onSubmit }) => {
  const [prelims, setPrelims] = useState([]);

  const [prelimsId, setPrelimsId] = useState("");
  const [testNumber, setTestNumber] = useState("");
  const [title, setTitle] = useState("");
  const [noOfQos, setNoOfQos] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchPrelims = useCallback(async () => {
    try {
      const res = await getPrelims(1, 1000);
      setPrelims(res.data || []);
    } catch (err) {
      console.error("Failed to fetch prelims", err);
    }
  }, []);

  useEffect(() => {
    fetchPrelims();
  }, [fetchPrelims]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      prelimes_id: prelimsId,
      test_type: "QZ",
      test_number: testNumber,
      title,
      no_of_qos: noOfQos,
      duration,
    };

    try {
      setLoading(true);
      const response = await addQuiz(payload);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: response.message || "Quiz added successfully",
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
            className="form-control"
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

        {/* Title */}
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

        {/* No. of Questions */}
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

        {/* Duration */}
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
            value="QZ"
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

export default QuizzesForm;