import userModel from "../models/user.model.js";

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    //checking
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Required all fields" });
    }

    //checking existence
    const userExist = await userModel.findOne({ email }); // Changed from find to findOne
    if (userExist) {
      // Now this will work correctly
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    //hash password
    const hashedPassword = await userModel.hashPassword(password);

    //create a new user
    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    //generate token
    const token = user.jenerateJwtToken();

    return res.status(201).json({ success: true, token, user });
  } catch (error) {
    console.log("New user registration failed:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Required all fields to login" });
    }

    const userExist = await userModel.findOne({ email }).select("+password"); // Changed from find to findOne
    if (!userExist) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    const decodePassword = await userExist.comparePassword(password);

    if (!decodePassword) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = userExist.jenerateJwtToken();

    res.cookie("token", token);
    return res.status(201).json({ success: true, token, userExist });
  } catch (error) {
    console.log("User login failed:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];
    res.status(201).json({ message: "Logout successfully!" });
  } catch (error) {
    console.log("error during logout");
    res.status(500).json({ success: false, message: error.message });
  }
};

const profile = async (req, res) => {
  res.json(req.user);
};

const users = async (req, res) => {
  try {
    const users = await userModel.find().select("-password");
    if (!users.length)
      return res
        .status(401)
        .json({ success: false, message: "No user have registered yet" });

    res.status(201).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.log("Error during fetching the users:", error.message);
    return res
      .status(501)
      .json({ message: "Server error,couldn't fetch users" });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const {role} = req.body;

    const roles = ["users", "admin", "moderator"];

    if (!roles.includes(role)) {
      return res.status(401).json({ message: "Invalid role provided" });
    }

    const user = await userModel
      .findByIdAndUpdate(userId, { role: role }, { new: true })
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({
      success: true,
      message: `User promoted to ${role}`,
      user,
    })
  } catch (error) {
    console.log("Error during updating the user role:",error.message)
    return res.status(501).json({
        success:false,
        message:"Server error couldn't update role"
    })
  }
}
export { register, login, logout, profile, users, updateUserRole};
