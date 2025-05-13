const { expect } = require("chai")
const sinon = require("sinon")
const nodemailer = require("nodemailer")
const notificador = require("../notificador")
const database = require("../database")

describe("Notificador Module", () => {
  let req
  let res
  let transporter

  beforeEach(() => {
    // Setup request and response objects
    req = {
      body: {},
      user: { id: 1, username: "testuser" },
      params: {},
    }

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    }

    // Create a sandbox for all stubs
    this.sandbox = sinon.createSandbox()

    // Mock database without assuming its structure
    this.sandbox.stub(database)

    // Stub nodemailer
    transporter = {
      sendMail: sinon.stub().resolves({ messageId: "test-id" }),
    }
    this.sandbox.stub(nodemailer, "createTransport").returns(transporter)
  })

  afterEach(() => {
    this.sandbox.restore()
  })

  describe("obtenerNotas", () => {
    it("should return 200 and notes for the user", async () => {
      // Mock database to return notes
      database.query = sinon.stub().resolves([
        { id: 1, titulo: "Nota 1", contenido: "Contenido 1", fecha: "2023-01-01" },
        { id: 2, titulo: "Nota 2", contenido: "Contenido 2", fecha: "2023-01-02" },
      ])

      await notificador.obtenerNotas(req, res)

      expect(res.status.calledWith(200)).to.be.true
    })
  })
})
