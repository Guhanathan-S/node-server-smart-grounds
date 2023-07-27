const admin = require("firebase-admin");
let serviceAccount = require("../config/push-notification-key.json");
const certPath = admin.credential.cert(serviceAccount);
admin.initializeApp({credential: certPath,
databaseURL : "https://smart-grounds-default-rtdb.firebaseio.com"});
const dataBase = admin.database();
let instance;
class DeviceTokensData{
    constructor(){
        console.log('Constructor is called');
        if(instance){
            throw new Error("New instance cannot be created!!");
        }
        instance = this;
        this.get_device_tokens();
    }
    deviceTokens = [];
    deviceTokenKeys =[];
    get deviceTokens() {
        return deviceTokens;
    }
    async get_device_tokens(){
        try{
         dataBase.ref('device_tokens').child('internal_users').on("value",
            (dataSnapshot)=>{
            this.deviceTokens = Object.values(dataSnapshot.val());
            this.deviceTokenKeys = Object.keys(dataSnapshot.val());
        });
    }catch(err){
        console.error(err);
    }
    }
    async removeDisabledTokens(deviceTokenKeys,response){
        let tokenKeys = [];
        for(let i = 0; i < deviceTokenKeys.length; i++){
            if(!response[i].success){
                let error = response[i].error;
                if((error.code === "messaging/registration-token-not-registered" &&
                error.message === "Requested entity was not found."
                ) || (error.code === "messaging/invalid-argument" && error.message ==="The registration token is not a valid FCM registration token")){
                    tokenKeys.push(deviceTokenKeys[i]);
                }
                console.log(error.code);
                console.log(error.message);
                console.log((error.code === "messaging/registration-token-not-registered" &&
                error.message === "Requested entity was not found."
                ) || (error.code === "messaging/invalid-argument" && error.message ==="The registration token is not a valid FCM registration token"));
            }
        }
        tokenKeys.forEach((id)=>{
            console.log(id)
            dataBase.ref('device_tokens').child('internal_users').child(`${id}`).remove();
        });
    }
}
let deviceTokensObject = new DeviceTokensData();
module.exports = {deviceTokensData: deviceTokensObject, admin};