// import React, { useEffect } from "react";
// import "./Home.css";
// import WebBack from '../assets/web-back.png';

// const Home = () => {

//   useEffect(() => {
//   const slider = document.querySelector(".nav-slider");
//   const links = document.querySelectorAll(".nav-link");

//   links.forEach(link => {
//     link.addEventListener("click", () => {
//       links.forEach(l => l.classList.remove("active"));
//       link.classList.add("active");

//       slider.style.width = `${link.offsetWidth - 30}px`;
//       slider.style.left = `${link.offsetLeft + 15}px`;
//             const navbarCollapse = document.getElementById("navbarNav");
//       if (navbarCollapse.classList.contains("show")) {
//         navbarCollapse.classList.remove("show");
//       }
//     });
//   });


//   const sections = document.querySelectorAll("section[id]");

//   const onScroll = () => {
//     const scrollPos = window.scrollY + 180;

//     sections.forEach(section => {
//       if (
//         scrollPos >= section.offsetTop &&
//         scrollPos < section.offsetTop + section.offsetHeight
//       ) {
//         const id = section.getAttribute("id");
//         links.forEach(link => {
//           link.classList.remove("active");
//           if (link.getAttribute("href") === `#${id}`) {
//             link.classList.add("active");
//             slider.style.width = `${link.offsetWidth - 30}px`;
//             slider.style.left = `${link.offsetLeft + 15}px`;
//           }
//         });
//       }
//     });
//   };

//   window.addEventListener("scroll", onScroll);

//   const activeLink = document.querySelector(".nav-link.active");
//   if (slider && activeLink) {
//     slider.style.width = `${activeLink.offsetWidth - 30}px`;
//     slider.style.left = `${activeLink.offsetLeft + 15}px`;
//   }

//   return () => {
//     window.removeEventListener("scroll", onScroll);
//   };
// }, []);


//   return (
//     <>

//     <div className="Home-background">
//       <nav className="navbar navbar-expand-lg fixed-top custom-navbar">
//         <div className="container">

//           <a className="navbar-brand d-flex align-items-center" href="#home">
//             <img src="/Yoga-icon-02.png" alt="Yoga Bharat" className="brand-logo" />
//             <span className="brand-yoga ms-2">Yoga</span>
//             <span className="brand-bharat ms-1">Bharat</span>
//           </a>

//           <button
//             className="navbar-toggler"
//             type="button"
//             data-bs-toggle="collapse"
//             data-bs-target="#navbarNav"
//           >
//             <span className="navbar-toggler-icon"></span>
//           </button>

//           <div className="collapse navbar-collapse" id="navbarNav">
//             <ul className="navbar-nav ms-auto align-items-center position-relative">
//               <span className="nav-slider"></span>

//               <li className="nav-item">
//                 <a className="nav-link active" href="#home">Home</a>
//               </li>
//               <li className="nav-item">
//                 <a className="nav-link" href="#about">About</a>
//               </li>
//               <li className="nav-item">
//                 <a className="nav-link" href="#classes">Classes</a>
//               </li>
//               <li className="nav-item">
//                 <a className="nav-link" href="#gallery">Gallery</a>
//               </li>
//               <li className="nav-item">
//                 <a className="nav-link" href="#blog">Blog</a>
//               </li>
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
//           <div className="row min-vh-100 align-items-center">
//             <div className="col-md-3"></div>
//             <div className="col-md-6 text-new">
//               <h1>Find Your Inner Peace</h1>
//               <p>Balance Your Body & Mind</p>
//               <button className="btn btn-warning now-back me-2">Join Now</button>
//               <button className="btn btn-outline-light">Learn More</button>
//             </div>
//             <div className="col-md-3"></div>
//           </div>
//         </div>
//       </section>

//       {/* === FEATURES === */}
//       <section className="features-section features-overlap">
//         <div className="container">
//           <div className="row text-center">
//             <div className="col-md-4 mb-3 mobile">
//               <div className="feature-box">
//                 <div className="feature-icon">
//                   <img src="/stree.png" alt="Stress Relief" />
//                 </div>
//                 <h5>Stress Relief</h5>
//                 <p>Calm Your Mind</p>
//               </div>
//             </div>

//             <div className="col-md-4 mb-3 mobile">
//               <div className="feature-box">
//                 <div className="feature-icon">
//                   <img src="/Flexibility.png" alt="Flexibility" />
//                 </div>
//                 <h5>Flexibility</h5>
//                 <p>Increase Your Flexibility</p>
//               </div>
//             </div>

//             <div className="col-md-4 mb- mobile">
//               <div className="feature-box">
//                 <div className="feature-icon">
//                   <img src="/Wellness.png" alt="Wellness" />
//                 </div>
//                 <h5>Wellness</h5>
//                 <p>Improve Your Health</p>
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
//               <h2>Yoga <span>Bharat</span></h2>

