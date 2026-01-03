// backend/data/scholarships.js

const scholarships = [
  {
    id: 1,
    title: "Student Excellence Scholarship",
    description: "For top-performing students excelling in academics",
    eligibility: "Student",
    domains: ["Tech", "Business", "Creative"],
    link: "https://scholarship.com/student-tech",
    amount: "₹50,000 - ₹2,00,000",
    deadline: "March 31, 2025",
  },
  {
    id: 2,
    title: "Skill Upgrade Fellowship",
    description: "For workers aiming to enhance professional skills",
    eligibility: "Worker",
    domains: ["Business", "Tech"],
    link: "https://scholarship.com/worker-business",
    amount: "₹30,000 - ₹1,00,000",
    deadline: "June 30, 2025",
  },
];

module.exports = scholarships;
