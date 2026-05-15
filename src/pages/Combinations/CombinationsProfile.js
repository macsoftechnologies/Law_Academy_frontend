import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCombinationsById } from "../../services/authService";

const BASE = process.env.REACT_APP_API_BASE_URL;
const getImageUrl = (filename) => (filename ? `${BASE}/${filename}` : "");

function CombinationProfile() {
  const { combo_id } = useParams();
  const navigate = useNavigate();

  const [combo, setCombo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageModal, setImageModal] = useState({ open: false, src: "" });

  const openImageModal = (src) => setImageModal({ open: true, src });
  const closeImageModal = () => setImageModal({ open: false, src: "" });

  useEffect(() => {
    if (!combo_id) return;
    const fetchCombo = async () => {
      setIsLoading(true);
      try {
        const res = await getCombinationsById(combo_id);
        const data = res?.data || res;
        setCombo(data);
      } catch (error) {
        console.error("Fetch Combo Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCombo();
  }, [combo_id]);

  if (isLoading || !combo) {
    return (
      <div className="p-3 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Loading combination profile...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-3 px-3 px-md-4">

      {/* ── PAGE HEADER ── */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h2 className="mb-0" style={{ fontSize: "clamp(1.1rem, 3vw, 1.5rem)", fontWeight: 700 }}>
          COMBINATION PROFILE
        </h2>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate("/combinations")}>
          ← Back
        </button>
      </div>

      {/* ── BASIC DETAILS CARD ── */}
      <div className="card p-3 shadow-sm mb-4">
        <h5 className="fw-bold mb-3">Basic Details</h5>

        <div className="row align-items-start">
          {/* Presentation image */}
          {combo.presentation_image && (
            <div className="col-12 col-md-4 mb-3 text-center text-md-start">
              <img
                src={getImageUrl(combo.presentation_image)}
                alt="Combination"
                style={{
                  width: "100%",
                  maxWidth: "220px",
                  height: "140px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                  cursor: "pointer",
                }}
                onClick={() => openImageModal(getImageUrl(combo.presentation_image))}
              />
            </div>
          )}

          {/* First Details Column */}
          <div className="col-12 col-md-4 mb-3">
            <p className="mb-1"><b>Title:</b> {combo.title || "N/A"}</p>
            <p className="mb-1">
              <b>Status:</b>{" "}
              {combo.isActive ? (
                <span className="badge bg-success ms-1">Active</span>
              ) : (
                <span className="badge bg-danger ms-1">Inactive</span>
              )}
            </p>
            <p className="mb-1">
              <b>Created:</b>{" "}
              <span style={{ fontSize: "13px" }}>
                {combo.createdAt ? new Date(combo.createdAt).toLocaleString() : "N/A"}
              </span>
            </p>
            <p className="mb-1">
              <b>Updated:</b>{" "}
              <span style={{ fontSize: "13px" }}>
                {combo.updatedAt ? new Date(combo.updatedAt).toLocaleString() : "N/A"}
              </span>
            </p>
          </div>

          {/* Second Details Column */}
          <div className="col-12 col-md-4 mb-3">
            <p className="mb-1">
              <b>Lectures:</b>{" "}
              {combo.includes_lectures ? (
                <span className="badge bg-success ms-1">Yes</span>
              ) : (
                <span className="badge bg-secondary ms-1">No</span>
              )}
            </p>
            <p className="mb-1">
              <b>Notes:</b>{" "}
              {combo.includes_notes ? (
                <span className="badge bg-success ms-1">Yes</span>
              ) : (
                <span className="badge bg-secondary ms-1">No</span>
              )}
            </p>
            <p className="mb-1">
              <b>Prelims:</b>{" "}
              {combo.includes_prelimes ? (
                <span className="badge bg-success ms-1">Yes</span>
              ) : (
                <span className="badge bg-secondary ms-1">No</span>
              )}
            </p>
            <p className="mb-1">
              <b>Mains:</b>{" "}
              {combo.includes_mains ? (
                <span className="badge bg-success ms-1">Yes</span>
              ) : (
                <span className="badge bg-secondary ms-1">No</span>
              )}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="row mt-2">
          <div className="col-12">
            <p className="mb-1"><b>Description:</b></p>
            <p style={{ fontSize: "13px", color: "#555", whiteSpace: "pre-line", margin: 0, lineHeight: "1.7" }}>
              {combo.description || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* ── LAWS & SUBJECTS ── */}
      {combo.laws?.length > 0 && (
        <div className="card p-3 shadow-sm mb-4">
          <h5 className="fw-bold mb-3">Laws &amp; Subjects</h5>

          {combo.laws.map((law) => (
            <div key={law.lawId} className="mb-4">

              {/* Law header bar */}
              <div
                className="d-flex align-items-center gap-3 mb-3"
                style={{
                  background: "#f0f4ff",
                  borderRadius: "12px",
                  padding: "10px 16px",
                  borderLeft: "4px solid #0d6efd",
                }}
              >
                {law.law_image && (
                  <img
                    src={getImageUrl(law.law_image)}
                    alt={law.title}
                    style={{
                      width: "52px", height: "40px", objectFit: "cover",
                      borderRadius: "8px", cursor: "pointer", flexShrink: 0,
                    }}
                    onClick={() => openImageModal(getImageUrl(law.law_image))}
                  />
                )}
                <div>
                  <h6 className="mb-0 fw-bold">{law.title}</h6>
                  <small className="text-muted">
                    {law.subjects_count} subject{law.subjects_count !== 1 ? "s" : ""}
                  </small>
                </div>
              </div>

              {/* Subject cards grid */}
              <div className="row g-3">
                {law.subjects?.map((subject) => (
                  <div className="col-12 col-md-6 col-xl-4" key={subject.subjectId}>
                    <div style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "14px",
                      background: "#fff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      overflow: "hidden",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}>

                      {/* Subject header */}
                      <div className="d-flex align-items-center gap-3 p-3 pb-2">
                        {subject.subject_image ? (
                          <img
                            src={getImageUrl(subject.subject_image)}
                            alt={subject.title}
                            style={{
                              width: "58px", height: "48px", objectFit: "cover",
                              borderRadius: "10px", flexShrink: 0, cursor: "pointer",
                            }}
                            onClick={() => openImageModal(getImageUrl(subject.subject_image))}
                          />
                        ) : (
                          <div style={{
                            width: "58px", height: "48px", borderRadius: "10px",
                            background: "#eef4ff", display: "flex",
                            alignItems: "center", justifyContent: "center",
                            fontSize: "22px", flexShrink: 0,
                          }}>
                            📘
                          </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <h6 className="fw-bold mb-1" style={{ fontSize: "13px", lineHeight: "1.3", margin: 0 }}>
                            {subject.title}
                          </h6>
                          <div className="d-flex gap-1 flex-wrap mt-1">
                            <span className="badge bg-primary" style={{ fontSize: "10px" }}>
                              {subject.lectures?.length || 0} Lecture{subject.lectures?.length !== 1 ? "s" : ""}
                            </span>
                            <span className="badge bg-warning text-dark" style={{ fontSize: "10px" }}>
                              {subject.notes?.length || 0} Note{subject.notes?.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </div>

                      <hr className="my-0 mx-3" style={{ borderColor: "#f0f0f0" }} />

                      <div className="p-3 pt-2" style={{ flex: 1 }}>

                        {/* LECTURES */}
                        {subject.lectures?.length > 0 && (
                          <div className="mb-2">
                            <small className="d-block mb-2" style={{ fontWeight: 700, color: "#888", fontSize: "10px", letterSpacing: "0.06em" }}>
                              LECTURES
                            </small>
                            {subject.lectures.map((lec, i) => (
                              <div
                                key={lec._id}
                                className="d-flex align-items-start gap-2 mb-2 p-2"
                                style={{ background: "#f0f4ff", borderRadius: "8px" }}
                              >
                                <span style={{
                                  minWidth: "20px", height: "20px", borderRadius: "50%",
                                  background: "#0d6efd", color: "#fff",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: "10px", fontWeight: 700, flexShrink: 0, marginTop: "2px",
                                }}>
                                  {i + 1}
                                </span>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <p className="mb-0 fw-semibold" style={{ fontSize: "12px", lineHeight: "1.4" }}>
                                    {lec.title}
                                  </p>
                                  {lec.description && (
                                    <p className="mb-1 text-muted" style={{
                                      fontSize: "11px",
                                      overflow: "hidden",
                                      display: "-webkit-box",
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: "vertical",
                                    }}>
                                      {lec.description}
                                    </p>
                                  )}
                                  {lec.video_url && (
                                    <a
                                      href={lec.video_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="btn btn-outline-primary btn-sm"
                                      style={{ fontSize: "10px", padding: "1px 8px" }}
                                    >
                                      ▶ Watch
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* NOTES */}
                        {subject.notes?.length > 0 && (
                          <div>
                            <small className="d-block mb-2" style={{ fontWeight: 700, color: "#888", fontSize: "10px", letterSpacing: "0.06em" }}>
                              NOTES
                            </small>
                            {subject.notes.map((note) => (
                              <div
                                key={note._id}
                                className="d-flex align-items-center gap-2 mb-2 p-2"
                                style={{ background: "rgb(255 172 45 / 12%)", borderRadius: "8px" }}
                              >
                                {note.presentation_image ? (
                                  <img
                                    src={getImageUrl(note.presentation_image)}
                                    alt="note"
                                    style={{
                                      width: "34px", height: "34px", objectFit: "cover",
                                      borderRadius: "6px", cursor: "pointer", flexShrink: 0,
                                    }}
                                    onClick={() => openImageModal(getImageUrl(note.presentation_image))}
                                  />
                                ) : (
                                  <div style={{
                                    width: "34px", height: "34px", borderRadius: "6px",
                                    background: "#ffd97a", display: "flex",
                                    alignItems: "center", justifyContent: "center",
                                    fontSize: "16px", flexShrink: 0,
                                  }}>
                                    📄
                                  </div>
                                )}
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <p className="mb-0 fw-semibold" style={{ fontSize: "12px", lineHeight: "1.3" }}>
                                    {note.title}
                                  </p>
                                  <span className={`badge ${note.isLocked ? "bg-danger" : "bg-success"}`} style={{ fontSize: "10px" }}>
                                    {note.isLocked ? "🔒 Locked" : "🔓 Free"}
                                  </span>
                                </div>
                                {note.pdf_url && (
                                  <a
                                    href={note.pdf_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-outline-warning btn-sm ms-auto"
                                    style={{ fontSize: "10px", padding: "2px 8px", flexShrink: 0 }}
                                  >
                                    PDF
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {!subject.lectures?.length && !subject.notes?.length && (
                          <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
                            No lectures or notes available.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ── IMAGE FULLSCREEN MODAL ── */}
      {imageModal.open && (
        <div
          onClick={closeImageModal}
          style={{
            position: "fixed", top: 0, left: 0,
            width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.78)",
            display: "flex", justifyContent: "center", alignItems: "center",
            zIndex: 9999, cursor: "pointer",
          }}
        >
          <img
            src={imageModal.src}
            alt="Full View"
            style={{
              maxWidth: "92%", maxHeight: "90%",
              borderRadius: "12px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
            }}
          />
        </div>
      )}

      {/* ── PRELIMS DETAILS ── */}
      {combo.prelimes_details?.length > 0 && (
        <div className="card p-3 shadow-sm mb-4">
          <h5 className="fw-bold mb-3">
            <span style={{ color: "#0d6efd" }}>📝</span> Prelims Details
          </h5>
          <div className="row g-3">
            {combo.prelimes_details.map((prelim) => (
              <div className="col-12 col-md-6" key={prelim.prelimes_id}>
                <div style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "14px",
                  background: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  overflow: "hidden",
                }}>
                  {/* Header with image + title */}
                  <div
                    className="d-flex align-items-center gap-3 p-3"
                    style={{ background: "#eef4ff", borderBottom: "1px solid #e0e9ff" }}
                  >
                    {prelim.presentation_image ? (
                      <img
                        src={getImageUrl(prelim.presentation_image)}
                        alt={prelim.title}
                        style={{
                          width: "64px", height: "52px", objectFit: "cover",
                          borderRadius: "10px", flexShrink: 0, cursor: "pointer",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                        }}
                        onClick={() => openImageModal(getImageUrl(prelim.presentation_image))}
                      />
                    ) : (
                      <div style={{
                        width: "64px", height: "52px", borderRadius: "10px",
                        background: "#cfe2ff", display: "flex",
                        alignItems: "center", justifyContent: "center", fontSize: "26px", flexShrink: 0,
                      }}>
                        📝
                      </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <h6 className="fw-bold mb-0" style={{ fontSize: "14px", lineHeight: "1.3" }}>
                        {prelim.title}
                      </h6>
                      {prelim.sub_title && (
                        <small className="text-muted">{prelim.sub_title}</small>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-3">
                    {prelim.about_course && (
                      <div className="mb-3">
                        <p className="mb-1" style={{ fontSize: "12px", fontWeight: 700, color: "#888", letterSpacing: "0.05em" }}>
                          ABOUT COURSE
                        </p>
                        <p style={{ fontSize: "13px", color: "#444", margin: 0, lineHeight: "1.6" }}>
                          {prelim.about_course}
                        </p>
                      </div>
                    )}

                    {prelim.course_points?.length > 0 && (
                      <div className="mb-3">
                        <p className="mb-2" style={{ fontSize: "12px", fontWeight: 700, color: "#888", letterSpacing: "0.05em" }}>
                          COURSE HIGHLIGHTS
                        </p>
                        <div className="d-flex flex-wrap gap-2">
                          {prelim.course_points.map((point, i) => (
                            <span
                              key={i}
                              className="badge"
                              style={{
                                background: "#eef4ff", color: "#0d6efd",
                                border: "1px solid #cfe2ff",
                                fontSize: "12px", padding: "5px 10px", fontWeight: 500,
                              }}
                            >
                              ✓ {point}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {prelim.terms_conditions && (
                      <div>
                        <p className="mb-1" style={{ fontSize: "12px", fontWeight: 700, color: "#888", letterSpacing: "0.05em" }}>
                          TERMS & CONDITIONS
                        </p>
                        <p style={{
                          fontSize: "12px", color: "#666", margin: 0,
                          lineHeight: "1.7", whiteSpace: "pre-line",
                          background: "#fffbf0", borderRadius: "8px",
                          padding: "8px 12px", border: "1px solid #ffe69c",
                        }}>
                          {prelim.terms_conditions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MAINS DETAILS ── */}
      {combo.mains_details?.length > 0 && (
        <div className="card p-3 shadow-sm mb-4">
          <h5 className="fw-bold mb-3">
            <span style={{ color: "#198754" }}>📋</span> Mains Details
          </h5>
          <div className="row g-3">
            {combo.mains_details.map((main) => (
              <div className="col-12 col-md-6" key={main.mains_id}>
                <div style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "14px",
                  background: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  overflow: "hidden",
                }}>
                  {/* Header with image + title */}
                  <div
                    className="d-flex align-items-center gap-3 p-3"
                    style={{ background: "#f0fff4", borderBottom: "1px solid #d1f0de" }}
                  >
                    {main.presentation_image ? (
                      <img
                        src={getImageUrl(main.presentation_image)}
                        alt={main.title}
                        style={{
                          width: "64px", height: "52px", objectFit: "cover",
                          borderRadius: "10px", flexShrink: 0, cursor: "pointer",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                        }}
                        onClick={() => openImageModal(getImageUrl(main.presentation_image))}
                      />
                    ) : (
                      <div style={{
                        width: "64px", height: "52px", borderRadius: "10px",
                        background: "#d1e7dd", display: "flex",
                        alignItems: "center", justifyContent: "center", fontSize: "26px", flexShrink: 0,
                      }}>
                        📋
                      </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <h6 className="fw-bold mb-0" style={{ fontSize: "14px", lineHeight: "1.3" }}>
                        {main.title}
                      </h6>
                      {main.sub_title && (
                        <small className="text-muted">{main.sub_title}</small>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-3">
                    {main.about_course && (
                      <div className="mb-3">
                        <p className="mb-1" style={{ fontSize: "12px", fontWeight: 700, color: "#888", letterSpacing: "0.05em" }}>
                          ABOUT COURSE
                        </p>
                        <p style={{ fontSize: "13px", color: "#444", margin: 0, lineHeight: "1.6" }}>
                          {main.about_course}
                        </p>
                      </div>
                    )}

                    {main.course_points?.length > 0 && (
                      <div className="mb-3">
                        <p className="mb-2" style={{ fontSize: "12px", fontWeight: 700, color: "#888", letterSpacing: "0.05em" }}>
                          COURSE HIGHLIGHTS
                        </p>
                        <div className="d-flex flex-wrap gap-2">
                          {main.course_points.map((point, i) => (
                            <span
                              key={i}
                              className="badge"
                              style={{
                                background: "#f0fff4", color: "#198754",
                                border: "1px solid #d1e7dd",
                                fontSize: "12px", padding: "5px 10px", fontWeight: 500,
                              }}
                            >
                              ✓ {point}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {main.terms_conditions && (
                      <div>
                        <p className="mb-1" style={{ fontSize: "12px", fontWeight: 700, color: "#888", letterSpacing: "0.05em" }}>
                          TERMS & CONDITIONS
                        </p>
                        <p style={{
                          fontSize: "12px", color: "#666", margin: 0,
                          lineHeight: "1.7", whiteSpace: "pre-line",
                          background: "#fffbf0", borderRadius: "8px",
                          padding: "8px 12px", border: "1px solid #ffe69c",
                        }}>
                          {main.terms_conditions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CombinationProfile;