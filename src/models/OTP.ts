import mongoose, { Document, Schema } from 'mongoose';
import emailTemplate from '../tempelate/mail/emailVerificationTemplate';
import mailSender from '../utils/mailSender';

// Define the interface for the OTP document
interface IOTP extends Document {
  email: string;
  otp: string;
  createdAt: Date;
}


// Define the schema for the OTP model
const OTPSchema: Schema<IOTP> = new Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
  },
});

// Define a function to send emails
async function sendVerificationEmail(email : any, otp : any): Promise<void> {
  try {
    const mailResponse = await mailSender(
      email,
      'Verification Email',
      emailTemplate(otp)
    );
    console.log('Email sent successfully: ', mailResponse.response);
  } catch (error) {
    console.log('Error occurred while sending email: ', error);
    throw error;
  }
}

// Define a pre-save hook to send an email after the document has been saved
OTPSchema.pre<IOTP>('save', async function (next) {
  console.log('New document saved to database');

  // Only send an email when a new document is created
  if (this.isNew) {
    await sendVerificationEmail(this.email, this.otp);
  }
  next();
});

// Create the OTP model
const OTP = mongoose.model<IOTP>('OTP', OTPSchema);

export default OTP;
