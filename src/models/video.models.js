import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new mongoose.Schema({
    videoFile: {
        type: String,
        required: true,
        lowercase: true,
        index: true
    },
    thumbnail:{
        type: String,
        required: true,
    },
    owner: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title:{
        type: String,
        default: "Default Title",
        trim: true,
        required: true,
    },
    description:{
        type: String,
        trim: true,
        default: "This is a default description.",
    },
    duration:{
        type: Number,
    },
    views: {
        type: Number,
        default: 0,
        required: true,
    },
    isPublished: {
        type: Boolean,
        required: true,
    }
}, {timestamps: true})

mongoose.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video",videoSchema); 