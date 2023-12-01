
  const config = {
    collectCoverageFrom: [
      '**/*.{js,jsx}',
      "!jest.config.js"
    ],
    coverageDirectory: './coverage/',
    collectCoverage: true,
    reporters: [
        "default",
        ["jest-junit", { "outputDirectory": "./testResult", "outputName": "junit.xml" }]
      ]
  };
  
  module.exports = config;