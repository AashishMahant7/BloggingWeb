const { Schema, model } = require('mongoose');
const {createHmac,randomBytes} = require('crypto');
const {createTokenForUser}=require("../services/auth")

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    salt: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    profileImageUrl: {
        type: String,
        default: "/images/default.png"
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER"
    }
}, { timestamps: true });

userSchema.pre("save", function(next) {
    const user = this;
    if (!user.isModified("password")) return;

    const salt = randomBytes(16).toString();
    const hashedPassword =createHmac("sha256", salt)
        .update(user.password)
        .digest("hex");
    user.salt = salt; 
    user.password = hashedPassword; 
    next();
});

userSchema.static("mathcPasswordAndGenerateToken", async function (email,password){
    const user= await this.findOne({email});
    if(!user) throw new Error("user not found");

    const salt = user.salt;
    const hashedPassword = user.password
  
    const userProvidedHash= createHmac("sha256", salt)
    .update(password)
    .digest("hex");

    if(hashedPassword !== userProvidedHash) 
        throw new Error("Invalid username or password");
    
   const token =createTokenForUser(user);
  // console.log(hashedPassword+"   "+userProvidedHash)

   return token;
})

const User = model("user", userSchema);
module.exports = User;
 