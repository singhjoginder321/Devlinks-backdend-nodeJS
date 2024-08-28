import mongoose, { Document, Schema } from 'mongoose';

// Define the Link interface
interface ILink extends Document {
  platform: 'GitHub' | 'LinkedIn' | 'Facebook' | 'YouTube' | 'GitLab';
  link: string;
  userId: mongoose.Types.ObjectId;
}

// Define the Link schema
const linkSchema: Schema = new Schema(
  {
    platform: {
      type: String,
      enum: ['GitHub', 'LinkedIn', 'Facebook', 'YouTube', 'GitLab'],
      required: true,
    },
    link: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => /^https?:\/\/[^\s]+$/.test(v), // Simple URL validation
        message: (props: { value: string }) => `${props.value} is not a valid URL!`,
      },
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Create and export the Link model
const Link = mongoose.model<ILink>('Link', linkSchema);
export default Link;
