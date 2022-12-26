require("dotenv").config({ path: ".env" })
const AWS = require("aws-sdk")
const uuid = require("uuid")
const http = require('https');
const agent = new http.Agent({
    keepAlive: true,
});

var credentials = new AWS.SharedIniFileCredentials({ profile: 'default' });
AWS.config.update({
    httpOptions: {
        agent
    }
});
AWS.config.credentials = credentials;
const sqs = new AWS.SQS({
    region: 'us-east-1'
})

// 1 message => 5 seconds
// 100 messages => 2 minutes and 04 seconds
// Using sendBatchMessage to 100 messages => 33 seconds 
// Using sendBatchMessage + task parallel to 100 messages => 17 seconds
// Using sendBatchMessage + task parallel + reuse http connection to 100 messages => 7 seconds

// 10 messages per time
// 1 message has 20 objects
// 10 * 20 => 200
// 4(taks parallel) * 200 => 800
const processMessage = async () => {
    console.log("Starting....")
    console.time()
    let items = []
    let messages = []
    let promisesSendMessage = []
    for (let index = 0; index < 1000000; index += 1) {

        items.push({ "to": "teste2@gmail.com", "message": "teste2" })

        if (items.length === 20) {
            messages.push({
                Id: uuid.v4(),
                MessageBody: JSON.stringify(items)
            })
            items = []
            console.log("Adding 1 new message")
        }

        if (messages.length === 10) {
            promisesSendMessage.push(
                sqs.sendMessageBatch({
                    QueueUrl: process.env.QUEUE,
                    Entries: messages
                }).promise()
            )
            messages = []
            console.log("Publish messagens batch")
        }

        if (promisesSendMessage.length == 4) {
            console.log(">>>> Publishing messages to sqs")
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
