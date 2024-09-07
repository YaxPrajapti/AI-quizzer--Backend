module.exports.extractQuizJSON = (quiz) => {
  //   console.log(quiz);
  const startIndexOfObj = quiz.indexOf("[");
  const endIndexOfObj = quiz.lastIndexOf("]");
  const jsonObj = JSON.parse(
    quiz.substring(startIndexOfObj, endIndexOfObj + 1)
  );
  return jsonObj;
};
