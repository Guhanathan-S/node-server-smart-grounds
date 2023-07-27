const pushNotificationController = require("../controller/push-notifications.controller");
const express = require("express");
const router = express.Router();
router.post("/send-event-notification",pushNotificationController.sendPushNotifications);
module.exports = router;