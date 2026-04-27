import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

/* Public Pages */
import Login from "./pages/Auth/Login";
import AdminForgotPassword from "./pages/Admins/AdminForgotPassword";
import SuperAdminForgotPassword from "./pages/Admins/SuperAdminForgotPassword";

// import Home from "./pages/Home";

/* Protected Pages */
import Dashboard from "./pages/Dashboard/Dashboard";
import Admins from "./pages/Admins/Admins";
import Students from "./pages/Students/Students";
import Categories from "./pages/Categories/Categories";
import SubCategories from "./pages/SubCategories/SubCategories";
import Laws from "./pages/Laws/Laws";
import Subjects from "./pages/Subjects/Subjects";
import Lectures from "./pages/Lectures/Lectures";
import GuestLectures from "./pages/GuestLectures/GuestLectures";
import CouresCombo from "./pages/Combination/CouresCombo";
import NpmCombos from "./pages/Combination/NpmCombos";
import Notes from "./pages/Notes/Notes";
import SubjectNotes from "./pages/Notes/SubjectNotes";
import PrintedNotesOrders from "./pages/Notes/PrintedNotesOrders";
import PrelimsSWMockTests from "./pages/Prelims/PrelimsSWMockTests";
import SubjectsSWMockTest from "./pages/Prelims/SubjectsSWMockTest";
import GrandTests from "./pages/Prelims/GrandTests";
import Quizzes from "./pages/Prelims/Quizzes";
import MainsQA from "./pages/Mains/MainsQA";
import MainsEssayTrans from "./pages/Mains/MainsEssayTrans";
import Banners from "./pages/Banners/Banners";
import StudentRequests from "./pages/StudentRequests/StudentRequests";
import Plans from "./pages/Plans/Plans";
import Coupons from "./pages/Coupons/Coupons";
import StudentProfile from "./pages/Students/Studentprofile";
import Mains from "./pages/Mains/Mains";
import Prelims from "./pages/Prelims/Prelims";
import PQAPaper from "./pages/Prelims/PQAPaper";
import MainsTestSeries from "./pages/Mains/MainsTests/MainsTestSeries";
import MainsSubjectTest from "./pages/Mains/MainsTests/MainsSubjectTest";
import MainsTestsAttempts from "./pages/Mains/MainsTests/MainsTestsAttempts";
import MainsResultsProfile from "./pages/Mains/MainsTests/MainsResultsProfile";
import TestTermsandConditions from "./pages/TermsandConditions/TestTermsandConditions";
import QuizProfile from "./pages/Prelims/QuizProfile";
import GrandTestsProfile from "./pages/Prelims/GrandTestsProfile";
import PrelimsSMTProfile from "./pages/Prelims/PrelimsSMTProfile";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ✅ Public Routes */}
        <Route path="/" element={<Login />} />
        {/* <Route path="/admin" element={<Login />} /> */}
        <Route path="/admin-forgot-password" element={<AdminForgotPassword />}/>
        <Route path="/superadmin-forgot-password" element={<SuperAdminForgotPassword />} />


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
          <Route path="subjectnotes" element={<SubjectNotes />} />
          <Route path="printednotesorders" element={<PrintedNotesOrders />}/>
          <Route path="coupons" element={<Coupons />} />
          <Route path="prelims" element={<Prelims />} />
          <Route path="pqapaper" element={<PQAPaper />} />
          <Route path="pswmocktests" element={<PrelimsSWMockTests />} />
          <Route path="/pswmocktests/:prelimes_test_id" element={<PrelimsSMTProfile />} />
          <Route path="sswmocktests" element={<SubjectsSWMockTest />} />
          <Route path="grandtests" element={<GrandTests />} />
          <Route path="/grandtests/:prelimes_test_id" element={<GrandTestsProfile />} />
          <Route path="quizzes" element={<Quizzes />} />
          <Route path="/quiz/:prelimes_test_id" element={<QuizProfile />} />
          <Route path="mains" element={<Mains />} />
          <Route path="mainsqa" element={<MainsQA />} />
          <Route path="manisessaytrans" element={<MainsEssayTrans />} />
          <Route path="mainstestseries" element={<MainsTestSeries />} />
          <Route path="mainssubjecttests" element={<MainsSubjectTest/>}/>
          <Route path="mainstestsattempts" element={<MainsTestsAttempts/>}/>
          <Route path="banners" element={<Banners />} />
          <Route path="testtermsconditions" element={<TestTermsandConditions />} />
          <Route path="/student/:userId" element={<StudentProfile />} />
          <Route path="/mains-result/:attemptId" element={<MainsResultsProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
