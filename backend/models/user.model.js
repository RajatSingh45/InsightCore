import mongoose from "mongoose"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
    name: String,
    email: {type: String, unique: true},
    password: String,
    role: {type: String, enum: ["user", "moderator", "admin"], default: "user"}
})

// Change arrow functions to regular functions
userSchema.methods.jenerateJwtToken = function() {
    const token = jwt.sign({_id: this._id, role:this.role}, process.env.SECRET_KEY, {expiresIn: '24h'})
    return token
}

userSchema.statics.hashPassword = async function(password) {
    return await bcrypt.hash(password, 10)
}

userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password)
}

export default mongoose.model("User", userSchema)