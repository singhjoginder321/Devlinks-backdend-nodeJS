import nodemailer, { SentMessageInfo, Transporter } from 'nodemailer';

// Define the type for the mailSender function parameters


// Define the mailSender function with type annotations
const mailSender = async ( email : string, title : string, body : string): Promise<SentMessageInfo | string> => {
  try {
    // Create a transporter object
    const transporter: Transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      secure: process.env.MAIL_SECURE === 'true', // Use true if the environment variable is set to 'true'
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Send mail using the transporter
    const info: SentMessageInfo = await transporter.sendMail({
      from: `"Joginder " <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    });

    console.log(info.response);
    return info;
  } catch (error) {
    console.log((error as Error).message);
    return (error as Error).message;
  }
};

export default mailSender;
