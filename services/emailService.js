const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config({});

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.email",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

module.exports.sendMail = async (evaluation, quizName, candidateEmail) => {
  try {
    const formattedSuggestions = evaluation.suggestions
      .map((suggestion, index) => `<li>${suggestion}</li>`)
      .join("");

    // Send mail with the defined transport object
    const info = await transporter.sendMail({
      from: `Yax Prajapati 👻" <${process.env.EMAIL}>`, // sender address
      to: candidateEmail, // list of receivers
      subject: `${quizName} Evaluation Results`, // Subject line
      text: `Here is your score: ${evaluation.finalScore}`, // plain text body
      html: `
          <h3>Your Final Score: ${evaluation.finalScore}</h3>
          <h3>Suggestions to Improve:</h3>
          <ol>${formattedSuggestions}</ol>
        `, // HTML body with formatted suggestions
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
