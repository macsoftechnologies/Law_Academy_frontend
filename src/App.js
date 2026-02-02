import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

/* Public Pages */
import Login from "./pages/Login";
import AdminForgotPassword from "./pages/AdminForgotPassword";
import Home from "./pages/Home";

/* Protected Pages */
import Dashboard from "./pages/Dashboard";
import Admins from "./pages/Admins";
import Students from "./pages/Students";
import Categories from "./pages/Categories";
import SubCategories from "./pages/SubCategories";
import Laws from "./pages/Laws";
import Subjects from "./pages/Subjects";
import Lectures from "./pages/Lectures";
import GuestLectures from "./pages/GuestLectures";
import CouresCombo from "./pages/CouresCombo";
import NpmCombos from "./pages/NpmCombos";
import Notes from "./pages/Notes";
import PYQPaper from "./pages/PYQPaper";
import SWMocksTests from "./pages/SWMocksTests";
import GrandTests from "./pages/GrandTests";
import Quizzes from "./pages/Quizzes";
import MainsQA from "./pages/MainsQA";
import MainsEssayTrans from "./pages/MainsEssayTrans";
import TestSeries from "./pages/TestSeries";
import Banners from "./pages/Banners";
import Results from "./pages/Results";
import StudentRequests from "./pages/StudentRequests";
import Plans from "./pages/Plans";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ✅ Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Login />} />
        <Route path="/admin-forgot-password" element={<AdminForgotPassword />}/>

        {/* ✅ Protected Routes */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="admins" element={<Admins />} />
          <Route path="students" element={<Students />} />
          <Route path="studentrequests" element={<StudentRequests/>} />
          <Route path="categories" element={<Categories />} />
          <Route path="subcategories" element={<SubCategories />} />
          <Route path="laws" element={<Laws />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="plans" element={<Plans />}/>
          <Route path="lectures" element={<Lectures />} />
          <Route path="gestlectures" element={<GuestLectures />} />
          <Route path="courescombo" element={<CouresCombo />} />
          <Route path="npmcombo" element={<NpmCombos />} />
          <Route path="notes" element={<Notes />} />
          <Route path="pyqpaper" element={<PYQPaper />} />
          <Route path="swmockstests" element={<SWMocksTests />} />
          <Route path="grandtests" element={<GrandTests />} />
          <Route path="quizzes" element={<Quizzes />} />
          <Route path="mainsqa" element={<MainsQA />} />
          <Route path="manisessaytrans" element={<MainsEssayTrans />} />
          <Route path="testseries" element={<TestSeries />} />
          <Route path="banners" element={<Banners />} />
          <Route path="results" element={<Results />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
