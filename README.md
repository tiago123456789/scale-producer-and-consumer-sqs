What is the project?
======================

In this project my focus show how can you publish and consumer huge volume messages, more specificily 1.000.000 messages.

Imagine huge ecommerces send email for all clients about christmas promotion you need delivery emails for all before chirstmas, because if send email after christmas the promotion no more valid and client will can angry.

Another situation is the Google calender notify via email about meet when near the call time. Imagine how many notify the Google calender need send.

I transformed this project to youtube serie in my channel. In this serie I created challenges and each challenge I created script to complete each challenge.


The challenge structure the youtube serie:
============================================

- Publish
    - Publish 1.000 messages to queue.
    - Publish 5.000 messages to queue.
    - Publish 10.000 messages to queue.
    - Publish 100.000 messages to queue.
    - Publish 200.000 messages to queue.
    - Publish 500.000 messages to queue.
    - Publish 1.000.000 messages to queue.
- Consume
    - Consume 1.000 messages to queue.
    - Consume 5.000 messages to queue.
    - Consume 10.000 messages to queue.
    - Consume 100.000 messages to queue.
    - Consume 200.000 messages to queue.
    - Consume 500.000 messages to queue.
    - Consume 1.000.000 messages to queue.

The techniques applied to complete all challenge:
==================================================

- Client sqs(aws-sdk) and use method sendMessageBatch() allow send 10 messages to request and reduce requests unnecessary.
- Task parallel(the node.js feature).
- Reuse http client connection.
- Put publisher application same region the sqs.
- Module cluster(the node.js feature) allow create child process and split all demand between process.

The referencies applied in this project:
=============================================
- https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_SendMessageBatch.html
- https://medium.com/@dinesh_kumar/how-i-ran-two-tasks-in-parallel-using-node-js-5cf8307bddac
- https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/node-reusing-connections.html
- https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-throughput-horizontal-scaling-and-batching.html
- https://nodejs.org/api/cluster.html
- https://www.serverless.com/framework/docs/providers/aws/events/sqs


Instructions to run
=====================

- Clone project
- Execute command **npm install** to download packages necessaries.
- Create **.env** file based **.env.example**
- Execute command **node ./src/producers/producer-version-here.js** to publish messages
- Execute command **node ./src/consumers/consumer-version-here.js** to consume messages


