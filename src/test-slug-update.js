// This is a simple test script to verify the slug update functionality
// You can run this with Node.js to test the slug generation

import slugify from "slugify";

// Test cases
const testCases = [
  { name: "Test Community", expected: "test-community" },
  { name: "Web Development 101", expected: "web-development-101" },
  { name: "JavaScript & TypeScript", expected: "javascript-typescript" },
  { name: "React/Next.js Group", expected: "react-next-js-group" },
  { name: "Special Characters: !@#$%^&*()", expected: "special-characters" },
];

// Test the slugify function
testCases.forEach((test) => {
  const slug = slugify(test.name, { lower: true, strict: true });
  console.log(`Name: "${test.name}"`);
  console.log(`Generated slug: "${slug}"`);
  console.log(`Expected slug: "${test.expected}"`);
  console.log(`Test ${slug === test.expected ? "PASSED" : "FAILED"}`);
  console.log("---");
});

// Test slug update scenario
console.log("\nTesting slug update scenario:");
const originalName = "Original Community Name";
const originalSlug = slugify(originalName, { lower: true, strict: true });
console.log(`Original name: "${originalName}"`);
console.log(`Original slug: "${originalSlug}"`);

const updatedName = "Updated Community Name";
const updatedSlug = slugify(updatedName, { lower: true, strict: true });
console.log(`Updated name: "${updatedName}"`);
console.log(`Updated slug: "${updatedSlug}"`);
console.log(`Slug changed: ${originalSlug !== updatedSlug ? "Yes" : "No"}`);
