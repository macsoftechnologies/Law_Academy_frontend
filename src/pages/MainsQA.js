import React, { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";

import Table from "../components/Table";
// import Button from "../components/Button";
import Modal from "../components/Modal";

import MainsQAForm from "../forms/MainsQAForm";

import {
  addQA,
  updateQA,
  deleteQA,
  getQAById,
  getMains,
} from "../services/authService";

import api from "../services/api";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import CommonHeader from "../components/CommonHeader";

const MainsQA = () => {
  const [open, setOpen]               = useState(false);
  const [editOpen, setEditOpen]       = useState(false);
  const [viewOpen, setViewOpen]       = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedQA, setSelectedQA]     = useState(null);
  const [qaList, setQAList]             = useState([]);
  const [mainsNameMap, setMainsNameMap] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [pageLimit, setPageLimit]     = useState(10);

  const mainsMapRef = useRef({});

  const loadAllQA = async (page = 1, limit = 10) => {
    setIsLoading(true);
    try {
      const res   = await api.post(
        `/qa/module/userId?page=${page}&limit=${limit}`,
        { module: "mains", module_type: "MQA" }
      );
      const json  = res.data;
      const data  = json.data       || [];
      const total = json.totalCount || data.length;

      setQAList(data);
      setTotalPages(Math.max(1, Math.ceil(total / limit)));
      setCurrentPage(page);
    } catch (err) {
      console.error("loadAllQA error:", err);
      setQAList([]);
      setTotalPages(1);
    } finally {
    setIsLoading(false);
  }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const res  = await getMains(1, 10);
        const list = res.data || [];
        const map  = {};
        list.forEach((m) => { map[m.mains_id] = m.title; });
        mainsMapRef.current = map;
        setMainsNameMap(map);
      } catch (err) {
        console.error("getMains error:", err);
      }
      await loadAllQA(1, 10);
    };
    init();
  }, []); 

  const handlePageChange = async (page) => {
    await loadAllQA(page, pageLimit);
  };

  const handleLimitChange = async (limit) => {
    setPageLimit(limit);
    await loadAllQA(1, limit);
  };

  const getMainsTitle = (module_id) => {
    if (!module_id) return "-";
    return mainsMapRef.current[module_id] || mainsNameMap[module_id] || module_id;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric", month: "short", day: "2-digit",
    });
  };

  const handleView = async (item, index) => {
    setViewOpen(true);
    setViewLoading(true);
    setSelectedQA(null);
    try {
      const res = await getQAById(item.qa_id);
      const d   = Array.isArray(res.data) ? res.data[0] : res.data || {};
      setSelectedQA({ ...d, serial: (currentPage - 1) * pageLimit + index + 1 });
    } catch (err) {
      setSelectedQA({ ...item, serial: (currentPage - 1) * pageLimit + index + 1 });
    } finally {
      setViewLoading(false);
    }
  };

  const handleEdit = (item, index) => {
    setSelectedQA({ ...item, serial: (currentPage - 1) * pageLimit + index + 1 });
    setEditOpen(true);
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This QA record will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteQA({ qa_id: item.qa_id });
      await loadAllQA(currentPage, pageLimit);
      Swal.fire({
        title: "Deleted!", text: "QA removed successfully", icon: "success",
        toast: true, position: "top-end", timer: 4000,
        showConfirmButton: false, timerProgressBar: true,
        background: "#8f1e1e", color: "#ffffff",
      });
    } catch (err) {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedQA && editOpen) {
        await updateQA(formData);
        setEditOpen(false);
        setSelectedQA(null);
        await loadAllQA(currentPage, pageLimit);
        Swal.fire({
          title: "Updated!", text: "QA updated successfully", icon: "success",
          toast: true, position: "top-end", timer: 5000,
          showConfirmButton: false, background: "#28a745", color: "#ffffff",
        });
        return;
      }
      await addQA(formData);
      setOpen(false);
      await loadAllQA(1, pageLimit);
      Swal.fire({
        title: "Added!", text: "QA added successfully", icon: "success",
        toast: true, position: "top-end", timer: 5000,
        showConfirmButton: false, background: "#28a745", color: "#ffffff",
      });
    } catch (err) {
      Swal.fire("Error", "Operation failed", "error");
    }
  };

  const columns = [
    { header: "S.No",      accessor: "serial" },
    { header: "Title",     accessor: "title" },
    { header: "Mains",     accessor: "mainsTitle" },
    { header: "No. of Qs", accessor: "no_of_qs" },
    { header: "Duration",  accessor: "duration" },
    { header: "Actions",   accessor: "actions" },
  ];

  const tableData = qaList.map((item, index) => ({
    ...item,
    serial:     (currentPage - 1) * pageLimit + index + 1,
    mainsTitle: getMainsTitle(item.module_id),
    actions: (
      <div className="actions d-flex">
        <button className="icon-btn view me-2" onClick={() => handleView(item, index)}><FaEye /></button>
        <button className="icon-btn edit me-2" onClick={() => handleEdit(item, index)}><FaEdit /></button>
        <button className="icon-btn delete"    onClick={() => handleDelete(item)}><FaTrash /></button>
      </div>
    ),
  }));

  return (
    <div>
      <CommonHeader
        title="MAINS Q&A LIST"
        count={qaList.length}
        totalPages={totalPages}
        pageLimit={pageLimit}
        setPageLimit={(limit) => handleLimitChange(limit)}
        setCurrentPage={setCurrentPage}
        onChange={(page, limit) => loadAllQA(page, limit)}
        buttonText="+ Add QA"
        buttonColor="secondary"
        onButtonClick={() => setOpen(true)}
      />  

        <Table
          columns={columns}
          data={tableData}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />

      <Modal open={open} onClose={() => setOpen(false)} title="Add Mains QA" size="lg">
        <MainsQAForm onClose={() => setOpen(false)} onSubmit={handleSubmit} />
      </Modal>

      <Modal
        open={editOpen}
        onClose={() => { setEditOpen(false); setSelectedQA(null); }}
        title="Edit Mains QA"
        size="lg"
      >
        <MainsQAForm
          isEdit
          initialData={selectedQA}
          onClose={() => { setEditOpen(false); setSelectedQA(null); }}
          onSubmit={handleSubmit}
        />
      </Modal>

      <Modal
        open={viewOpen}
        onClose={() => { setViewOpen(false); setSelectedQA(null); }}
        title="Mains QA Details"
        size="lg"
      >
        {viewLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status" />
            <p className="mt-2 text-muted">Loading QA details...</p>
          </div>
        ) : selectedQA ? (
          <div className="container">

            <div className="row mb-3">
              <div className="col-md-6">
                <b>Title:</b>
                <div className="mt-1">{selectedQA.title || "N/A"}</div>
              </div>
              <div className="col-md-6">
                <b>No. of Questions:</b>
                <div className="mt-1">{selectedQA.no_of_qs || "N/A"}</div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <b>Mains Module:</b>
                <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                  {getMainsTitle(selectedQA.module_id)}
                </div>
              </div>
              <div className="col-md-6">
                <b>Duration:</b>
                <div className="mt-1">{selectedQA.duration || "N/A"}</div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <b>Presentation Image:</b>
                {selectedQA.presentation_image ? (
                  <div className="mt-2">
                    <img
                      src={`${process.env.REACT_APP_API_BASE_URL}/${selectedQA.presentation_image}`}
                      alt="Presentation"
                      style={{ maxHeight: "150px", borderRadius: "8px", border: "1px solid #ddd", maxWidth: "100%" }}
                    />
                  </div>
                ) : (
                  <p className="mt-1 text-muted">No Image</p>
                )}
              </div>
              <div className="col-md-6">
                <b>Module Type:</b>
                <div className="mt-1">{selectedQA.module_type || "N/A"}</div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <b>Created At:</b>
                <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                  {formatDate(selectedQA.createdAt)}
                </div>
              </div>
              <div className="col-md-6">
                <b>Updated At:</b>
                <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                  {formatDate(selectedQA.updatedAt)}
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-12">
                <b>Video URL:</b>
                <div className="mt-1">
                  {selectedQA.video_url ? (
                    <a href={selectedQA.video_url} target="_blank" rel="noreferrer"
                      style={{ fontSize: "13px", wordBreak: "break-all" }}>
                      {selectedQA.video_url}
                    </a>
                  ) : (
                    <span className="text-muted" style={{ fontSize: "13px" }}>N/A</span>
                  )}
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-12">
                <b>PDF URL:</b>
                <div className="mt-1">
                  {selectedQA.pdf_url ? (
                    <a href={selectedQA.pdf_url} target="_blank" rel="noreferrer"
                      style={{ fontSize: "13px", wordBreak: "break-all" }}>
                      {selectedQA.pdf_url}
                    </a>
                  ) : (
                    <span className="text-muted" style={{ fontSize: "13px" }}>N/A</span>
                  )}
                </div>
              </div>
            </div>

            <hr />
            <div className="text-end">
              <button
                className="btn btn-secondary"
                onClick={() => { setViewOpen(false); setSelectedQA(null); }}
              >
                Close
              </button>
            </div>

          </div>
        ) : (
          <p className="text-center text-muted py-4">No data available.</p>
        )}
      </Modal>
    </div>
  );
};

export default MainsQA;