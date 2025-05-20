import * as authService from "../services/authService.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt with:", email);

    const user = await authService.findUserByEmail(email);
    console.log("User found:", user);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Ganti .compare dengan perbandingan biasa
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
