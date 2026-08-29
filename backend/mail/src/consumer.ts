import amqplib from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const startSendOtpConsumer = async () => {
    try{
const connection =await amqplib.connect({
            protocol:"amqp",
            hostname:process.env.RabbitMQ_Host,
            port:5672,
            username:process.env.RabbitMQ_Username,
            password:process.env.RabbitMQ_Password
        });
        const channel=await connection.createChannel()
        const queueName="send-otp"
        await channel.assertQueue(queueName,{durable:true})
        console.log("Mail service consumer started listening for otp emails")
        channel.consume(queueName,async(msg)=>{
            if(msg){
                try{
                    const {to,subject,body}=JSON.parse(msg.content.toString())
                    const transporter=nodemailer.createTransport({
                        host:"smtp.gmail.com",
                        port:465,
                        auth:{
                            user:process.env.USER_EMAIL,
                            pass:process.env.USER_PASS,
                        }
                    })
                    await transporter.sendMail({
                        from:"LinkUp",
                        to,
                        subject,
                        text:body,
                    })

                    console.log(`OTP mail sent to ${to}`)
                    channel.ack(msg)

                }
                catch(error){
                    console.log("Error sending otp ",error)
                }
            }
        })
            }
    catch(error){
        console.error("Error in send OTP consumer:", error);
    }
}