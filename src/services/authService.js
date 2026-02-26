import api from "./api"; 

export const adminlogin = async ({ emailId, password }) => {
  const payload = {
    emailId: emailId,
    mobileNumber: emailId,
    password: password,
  };
  const response = await api.post("/admin/login", payload);
  return response.data;
};

export const superadminlogin = async ({ emailId, password }) => {
  const payload = {
    email: emailId,
    mobile_number: emailId, 
    password: password,
  };

  const response = await api.post("/admin/superadminlogin", payload);
  return response.data;
};

export const adminForgotPassword = async (Forgotload) => {
  const response = await api.post("/admin/forgotpassword", Forgotload);
  return response.data;
};

export const superadminForgotPassword = async (Forgotload) => {
  const response = await api.post("/admin/superadminforgotpassword", Forgotload);
  return response.data;
};

export const getadmins = async (page = 1, limit = 10) => {
  const res = await api.get(`/admin?page=${page}&limit=${limit}`);
  return res.data;
};

export const addAdmin = async (data) => {
  const res = await api.post("/admin/register", data, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export const updateAdmin = async (data) => {
  const res = await api.post("/admin/update", data, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export const deleteAdmin = async (adminId) => {
  const res = await api.post(
    "/admin/delete",
    { adminId }, // ✅ body only
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return res.data;
};

export const getUsersList = async (page = 1, limit = 10) => {
  const res = await api.get(`/users?page=${page}&limit=${limit}`);
  return res.data;
};

export const getUserDetails = async (userId) => {
  const res = await api.post("/users/details", { userId });
  return res.data;
};

export const getStudentRequestlist = async (page = 1, limit = 10) => {
  const res = await api.get(`/users/detailsrequestslist?page=${page}&limit=${limit}`);
  return res.data;
};

export const getStudentCoursesDetails = async (userId) => {
  const res = await api.post("/enrollments/user_courses", { userId });
  return res.data;
};

export const completeStudentRequest = async (detailsId) => {
  const res = await api.post("/users/completerequest", {
    detailsId,
  });
  return res.data;
};

export const addBanner = async (formData) => {
  const res = await api.post("/banners/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getBanners = async (page = 1, limit = 10) => {
  const res = await api.get(`/banners?page=${page}&limit=${limit}`);
  return res.data;
};

export const deleteBanner = async (data) => {
  const res = await api.post("/banners/delete", data);
  return res.data;
};

export const addCategories = async (formData) => {
  const res = await api.post("/categories/add", formData,{
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export const getCategories = async (page = 1, limit = 10) => {
  const res = await api.get(`/categories?page=${page}&limit=${limit}`);
  return res.data;
};

export const getCategoriesById = async (categoryId) => {
  const res = await api.post("/categories/details", { categoryId }, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export const updateCategories = async (formData) => {
  const res = await api.post("/categories/update", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteCategories = async (data) => {
  const res = await api.post("/categories/delete", data);
  return res.data;
};

export const addSubCategories = async (formData) => {
  const res = await api.post("/subcategories/add", formData,{
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export const getSubCategories = async (page = 1, limit = 10) => {
  const res = await api.get(`/subcategories?page=${page}&limit=${limit}`);
  return res.data;
};

export const getSubCategoriesById = async (subcategory_id) => {
  const res = await api.post("/subcategories/details", { subcategory_id }, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export const updateSubCategories = async (formData) => {
  const res = await api.post("/subcategories/update", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteSubCategories = async (data) => {
  const res = await api.post("/subcategories/delete", data);
  return res.data;
};

export const getSubCategoriesByCategory = async (data) => {
  const res = await api.post("/subcategories/getbycategory", data);
  return res.data;
};

export const addLaws = async (formData) => {
  const res = await api.post("/laws/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getLaws = async (page = 1, limit = 10) => {
  const res = await api.get(`/laws?page=${page}&limit=${limit}`);
  return res.data;
};

export const updateLaws = async (formData) => {
  const res = await api.post("/laws/update", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteLaws = async (data) => {
  const res = await api.post("/laws/delete", data);
  return res.data;
};

export const getLaswsBySubCategory = async (data) => {
  const res = await api.post("/laws/listbysubcategory", data);
  return res.data;
};

export const addSubjects = async (formData) => {
  const res = await api.post("/subjects/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getSubjects = async (page = 1, limit = 10) => {
  const res = await api.get(`/subjects?page=${page}&limit=${limit}`);
  return res.data;
};

export const updateSubjects = async (formData) => {
  const res = await api.post("/subjects/update", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteSubjects = async (data) => {
  const res = await api.post("/subjects/delete", data);
  return res.data;
};

export const getSubjectsByLaw = async (data) => {
  const res = await api.post("/subjects/listbylaw", data);
  return res.data;
};

export const addLectures = async (data)=>{
  const res = await api.post("/lectures/add", data, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}
export const getLectures = async (page = 1, limit = 10) => {
  const res = await api.get(`/lectures?page=${page}&limit=${limit}`);
  return res.data;
};

export const updateLectures = async (data) => {
  const res = await api.post("/lectures/update", data, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export const deleteLectures = async (data) => {
  const res = await api.post("/lectures/delete", data);
  return res.data;
};

export const addGuestLectures = async (formData) => {
  const res = await api.post("/guest-lectures/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getGusestLectures = async (page = 1, limit = 10) => {
  const res = await api.get(`/guest-lectures?page=${page}&limit=${limit}`);
  return res.data;
};

export const getGuestLecturesById = async (guest_lecture_id) => {
  const res = await api.post("/guest-lectures/details", { guest_lecture_id }, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export const updateGuestLectures = async (formData) => {
  const res = await api.post("/guest-lectures/update", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteGuestLectures = async (data) => {
  const res = await api.post("/guest-lectures/delete", data);
  return res.data;
};

export const addPlans = async (data) => {
  const res = await api.post("/plans/add", data, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export const getPlans = async (page = 1, limit = 10) => {
  const res = await api.get(`/plans?page=${page}&limit=${limit}`);
  return res.data;
};

export const getPlansById = async (planId) => {
  const res = await api.post("/plans/getbyid", { planId }, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export const updatePlans = async (data) => {
  const res = await api.post("/plans/update", data, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export const deletePlans = async (planId) => {
  const res = await api.post("/plans/delete",{ planId },);
  return res.data;
};

export const addCoupon = async (data) => {
  const res = await api.post("/coupons/add", data);
  return res.data;
};

export const getCoupons = async (page = 1, limit = 10) => {
  const res = await api.get(`/coupons?page=${page}&limit=${limit}`);
  return res.data;
};

export const getCouponById = async (couponId) => {
  const res = await api.post("/coupons/details", { couponId });
  return res.data;
};

export const updateCoupon = async (data) => {
  const res = await api.post("/coupons/update", data);
  return res.data;
};

export const deleteCoupon = async (couponId) => {
  const res = await api.post("/coupons/delete", { couponId });
  return res.data;
};


export const addNotes = async (formData) => {
  const res = await api.post("/notes/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getNotes = async (page = 1, limit = 10, userId) => {
  const res = await api.get(`/notes?page=${page}&limit=${limit}&userId=${userId}`);
  return res.data;
};

export const getNotesById = async (notes_id) => {
  const res = await api.post("/notes/details", { notes_id });
  return res.data;
};

export const updateNotes = async (formData) => {
  const res = await api.post("/notes/update", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteNotes = async (notes_id) => {
  const res = await api.post("/notes/delete", { notes_id });
  return res.data;
};

export const getPrintednotesoders = async (page = 1, limit = 10) => {
  const res = await api.get(`/notes/orders?page=${page}&limit=${limit}`);
  return res.data;
};

export const updateOrderStatus = async (body) => {
  const res = await api.post("/notes/updateorderstatus", body);
  return res.data;
};

export const addSubjectnotes = async (formData) => {
  const res = await api.post("/subject-notes/add", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const updateSubjectnotes = async (formData) => {
  const res = await api.post("/subject-notes/update", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const getSubjectnotes = async (page = 1, limit = 10) => {
  const res = await api.get(`/subject-notes?page=${page}&limit=${limit}`);
  return res.data;
};

export const deleteSubjectnotes = async (data) => {
  const res = await api.post("/subject-notes/delete", data);
  return res.data;
};

export const addPrelims = async (formData) => {
  const res = await api.post("/prelimes/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getPrelims = async (page = 1, limit = 10) => {
  const res = await api.get(`/prelimes?page=${page}&limit=${limit}`);
  return res.data;
};

export const getPrelimsById = async (prelimes_id) => {
  const res = await api.post("/prelimes/details", { prelimes_id }, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export const updatePrelims = async (formData) => {
  const res = await api.post("/prelimes/update", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deletePrelims = async (data) => {
  const res = await api.post("/prelimes/delete", data);
  return res.data;
};


export const addMains = async (formData) => {
  const res = await api.post("/mains/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getMains = async (page = 1, limit = 10) => {
  const res = await api.get(`/mains?page=${page}&limit=${limit}`);
  return res.data;
};

export const getMainsById = async (mains_id) => {
  const res = await api.post("/mains/details", { mains_id }, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export const updateMains = async (formData) => {
  const res = await api.post("/mains/update", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteMains = async (data) => {
  const res = await api.post("/mains/delete", data);
  return res.data;
};




// // ---------------- Health Preference APIs ----------------
// export const addHealthPreference = async (formData) => {
//   const response = await api.post("/users/addhealthpreference", formData, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   });
//   return response.data;
// };

// export const getHealthPreferences = async (page = 1, limit = 10) => {
//   try {
//     const response = await api.get(`/users/healthpreferences?page=${page}&limit=${limit}`, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });
//     return response.data.data;
//   } catch (err) {
//     console.error("API Error:", err);
//     return []; 
//   }
// };

// export const updateHealthPreference = async (formData) => {
//   const response = await api.post("/users/updatehealthpreference",formData,
//     {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     }
//   );
//   return response.data;
// };

// export const HealthPreferenceById = async (prefId) => {
//   const response = await api.post("/users/healthpreferencebyid",{ prefId },
//     {
//       headers: {
//         "Content-Type": "application/json",
//       },
//     }
//   );

//   return response.data;
// };

// export const deleteHealthPreference = async (prefId) => {
//   const response = await api.post("/users/deletehealthpreference",{ prefId },
//     {
//       headers: {
//         "Content-Type": "application/json",
//       },
//     }
//   );
//   return response.data;
// };

// // ---------------- Languages Preference APIs ----------------

// export const addLanguage = async (data) => {
//   const res = await api.post("/language/add", data, {
//     headers: { "Content-Type": "application/json" },
//   });
//   return res.data;
// };

// export const getLanguages = async (page = 1, limit = 10) => {
//   const res = await api.get(`/language/list?page=${page}&limit=${limit}`);
//   return res.data; 
// };

// export const getLanguageById = async (languageId) => {
//   const response = await api.post(
//     "/language/languagebyid",
//     { languageId },
//     { headers: { "Content-Type": "application/json" } }
//   );
//   return response.data;
// };

// export const updateLanguage = async (data) => {
//   const response = await api.post(
//     "/language/update",
//     data, 
//     {
//       headers: {
//         "Content-Type": "application/json",
//       },
//     }
//   );
//   return response.data;
// };

// export const deleteLanguage = async (languageId) => {
//   const response = await api.post(
//     "/language/delete",
//     { languageId },
//     { headers: { "Content-Type": "application/json" } }
//   );
//   return response.data;
// };

// // ---------------- FeatureBanners APIs ----------------

// export const addFeature = async (formData) => {
//   const res = await api.post("/feature/add", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return res.data;
// };

// export const getFeatures = async (page = 1, limit = 10) => {
//   const res = await api.get(`/feature/list?page=${page}&limit=${limit}`);
//   return res.data;
// };

// export const getFeatureById = async (featureId) => {
//   const res = await api.post("/feature/bannerbyid", { featureId }, {
//     headers: { "Content-Type": "application/json" },
//   });
//   return res.data;
// };

// export const updateFeature = async (formData) => {
//   const res = await api.post("/feature/update", formData, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   });
//   return res.data;
// };

// export const deleteFeature = async (featureId) => {
//   const res = await api.post("/feature/delete", { featureId }, {
//     headers: { "Content-Type": "application/json" },
//   });
//   return res.data;
// };

// // ---------------- Privacy Preference APIs ----------------

// export const addPrivacy = async (data) => {
//   const res = await api.post("/privacy/add", data, {
//     headers: { "Content-Type": "application/json" },
//   });
//   return res.data;
// };

// export const getPrivacyList = async (page = 1, limit = 10) => {
//   const res = await api.get(`/privacy/list?page=${page}&limit=${limit}`);
//   return res.data;
// };

// export const getPrivacyById = async (privacyId) => {
//   const res = await api.post(
//     "/privacy/privacybyid",
//     { privacyId },
//     { headers: { "Content-Type": "application/json" } }
//   );
//   return res.data;
// };

// export const updatePrivacy = async (data) => {
//   const res = await api.post("/privacy/update", data, {
//     headers: { "Content-Type": "application/json" },
//   });
//   return res.data;
// };

// export const deletePrivacy = async (privacyId) => {
//   const res = await api.post(
//     "/privacy/delete",
//     { privacyId },
//     { headers: { "Content-Type": "application/json" } }
//   );
//   return res.data;
// };

// // ---------------- Terms & Conditions APIs ----------------

// export const addTerms = async (data) => {
//   const res = await api.post(
//     "/terms/add",
//     data,
//     { headers: { "Content-Type": "application/json" } }
//   );
//   return res.data;
// };

// export const getTerms = async (page = 1, limit = 10) => {
//   const res = await api.get(`/terms/list?page=${page}&limit=${limit}`);
//   return res.data;
// };

// export const getTermsById = async (termsId) => {
//   const res = await api.post(
//     "/terms/termsbyid",
//     { termsId },
//     { headers: { "Content-Type": "application/json" } }
//   );
//   return res.data;
// };

// export const updateTerms = async (data) => {
//   const res = await api.post(
//     "/terms/update",
//     data,
//     { headers: { "Content-Type": "application/json" } }
//   );
//   return res.data;
// };

// export const deleteTerms = async (termsId) => {
//   const res = await api.post(
//     "/terms/delete",
//     { termsId },
//     { headers: { "Content-Type": "application/json" } }
//   );
//   return res.data;
// };

// // ---------------- SplashScreen APIs ----------------

// export const addSplashScreen = async (data) => {
//   const res = await api.post("/splashscreen/add", data, {
//     headers: { "Content-Type": "application/json" },
//   });
//   return res.data;
// };

// export const getSplashScreens = async (page = 1, limit = 10) => {
//   const res = await api.get(`/splashscreen/list?page=${page}&limit=${limit}`);
//   return res.data;
// };

// export const getSplashScreenById = async (splashscreenId) => {
//   const res = await api.post("/splashscreen/screentextbyid", { splashscreenId });
//   return res.data; 
// };

// export const updateSplashScreen = async (data) => {
//   const res = await api.post("/splashscreen/update", data, {
//     headers: { "Content-Type": "application/json" },
//   });
//   return res.data;
// };

// export const deleteSplashScreen = async (splashscreenId) => {
//   const res = await api.post("/splashscreen/delete", { splashscreenId }, {
//     headers: { "Content-Type": "application/json" },
//   });
//   return res.data;
// };

// // ---------------- AppTutorial APIs ----------------

// export const addAppTutorial = async (formData) => {
//   const res = await api.post("/apptutorial/add", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return res.data;
// };

// export const getAppTutorials = async (page = 1, limit = 10) => {
//   const res = await api.get(`/apptutorial/list?page=${page}&limit=${limit}`);
//   return res.data;
// };

// export const getAppTutorialById = async (appId) => {
//   const res = await api.post("/apptutorial/tutorialbyid", { appId }, {
//     headers: { "Content-Type": "application/json" },
//   });
//   return res.data;
// };

// export const updateAppTutorial = async (formData) => {
//   const res = await api.post("/apptutorial/update", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return res.data;
// };

// export const deleteAppTutorial = async (appId) => {
//   const res = await api.post(
//     "/apptutorial/delete",
//     { appId },
//     {
//       headers: { "Content-Type": "application/json" },
//     }
//   );
//   return res.data;
// };


// // ---------------- Yogs APIs ----------------

// export const addYoga = async (formData) => {
//   try {
//     const res = await api.post("/yoga/add", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return res.data;
//   } catch (err) {
//     console.error("Add Yoga API Error:", err);
//     throw err;
//   }
// };
// export const getYogaList = async (page = 1, limit = 10) => {
//   try {
//     const res = await api.get(`/yoga/list?page=${page}&limit=${limit}`, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return res.data.data || [];
//   } catch (err) {
//     console.error("Get Yoga List API Error:", err);
//     return [];
//   }
// };

// export const updateYoga = async (formData) => {
//   try {
//     const res = await api.post("/yoga/update", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return res.data;
//   } catch (err) {
//     console.error("Update Yoga API Error:", err);
//     throw err;
//   }
// };

// export const yogaById = async (yogaId) => {
//   const res = await api.post("/yoga/yogabyid", { yogaId }, {
//     headers: { "Content-Type": "application/json" },
//   });
//   return res.data;
// };

// export const deleteYoga = async (yogaId) => {
//   const res = await api.post("/yoga/delete", { yogaId }, {
//     headers: { "Content-Type": "application/json" },
//   });
//   return res.data;
// };

// // ---------------- Users APIs  Clients----------------

// export const getClients = async (page = 1, limit = 10) => {
//   try {
//     const res = await api.get(`/users/clients?page=${page}&limit=${limit}`, {
//       headers: { "Content-Type": "application/json" },
//     });
//     return res.data.data || [];
//   } catch (err) {
//     console.error("Get Clients API Error:", err);
//     return [];
//   }
// };

// export const getTrainers = async (page = 1, limit = 10) => {
//   try {
//     const res = await api.get(`/users/trainers?page=${page}&limit=${limit}`, {
//       headers: { "Content-Type": "application/json" },
//     });
//     return res.data.data || [];
//   } catch (err) {
//     console.error("Get Trainers API Error:", err);
//     return [];
//   }
// };

// export const approveTrainer = async (userId) => {
//   try {
//     const res = await api.post(
//       "/users/approvetrainer",
//       { userId },
//       { headers: { "Content-Type": "application/json" } }
//     );
//     return res.data;
//   } catch (err) {
//     console.error("Approve Trainer API Error:", err);
//     throw err;
//   }
// };

// export const getCertificatesByUser = async (userId) => {
//   const res = await api.post(
//     "/users/certificatebyuser",
//     { userId },
//     {
//       headers: { "Content-Type": "application/json" },
//     }
//   );
//   return res.data;
// };



// // ---------------- Users APIs Booking----------------

// export const getBookings = async (page = 1, limit = 10) => {
//   try {
//     const res = await api.post(
//       `/booking/filterlist?page=${page}&limit=${limit}`,
//       {},
//       { headers: { "Content-Type": "application/json" } }
//     );
//     return res.data;
//   } catch (err) {
//     console.error("Get Bookings API Error:", err);
//     return null;
//   }
// };

