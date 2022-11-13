require("dotenv").config()
const cluster = require("cluster")
const fakeData = require("../fake.json")
const cpus = 8


// 1 message => 5 seconds
// 100 messages => 2 minutes and 04 seconds
// Using sendBatchMessage to 100 messages => 33 seconds 
// Using sendBatchMessage + task parallel to 100 messages => 17 seconds
// Using sendBatchMessage + task parallel + reuse http connection to 100 messages => 7 seconds
// Using sendBatchMessage + task parallel + reuse http connection + cluster module to 100 messages => 7 seconds


if (cluster.isMaster) {
    const totalItemsForeachProcess = (fakeData.length / cpus)
    for (let index = 0; index < fakeData.length; index += totalItemsForeachProcess) {
        cluster.fork()
        const lastPosition = Object.keys(cluster.workers).length
        cluster.workers[lastPosition].send({ index, limit: totalItemsForeachProcess })
    }
} else {
    const AWS = require("aws-sdk")
    const uuid = require("uuid")
    const http = require('https');
    const agent = new http.Agent({
        keepAlive: true,
        // Infinity is read as 50 sockets
        // maxSockets: Infinity
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

    process.on("message", async (data) => {
        const registers = []
        for (let index = data.index; index < (data.index + data.limit); index++) {
            registers.push(fakeData[index])
        }

        console.log(`>>> Starting process ${process.pid}`)
        console.time()
        let messages = []
        let promisesSendMessage = []
        for (let index = 0; index < registers.length; index += 1) {
            messages.push({
                Id: uuid.v4(),
                MessageBody: JSON.stringify(registers[0])
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
        console.log(`>>> Finished process ${process.pid}`)
        console.timeEnd()
        process.exit()
    })
}

