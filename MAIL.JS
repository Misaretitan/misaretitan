const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

let subscribers = []; // In production, use a real database

app.use(bodyParser.json());
app.use(cors()); // allows HTML form to connect

// Subscribe route
app.post("/subscribe", (req, res) => {
  const { email } = req.body;
  if (!subscribers.includes(email)) {
    subscribers.push(email);
  }
  res.json({ message: "Subscribed successfully!" });
});

// Send newsletter (admin only – here simplified)
app.post("/send-newsletter", (req, res) => {
  const { subject, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: "briankoros02@gmail.com", pass: "admin@123" }
  });

  subscribers.forEach(email => {
    transporter.sendMail({
      from: "your@gmail.com",
      to: email,
      subject: subject,
      text: message
    });
  });

  res.json({ message: "Newsletter sent!" });
});

app.listen(3000, () => console.log("Server running on port 3000"));
