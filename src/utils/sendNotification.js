import { notificationModel } from "../../database/models/notification.model.js";
import { sio } from "../../server.js";


export const sendNotification =  async (message_en, message_ar, type , receivers) => {
try {
    if (!Array.isArray(receivers)) {
        receivers = [receivers];
    }
    function cleanList(arr) {  // to remove duplicates and undefined values
        return Array.from(new Set(arr)).filter(item => item !== undefined);
    }
    receivers = cleanList(receivers);
    let message = {};
    message.message_en = message_en;
    message.message_ar = message_ar;
    const newNotif = new notificationModel({ message, type, receivers });
    const savedNotif = await newNotif.save();
    sio.emit(`notification_`, { message }, { type }, { receivers });
}catch (error) {
    console.log(error,"error in sending notification");
}
}
