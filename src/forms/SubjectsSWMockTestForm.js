import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import {
  addMockTestSubject,
  updateMockTestSubject,
  getPrelims,
  getLaws,
} from "../services/authService";

const SubjectsSWMockTestForm = ({ onClose, isEdit, initialData, onSubmit }) => {
  const [prelims, setPrelims] = useState([]);
  const [allLaws, setAllLaws] = useState([]);
  const [filteredLaws, setFilteredLaws] = useState([]);

  const [prelimsId, setPrelimsId] = useState("");
  const [lawId, setLawId] = useState("");
  const [prelimsLabel, setPrelimsLabel] = useState("");
  const [lawLabel, setLawLabel] = useState("");
  const [title, setTitle] = useState("");
  const [noOfQos, setNoOfQos] = useState("");
  const [duration, setDuration] = useState("");
  const [presentationImage, setPresentationImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPrelims = useCallback(async () => {
    try {
      const res = await getPrelims(1, 1000);
      return res.data || [];
    } catch (err) {
      console.error("Failed to fetch prelims", err);
      return [];
    }
  }, []);

  const fetchAllLaws = useCallback(async () => {
    try {
      const res = await getLaws(1, 1000);
      return res.data || [];
    } catch (err) {
      console.error("Failed to fetch laws", err);
      return [];
    }
  }, []);

  // On mount — load both lists, then resolve edit labels if isEdit
  useEffect(() => {
    const init = async () => {
      const [prelimsList, lawsList] = await Promise.all([
        fetchPrelims(),
        fetchAllLaws(),
      ]);
      setPrelims(prelimsList);
      setAllLaws(lawsList);

      if (isEdit && initialData) {
        setTitle(initialData.title || "");
        setNoOfQos(initialData.no_of_qos || "");
        setDuration(initialData.duration || "");

        // Handle both flat and nested prelims
        const pId =
          initialData.prelimes_id ||
          initialData.prelimes?.prelimes_id ||
          "";
        const lId =
          initialData.lawId ||
          initialData.law?.lawId ||
          "";

        setPrelimsId(pId);
        setLawId(lId);

        // Resolve prelims label — try nested first, then from list
        const prelimTitle = initialData.prelimes?.title || "";
        if (prelimTitle) {
          setPrelimsLabel(prelimTitle);
        } else {
          const foundPrelim = prelimsList.find(
            (p) => (p.prelimes_id || p._id) === pId
          );
          if (foundPrelim) setPrelimsLabel(foundPrelim.title || "");
        }

        // Resolve law label — try nested first, then from list
        const lawTitle = initialData.law?.title || "";
        if (lawTitle) {
          setLawLabel(lawTitle);
        } else {
          const foundLaw = lawsList.find((l) => l.lawId === lId);
          if (foundLaw) setLawLabel(foundLaw.title || "");
        }
      }
    };

    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When prelims changes in ADD mode — filter laws by matching subcategory_id
  useEffect(() => {
    if (!isEdit && prelimsId && prelims.length > 0 && allLaws.length > 0) {
      const selectedPrelim = prelims.find(
        (p) => (p.prelimes_id || p._id) === prelimsId
      );
      const subCatId =
        selectedPrelim?.subcategory_id?.[0]?.subcategory_id ||
        selectedPrelim?.subcategory_id ||
        null;

      if (subCatId) {
        const matched = allLaws.filter(
          (l) =>
            l.subcategory_id?.[0]?.subcategory_id === subCatId ||
            l.subcategory_id === subCatId
        );
        setFilteredLaws(matched.length > 0 ? matched : allLaws);
      } else {
        setFilteredLaws(allLaws);
      }
      setLawId("");
    }
  }, [prelimsId, prelims, allLaws, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("prelimes_id", prelimsId);
    formData.append("lawId", lawId);
    formData.append("title", title);
    formData.append("no_of_qos", noOfQos);
    formData.append("duration", duration);
    if (presentationImage) formData.append("presentation_image", presentationImage);

    try {
      setLoading(true);
      let response;

      if (isEdit) {
        formData.append("mocktest_subject_id", initialData.mocktest_subject_id);
        response = await updateMockTestSubject(formData);
      } else {
        response = await addMockTestSubject(formData);
      }

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: response.message || (isEdit ? "Updated successfully" : "Added successfully"),
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

        {/* Prelims */}
        <div className="col-md-6 mb-3">
          <label>Prelims</label>
          {isEdit ? (
            <input
              type="text"
              className="form-control"
              value={prelimsLabel}
              readOnly
              style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
            />
          ) : (
            <select
              style={{ cursor: "pointer" }}
              className="form-control"
              value={prelimsId}
              onChange={(e) => setPrelimsId(e.target.value)}
            >
              <option value="">Select Prelims</option>
              {prelims.map((p) => (
                <option key={p.prelimes_id || p._id} value={p.prelimes_id || p._id}>
                  {p.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Law */}
        <div className="col-md-6 mb-3">
          <label>Law</label>
          {isEdit ? (
            <input
              type="text"
              className="form-control"
              value={lawLabel}
              readOnly
              style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
            />
          ) : (
            <select
              style={{ cursor: "pointer" }}
              className="form-control"
              value={lawId}
              onChange={(e) => setLawId(e.target.value)}
              disabled={!prelimsId}
            >
              <option value="">
                {prelimsId ? "Select Law" : "Select Prelims first"}
              </option>
              {filteredLaws.map((l) => (
                <option key={l.lawId} value={l.lawId}>
                  {l.title}
                </option>
              ))}
            </select>
          )}
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

        {/* Presentation Image */}
        <div className="col-md-6 mb-3">
          <label>Presentation Image</label>
          {isEdit && initialData?.presentation_image && (
            <div className="mb-2">
              <img
                src={`${process.env.REACT_APP_API_BASE_URL}/${initialData.presentation_image}`}
                alt="Previous Presentation"
                style={{
                  height: "80px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                }}
              />
            </div>
          )}
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={(e) => setPresentationImage(e.target.files[0])}
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
          {loading ? "Saving..." : isEdit ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
};

export default SubjectsSWMockTestForm;