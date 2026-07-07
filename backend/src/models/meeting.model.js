import { Schema } from "mongoose";

const meetingShema = new Schema(
    {
        user_id:{type:String},
        meetingCode : {type : String , required : true },
        Date:{type:Date , required: true , default : Date.now},
    }
)

const Meeting = mongoose.model("Meeting" , meetingShemaSchema);
export { Meetingeeting };
