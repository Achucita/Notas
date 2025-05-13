const db = require("./database")
const nodemailer = require("nodemailer")

// Configuración del transporte de correo
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.example.com",
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "user@example.com",
    pass: process.env.EMAIL_PASS || "password",
  },
})

// Obtener todas las notas de un usuario
async function obtenerNotas(req, res) {
  try {
    const userId = req.user.id
    const notas = await db.query("SELECT * FROM notas WHERE usuario_id = ?", [userId])
    res.status(200).json(notas)
  } catch (error) {
    console.error("Error al obtener notas:", error)
    res.status(500).json({ error: "Error al obtener las notas" })
  }
}

// Crear una nueva nota
async function crearNota(req, res) {
  try {
    const { titulo, contenido } = req.body
    const userId = req.user.id

    if (!titulo || !contenido) {
      return res.status(400).json({ error: "El título y el contenido son obligatorios" })
    }

    const fecha = new Date().toISOString()
    const result = await db.run("INSERT INTO notas (titulo, contenido, fecha, usuario_id) VALUES (?, ?, ?, ?)", [
      titulo,
      contenido,
      fecha,
      userId,
    ])

    res.status(201).json({
      id: result.lastID,
      message: "Nota creada con éxito",
    })
  } catch (error) {
    console.error("Error al crear nota:", error)
    res.status(500).json({ error: "Error al crear la nota" })
  }
}

// Actualizar una nota existente
async function actualizarNota(req, res) {
  try {
    const { id } = req.params
    const { titulo, contenido } = req.body
    const userId = req.user.id

    if (!titulo && !contenido) {
      return res.status(400).json({ error: "Debe proporcionar al menos un campo para actualizar" })
    }

    // Verificar que la nota existe y pertenece al usuario
    const nota = await db.get("SELECT * FROM notas WHERE id = ?", [id])

    if (!nota) {
      return res.status(404).json({ error: "Nota no encontrada" })
    }

    if (nota.usuario_id !== userId) {
      return res.status(403).json({ error: "No tienes permiso para actualizar esta nota" })
    }

    // Actualizar solo los campos proporcionados
    const updates = []
    const values = []

    if (titulo) {
      updates.push("titulo = ?")
      values.push(titulo)
    }

    if (contenido) {
      updates.push("contenido = ?")
      values.push(contenido)
    }

    updates.push("fecha = ?")
    values.push(new Date().toISOString())

    // Añadir el ID al final para la cláusula WHERE
    values.push(id)

    await db.run(`UPDATE notas SET ${updates.join(", ")} WHERE id = ?`, values)

    res.status(200).json({ message: "Nota actualizada con éxito" })
  } catch (error) {
    console.error("Error al actualizar nota:", error)
    res.status(500).json({ error: "Error al actualizar la nota" })
  }
}

// Eliminar una nota
async function eliminarNota(req, res) {
  try {
    const { id } = req.params
    const userId = req.user.id

    // Verificar que la nota existe y pertenece al usuario
    const nota = await db.get("SELECT * FROM notas WHERE id = ?", [id])

    if (!nota) {
      return res.status(404).json({ error: "Nota no encontrada" })
    }

    if (nota.usuario_id !== userId) {
      return res.status(403).json({ error: "No tienes permiso para eliminar esta nota" })
    }

    await db.run("DELETE FROM notas WHERE id = ?", [id])

    res.status(200).json({ message: "Nota eliminada con éxito" })
  } catch (error) {
    console.error("Error al eliminar nota:", error)
    res.status(500).json({ error: "Error al eliminar la nota" })
  }
}

// Enviar notificación por correo electrónico
async function enviarNotificacion(req, res) {
  try {
    const { destinatario, asunto, mensaje } = req.body

    if (!destinatario || !asunto || !mensaje) {
      return res.status(400).json({ error: "Destinatario, asunto y mensaje son obligatorios" })
    }

    // Enviar correo
    await transporter.sendMail({
      from: process.env.EMAIL_USER || "notificaciones@example.com",
      to: destinatario,
      subject: asunto,
      text: mensaje,
      html: `<p>${mensaje}</p>`,
    })

    res.status(200).json({ message: "Notificación enviada con éxito" })
  } catch (error) {
    console.error("Error al enviar notificación:", error)
    res.status(500).json({ error: "Error al enviar la notificación" })
  }
}

module.exports = {
  obtenerNotas,
  crearNota,
  actualizarNota,
  eliminarNota,
  enviarNotificacion,
}
