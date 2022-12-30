require("dotenv").config({ path: ".env" })

const AWS = require("aws-sdk")
const amqp = require('amqplib');
const https = require('https');
const agent = new https.Agent({
  keepAlive: true
});

const credentials = new AWS.SharedIniFileCredentials({ profile: 'default' });
AWS.config.credentials = credentials;

const lambdaClient = new AWS.Lambda({
    httpOptions: {
        agent
    },
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