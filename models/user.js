const mongoose=require("mongoose");
const { createHmac, randomBytes } = require("crypto");

const userSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
        },
        email:{
            type:String,
            required:true,
            unique:true,
        },
        salt: {
        type: String
         },
        password:{
            type:String,
            required:true,
        }
},{timestamps:true})

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = randomBytes(16).toString("hex");
    const hashedPassword = createHmac("sha256", salt)
        .update(this.password)
        .digest("hex");

    this.salt = salt;
    this.password = hashedPassword;
});

userSchema.static("matchPassword",async function(email,password){
    const user=await this.findOne({email});
    if(!user) throw new Error("User Not Found");
    const hashedPassword=user.password;
    const userProvidedHash=createHmac("sha256", user.salt)
        .update(password)
        .digest("hex");
    if(hashedPassword!==userProvidedHash) throw new Error("Incorrect Password");
    return user;

})
const User=mongoose.model("user",userSchema);
module.exports=User;