// import React, { useEffect } from "react";
// import "./Home.css";
// import WebBack from "../assets/law-hero.png";
// import logo from "../assets/logo.jpeg";

// const Home = () => {

//   useEffect(() => {
//     const slider = document.querySelector(".nav-slider");
//     const links = document.querySelectorAll(".nav-link");

//     links.forEach(link => {
//       link.addEventListener("click", () => {
//         links.forEach(l => l.classList.remove("active"));
//         link.classList.add("active");

//         slider.style.width = `${link.offsetWidth - 30}px`;
//         slider.style.left = `${link.offsetLeft + 15}px`;

//         const navbarCollapse = document.getElementById("navbarNav");
//         if (navbarCollapse.classList.contains("show")) {
//           navbarCollapse.classList.remove("show");
//         }
//       });
//     });

//     const sections = document.querySelectorAll("section[id]");

//     const onScroll = () => {
//       const scrollPos = window.scrollY + 180;

//       sections.forEach(section => {
//         if (
//           scrollPos >= section.offsetTop &&
//           scrollPos < section.offsetTop + section.offsetHeight
//         ) {
//           const id = section.getAttribute("id");
//           links.forEach(link => {
//             link.classList.remove("active");
//             if (link.getAttribute("href") === `#${id}`) {
//               link.classList.add("active");
//               slider.style.width = `${link.offsetWidth - 30}px`;
//               slider.style.left = `${link.offsetLeft + 15}px`;
//             }
//           });
//         }
//       });
//     };

//     window.addEventListener("scroll", onScroll);

//     const activeLink = document.querySelector(".nav-link.active");
//     if (slider && activeLink) {
//       slider.style.width = `${activeLink.offsetWidth - 30}px`;
//       slider.style.left = `${activeLink.offsetLeft + 15}px`;
//     }

//     return () => window.removeEventListener("scroll", onScroll);
//   }, []);

//   return (
//     <div className="Home-background">

//       {/* === NAVBAR === */}
//       <nav className="navbar navbar-expand-lg fixed-top custom-navbar">
//         <div className="container">

//           <a className="navbar-brand d-flex align-items-center" href="#home">
//            <img src={logo} alt="Law Academy" className="brand-logo" />         
//           {/* <span className="brand-yoga ms-2">Law</span>
//             <span className="brand-bharat ms-1">Academy</span> */}
//           </a>

//           <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
//             <span className="navbar-toggler-icon"></span>
//           </button>

//           <div className="collapse navbar-collapse" id="navbarNav">
//             <ul className="navbar-nav ms-auto align-items-center position-relative">
//               <span className="nav-slider"></span>

//               <li className="nav-item"><a className="nav-link active" href="#home">Home</a></li>
//               <li className="nav-item"><a className="nav-link" href="#about">About</a></li>
//               <li className="nav-item"><a className="nav-link" href="#courses">Courses</a></li>
//               <li className="nav-item"><a className="nav-link" href="#faculty">Faculty</a></li>
//               <li className="nav-item"><a className="nav-link" href="#blog">Blog</a></li>
//             </ul>
//           </div>

//         </div>
//       </nav>

//       {/* === HERO === */}
//       <section
//         id="home"
//         className="hero-section"
//         style={{ backgroundImage: `url(${WebBack})` }}
//       >
//         <div className="container">
//           <div className="row min-vh-100 align-items-center text-center">
//             <div className="col-md-12 text-new">
//               <h1>Empowering Future Legal Professionals</h1>
//               <p>Expert Guidance • Practical Knowledge • Career Excellence</p>
//               <button className="btn btn-warning me-2">Explore Courses</button>
//               <button className="btn btn-outline-light">Contact Us</button>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* === FEATURES === */}
//       <section className="features-section features-overlap">
//         <div className="container">
//           <div className="row text-center">
//             <div className="col-md-4 mb-3">
//               <div className="feature-box">
//                 <img src="/law-icon-1.png" alt="Experts" />
//                 <h5>Expert Faculty</h5>
//                 <p>Learn from senior advocates & judges</p>
//               </div>
//             </div>

//             <div className="col-md-4 mb-3">
//               <div className="feature-box">
//                 <img src="/law-icon-2.png" alt="Practice" />
//                 <h5>Practical Training</h5>
//                 <p>Case studies & real-world exposure</p>
//               </div>
//             </div>

