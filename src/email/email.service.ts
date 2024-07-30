import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { User } from 'src/entities/user.entity';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.USERNAME,
        pass: process.env.APP_PASSWORD,
      },
    });
  }

  async sendverifyEmail(user: User, password: string) {
    const mailOptions: nodemailer.SendMailOptions = {
      from: 'nnamdidanielosuji@gmail.com',
      to: user.email,
      subject: 'Verify Your email address',
      text: 'One time passsword',
      html: `<html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Welcome to Our Platform</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            width: 80%;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            text-align: center;
          }
          h1 {
            color: #007bff;
            margin-bottom: 20px;
          }
          p {
            color: #555;
            margin-bottom: 10px;
          }
          .verification-code {
            color: #007bff;
            padding: 10px 15px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 2.5rem;
            margin: 20px 0;
          }
          .contact-info {
            margin-top: 20px;
          }
          .team-signature {
            margin-top: 20px;
            color: #888;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Verify Your Email Address</h1>
          <p>Dear ${user.firstName} ${user.lastName}</p>
          <p>Thank you for joining us. Your verification code is:</p>
          <div class="verification-code">${password}</div>
          <p>Please use this code to complete your registration.</p>
          <p>If you have any questions or need assistance, feel free to contact us. We're here to help!</p>
          <p class="contact-info">Best regards,<br>The Team</p>
          <p class="team-signature">Contact us at support@ourplatform.com</p>
        </div>
      </body>
      </html> `,
    };
    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendVerificationSuccessMail(user: User) {
    const mailOptions: nodemailer.SendMailOptions = {
      from: 'nnamdidanielosuji@gmail.com',
      to: user.email,
      subject: 'Welcome to E-Biding',
      text: 'Your account has been successfully verified. Welcome to our platform!',
      html: `
          <html lang="en">
            <head>
              <meta charset="UTF-8">
              <title>Welcome Email</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
                  line-height: 1.6;
                }
                .container {
                  width: 80%;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #fff;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  border-radius: 8px;
                }
                h1 {
                  color: #333;
                }
                p {
                  color: #555;
                }
                .verification-code {
                  background-color: #007bff;
                  color: #fff;
                  padding: 10px 15px;
                  border-radius: 4px;
                  display: inline-block;
                  font-weight: bold;
                  margin-bottom: 20px;
                  font-size: 2rem;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Welcome to NIGALEX E-Biding App, ${user.firstName}! 🎉</h1>
                <p>Congratulations! Your account has been successfully verified, and you are now part of our community.</p>
                <p>Explore the powerful features of NIGALEX E-Biding:</p>
                <ul>
                  <li>Real Time Auction Service</li>
                  <li>Reliable Product Delivery</li>
                  <li>Auction Management</li>
                </ul>
                <p>If you have any questions or need assistance, feel free to contact us. We're here to help!</p>
                <p>Best regards,</p>
                <p>The E-Biding Team</p>
              </div>
            </body>
          </html>
        `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  //   async sendResetPasswordTokenMail(user: User, code: string) {
  //     const mailOptions: nodemailer.SendMailOptions = {
  //       from: 'nnamdidanielosuji@gmail.com',
  //       to: user.email_address,
  //       subject: 'FORGOT PASSWORD',
  //       text: 'One time passsword',
  //       html: `<html lang="en">
  //       <head>
  //         <meta charset="UTF-8">
  //         <title>Welcome to Our Platform</title>
  //         <style>
  //           body {
  //             font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  //             background-color: #f5f5f5;
  //             margin: 0;
  //             padding: 0;
  //           }
  //           .container {
  //             width: 80%;
  //             margin: 20px auto;
  //             padding: 20px;
  //             background-color: #ffffff;
  //             box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  //             border-radius: 8px;
  //             text-align: center;
  //           }
  //           h1 {
  //             color: #007bff;
  //             margin-bottom: 20px;
  //           }
  //           p {
  //             color: #555;
  //             margin-bottom: 10px;
  //           }
  //           .verification-code {
  //             color: #007bff;
  //             padding: 10px 15px;
  //             border-radius: 4px;
  //             font-weight: bold;
  //             font-size: 2.5rem;
  //             margin: 20px 0;
  //           }
  //           .contact-info {
  //             margin-top: 20px;
  //           }
  //           .team-signature {
  //             margin-top: 20px;
  //             color: #888;
  //           }
  //         </style>
  //       </head>
  //       <body>
  //         <div class="container">
  //           <h1>Password reset token</h1>
  //           <p>Hello ${user.first_name} ${user.last_name}</p>
  //           <p>You requested a password reset on your Abacus account.</p>
  //           <div class="verification-code">${code}</div>
  //           <p>Please use the code below to set a new password on your account</p>
  //           <p>If you did not initiate this request, please ignore this email and contact our Support Team immediately.</p>
  //           <p class="contact-info">Best regards,<br>The Team</p>
  //           <p class="team-signature">Contact us at support@ourplatform.com</p>
  //         </div>
  //       </body>
  //       </html> `,
  //     };
  //     try {
  //       const info = await this.transporter.sendMail(mailOptions);
  //       console.log('Message sent: %s', info.messageId);
  //     } catch (error) {
  //       console.error('Error sending email:', error);
  //       throw new Error('Failed to send email');
  //     }
  //   }
}
