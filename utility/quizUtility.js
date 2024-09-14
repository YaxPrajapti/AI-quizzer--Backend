module.exports.extractQuizJSON = (quiz) => {
  const startIndexOfObj = quiz.indexOf("[");
  const endIndexOfObj = quiz.lastIndexOf("]");
  const jsonObj = JSON.parse(
    quiz.substring(startIndexOfObj, endIndexOfObj + 1)
  );
  return jsonObj;
};

module.exports.getFilter = (req) => {
  const { grade, subject, marks, from, to } = req.query;
  let filter = {};
  if (grade) {
    filter.grade = grade;
  }
  if (subject) {
    filter.subject = subject;
  }
  if (marks) {
    filter.score = Number(marks);
  }
  if (from && to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setTime(new Date().getTime()); 
    filter.completedDate = { $gte: fromDate, $lte: toDate };
  }
  return filter;
};

module.exports.extractScoreAndSuggestions = (response) => {
  const scoreStart = response.indexOf("Final Score:");
  let finalScore = null;
  if (scoreStart !== -1) {
    const scoreLine = response
      .substring(scoreStart + 12)
      .split("\n")[0]
      .trim();
    finalScore = parseInt(scoreLine, 10);
  }

  const suggestionsStart = response.indexOf("Suggestions to improve skills:");
  const suggestions = [];
  if (suggestionsStart !== -1) {
    const suggestionLines = response.substring(suggestionsStart).split("\n");
    const suggestion1 = suggestionLines[1]?.trim().slice(3);
    const suggestion2 = suggestionLines[2]?.trim().slice(3);
    if (suggestion1) suggestions.push(suggestion1);
    if (suggestion2) suggestions.push(suggestion2);
  }
  const finalRes = { finalScore: finalScore, suggestions: suggestions };
  return finalRes;
};
