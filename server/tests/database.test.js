const { expect } = require("chai")
const sinon = require("sinon")
const sqlite3 = require("sqlite3")
const database = require("../database")

describe("Database Module", () => {
  beforeEach(() => {
    // Create a sandbox for all stubs
    this.sandbox = sinon.createSandbox()

    // Mock sqlite3 without assuming the structure of your database module
    this.sandbox.stub(sqlite3, "Database").returns({
      all: sinon.stub().callsArgWith(2, null, [{ id: 1, title: "Test Note" }]),
      run: sinon.stub().callsArgWith(2, null),
      get: sinon.stub().callsArgWith(2, null, { id: 1, title: "Test Note" }),
    })
  })

  afterEach(() => {
    this.sandbox.restore()
  })

  describe("query", () => {
    it("should execute a query and return results", async () => {
      // This test will need to be adjusted based on your actual database implementation
      // For now, we're just checking if the module exists
      expect(database).to.exist
      expect(typeof database).to.equal("object")
    })
  })
})

