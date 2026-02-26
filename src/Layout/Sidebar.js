import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  MdDashboard,
  MdKeyboardArrowDown,
  MdRadioButtonUnchecked,
  MdCategory,
  MdMenuBook,
  MdSchool,
  MdOutlineGavel,
} from "react-icons/md";

import {
  FaUserShield,
  FaUserGraduate,
  FaFileAlt,
  FaChalkboardTeacher,
  FaClipboardList,
  FaImages,
  FaGavel,
  FaTrophy,
  FaTasks,
  FaTags,
} from "react-icons/fa";

import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ sidebarOpen }) => {
  const { pathname } = useLocation();

  const [openCombo, setOpenCombo] = useState(false);
  const [openPrelims, setOpenPrelims] = useState(false);
  const [openMains, setOpenMains] = useState(false);
  const [openNotes, setOpenNotes] = useState(false);

  const role = localStorage.getItem("role");
  const accessModules = JSON.parse(
    localStorage.getItem("access_modules") || "[]"
  );

  const isSuperAdmin = role === "superadmin";

  const canAccess = useCallback(
    (module) => isSuperAdmin || accessModules.includes(module),
    [isSuperAdmin, accessModules]
  );

  const hasComboAccess = useMemo(
    () => isSuperAdmin || canAccess("courescombo") || canAccess("npmcombo"),
    [isSuperAdmin, canAccess]
  );

  const hasPrelimsAccess = useMemo(
    () =>
      isSuperAdmin ||
      canAccess("prelims") ||
      canAccess("pyqpaper") ||
      canAccess("swmockstests") ||
      canAccess("grandtests") ||
      canAccess("quizzes"),
    [isSuperAdmin, canAccess]
  );

  const hasMainsAccess = useMemo(
    () =>
      isSuperAdmin ||
      canAccess("mains")   ||
      canAccess("mainsqa") ||
      canAccess("manisessaytrans") ||
      canAccess("testseries"),
    [isSuperAdmin, canAccess]
  );

  const hasNotesAccess = useMemo(
    () =>
      isSuperAdmin ||
      canAccess("notes") ||
      canAccess("subjectnotes") ||
      canAccess("printednotesorders"),
    [isSuperAdmin, canAccess]
  );

  useEffect(() => {
    setOpenCombo(
      hasComboAccess &&
        (pathname.includes("courescombo") || pathname.includes("npmcombo"))
    );
    setOpenPrelims(
      hasPrelimsAccess &&
        ( pathname.includes("prelims") ||
          pathname.includes("pyqpaper") ||
          pathname.includes("swmockstests") ||
          pathname.includes("grandtests") ||
          pathname.includes("quizzes"))
    );
    setOpenMains(
      hasMainsAccess &&
        ( pathname.includes("mains") ||
          pathname.includes("mainsqa") ||
          pathname.includes("manisessaytrans") ||
          pathname.includes("testseries"))
    );
    setOpenNotes(
      hasNotesAccess &&
        (pathname.includes("notes") ||
          pathname.includes("subjectnotes") ||
          pathname.includes("printednotesorders"))
    );
  }, [pathname, hasComboAccess, hasPrelimsAccess, hasMainsAccess, hasNotesAccess]);

  // Active class helper for NavLinks that have child routes
  const studentNavClass = ({ isActive }) =>
    isActive || pathname.startsWith("/student/") ? "active" : "";

  return (
    <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <div className="law-brand">Rao's Law Academy</div>
      </div>

      <ul className="sidebar-menu">
        {(role === "admin" || isSuperAdmin) && (
          <li className="menu-item">
            <NavLink to="dashboard">
              <MdDashboard className="menu-icon" />
              Dashboard
            </NavLink>
          </li>
        )}

        {canAccess("admins") && (
          <li className="menu-item">
            <NavLink to="admins">
              <FaUserShield className="menu-icon" />
              Admins
            </NavLink>
          </li>
        )}

        {canAccess("students") && (
          <li className="menu-item">
            <NavLink to="students" className={studentNavClass}>
              <FaUserGraduate className="menu-icon" />
              Students
            </NavLink>
          </li>
        )}

        {canAccess("student_requests") && (
          <li className="menu-item">
            <NavLink to="studentrequests">
              <FaGavel className="menu-icon" />
              Student Requests
            </NavLink>
          </li>
        )}

        {canAccess("categories") && (
          <li className="menu-item">
            <NavLink to="categories">
              <MdCategory className="menu-icon" />
              Categories
            </NavLink>
          </li>
        )}

        {canAccess("subcategories") && (
          <li className="menu-item">
            <NavLink to="subcategories">
              <MdCategory className="menu-icon" />
              Sub-Categories
            </NavLink>
          </li>
        )}

        {canAccess("laws") && (
          <li className="menu-item">
            <NavLink to="laws">
              <MdOutlineGavel className="menu-icon" />
              Laws
            </NavLink>
          </li>
        )}

        {canAccess("subjects") && (
          <li className="menu-item">
            <NavLink to="subjects">
              <MdMenuBook className="menu-icon" />
              Subjects
            </NavLink>
          </li>
        )}

        {canAccess("lectures") && (
          <li className="menu-item">
            <NavLink to="lectures">
              <FaChalkboardTeacher className="menu-icon" />
              Lectures
            </NavLink>
          </li>
        )}

        {canAccess("gestlectures") && (
          <li className="menu-item">
            <NavLink to="gestlectures">
              <FaClipboardList className="menu-icon" />
              Guest Lectures
            </NavLink>
          </li>
        )}

        {canAccess("plans") && (
          <li className="menu-item">
            <NavLink to="plans">
              <FaTasks className="menu-icon" />
              Plans
            </NavLink>
          </li>
        )}

        {canAccess("coupons") && (
          <li className="menu-item">
            <NavLink to="coupons">
              <FaTags className="menu-icon" />
              Coupons
            </NavLink>
          </li>
        )}

        {/* ================= NOTES ================= */}
        {hasNotesAccess && (
          <>
            <li className="menu-item dropdown">
              <div
                className="dropdown-toggle"
                onClick={() => setOpenNotes(!openNotes)}
              >
                <FaFileAlt className="menu-icon toggle-space" />
                Notes
                <MdKeyboardArrowDown
                  className={`arrow-icon ${openNotes ? "rotate" : ""}`}
                />
              </div>
            </li>

            {openNotes && (
              <>
                {canAccess("notes") && (
                  <li className="menu-item subitem">
                    <NavLink to="notes">
                      <MdRadioButtonUnchecked className="menu-icon" />
                      Notes
                    </NavLink>
                  </li>
                )}
                {canAccess("subjectnotes") && (
                  <li className="menu-item subitem">
                    <NavLink to="subjectnotes">
                      <MdRadioButtonUnchecked className="menu-icon" />
                      Subject Notes
                    </NavLink>
                  </li>
                )}
                {canAccess("printednotesorders") && (
                  <li className="menu-item subitem">
                    <NavLink to="printednotesorders">
                      <MdRadioButtonUnchecked className="menu-icon" />
                      Printed Notes Orders
                    </NavLink>
                  </li>
                )}
              </>
            )}
          </>
        )}

        {/* ================= COMBINATION ================= */}
        {hasComboAccess && (
          <>
            <li className="menu-item dropdown">
              <div
                className="dropdown-toggle"
                onClick={() => setOpenCombo(!openCombo)}
              >
                <MdSchool className="menu-icon toggle-space" />
                Combination
                <MdKeyboardArrowDown
                  className={`arrow-icon ${openCombo ? "rotate" : ""}`}
                />
              </div>
            </li>

            {openCombo && (
              <>
                {canAccess("courescombo") && (
                  <li className="menu-item subitem">
                    <NavLink to="courescombo">
                      <MdRadioButtonUnchecked className="menu-icon" />
                      Course Combo
                    </NavLink>
                  </li>
                )}
                {canAccess("npmcombo") && (
                  <li className="menu-item subitem">
                    <NavLink to="npmcombo">
                      <MdRadioButtonUnchecked className="menu-icon" />
                      Notes / Prelims / Mains
                    </NavLink>
                  </li>
                )}
              </>
            )}
          </>
        )}

        {/* ================= PRELIMS ================= */}
        {hasPrelimsAccess && (
          <>
            <li className="menu-item dropdown">
              <div
                className="dropdown-toggle"
                onClick={() => setOpenPrelims(!openPrelims)}
              >
                <FaClipboardList className="menu-icon toggle-space" />
                Prelims
                <MdKeyboardArrowDown
                  className={`arrow-icon ${openPrelims ? "rotate" : ""}`}
                />
              </div>
            </li>

            {openPrelims && (
              <>
                {canAccess("prelims") && (
                  <li className="menu-item subitem">
                    <NavLink to="prelims">
                      <MdRadioButtonUnchecked className="menu-icon" />
                      Prelims
                    </NavLink>
                  </li>
                )}
                {canAccess("pyqpaper") && (
                  <li className="menu-item subitem">
                    <NavLink to="pyqpaper">
                      <MdRadioButtonUnchecked className="menu-icon" />
                      PYQ Papers
                    </NavLink>
                  </li>
                )}
                {canAccess("swmockstests") && (
                  <li className="menu-item subitem">
                    <NavLink to="swmockstests">
                      <MdRadioButtonUnchecked className="menu-icon" />
                      SW Mock Tests
                    </NavLink>
                  </li>
                )}
                {canAccess("grandtests") && (
                  <li className="menu-item subitem">
                    <NavLink to="grandtests">
                      <MdRadioButtonUnchecked className="menu-icon" />
                      Grand Tests
                    </NavLink>
                  </li>
                )}
                {canAccess("quizzes") && (
                  <li className="menu-item subitem">
                    <NavLink to="quizzes">
                      <MdRadioButtonUnchecked className="menu-icon" />
                      Quizzes
                    </NavLink>
                  </li>
                )}
              </>
            )}
          </>
        )}

        {/* ================= MAINS ================= */}
        {hasMainsAccess && (
          <>
            <li className="menu-item dropdown">
              <div
                className="dropdown-toggle"
                onClick={() => setOpenMains(!openMains)}
              >
                <MdMenuBook className="menu-icon toggle-space" />
                Mains
                <MdKeyboardArrowDown
                  className={`arrow-icon ${openMains ? "rotate" : ""}`}
                />
              </div>
            </li>

            {openMains && (
              <>
                {canAccess("mains") && (
                  <li className="menu-item subitem">
                    <NavLink to="mains">
                      <MdRadioButtonUnchecked className="menu-icon" />
                      Mains
                    </NavLink>
                  </li>
                )}
                {canAccess("mainsqa") && (
                  <li className="menu-item subitem">
                    <NavLink to="mainsqa">
                      <MdRadioButtonUnchecked className="menu-icon" />
                      Mains Q & A
                    </NavLink>
                  </li>
                )}
                {canAccess("manisessaytrans") && (
                  <li className="menu-item subitem">
                    <NavLink to="manisessaytrans">
                      <MdRadioButtonUnchecked className="menu-icon" />
                      Essay & Translation
                    </NavLink>
                  </li>
                )}
                {canAccess("testseries") && (
                  <li className="menu-item subitem">
                    <NavLink to="testseries">
                      <MdRadioButtonUnchecked className="menu-icon" />
                      Test Series
                    </NavLink>
                  </li>
                )}
              </>
            )}
          </>
        )}

        {canAccess("banners") && (
          <li className="menu-item">
            <NavLink to="banners">
              <FaImages className="menu-icon" />
              Banners
            </NavLink>
          </li>
        )}

        {canAccess("results") && (
          <li className="menu-item">
            <NavLink to="results">
              <FaTrophy className="menu-icon" />
              Results
            </NavLink>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;