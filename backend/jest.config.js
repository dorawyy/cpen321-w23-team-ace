
  const config = {
    collectCoverageFrom: [
      '**/*.{js,jsx}',
    ],
    coverageDirectory: './coverage/',
    collectCoverage: true,
    reporters: [
        "default",
        ["jest-junit", { "outputDirectory": "./backend/BackendTest", "outputName": "junit.xml" }]
      ]
  };
  
  module.exports = config;