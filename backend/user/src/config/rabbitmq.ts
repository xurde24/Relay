import amqplib from 'amqplib'
import dotenv from 'dotenv'

dotenv.config()

let channel:amqplib.Channel;

//for connecting to a rabbitmq server
export const connectRabbitMQ=async()=>{
    try{
        const connection =await amqplib.connect({
            protocol:"amqp",
            hostname:process.env.RabbitMQ_Host,
            port:5672,
            username:process.env.RabbitMQ_Username,
            password:process.env.RabbitMQ_Password
        });
        channel=await connection.createChannel()
        console.log("Connected to RabbitMQ")
    }
    catch(error){
        console.log("failed to connect rabbitmq",error)
    }
}

//for sending the message to rabbit mq from a producer which is --> (user)
export const publishToQueue=async(queueName:string,message:any)=>{
    if(!channel) {console.log("No RabbitMQ channel detected")
        return;
    }
    await channel.assertQueue(queueName,{durable:true})
    channel.sendToQueue(queueName,Buffer.from(JSON.stringify(message)),{
        persistent:true,
    })


}