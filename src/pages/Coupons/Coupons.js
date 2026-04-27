import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";

import Table from "../../components/Table";
// import Button from "../components/Button";
import Modal from "../../components/Modal";

import CouponsForm from "../../forms/Coupons/CouponsForm";

import {
  addCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
} from "../../services/authService";

import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import CommonHeader from "../../components/CommonHeader";

const Coupons = () => {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const [couponList, setCouponList] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCoupons = useCallback(
    async (page = 1, limit = pageLimit) => {
      setIsLoading(true);
      try {
        const res = await getCoupons(page, limit);
        setCouponList(res.data || []);
        setTotalPages(res.totalPages || 1);
      } catch (err) {
        Swal.fire("Error", "Failed to fetch coupons", "error");
        setCouponList([]);
        setTotalPages(1);
      }finally {
    setIsLoading(false);    
  }
    },
    [pageLimit]
  );

  useEffect(() => {
    fetchCoupons(currentPage, pageLimit);
  }, [currentPage, pageLimit, fetchCoupons]);

  const handleView = (item, index) => {
    setSelectedCoupon({
      ...item,
      serial: (currentPage - 1) * pageLimit + index + 1,
    });
    setViewOpen(true);
  };

  const handleEdit = (item, index) => {
    setSelectedCoupon({
      ...item,
      serial: (currentPage - 1) * pageLimit + index + 1,
    });
    setEditOpen(true);
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This coupon will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteCoupon(item.couponId);

      fetchCoupons(currentPage, pageLimit);

      Swal.fire({
        title: "Deleted!",
        text: "Coupon removed successfully",
        icon: "success",
        toast: true,
        position: "top-end",
        timer: 4000,
        showConfirmButton: false,
        timerProgressBar: true,
        background: "#8f1e1e",
        color: "#ffffff",
      });
    } catch (err) {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedCoupon && editOpen) {
        formData.couponId = selectedCoupon.couponId;

        await updateCoupon(formData);

        setEditOpen(false);
        setSelectedCoupon(null);

        fetchCoupons(currentPage, pageLimit);

        Swal.fire({
          title: "Updated!",
          text: "Coupon updated successfully",
          icon: "success",
          toast: true,
          position: "top-end",
          timer: 5000,
          showConfirmButton: false,
          background: "#28a745",
          color: "#ffffff",
        });

        return;
      }

      await addCoupon(formData);

      setOpen(false);

      fetchCoupons(currentPage, pageLimit);

      Swal.fire({
        title: "Added!",
        text: "Coupon added successfully",
        icon: "success",
        toast: true,
        position: "top-end",
        timer: 5000,
        showConfirmButton: false,
        background: "#28a745",
        color: "#ffffff",
      });
    } catch (err) {
      Swal.fire("Error", "Operation failed", "error");
    }
  };

  const columns = [
    { header: "S.No", accessor: "serial" },
    { header: "Coupon Code", accessor: "coupon_code" },
    { header: "Offer Amount", accessor: "offer_amount" },
    { header: "Valid From", accessor: "valid_from" },
    { header: "Valid To", accessor: "valid_to" },
    { header: "Status", accessor: "status" },
    { header: "Actions", accessor: "actions" },
  ];

  const tableData = couponList.map((item, index) => ({
    ...item,
    serial: (currentPage - 1) * pageLimit + index + 1,
    valid_from: item.valid_from?.split("T")[0],
    valid_to: item.valid_to?.split("T")[0],

    actions: (
      <div className="actions d-flex">
        <button
          className="icon-btn view me-2"
          onClick={() => handleView(item, index)}
        >
          <FaEye />
        </button>

        <button
          className="icon-btn edit me-2"
          onClick={() => handleEdit(item, index)}
        >
          <FaEdit />
        </button>

        <button
          className="icon-btn delete"
          onClick={() => handleDelete(item)}
        >
          <FaTrash />
        </button>
      </div>
    ),
  }));

  return (
    <div>
      <CommonHeader
        title="COUPONS LIST"
        count={couponList.length}
        totalPages={totalPages}
        pageLimit={pageLimit}
        setPageLimit={setPageLimit}
        setCurrentPage={setCurrentPage}
        onChange={fetchCoupons}
        buttonText="+ Add Coupon"
        buttonColor="secondary"
        onButtonClick={() => setOpen(true)}
      />

      <Table
        columns={columns}
        data={tableData}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        isLoading={isLoading}
        
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Add Coupon" size="lg">
        <CouponsForm onClose={() => setOpen(false)} onSubmit={handleSubmit} />
      </Modal>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Coupon"
      >
        <CouponsForm
          isEdit
          initialData={selectedCoupon}
          onClose={() => setEditOpen(false)}
          onSubmit={handleSubmit}
        />
      </Modal>

      <Modal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title="Coupon Details"
      >
        {selectedCoupon && (
          <div>
            <p>
              <b>Coupon Code:</b> {selectedCoupon.coupon_code}
            </p>
            <p>
              <b>Offer Amount:</b> {selectedCoupon.offer_amount}
            </p>
            <p>
              <b>Valid From:</b> {selectedCoupon.valid_from}
            </p>
            <p>
              <b>Valid To:</b> {selectedCoupon.valid_to}
            </p>
            <p>
              <b>Status:</b> {selectedCoupon.status}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Coupons;
