import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";

import Table  from "../../../components/Table";
// import Button from "../components/Button";
import Modal  from "../../../components/Modal";

import MainsTestSeriesForm from "../../../forms/Mains/MainsTests/MainsTestSeriesForm";

import {
  addMainsTestSeries,
  getMainsTestSeries,
  updateMainsTestSeries,
  deleteMainsTestSeries,
  getMainsTestSeriesById,
  getMains,
} from "../../../services/authService";

import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import CommonHeader from "../../../components/CommonHeader";

const MainsTestSeries = () => {
  const [open,        setOpen]        = useState(false);
  const [editOpen,    setEditOpen]    = useState(false);
  const [viewOpen,    setViewOpen]    = useState(false);
  const [viewLoading, setViewLoading] = useState(false);

  const [selectedTest, setSelectedTest] = useState(null);
  const [testList,     setTestList]     = useState([]);
  const [mainsNameMap, setMainsNameMap] = useState({});
  const [mainsList,    setMainsList]    = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [pageLimit,   setPageLimit]   = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  /* ── fetch mains list once ── */
  useEffect(() => {
    const fetchMainsList = async () => {
      setIsLoading(true);
      try {
        const res  = await getMains(1, 10);
        const list = res.data || [];
        const map  = {};
        list.forEach((m) => { map[m.mains_id] = m.title; });
        setMainsList(list);
        setMainsNameMap(map);
      } catch {
        setMainsList([]);
        setMainsNameMap({});
      }finally {
    setIsLoading(false);
  }
    };
    fetchMainsList();
  }, []);

  const fetchTests = useCallback(
    async (page = 1, limit = pageLimit, mainsData = mainsList) => {
      if (!mainsData.length) {
        setTestList([]);
        setTotalPages(1);
        return;
      }
      try {
        const results = await Promise.all(
          mainsData.map((m) =>
            getMainsTestSeries(1, 10, m.mains_id).catch(() => ({ data: [] }))
          )
        );
        const all = results.flatMap((r) => r.data || []);

        const total = all.length;
        const pages = Math.ceil(total / limit) || 1;
        const start = (page - 1) * limit;
        const slice = all.slice(start, start + limit);

        setTestList(slice);
        setTotalPages(pages);
      } catch {
        Swal.fire("Error", "Failed to fetch mains test series", "error");
        setTestList([]);
        setTotalPages(1);
      }
    },
    [pageLimit, mainsList]
  );

  useEffect(() => {
    if (mainsList.length > 0) {
      fetchTests(currentPage, pageLimit, mainsList);
    }
  }, [mainsList, currentPage, pageLimit, fetchTests]);

  /* ── helpers ── */
  const getMainsTitle = (mains_id) => {
    if (Array.isArray(mains_id) && mains_id.length > 0) {
      const first = mains_id[0];
      if (typeof first === "object" && first !== null) return first.title || "-";
      return mainsNameMap[first] || first || "-";
    }
    if (typeof mains_id === "object" && mains_id !== null) return mains_id.title || "-";
    if (typeof mains_id === "string" && mains_id) return mainsNameMap[mains_id] || mains_id;
    return "-";
  };



  /* ── actions ── */
  const handleView = async (item, index) => {
    setViewOpen(true);
    setViewLoading(true);
    setSelectedTest(null);
    try {
      const res = await getMainsTestSeriesById(item.mains_test_id);
      const d   = Array.isArray(res.data) ? res.data[0] : res.data || {};
      setSelectedTest({ ...d, serial: (currentPage - 1) * pageLimit + index + 1 });
    } catch {
      setSelectedTest({ ...item, serial: (currentPage - 1) * pageLimit + index + 1 });
    } finally {
      setViewLoading(false);
    }
  };

  const handleEdit = (item, index) => {
    setSelectedTest({ ...item, serial: (currentPage - 1) * pageLimit + index + 1 });
    setEditOpen(true);
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This test series record will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
    });
    if (!result.isConfirmed) return;

    try {
      await deleteMainsTestSeries({ mains_test_id: item.mains_test_id });
      fetchTests(currentPage, pageLimit, mainsList);
      Swal.fire({
        title: "Deleted!", text: "Test series removed successfully", icon: "success",
        toast: true, position: "top-end", timer: 4000,
        showConfirmButton: false, timerProgressBar: true,
        background: "#8f1e1e", color: "#ffffff",
      });
    } catch {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedTest && editOpen) {
        await updateMainsTestSeries(formData);
        setEditOpen(false);
        setSelectedTest(null);
        fetchTests(currentPage, pageLimit, mainsList);
        Swal.fire({
          title: "Updated!", text: "Test series updated successfully", icon: "success",
          toast: true, position: "top-end", timer: 5000,
          showConfirmButton: false, background: "#28a745", color: "#ffffff",
        });
        return;
      }
      await addMainsTestSeries(formData);
      setOpen(false);
      fetchTests(currentPage, pageLimit, mainsList);
      Swal.fire({
        title: "Added!", text: "Test series added successfully", icon: "success",
        toast: true, position: "top-end", timer: 5000,
        showConfirmButton: false, background: "#28a745", color: "#ffffff",
      });
    } catch {
      Swal.fire("Error", "Operation failed", "error");
    }
  };

  /* ── table ── */
  const columns = [
    { header: "S.No",        accessor: "serial"         },
    { header: "Title",       accessor: "title"          },
    { header: "No of Qs",    accessor: "no_of_qs"       },
    { header: "No of Subj.", accessor: "no_of_subjects" },
    { header: "Mains",       accessor: "mainsTitle"     },
    { header: "Actions",     accessor: "actions"        },
  ];

  const tableData = testList.map((item, index) => ({
    ...item,
    serial:     (currentPage - 1) * pageLimit + index + 1,
    mainsTitle: getMainsTitle(item.mains_id),
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
        title="MAINS TEST SERIES LIST"
          count={testList.length}
          totalPages={totalPages}
          pageLimit={pageLimit}
          setPageLimit={setPageLimit}
          setCurrentPage={setCurrentPage}
          onChange={(page, limit) => fetchTests(page, limit, mainsList)}
          buttonText="+ Add Test Series"
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

      {/* ── Add Modal ── */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Mains Test Series" size="lg">
        <MainsTestSeriesForm onClose={() => setOpen(false)} onSubmit={handleSubmit} />
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal
        open={editOpen}
        onClose={() => { setEditOpen(false); setSelectedTest(null); }}
        title="Edit Mains Test Series"
        size="lg"
      >
        <MainsTestSeriesForm
          isEdit
          initialData={selectedTest}
          onClose={() => { setEditOpen(false); setSelectedTest(null); }}
          onSubmit={handleSubmit}
        />
      </Modal>

      {/* ── View Modal ── */}
      <Modal
        open={viewOpen}
        onClose={() => { setViewOpen(false); setSelectedTest(null); }}
        title="Mains Test Series Details"
        size="lg"
      >
        {viewLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status" />
            <p className="mt-2 text-muted">Loading details...</p>
          </div>
        ) : selectedTest ? (
          <div className="container">

            <div className="row mb-3">
              <div className="col-md-6">
                <b>Title:</b>
                <div className="mt-1">{selectedTest.title || "N/A"}</div>
              </div>
              <div className="col-md-6">
                <b>Mains:</b>
                <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                  {getMainsTitle(selectedTest.mains_id)}
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <b>No. of Questions:</b>
                <div className="mt-1">{selectedTest.no_of_qs || "N/A"}</div>
              </div>
              <div className="col-md-6">
                <b>No. of Subjects:</b>
                <div className="mt-1">{selectedTest.no_of_subjects || "N/A"}</div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <b>Presentation Image:</b>
                {selectedTest.presentation_image ? (
                  <div className="mt-2">
                    <img
                      src={`${process.env.REACT_APP_API_BASE_URL}/${selectedTest.presentation_image}`}
                      alt="Presentation"
                      style={{ maxHeight: "150px", borderRadius: "8px", border: "1px solid #ddd", maxWidth: "100%" }}
                    />
                  </div>
                ) : (
                  <p className="mt-1 text-muted">No Image</p>
                )}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-12">
                <b>Terms &amp; Conditions:</b>
                <div
                  className="mt-1 p-2"
                  style={{
                    fontSize: "13px", whiteSpace: "pre-wrap",
                    background: "#f8f9fa", borderRadius: "6px", border: "1px solid #e9ecef",
                  }}
                >
                  {selectedTest.terms_conditions || "N/A"}
                </div>
              </div>
            </div>

            <hr />
            <div className="text-end">
              <button
                className="btn btn-secondary"
                onClick={() => { setViewOpen(false); setSelectedTest(null); }}
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

export default MainsTestSeries;