require("dotenv").config({ path: ".env" })
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
// Using sendBatchMessage + task parallel to 100 messages => 17 seconds

const processMessage = async () => {
    console.log("Starting....")
    console.time()
    let messages = []
    let promisesSendMessage = []
    for (let index = 0; index < 1000; index += 1) {
        messages.push({
            Id: uuid.v4(),
            MessageBody: JSON.stringify({ "to": "teste2@gmail.com", "message": "teste2" })
        })

        if (messages.length === 10) {
            promisesSendMessage.push(
                sqs.sendMessageBatch({
                    QueueUrl: process.env.QUEUE,
                    Entries: messages
                }).promise()
            )
            messages = []
        }

        if (promisesSendMessage.length == 4) {
            console.log(">>>> Publishing 40 messages to sqs")
            await Promise.all(promisesSendMessage)
            promisesSendMessage = []
        }
    }

    if (promisesSendMessage.length > 0) {
        console.log(`>>>> Publishing ${10 * promisesSendMessage.length} messages to sqs`)
        await Promise.all(promisesSendMessage)
        promisesSendMessage = []
    }
    console.timeEnd()
    console.log("Finish....")
}

processMessage()