//             <div className="col-md-4 mb-3">
//               <div className="feature-box">
//                 <img src="/law-icon-3.png" alt="Career" />
//                 <h5>Career Support</h5>
//                 <p>Judiciary, CLAT & corporate law</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* === ABOUT === */}
//       <section id="about" className="about-section">
//         <div className="container">
//           <div className="row align-items-center">

//             <div className="col-md-6 about-content">
//               <h6 className="subtitle">Welcome to</h6>
//               <h2>Law <span>Academy</span></h2>

//               <p className="description">
//                 Law Academy is committed to shaping confident legal professionals
//                 through structured courses, expert mentorship, and exam-oriented learning.
//               </p>

//               <ul className="features">
//                 <li>Judiciary & Competitive Exams</li>
//                 <li>Corporate & Criminal Law</li>
//                 <li>Mock tests & case analysis</li>
//                 <li>Career-oriented mentoring</li>
//               </ul>
//             </div>

//             <div className="col-md-6 text-center">
//               <img
//                 src="/about_us.avif"
//                 alt="Law Academy"
//                 className="about-image"
//               />
//             </div>

//           </div>
//         </div>
//       </section>

//       {/* === COURSES === */}
//       <section id="courses" className="classes-section">
//         <div className="container text-center">
//           <h2 className="animated-underline">Our Courses</h2>

//           <div className="row mt-4">
//             <div className="col-md-4 mb-3">
//               <div className="class-card">
//                 <img src="/law-course-1.jpg" alt="Judiciary" />
//                 <h5>Judiciary Coaching</h5>
//                 <p>Prelims • Mains • Interview</p>
//               </div>
//             </div>

//             <div className="col-md-4 mb-3">
//               <div className="class-card">
//                 <img src="/law-course-2.jpg" alt="Corporate" />
//                 <h5>Corporate Law</h5>
//                 <p>Contracts & Compliance</p>
//               </div>
//             </div>

//             <div className="col-md-4 mb-3">
//               <div className="class-card">
//                 <img src="/law-course-3.jpg" alt="Criminal" />
//                 <h5>Criminal Law</h5>
//                 <p>IPC • CrPC • Evidence</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* === FACULTY === */}
//       <section id="faculty" className="gallery-section">
//         <div className="container text-center">
//           <h2 className="animated-underline">Our Faculty</h2>

//           <div className="row mt-4">
//             <div className="col-md-4 mb-3">
//               <img src="/faculty-1.jpg" alt="Faculty" />
//               <h6>Adv. R. Sharma</h6>
//             </div>
//             <div className="col-md-4 mb-3">
//               <img src="/faculty-2.jpg" alt="Faculty" />
//               <h6>Justice K. Verma</h6>
//             </div>
//             <div className="col-md-4 mb-3">
//               <img src="/faculty-3.jpg" alt="Faculty" />
//               <h6>Dr. S. Iyer</h6>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* === BLOG === */}
//       <section id="blog" className="blog-section">
//         <div className="container text-center">
//           <h2 className="animated-underline">Legal Insights</h2>

//           <div className="row mt-4">
//             <div className="col-md-4 mb-4">
//               <div className="blog-card">
//                 <img src="/law-blog-1.jpg" alt="Blog" />
//                 <div className="p-3">
//                   <h5>Judiciary Preparation Tips</h5>
//                   <p>Smart strategies to crack exams</p>
//                 </div>
//               </div>
//             </div>

//             <div className="col-md-4 mb-4">
//               <div className="blog-card">
//                 <img src="/law-blog-2.jpg" alt="Blog" />
//                 <div className="p-3">
//                   <h5>Career in Corporate Law</h5>
//                   <p>Opportunities & growth</p>
//                 </div>
//               </div>
//             </div>

//             <div className="col-md-4 mb-4">
//               <div className="blog-card">
//                 <img src="/law-blog-3.jpg" alt="Blog" />
//                 <div className="p-3">
//                   <h5>Criminal Law Explained</h5>
//                   <p>Core concepts simplified</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* === FOOTER === */}
//       <footer className="footer">
//         <div className="container text-center">
//           <p className="rights">© 2025 Law Academy. All rights reserved.</p>
//         </div>
//       </footer>

//     </div>
//   );
// };

// export default Home;


import React from 'react'

const Home = () => {
  return (
    <div>Home</div>
  )
}

export default Home