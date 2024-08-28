import mongoose, { Document, Schema } from 'mongoose';
// import bcrypt from 'bcryptjs';

// Define the User interface
interface IUser extends Document {
  name: string;
  email: string;
  profilePicture?: string;
  password: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: number;
}

// Define the User schema
const userSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  profilePicture: { type: String },
  password: {
    type: String,
    required: true,
  },
});

// Add a method to hash the user's password before saving (optional)
// userSchema.pre<IUser>('save', async function (next) {
//   if (this.isModified('password')) {
//     const hashedPassword = await bcrypt.hash(this.password, 10);
//     this.password = hashedPassword;
//   }
//   next();
// });

// Create and export the User model
const User = mongoose.model<IUser>('User', userSchema);
export default User;
