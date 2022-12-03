const cluster = require("cluster")
const { Consumer } = require('sqs-consumer');
const AWS = require("aws-sdk")

const credentials = new AWS.SharedIniFileCredentials({ profile: 'default'});
AWS.config.credentials = credentials;

const ses = new AWS.SES(
    {
        region: "us-east-1"
    }
)

const sendEmail = async (data) => {
    console.log(`>>> ${new Date().toISOString()} | ${process.pid} | Sending email`)
    await ses.sendEmail({
        Source: "tiagorosadacost@gmail.com",
        Destination: {
            ToAddresses: [data.to],
        },
        Message: {
            Subject: {
                Data: "Test"
            },
            Body: {
                Text: {
                    Data: data.message
                }
            }
        }
    }).promise()
    console.log(`>>> ${new Date().toISOString()} | ${process.pid} | Sended email`)
}

if (cluster.isMaster) {
    for (let index = 0; index < 4; index++) {
        cluster.fork()
    }
} else {
    require("dotenv").config({ path: ".env" })
    console.log(`Starting consumer ${process.pid}`)
    const app = Consumer.create({
        queueUrl: process.env.QUEUE,
        handleMessage: async (message) => {
            const data = JSON.parse(message.Body)
            sendEmail(data);
        }
    });
    
    app.on('error', (err) => {
        console.error(err.message);
    });
    
    app.on('processing_error', (err) => {
        console.error(err.message);
    });
    
    app.start();
}
