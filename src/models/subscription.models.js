import mongoose from "mongoose";

let subscriptionSchema = new mongoose.Schema({
    subscriber:{
        type: mongoose.Schema.Types.ObjectId, // one who is subscribing
        ref: "User"
    },
    channel:{
        type: mongoose.Schema.Types.ObjectId, // one to whom subscriber is subscribing
        ref: "User"
    }
},{timestamps: true});

export const Subscription = mongoose.model("Subscription",subscriptionSchema);


/* Explanation

1. This Schema is made in such a way that channels and subscribers are both coming from the user document.

2. Whenever a person subscribes to a channel, the channel id and subscriber id are stored inside 
the documents of subscription schema. 

3. When we need to find all subscribers of a channel, we find the count of 
all subscription documents that have the same channel id. 

4. When we need to find all the channels that a user has subscribed to,
we find the count of all subscription documents that have the same subscriber id.

*/