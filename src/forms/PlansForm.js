import React, { useEffect, useState } from "react";
import "../forms/form.css";

function PlansForm({ onClose, initialData, isEdit, onSubmit }) {
  const [originalPrice, setOriginalPrice] = useState("");
  const [strikePrice, setStrikePrice] = useState("");
  const [durationValue, setDurationValue] = useState("");
  const [durationUnit, setDurationUnit] = useState("years");
  const [handlingFee, setHandlingFee] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [courseType, setCourseType] = useState("course");
  const [courseId, setCourseId] = useState("");

  useEffect(() => {
    if (isEdit && initialData) {
      setOriginalPrice(initialData.original_price || "");
      setStrikePrice(initialData.strike_price || "");
      setHandlingFee(initialData.handling_fee || "");
      setDiscountPercent(initialData.discount_percent || "");
      setCourseType(initialData.course_type || "course");
      setCourseId(initialData.course_id || "");

      if (initialData.duration) {
        const [value, unit] = initialData.duration.split(" ");
        setDurationValue(value || "");
        setDurationUnit(unit || "years");
      }
    }
  }, [initialData, isEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      original_price: originalPrice,
      strike_price: strikePrice,
      duration: `${durationValue} ${durationUnit}`,
      handling_fee: handlingFee,
      discount_percent: discountPercent,
      course_type: courseType,
      course_id: courseId,
    };

    if (isEdit && initialData?.planId) {
      payload.planId = initialData.planId;
    }

    onSubmit(payload);
    onClose();
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="row">

        <div className="col-md-6 mb-3">
          <label className="form-label">Original Price</label>
          <input
            type="number"
            className="form-control"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            required
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Strike Price</label>
          <input
            type="number"
            className="form-control"
            value={strikePrice}
            onChange={(e) => setStrikePrice(e.target.value)}
            required
          />
        </div>

        {/* Duration */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Duration</label>
          <input
            type="number"
            className="form-control"
            value={durationValue}
            onChange={(e) => setDurationValue(e.target.value)}
            required
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Unit</label>
          <select
            className="form-select"
            value={durationUnit}
            onChange={(e) => setDurationUnit(e.target.value)}
          >
            <option value="months">Months</option>
            <option value="years">Years</option>
          </select>
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Handling Fee (%)</label>
          <input
            type="number"
            className="form-control"
            value={handlingFee}
            onChange={(e) => setHandlingFee(e.target.value)}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Discount (%)</label>
          <input
            type="number"
            className="form-control"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Course Type</label>
          <select
            className="form-select"
            value={courseType}
            onChange={(e) => setCourseType(e.target.value)}
          >
            <option value="course">Course</option>
            <option value="program">Program</option>
          </select>
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Course ID</label>
          <input
            className="form-control"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            required
          />
        </div>

      </div>

      <div className="text-end mt-3">
        <button type="button" className="btn btn-secondary me-2" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-success">
          {isEdit ? "Update Plan" : "Add Plan"}
        </button>
      </div>
    </form>
  );
}

export default PlansForm;
