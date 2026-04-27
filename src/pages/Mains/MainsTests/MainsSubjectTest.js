import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";

import Table  from "../../../components/Table";
// import Button from "../components/Button";
import Modal  from "../../../components/Modal";

import MainsSubjectTestForm from "../../../forms/Mains/MainsTests/MainsSubjectTestForm";

import {
  addMainsSubjectTests,
  getMainsSubjectTests,
  updateMainsSubjectTests,
  deleteMainsSubjectTests,
  getMainsSubjectTestsById,
  getMainsTestSeries,
  getMains,
} from "../../../services/authService";

import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import CommonHeader from "../../../components/CommonHeader";

const MainsSubjectTest = () => {
  const [open,        setOpen]        = useState(false);
  const [editOpen,    setEditOpen]    = useState(false);
  const [viewOpen,    setViewOpen]    = useState(false);
  const [viewLoading, setViewLoading] = useState(false);

  const [selectedTest,    setSelectedTest]    = useState(null);
  const [subjectTestList, setSubjectTestList] = useState([]);
  const [allSubjectTests, setAllSubjectTests] = useState([]);
  const [testSeriesMap,   setTestSeriesMap]   = useState({});
  const [testSeriesList,  setTestSeriesList]  = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [pageLimit,   setPageLimit]   = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadTestSeries = async () => {
      setIsLoading(true);
      try {
        const mainsRes  = await getMains(1, 10);
        const mainsList = mainsRes.data || [];

        const results = await Promise.all(
          mainsList.map((m) =>
            getMainsTestSeries(1, 10, m.mains_id).catch(() => ({ data: [] }))
          )
        );
        const allSeries = results.flatMap((r) => r.data || []);
        const map = {};
        allSeries.forEach((t) => { map[t.mains_test_id] = t.title; });
        setTestSeriesList(allSeries);
        setTestSeriesMap(map);
      } catch {
        setTestSeriesList([]);
        setTestSeriesMap({});
      }finally {
    setIsLoading(false);
  }
    };
    loadTestSeries();
  }, []);

  const dedupe = (list) => {
    const seen = new Set();
    return list.filter((item) => {
      if (!item.mains_subject_test_id) return true;
      if (seen.has(item.mains_subject_test_id)) return false;
      seen.add(item.mains_subject_test_id);
      return true;
    });
  };

  const loadAll = useCallback(async (seriesList = testSeriesList) => {
    try {
      const allRes  = await getMainsSubjectTests(1, 10).catch(() => ({ data: [] }));
      const allData = allRes.data || [];

      // also fetch per test series (in case backend requires mains_test_id)
      const perSeries = seriesList.length
        ? await Promise.all(
            seriesList.map((t) =>
              getMainsSubjectTests(1, 10, t.mains_test_id).catch(() => ({ data: [] }))
            )
          )
        : [];
      const seriesData = perSeries.flatMap((r) => r.data || []);

      // merge both, deduplicate
      const merged = dedupe([...allData, ...seriesData]);
      setAllSubjectTests(merged);
    } catch {
      Swal.fire("Error", "Failed to fetch subject tests", "error");
      setAllSubjectTests([]);
    }
  }, [testSeriesList]);

  useEffect(() => {
    loadAll(testSeriesList);
  }, [testSeriesList, loadAll]);

  useEffect(() => {
    const total = allSubjectTests.length;
    const pages = Math.ceil(total / pageLimit) || 1;
    const start = (currentPage - 1) * pageLimit;
    setSubjectTestList(allSubjectTests.slice(start, start + pageLimit));
    setTotalPages(pages);
  }, [allSubjectTests, currentPage, pageLimit]);

  const getTestSeriesTitle = (mains_test_id) => {
    if (Array.isArray(mains_test_id) && mains_test_id.length > 0) {
      const first = mains_test_id[0];
      if (typeof first === "object" && first !== null) return first.title || "-";
      return testSeriesMap[first] || first || "-";
    }
    if (typeof mains_test_id === "object" && mains_test_id !== null) return mains_test_id.title || "-";
    if (typeof mains_test_id === "string" && mains_test_id) return testSeriesMap[mains_test_id] || mains_test_id;
    return "-";
  };

  const refresh = useCallback(async () => {
    setCurrentPage(1);
    await loadAll(testSeriesList);
  }, [loadAll, testSeriesList]);

  const handleView = async (item, index) => {
    setViewOpen(true);
    setViewLoading(true);
    setSelectedTest(null);
    try {
      const res = await getMainsSubjectTestsById(item.mains_subject_test_id);
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
      text: "This subject test record will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteMainsSubjectTests({ mains_subject_test_id: item.mains_subject_test_id });
      await refresh();
      Swal.fire({
        title: "Deleted!", text: "Subject test removed successfully", icon: "success",
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
        await updateMainsSubjectTests(formData);
        setEditOpen(false);
        setSelectedTest(null);
        await refresh();
        Swal.fire({
          title: "Updated!", text: "Subject test updated successfully", icon: "success",
          toast: true, position: "top-end", timer: 5000,
          showConfirmButton: false, background: "#28a745", color: "#ffffff",
        });
        return;
      }
      await addMainsSubjectTests(formData);
      setOpen(false);
      await refresh();
      Swal.fire({
        title: "Added!", text: "Subject test added successfully", icon: "success",
        toast: true, position: "top-end", timer: 5000,
        showConfirmButton: false, background: "#28a745", color: "#ffffff",
      });
    } catch {
      Swal.fire("Error", "Operation failed", "error");
    }
  };

  const columns = [
    { header: "S.No",        accessor: "serial"          },
    { header: "Title",       accessor: "title"           },
    { header: "No of Qs",    accessor: "no_of_qos"       },
    { header: "Duration",    accessor: "duration"        },
    { header: "Marks",       accessor: "marks"           },
    { header: "Test Series", accessor: "testSeriesTitle" },
    { header: "Actions",     accessor: "actions"         },
  ];

  const tableData = subjectTestList.map((item, index) => ({
    ...item,
    serial:          (currentPage - 1) * pageLimit + index + 1,
    testSeriesTitle: getTestSeriesTitle(item.mains_test_id),
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
        title="MAINS SUBJECT TEST LIST"
        count={allSubjectTests.length}
        totalPages={totalPages}
        pageLimit={pageLimit}
        setPageLimit={(limit) => {
          setPageLimit(limit);
          setCurrentPage(1);
        }}
        setCurrentPage={setCurrentPage}
        onChange={(page, limit) => {
          setCurrentPage(page);
          setPageLimit(limit);
        }}
        buttonText="+ Add Subject Test"
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
      <Modal open={open} onClose={() => setOpen(false)} title="Add Mains Subject Test" size="lg">
        <MainsSubjectTestForm
          onClose={() => setOpen(false)}
          onSubmit={handleSubmit}
          testSeriesList={testSeriesList}
        />
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal
        open={editOpen}
        onClose={() => { setEditOpen(false); setSelectedTest(null); }}
        title="Edit Mains Subject Test"
        size="lg"
      >
        <MainsSubjectTestForm
          isEdit
          initialData={selectedTest}
          onClose={() => { setEditOpen(false); setSelectedTest(null); }}
          onSubmit={handleSubmit}
          testSeriesList={testSeriesList}
        />
      </Modal>

      {/* ── View Modal ── */}
      <Modal
        open={viewOpen}
        onClose={() => { setViewOpen(false); setSelectedTest(null); }}
        title="Mains Subject Test Details"
        size="lg"
      >
        {viewLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status" />
            <p className="mt-2 text-muted">Loading details...</p>
          </div>
        ) : selectedTest ? (
          <div className="container">

            {/* ── Subject Test Info ── */}
            <div className="row mb-3">
              <div className="col-md-6">
                <b>Title:</b>
                <div className="mt-1">{selectedTest.title || "N/A"}</div>
              </div>
              <div className="col-md-6">
                <b>Test Series:</b>
                <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                  {getTestSeriesTitle(selectedTest.mains_test_id)}
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-4">
                <b>No. of Questions:</b>
                <div className="mt-1">{selectedTest.no_of_qos || "N/A"}</div>
              </div>
              <div className="col-md-4">
                <b>Duration:</b>
                <div className="mt-1">{selectedTest.duration || "N/A"}</div>
              </div>
              <div className="col-md-4">
                <b>Marks:</b>
                <div className="mt-1">{selectedTest.marks || "N/A"}</div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-12">
                <b>Question Paper Link:</b>
                <div className="mt-1">
                  {selectedTest.question_paper_file ? (
                    <a
                      href={selectedTest.question_paper_file}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#872026", wordBreak: "break-all", fontSize: "13px" }}
                    >
                      {selectedTest.question_paper_file}
                    </a>
                  ) : (
                    <span className="text-muted" style={{ fontSize: "13px" }}>N/A</span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Mains Test Series details (from populated mains_test_id) ── */}
            {Array.isArray(selectedTest.mains_test_id) && selectedTest.mains_test_id.length > 0 && (() => {
              const mt = selectedTest.mains_test_id[0];
              return (
                <>
                  <hr />
                  <h6 className="mb-3" style={{ color: "#2b377b", fontWeight: "bold" }}>
                    Mains Test Series Info
                  </h6>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <b>Mains Test Title:</b>
                      <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                        {mt.title || "N/A"}
                      </div>
                    </div>
                    <div className="col-md-3">
                      <b>No. of Questions:</b>
                      <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                        {mt.no_of_qs || "N/A"}
                      </div>
                    </div>
                    <div className="col-md-3">
                      <b>No. of Subjects:</b>
                      <div className="mt-1" style={{ fontSize: "13px", color: "#555" }}>
                        {mt.no_of_subjects || "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <b>Presentation Image:</b>
                      {mt.presentation_image ? (
                        <div className="mt-2">
                          <img
                            src={`${process.env.REACT_APP_API_BASE_URL}/${mt.presentation_image}`}
                            alt="Presentation"
                            style={{ maxHeight: "120px", borderRadius: "8px", border: "1px solid #ddd", maxWidth: "100%" }}
                          />
                        </div>
                      ) : (
                        <p className="mt-1 text-muted" style={{ fontSize: "13px" }}>No Image</p>
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
                        {mt.terms_conditions || "N/A"}
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}

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

export default MainsSubjectTest;