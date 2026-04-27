import React, { useEffect, useState } from "react";
import "../form.css";

function CouponsForm({ onClose, initialData, isEdit, onSubmit }) {
  const [couponCode, setCouponCode] = useState("");
  const [offerAmount, setOfferAmount] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [status, setStatus] = useState("Active");

  useEffect(() => {
    if (isEdit && initialData) {
      setCouponCode(initialData.coupon_code || "");
      setOfferAmount(initialData.offer_amount || "");
      setValidFrom(initialData.valid_from?.split("T")[0] || "");
      setValidTo(initialData.valid_to?.split("T")[0] || "");
      setStatus(initialData.status || "Active");
    }
  }, [isEdit, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    let finalStatus = status;

    if (isEdit) {
      const today = new Date().toISOString().split("T")[0];

      if (validTo < today) {
        finalStatus = "Inactive";
      }
    }

    const payload = {
      coupon_code: couponCode,
      offer_amount: offerAmount,
      valid_from: validFrom,
      valid_to: validTo,
      status: isEdit ? finalStatus : "Active",
    };

    if (isEdit && initialData?.couponId) {
      payload.couponId = initialData.couponId;
    }

    onSubmit(payload);
    onClose();
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Coupon Code</label>
          <input
            type="text"
            className="form-control"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Enter Coupon Code"
            required
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Offer Amount</label>
          <input
            type="number"
            className="form-control"
            value={offerAmount}
            onChange={(e) => setOfferAmount(e.target.value)}
            placeholder="Enter Offer Amount"
            required
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Valid From</label>
          <input
            type="date"
            className="form-control"
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
            required
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Valid To</label>
          <input
            type="date"
            className="form-control"
            value={validTo}
            onChange={(e) => setValidTo(e.target.value)}
            required
          />
        </div>

        {isEdit && (
          <div className="col-md-12 mb-3">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        )}
      </div>

      <div className="text-end mt-3">
        <button
          type="button"
          className="btn btn-secondary me-2"
          onClick={onClose}
        >
          Cancel
        </button>

        <button type="submit" className="btn btn-success">
          {isEdit ? "Update Coupon" : "Add Coupon"}
        </button>
      </div>
    </form>
  );
}

export default CouponsForm;
