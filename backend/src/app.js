const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const multer = require("multer")
const path = require('path')
const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "https://resumebuilderproject-w9zi.onrender.com",
    credentials: true
}))

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")


/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

app.use((err, req, res, next) => {
    console.error("Request failed:", err)

    if (err instanceof multer.MulterError) {
        const message = err.code === "LIMIT_FILE_SIZE"
            ? "Resume must be 3MB or smaller."
            : err.message

        return res.status(400).json({ message })
    }

    return res.status(err.statusCode || 500).json({
        message: err.statusCode ? err.message : "Internal server error."
    })
})

// Serve React build
app.use(express.static(path.join(__dirname, "../public")));

// React Router
app.get("*name", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});


module.exports = app