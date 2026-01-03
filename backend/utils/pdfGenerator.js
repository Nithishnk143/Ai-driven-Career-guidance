// backend/utils/pdfGenerator.js
const { jsPDF } = require("jspdf");

/**
 * Generate Career Counselling Portfolio PDF
 * @param {Object} user - User object from memory
 * @param {Object} testResponse - Test response object from memory
 * @returns {Buffer} PDF buffer
 */
const generatePDF = async (user, testResponse) => {
  try {
    const doc = new jsPDF();

    // --- Header ---
    doc.setFontSize(20);
    doc.setTextColor(0, 102, 204);
    doc.text("Career Counselling Portfolio", 20, 20);

    // --- Personal Information ---
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Personal Information", 20, 40);

    doc.setFontSize(12);
    doc.text(`Name: ${user.name || ""}`, 20, 55);
    doc.text(`Email: ${user.email || ""}`, 20, 65);
    doc.text(`Phone: ${user.phone || ""}`, 20, 75);
    doc.text(`Status: ${user.class_status || ""}`, 20, 85);

    // Profile extras
    const profile = user.profile || {};
    let y = 95;
    if (profile.studentType) {
      doc.text(`Student Type: ${profile.studentType}`, 20, y); y += 10;
    }
    if (profile.stream) { doc.text(`Stream: ${profile.stream}`, 20, y); y += 10; }
    if (profile.academicPercentile) { doc.text(`Academic %: ${profile.academicPercentile}`, 20, y); y += 10; }
    if (profile.ieltsSat) { doc.text(`IELTS/SAT: ${profile.ieltsSat}`, 20, y); y += 10; }
    if (profile.bachelorStream) { doc.text(`Bachelor's Stream: ${profile.bachelorStream}`, 20, y); y += 10; }
    if (profile.careerGoal) { doc.text(`Career Goal: ${profile.careerGoal}`, 20, y); y += 10; }
    if (profile.greGmat) { doc.text(`GRE/GMAT: ${profile.greGmat}`, 20, y); y += 10; }
    if (profile.experienceYears != null) { doc.text(`Experience (yrs): ${profile.experienceYears}`, 20, y); y += 10; }

    // Research papers (PG/PhD)
    if (Array.isArray(profile.researchPapers) && profile.researchPapers.length) {
      doc.setFontSize(14);
      doc.text("Research Papers", 20, y + 10);
      y += 20;
      doc.setFontSize(12);
      profile.researchPapers.slice(0, 6).forEach((p) => {
        const line = `• ${p.title || "Untitled"} ${p.year ? `(${p.year})` : ""}`;
        const wrapped = doc.splitTextToSize(line, 170);
        doc.text(wrapped, 25, y);
        y += 10 + (wrapped.length - 1) * 6;
      });
    }

    // --- Career Suggestion ---
    const suggestion = testResponse?.careerSuggestion || {};
    const roles = Array.isArray(suggestion.roles) ? suggestion.roles : [];
    const courses = Array.isArray(suggestion.courses) ? suggestion.courses : [];
    const description = suggestion.description || "";

    doc.setFontSize(16);
    doc.text("Career Recommendation", 20, Math.min(y + 10, 200));

    doc.setFontSize(12);
    const baseY = Math.min(y + 25, 215);
    doc.text(`Recommended Domain: ${suggestion.domain || "N/A"}`, 20, baseY);
    doc.text(`Suggested Roles:`, 20, baseY + 15);

    let yPos = baseY + 25;
    roles.forEach((role) => {
      doc.text(`• ${role}`, 25, yPos);
      yPos += 10;
    });

    doc.text(`Recommended Courses:`, 20, yPos + 5);
    yPos += 15;
    courses.forEach((course) => {
      doc.text(`• ${course}`, 25, yPos);
      yPos += 10;
    });

    // --- Description / Summary ---
    doc.text("Assessment Summary:", 20, yPos + 5);
    const splitDescription = doc.splitTextToSize(description, 170);
    doc.text(splitDescription, 20, yPos + 15);

    // --- Footer ---
    doc.setFontSize(10);
    doc.setTextColor(100);
    const generatedDate = new Date().toLocaleDateString();
    doc.text(`Generated on: ${generatedDate}`, 20, 280);
    doc.text("Career Counselling Web App", 150, 280);

    const arrayBuffer = doc.output("arraybuffer");
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("PDF Generation Error:", error);
    throw error;
  }
};

module.exports = {
  generatePDF,
};
