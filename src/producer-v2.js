require("dotenv").config()

const AWS = require("aws-sdk")
const uuid = require("uuid")

var credentials = new AWS.SharedIniFileCredentials({ profile: 'default' });
AWS.config.credentials = credentials;
const sqs = new AWS.SQS({
    region: 'us-east-1'
})

// 1 message => 5 seconds
// 100 messages => 2 minutes and 04 seconds
// Using sendBatchMessage to 100 messages => 33 seconds 

const processMessage = async () => {
    console.log("Starting....")
    console.time()

    let messages = []
    for (let index = 0; index < 100000; index += 1) {
        
        messages.push({
            Id: uuid.v4(),
            MessageBody: JSON.stringify({
                teste: "teste"
            })
        })

        if (messages.length === 10) {
            await sqs.sendMessageBatch({
                QueueUrl: process.env.QUEUE,
                Entries: messages
            }).promise()
            console.log("Publising 10 messages....")
            messages = []
        }
    }
    console.timeEnd()
    console.log("Finish....")
}

processMessage()
