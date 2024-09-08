module.exports.extractQuizJSON = (quiz) => {
  //   console.log(quiz);
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
    filter.completedDate = { $gte: fromDate, $lte: toDate };
  }
  return filter;
};
