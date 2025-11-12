module.exports = {
  testEnvironment: "node",
  testMatch: ["**/src/tests/**/*.test.js", "**/src/tests/**/*.spec.js"],
  verbose: true,
  // si no usas transformadores/ Babel, dejar transform vacío
  transform: {},
  coverageDirectory: "./coverage"
};