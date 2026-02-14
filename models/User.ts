import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
    name: { type: String },
    email: { type: String, unique: true },
    emailVerified: { type: Date },
    image: { type: String },
    role: {
        type: String,
        enum: ["candidate", "recruiter"],
        // No default - explicit selection required
    },
    // Helper to account for native MongoDB _id
}, {
    timestamps: true,
    toJSON: { virtuals: true },
});

// Prevent overwriting model during hot reload
const User = models.User || model("User", UserSchema);

export default User;
