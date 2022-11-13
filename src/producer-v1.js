require("dotenv").config()

const AWS = require("aws-sdk")
var credentials = new AWS.SharedIniFileCredentials({ profile: 'default' });
AWS.config.credentials = credentials;
const sqs = new AWS.SQS({
    region: 'us-east-1'
})

// 1 message => 5 seconds
// 100 messages => 2 minutes and 04 seconds
const processMessage = async () => {
    console.log("Starting....")
    console.time()
    for (let index = 0; index < 100000; index += 1) {
        console.log(">>>>> Publishing 1 message")
        await sqs.sendMessage({
            QueueUrl: process.env.QUEUE,
            MessageBody: JSON.stringify({ teste: "teste" })
        }).promise()
    }
    console.timeEnd()
    console.log("Finish....")
}

processMessage()
