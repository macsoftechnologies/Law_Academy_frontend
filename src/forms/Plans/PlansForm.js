import React, { useEffect, useState, useCallback } from "react";
import "../form.css";
import {
  getCategories,
  getSubCategoriesByCategory,
  getLaswsBySubCategory,
  getSubjectsByLaw,
  getMains,
  getNotes,
  getPrelims,
} from "../../services/authService";

function PlansForm({ onClose, initialData, isEdit, onSubmit }) {
  const [originalPrice, setOriginalPrice] = useState("");
  const [strikePrice, setStrikePrice] = useState("");
  const [durationValue, setDurationValue] = useState("");
  const [durationUnit, setDurationUnit] = useState("years");
  const [handlingFee, setHandlingFee] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [courseType, setCourseType] = useState("");
  const [courseId, setCourseId] = useState("");

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [laws, setLaws] = useState([]);
  const [selectedLaw, setSelectedLaw] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [courseList, setCourseList] = useState([]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await getCategories(1, 1000);
      return res.data || [];
    } catch (err) {
      console.error("Failed to fetch categories", err);
      return [];
    }
  }, []);

  const fetchSubCategories = useCallback(async (id) => {
    if (!id) return [];
    try {
      const res = await getSubCategoriesByCategory({ categoryId: id });
      return res.data || [];
    } catch (err) {
      console.error("Failed to fetch subcategories", err);
      return [];
    }
  }, []);

  const fetchLaws = useCallback(async (id) => {
    if (!id) return [];
    try {
      const res = await getLaswsBySubCategory({ subcategory_id: id });
      return res.data || [];
    } catch (err) {
      console.error("Failed to fetch laws", err);
      return [];
    }
  }, []);

  const fetchSubjects = useCallback(async (id) => {
    if (!id) return [];
    try {
      const res = await getSubjectsByLaw({ law_id: id });
      return res.data || [];
    } catch (err) {
      console.error("Failed to fetch subjects", err);
      return [];
    }
  }, []);

  const fetchCourseList = useCallback(async (type) => {
    setCourseList([]);
    try {
      let res;
      if (type === "mains") res = await getMains(1, 1000);
      else if (type === "notes") res = await getNotes(1, 1000);
      else if (type === "prelimes") res = await getPrelims(1, 1000);
      const normalized = (res?.data || []).map((item) => ({
      id: item.notes_id || item.mains_id || item.prelimes_id,
      title: item.title,
    }));
    setCourseList(normalized);
    } catch (err) {
      console.error("Failed to fetch course list", err);
    }
  }, []);

  useEffect(() => {
    if (isEdit && initialData) {
      setOriginalPrice(initialData.original_price || "");
      setStrikePrice(initialData.strike_price || "");
      setHandlingFee(initialData.handling_fee || "");
      setDiscountPercent(initialData.discount_percent || "");

      if (initialData.duration) {
        const parts = initialData.duration.split(" ");
        setDurationValue(parts[0] || "");
        setDurationUnit(parts[1] || "years");
      }

      const type = initialData.course_type || "";
      setCourseType(type);
      setCourseId(initialData.course_id || "");

      const details = initialData.courseDetails;

      const loadEditData = async () => {
        if (type === "full-course" && details) {
          const catId = details.categoryId || "";
          const subCatId = details.subcategory_id || "";

          const cats = await fetchCategories();
          setCategories(cats);

          if (catId) {
            setSelectedCategory(catId);
            const subs = await fetchSubCategories(catId);
            setSubcategories(subs);
            if (subCatId) {
              setSelectedSubCategory(subCatId);
            }
          }
        } else if (type === "subject-wise" && details) {
          const catId = details.categoryId || "";
          const subCatId = details.subcategory_id || "";
          const lawId = details.law_id || "";
          const subjectId = details.subjectId || "";

          const cats = await fetchCategories();
          setCategories(cats);

          if (catId) {
            setSelectedCategory(catId);
            const subs = await fetchSubCategories(catId);
            setSubcategories(subs);

            if (subCatId) {
              setSelectedSubCategory(subCatId);
              const lawsList = await fetchLaws(subCatId);
              setLaws(lawsList);

              if (lawId) {
                setSelectedLaw(lawId);
                const subjectsList = await fetchSubjects(lawId);
                setSubjects(subjectsList);

                if (subjectId) {
                  setSelectedSubject(subjectId);
                }
              }
            }
          }
        } else if (["mains", "notes", "prelimes"].includes(type)) {
          await fetchCourseList(type);
        }
      };

      loadEditData();
    }
  }, [initialData, isEdit, fetchCategories, fetchSubCategories, fetchLaws, fetchSubjects, fetchCourseList]);

  const handleCourseTypeChange = (e) => {
    const type = e.target.value;
    setCourseType(type);
    setCourseId("");
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSelectedLaw("");
    setSelectedSubject("");
    setCategories([]);
    setSubcategories([]);
    setLaws([]);
    setSubjects([]);
    setCourseList([]);

    if (type === "full-course" || type === "subject-wise") {
      fetchCategories().then((cats) => setCategories(cats));
    } else if (["mains", "notes", "prelimes"].includes(type)) {
      fetchCourseList(type);
    }
  };

  const handleCategoryChange = (e) => {
    const id = e.target.value;
    setSelectedCategory(id);
    setSelectedSubCategory("");
    setSelectedLaw("");
    setSelectedSubject("");
    setCourseId("");
    setSubcategories([]);
    setLaws([]);
    setSubjects([]);
    fetchSubCategories(id).then((subs) => setSubcategories(subs));
  };

  const handleSubCategoryChange = (e) => {
    const id = e.target.value;
    setSelectedSubCategory(id);
    setSelectedLaw("");
    setSelectedSubject("");
    setLaws([]);
    setSubjects([]);

    if (courseType === "full-course") {
      setCourseId(id);
    } else {
      setCourseId("");
      fetchLaws(id).then((l) => setLaws(l));
    }
  };

  const handleLawChange = (e) => {
    const id = e.target.value;
    setSelectedLaw(id);
    setSelectedSubject("");
    setSubjects([]);
    setCourseId("");
    fetchSubjects(id).then((s) => setSubjects(s));
  };

  const handleSubjectChange = (e) => {
    const id = e.target.value;
    setSelectedSubject(id);
    setCourseId(id);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      original_price: originalPrice,
      strike_price: strikePrice,
      duration: `${durationValue} ${durationUnit}`,
      handling_fee: handlingFee,
      discount_percent: discountPercent,
      course_type: courseType,
      course_id: courseId,
    };

    if (isEdit && initialData?.planId) {
      payload.planId = initialData.planId;
    }

    onSubmit(payload);
    onClose();
  };

  const renderCourseFields = () => {
    if (!courseType) return null;

    if (courseType === "full-course") {
      return (
        <>
          <div className="col-md-6 mb-3">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={handleCategoryChange}
              disabled={isEdit}
              required
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Sub Category</label>
            <select
              className="form-select"
              value={selectedSubCategory}
              onChange={handleSubCategoryChange}
              disabled={isEdit || !selectedCategory}
              required
            >
              <option value="">Select Sub Category</option>
              {subcategories.map((s) => (
                <option key={s.subcategory_id} value={s.subcategory_id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
        </>
      );
    }

    if (courseType === "subject-wise") {
      return (
        <>
          <div className="col-md-6 mb-3">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={handleCategoryChange}
              disabled={isEdit}
              required
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Sub Category</label>
            <select
              className="form-select"
              value={selectedSubCategory}
              onChange={handleSubCategoryChange}
              disabled={isEdit || !selectedCategory}
              required
            >
              <option value="">Select Sub Category</option>
              {subcategories.map((s) => (
                <option key={s.subcategory_id} value={s.subcategory_id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Law</label>
            <select
              className="form-select"
              value={selectedLaw}
              onChange={handleLawChange}
              disabled={isEdit || !selectedSubCategory}
              required
            >
              <option value="">Select Law</option>
              {laws.map((l) => (
                <option key={l.lawId} value={l.lawId}>
                  {l.title}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Subject</label>
            <select
              className="form-select"
              value={selectedSubject}
              onChange={handleSubjectChange}
              disabled={isEdit || !selectedLaw}
              required
            >
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s.subjectId} value={s.subjectId}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
        </>
      );
    }

    if (["mains", "notes", "prelimes"].includes(courseType)) {
      const label =
        courseType === "mains" ? "Mains" :
        courseType === "notes" ? "Notes" : "Prelimes";

      return (
        <div className="col-md-6 mb-3">
          <label className="form-label">{label}</label>
          <select
            className="form-select"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            disabled={isEdit}
            required
          >
            <option value="">Select {label}</option>
            {courseList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>
      );
    }
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="row">

        <div className="col-md-6 mb-3">
          <label className="form-label">Original Price</label>
          <input
            type="number"
            className="form-control"
            placeholder="Enter original price"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            required
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Strike Price</label>
          <input
            type="number"
            className="form-control"
            placeholder="Enter strike price"
            value={strikePrice}
            onChange={(e) => setStrikePrice(e.target.value)}
            required
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Duration</label>
          <input
            type="number"
            className="form-control"
            placeholder="Enter duration"
            value={durationValue}
            onChange={(e) => setDurationValue(e.target.value)}
            required
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Unit</label>
          <select
            className="form-select"
            value={durationUnit}
            onChange={(e) => setDurationUnit(e.target.value)}
          >
            <option value="">Select unit</option>
            <option value="months">Months</option>
            <option value="years">Years</option>
          </select>
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Handling Fee (%)</label>
          <input
            type="number"
            className="form-control"
            placeholder="Enter handling fee %"
            value={handlingFee}
            onChange={(e) => setHandlingFee(e.target.value)}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Discount (%)</label>
          <input
            type="number"
            className="form-control"
            placeholder="Enter discount %"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Course Type</label>
          <select
            className="form-select"
            value={courseType}
            onChange={handleCourseTypeChange}
            disabled={isEdit}
            required
          >
            <option value="">Select course type</option>
            <option value="full-course">Full-Course</option>
            <option value="subject-wise">Subject-wise</option>
            <option value="mains">Mains</option>
            <option value="notes">Notes</option>
            <option value="prelimes">Prelimes</option>
          </select>
        </div>

        {renderCourseFields()}

      </div>

      <div className="text-end mt-3">
        <button type="button" className="btn btn-secondary me-2" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-success">
          {isEdit ? "Update Plan" : "Add Plan"}
        </button>
      </div>
    </form>
  );
}

export default PlansForm;