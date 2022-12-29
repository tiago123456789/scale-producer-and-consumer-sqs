require("dotenv").config({ path: ".env" })

const AWS = require("aws-sdk")
const amqp = require('amqplib');

const credentials = new AWS.SharedIniFileCredentials({ profile: 'default' });
AWS.config.credentials = credentials;

const lambdaClient = new AWS.Lambda({
    region: "us-east-1"
})

const startConsumer = async () => {
    const connection = await amqp.connect(process.env.RABBIT_URL)
    const channel = await connection.createChannel()
    const exchange = 'messages';
    await channel.assertExchange(exchange, 'direct', {
        durable: false
    });

    const q = await channel.assertQueue('', { exclusive: true })
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
    await channel.bindQueue(q.queue, exchange, '');

    channel.consume(q.queue, async function (msg) {
        if (msg.content) {
            const key = Math.random().toString()
            console.time(key);
            console.log(" [x] %s", msg.content.toString());
            await lambdaClient.invoke({
                FunctionName: "consumer-v3-sqs-dev-notify",
                InvocationType: "Event",
                Payload: JSON.stringify({
                    Records: [
                        { body: msg.content.toString() }
                    ]
                })
            })
            .promise()
            console.timeEnd(key);
            // { "to": "tiagorosadacost+11@gmail.com", "message": "teste teste" }
        }
    });

};

startConsumer()
// const ses = new AWS.SES(
//     {
//         region: "us-east-1"
//     }
// )

// const sendEmail = async (data) => {
//     console.log(`>>> ${new Date().toISOString()} | Sending email`)
//     await ses.sendEmail({
//         Source: "tiagorosadacost@gmail.com",
//         Destination: {
//             ToAddresses: [data.to],
//         },
//         Message: {
//             Subject: {
//                 Data: "Test"
//             },
//             Body: {
//                 Text: {
//                     Data: data.message
//                 }
//             }
//         }
//     }).promise()
//     console.log(`>>> ${new Date().toISOString()} | Sended email`)
// }

// const sleep = (seconds) => {
//     return new Promise((resolve, reject) => {
//         setTimeout(() => resolve(), (seconds * 1000))
//     })
// }

// const app = Consumer.create({
//     queueUrl: process.env.QUEUE,
//     handleMessage: async (message) => {
//         console.time()
//         console.log(">>>>>>>> Processing...")
//         const data = JSON.parse(message.Body)
//         console.log(data);
//         const promisesToSendEmail = []
//         for (let index = 0; index < data.length; index++) {
//             promisesToSendEmail.push(
//                 sendEmail(data[index])
//             )
//         }
//         await Promise.all(promisesToSendEmail)
//         console.log(">>>>>>>> Finish")
//         console.timeEnd()
//     }
// });

// app.on('error', (err) => {
//     console.error(err.message);
// });

// app.on('processing_error', (err) => {
//     console.error(err.message);
// });

// app.start();