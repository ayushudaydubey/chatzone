import userModel from "../Models/users.models.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export async function registerUserController(req, res) {
  try {
    const { name, email, password, mobileNo } = req.body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email." });
    }

    const hassPassword = await bcrypt.hash(password, 10);
    
    const user = await userModel.create({
      name,
      email,
      mobileNo,
      password: hassPassword,
      isOnline: true
    });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.SEC_KEY,
      { expiresIn: '1h' }
    );

    res.cookie("token", token);

    console.log(user, token);
    
    res.status(201).json({
      message: "User registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobileNo: user.mobileNo
      },
      token
    });

  } catch (err) {
    console.log(err);
  }
}