//               <p className="tagline">Experience the Art of Yoga and Meditation</p>

//               <p className="description">
//                 Yoga Bharat is dedicated to helping you achieve harmony of body,
//                 mind, and soul through traditional yoga practices and mindful meditation.
//               </p>

//               <ul className="features">
//                 <li>Improve flexibility and posture</li>
//                 <li>Reduce stress and anxiety</li>
//                 <li>Enhance focus and mindfulness</li>
//                 <li>Boost overall health</li>
//               </ul>

//               {/* <button className="btn-read">Read More</button> */}
//             </div>

//             <div className="col-md-6 text-center">
//               <img
//                 src="https://images.unsplash.com/photo-1545205597-3d9d02c29597"
//                 alt="Yoga"
//                 className="about-image"
//               />
//             </div>

//           </div>
//         </div>
//       </section>

//       {/* === CLASSES === */}
//       <section id="classes" className="classes-section">
//         <div className="container text-center">
//           <h2 className="animated-underline">Our Classes</h2>
//           <p className="classes-description">
//             Discover mindful yoga practices that enhance flexibility, improve strength,
//             and bring peace to your everyday life.
//           </p>


//           <div className="row mt-4">
//             <div className="col-md-4 mb-3">
//               <div className="class-card">
//                 <img src="https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=800&q=80" alt="Yoga" />
//                 <h5 className="hatha-yoga">Hatha Yoga</h5>
//                 <p>Balance & Strength</p>
//               </div>
//             </div>

//             <div className="col-md-4 mb-3">
//               <div className="class-card">
//                 <img src="https://images.unsplash.com/photo-1549576490-b0b4831ef60a?auto=format&fit=crop&w=800&q=80" alt="Yoga" />
//                 <h5 className="hatha-yoga">Vinyasa Yoga</h5>
//                 <p>Energy Flow</p>
//               </div>
//             </div>

//             <div className="col-md-4 mb-3">
//               <div className="class-card">
//                 <img src="/meditating.jpg" alt="Meditation" />
//                 <h5 className="hatha-yoga">Meditation</h5>
//                 <p>Peace & Focus</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* === GALLERY === */}
//       <section id="gallery" className="gallery-section">
//         <div className="container text-center">
//           <h2 className="animated-underline">Our Gallery</h2>

//           <div className="row mt-4">
//             <div className="col-md-4 mb-3 gallery">
//               <img src="/gallery-01.jpg" alt="Gallery" />
//             </div>
//             <div className="col-md-4 mb-3 gallery">
//               <img src="/gallery-02.jpg" alt="Gallery" />
//             </div>
//             <div className="col-md-4 mb-3 gallery">
//               <img src="/gallery-03.jpg" alt="Gallery" />
//             </div>
//           </div>
//           <div className="row mt-4">
//             <div className="col-md-4 mb-3 gallery">
//               <img src="/gallery-07.jpg" alt="Gallery" />
//             </div>
//             <div className="col-md-4 mb-3 gallery">
//               <img src="/gallery-08.jpg" alt="Gallery" />
//             </div>
//             <div className="col-md-4 mb-3 gallery">
//               <img src="/gallery-09.jpg" alt="Gallery" />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* === BLOG === */}
//       <section id="blog" className="blog-section">
//         <div className="container text-center">
//           <h2 className="animated-underline">Latest Blogs</h2>
//           <p className="classes-description">
//             Explore insightful articles on yoga, meditation, and healthy living.
//             Stay inspired with tips that nurture your body, mind, and soul.
//           </p>
//           <div className="row mt-4">
//             <div className="col-md-4 mb-4">
//               <div className="blog-card h-100">
//                 <img src="/gallery-04.jpg" alt="Blog" />
//                 <div className="p-3">
//                   <h5>Benefits of Yoga</h5>
//                   <p>Improve flexibility and mental health.</p>
//                 </div>
//               </div>
//             </div>

//             <div className="col-md-4 mb-4">
//               <div className="blog-card h-100">
//                 <img src="/gallery-05.jpg" alt="Blog" />
//                 <div className="p-3">
//                   <h5>Meditation Tips</h5>
//                   <p>Calm your mind naturally.</p>
//                 </div>
//               </div>
//             </div>

//             <div className="col-md-4 mb-4">
//               <div className="blog-card h-100">
//                 <img src="/gallery-06.jpg" alt="Blog" />
//                 <div className="p-3">
//                   <h5>Healthy Living</h5>
//                   <p>Yoga for daily wellness.</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* === FOOTER === */}
//       <footer className="footer">
//         <div className="container text-center reserved">
//           <p className="rights">© 2025 Yoga Bharat. All rights reserved.</p>
//         </div>
//       </footer>
//       </div>
//     </>
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
