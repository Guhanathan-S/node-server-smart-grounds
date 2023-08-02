var cron = require("node-cron");
var {deviceTokensData,admin} = require('../firebase_functions/firestore_modules');
const EventEmitter = require('events');
const { response } = require("express");
let eventEmitter = new EventEmitter();

exports.sendPushNotifications  = async (req,res,next) =>{
    try{
    const body = req.body;
    console.log(req.body);
    console.log(body.time);
    sendMessage(body.date,body.time,body.title,body.content,res);
    res.send({
        statuscode: 200,
        message : "message scheduled sucessfully"
    })
    } catch(err){
        console.error(err);
        res.send("message scheduled failed");
    }
}

const sendMessage = (date, time,title,content,res)=>{
    let deviceTokens = deviceTokensData.deviceTokens;
    let deviceTokenKeys = deviceTokensData.deviceTokenKeys;
    var temp = time.split(" ");
    var sec = temp[0].split(":")[1];
    if(temp[1] === "PM" && temp[0].split(":")[0] !== '12')
       time= 12 + parseFloat(temp[0]); 
    else
       time = temp[0].split(":")[0]
    dateString = date.split("-")
    let schedule = [sec,time,dateString[2],dateString[1],"*"].join(" ");
    console.log("Event Schedule Time",schedule);    
    cron.schedule(schedule,()=>{
     console.log(scheduleMessage(deviceTokens,deviceTokenKeys,title,content));
    });
}


function scheduleMessage(deviceTokens,deviceTokenKeys,title,content){
    let messageJson = {
        notification:{
            title: title,
            body: content,
        },
        data:{
            id : "5945321",
            description: "It's a dummy Id."
        },
        android:{
            notification:{
                click_action: "Navigate the route to corresponding screen"
            }
        },
    };
    let messageData = JSON.stringify(messageJson);
    console.log(messageData);   
    try{
        let message={
            data: {
                "message" : messageData,
            },  
            tokens: deviceTokens,   
        };
        admin.messaging().sendEachForMulticast(message).then(async(response) => {
            console.log("message send sucessfuly");
            if(response.failureCount != 0){
              eventEmitter.emit('remove_tokens',deviceTokenKeys,response.responses);
              console.log("event emitted");}
           return (
            {statuscode: 200,
             message : "message sent sucessfully"
            }
        );
        }).catch((err) => { 
            console.log("error in sending message",err);
            return (
                {statuscode: 200,
                    message : 
                'Failed to send messages'
        });
        });
    }catch(error){
        console.error(error);
        return ('Failed to send messages');
    }
}

eventEmitter.on('remove_tokens',(deviceTokenKeys,response)=>{
    deviceTokensData.removeDisabledTokens(deviceTokenKeys,response);
});