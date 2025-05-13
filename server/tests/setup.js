// This file sets up the test environment
const path = require("path")
const fs = require("fs")

// Create a tests directory if it doesn't exist
const testsDir = path.join(__dirname)
if (!fs.existsSync(testsDir)) {
  fs.mkdirSync(testsDir, { recursive: true })
}

// Set up environment variables for testing
process.env.NODE_ENV = "test"
process.env.JWT_SECRET = "test-secret-key"
process.env.EMAIL_HOST = "smtp.example.com"
process.env.EMAIL_PORT = "587"
process.env.EMAIL_SECURE = "false"
process.env.EMAIL_USER = "test@example.com"
process.env.EMAIL_PASS = "test-password"

// This prevents tests from using the production database
process.env.DB_PATH = ":memory:"

// Global setup code can go here
console.log("Test environment set up successfully")
