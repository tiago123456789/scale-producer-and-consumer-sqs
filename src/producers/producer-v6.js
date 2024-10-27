require("dotenv").config({ path: ".env" });
const AWS = require("aws-sdk");
const http = require("https");
const agent = new http.Agent({
  keepAlive: true,
});

var credentials = new AWS.SharedIniFileCredentials({ profile: "tiago" });
AWS.config.update({
  httpOptions: {
    agent,
  },
});
AWS.config.credentials = credentials;
const sqs = new AWS.SQS({
  region: "us-east-1",
});

// Strategies applied:
// Reuse http connection
// Task parallel in node.js
// Add 200 items inside one message
// Put EC2 machine and SQS on same region to reduce latency

const processMessage = async () => {
  console.log("Starting....");
  console.time();
  let messages = [];
  let promisesSendMessage = [];
  for (let index = 0; index < 1000000; index += 1) {
    messages.push({
      to: "teste2@gmail.com",
      message: "teste2",
    });

    if (messages.length === 200) {
      console.log("passed on here");
      promisesSendMessage.push(
        sqs
          .sendMessage({
            QueueUrl: process.env.QUEUE,
            MessageBody: JSON.stringify(messages),
          })
          .promise()
      );
      messages = [];
    }

    if (promisesSendMessage.length === 4) {
      await Promise.all(promisesSendMessage);
      promisesSendMessage = [];
    }
  }

  if (messages.length > 0) {
    promisesSendMessage.push(
      sqs
        .sendMessage({
          QueueUrl: process.env.QUEUE,
          MessageBody: JSON.stringify(messages),
        })
        .promise()
    );
    messages = [];
  }

  if (promisesSendMessage.length > 0) {
    await Promise.all(promisesSendMessage);
    promisesSendMessage = [];
  }
  console.timeEnd();
  console.log("Finish....");
};

processMessage();
