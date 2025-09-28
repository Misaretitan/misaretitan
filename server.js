const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const SUBSCRIBERS_FILE = "subscribers.json";

// Load existing subscribers
let subscribers = [];
if (fs.existsSync(SUBSCRIBERS_FILE)) {
  subscribers = JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, "utf-8"));
}

// Save subscribers to file
function saveSubscribers() {
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
}

// Admin credentials
const ADMIN_USER = "msas";
const ADMIN_PASS = "Seals.com1";

// Store active sessions (token → username)
let sessions = {};

// Nodemailer transporter (Gmail + App Password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "seals.securiti@gmail.com",
    pass: "ghma ohaq prqk smti", // Gmail App Password
  },
});

// Subscribe endpoint
app.post("/subscribe", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  if (!subscribers.includes(email)) {
    subscribers.push(email);
    saveSubscribers();
    return res.json({ message: "✅ Subscribed successfully!" });
  } else {
    return res.json({ message: "⚠️ Already subscribed!" });
  }
});

// Admin login
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    // Generate a session token
    const token = crypto.randomBytes(16).toString("hex");
    sessions[token] = username;
    return res.json({ success: true, message: "✅ Login successful", token });
  }
  return res.status(401).json({ success: false, message: "❌ Invalid credentials" });
});

// Send newsletter
app.post("/admin/send", (req, res) => {
  const { token, subject, message } = req.body;

  if (!token || !sessions[token]) {
    return res.status(401).json({ success: false, message: "❌ Unauthorized" });
  }

  if (!subject || !message) {
    return res.status(400).json({ success: false, message: "⚠️ Subject and message are required" });
  }

  if (subscribers.length === 0) {
    return res.status(400).json({ success: false, message: "⚠️ No subscribers to send" });
  }

  // Send to all subscribers
  const mailOptions = {
  from: `"Misaree Seals And Security | Cybersecurity | EthicalHacking" <seals.securiti@gmail.com>`,
  to: subscribers.join(","),
  subject,
  text: message, // fallback for older email clients
  html: `
    <div style="font-family: Arial, sans-serif; line-height:1.6; padding:20px; color:#333;">
      <h2 style="color:#004aad;">${subject}</h2>
      <p>${message}</p>
      <hr/>
      <p style="font-size:12px; color:#777;">
        © Misaree Seals And Security – Cybersecurity & EthicalHacking
      </p>
    </div>
  `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Error sending email:", error);
      return res.status(500).json({ success: false, message: "❌ Failed to send emails" });
    }
    console.log("✅ Emails sent:", info.response);
    res.json({ success: true, message: "✅ Newsletter sent to all subscribers!" });
  });
});

// Test endpoint
app.get("/", (req, res) => {
  res.send("🚀 Server is running...");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
