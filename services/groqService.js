const grodSDK = require("groq-sdk");
require("dotenv").config();

const Groq = grodSDK.Groq;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

module.exports.generateNewQuiz = async (quizDetails) => {
  // console.log(quizDetails);
  const prompt = `I am trying to create a MCQ quiz for my students. I want your help to generate a new MCQ quiz based on the details I will provide you. Generate a quiz for grade ${quizDetails.grade} of subject ${quizDetails.subject}, keep ${quizDetails.totalQuestions}. The maxScore for quiz will be ${quizDetails.maxScore} and keep difficutly of ${quizDetails.difficulty} level. Provides ans for each question also. Formate response in array JOSN of questions. Just give me objects containing quiestions, options and asnwers. No extra strings nothing so extraction json objects becomes esier for me`;
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "mixtral-8x7b-32768",
  });
  const content = completion.choices[0]?.message?.content || "";
  console.log(content);
  return content;
};

module.exports.scoreQuiz = async (payload) => {
  const prompt = `You are a teacher in class who is assigned a task to evaluate a quiz taken by students. Here is the quiz data: ${JSON.stringify(
    payload
  )}. The data includes question IDs and user responses. Your task is to evaluate the answers and provide the total score in a consistent format. 

  Format your response as follows:
  Final Score: [score]

  Only include the final score in this format. Do not add any other text or explanations.`;
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "mixtral-8x7b-32768",
  });
  const content = completion.choices[0]?.message?.content || "";
  const score = content.split("\n")[0]?.split("Final Score: ")[1]?.trim(); 
  return score;
};
