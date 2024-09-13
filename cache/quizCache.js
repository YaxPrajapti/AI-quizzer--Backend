const Redis = require("redis");
const dotenv = require("dotenv").config({});

const client = Redis.createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: "redis-11510.c212.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 11510,
  },
});
client.on("error", (err) => console.log("Redis Client Error", err));
(async () => {
  try {
    await client.connect();
    console.log("Connected to Redis successfully.");
  } catch (error) {
    console.error("Error connecting to Redis:", error.message);
  }
})();

module.exports.save_quiz = async (key, value) => {
  try {
    await client.set(key, JSON.stringify(value), {
      EX: 3600,
    });
    console.log("Quiz stored in Redis cache successfully.");
  } catch (error) {
    console.error("Quiz is not saved in chache");
  }
};

module.exports.get_quiz = async (key) => {
  try {
    const quizData = await client.get(key);
    return quizData ? JSON.parse(quizData) : null;
  } catch (error) {
    console.error("Error in fetching quiz from redis", error);
  }
};
