// backend/utils/excelExport.js
const XLSX = require("xlsx");

/**
 * Generate Excel workbook buffer from user and test data
 * @param {Object} user - User object from in-memory storage
 * @param {Object} testResponse - Test response object from in-memory storage
 * @returns {Buffer} Excel workbook buffer
 */
const generateExcel = async (user, testResponse) => {
  try {
    const workbook = XLSX.utils.book_new();

    // --- Personal Information Sheet ---
    const profile = user.profile || {};
    const personalData = [
      ["Personal Information", ""],
      ["Name", user.name || ""],
      ["Email", user.email || ""],
      ["Phone", user.phone || ""],
      ["Status", user.class_status || ""],
      ["Student Type", profile.studentType || ""],
      ["Stream", profile.stream || ""],
      ["Academic %", profile.academicPercentile || ""],
      ["IELTS/SAT", profile.ieltsSat || ""],
      ["Bachelor Stream", profile.bachelorStream || ""],
      ["Career Goal", profile.careerGoal || ""],
      ["GRE/GMAT", profile.greGmat || ""],
      ["Experience (yrs)", profile.experienceYears != null ? profile.experienceYears : ""],
      [
        "Registration Date",
        user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "",
      ],
    ];

    const personalSheet = XLSX.utils.aoa_to_sheet(personalData);
    XLSX.utils.book_append_sheet(workbook, personalSheet, "Personal Info");

    // --- Test Responses Sheet ---
    const testData = [["Question ID", "Question", "Answer"]];
    if (testResponse.answers && Array.isArray(testResponse.answers)) {
      testResponse.answers.forEach((answer) => {
        testData.push([
          answer.questionId || "",
          answer.question || `Question ${answer.questionId || ""}`,
          answer.answer || "",
        ]);
      });
    }

    const testSheet = XLSX.utils.aoa_to_sheet(testData);
    XLSX.utils.book_append_sheet(workbook, testSheet, "Test Responses");

    // --- Career Recommendation Sheet ---
    const career = testResponse.careerSuggestion || {};
    const careerData = [
      ["Career Recommendation", ""],
      ["Domain", career.domain || ""],
      ["Description", career.description || ""],
      ["Suggested Roles", ""],
      ...(career.roles && Array.isArray(career.roles)
        ? career.roles.map((role) => ["", role])
        : []),
      ["Recommended Courses", ""],
      ...(career.courses && Array.isArray(career.courses)
        ? career.courses.map((course) => ["", course])
        : []),
    ];

    const careerSheet = XLSX.utils.aoa_to_sheet(careerData);
    XLSX.utils.book_append_sheet(
      workbook,
      careerSheet,
      "Career Recommendation"
    );

    // --- Aggregates Sheet (RIASEC/MI/EI) ---
    if (career.aggregates && typeof career.aggregates === "object") {
      const entries = Object.entries(career.aggregates).sort((a, b) => b[1] - a[1]);
      const aggData = [["Dimension", "Score"], ...entries.map(([k, v]) => [k, v])];
      const aggSheet = XLSX.utils.aoa_to_sheet(aggData);
      XLSX.utils.book_append_sheet(workbook, aggSheet, "Aggregates");
    }

    // --- Research Papers Sheet (if any) ---
    if (Array.isArray(profile.researchPapers) && profile.researchPapers.length) {
      const papersData = [["Title", "Venue", "Year", "Link"]];
      profile.researchPapers.forEach((p) => {
        papersData.push([p.title || "", p.venue || "", p.year || "", p.link || ""]);
      });
      const papersSheet = XLSX.utils.aoa_to_sheet(papersData);
      XLSX.utils.book_append_sheet(workbook, papersSheet, "Research Papers");
    }

    // Generate Excel buffer
    return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  } catch (error) {
    console.error("Excel Generation Error:", error);
    throw error;
  }
};

module.exports = {
  generateExcel,
};
