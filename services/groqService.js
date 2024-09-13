const grodSDK = require("groq-sdk");
require("dotenv").config();
const quizUtility = require("../utility/quizUtility");

const Groq = grodSDK.Groq;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

module.exports.generateNewQuiz = async (quizDetails) => {
  // console.log(quizDetails);
  const prompt = `You are tasked with generating a multiple-choice quiz for students. Please create a quiz based on the details provided below:

- Grade Level: ${quizDetails.grade}
- Subject: ${quizDetails.subject}
- Number of Questions: ${quizDetails.totalQuestions}
- Maximum Score: ${quizDetails.maxScore}
- Difficulty Level: ${quizDetails.difficulty}

Each question should include the following:
1. A clear and concise question statement.
2. Four distinct options.
3. The correct answer from the options provided.
4. A hint to help students understand the question better.

Format the output as a JSON array of objects. Each object should contain:
- "question": A string representing the question text.
- "options": An array of four strings, each representing a possible answer.
- "answer": A string indicating the correct answer.
- "hint": A string providing a hint for the question.

Return only the JSON array of objects, without any extra text, explanations, or formatting outside of the JSON array. This will help in easy extraction of the JSON objects.

Example format:
[
  {
    "question": "What is 2 + 2?",
    "options": ["1", "2", "3", "4"],
    "answer": "4",
    "hint": "Think about simple addition."
  },
  ...
]

Please adhere strictly to this format to ensure uniform output so it becomes easier for me to convert the string to JSON object.`;
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
  return content;
};

module.exports.scoreQuiz = async (payload) => {
  const prompt = `You are a teacher tasked with evaluating a quiz based on the student's responses. Here's the quiz data: ${JSON.stringify(
    payload
  )}. 
  
  Instructions for evaluation:
  1. Calculate each question's score using the formula: score = Math.floor(userResponse * (maxScore / totalQuestions)).
  2. Ensure the score does not exceed the question's maxScore.
  3. If the response is invalid or incorrect, the score should be 0, if the response is correct then add score by 1.
  4. Sum all individual scores to get the final score, ensuring consistency with the weightage calculations.
  5. Provide two actionable suggestions to improve the student's skills based on incorrect or low-scoring responses.
  
  Format your response as follows:
  Final Score: [calculated score]
  Suggestions to improve skills:
  1. [First suggestion]
  2. [Second suggestion]
  
  Ensure the response strictly follows this format with no additional text or commentary.`;

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
  const res = quizUtility.extractScoreAndSuggestions(content);
  return res;
};
