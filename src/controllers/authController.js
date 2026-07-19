import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { generateOTP, isOTPExpired } from "../utils/otpUtils.js";
import nodemailer from "nodemailer";

export const sendOTP = async (req, res) => {
  try {
    const { name, email, mobile } = req.body;

    if (!email && !mobile) {
      return res.status(400).json({ message: "Email or mobile number is required" });
    }

    if (email && !name) {
      return res.status(400).json({ message: "Name is required" });
    }

    let user;
    if (email) {
      user = await User.findOne({ email });
      // Create user if doesn't exist
      if (!user) {
        user = await User.create({
          name,
          email,
        });
      }
    } else {
      user = await User.findOne({ mobile });
      if (!user) {
        return res.status(400).json({ message: "User with this mobile number not found. Please use email to create account." });
      }
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP via email
    if (email) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP for Login",
        text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
      };

      await transporter.sendMail(mailOptions);
    }

    // For mobile, you would integrate with an SMS service like Twilio
    // This is a placeholder for SMS functionality
    if (mobile) {
      console.log(`SMS would be sent to ${mobile}: Your OTP is ${otp}`);
    }

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, mobile, otp } = req.body;

    if (!email && !mobile) {
      return res.status(400).json({ message: "Email or mobile number is required" });
    }

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    let user;
    if (email) {
      user = await User.findOne({ email });
    } else {
      user = await User.findOne({ mobile });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: "No OTP generated for this user" });
    }

    if (isOTPExpired(user.otpExpiry)) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Clear OTP after successful verification
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
