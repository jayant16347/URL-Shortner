const User=require("../models/user");

const {v4:uuidv4}=require("uuid");
const {setUser}=require("../service/auth");
async function handleUserSignUp(req, res) {
  const { name, email, password } = req.body;

  // 1. Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.render("signup", {
      error: "Email already registered. Please login."
    });
  }

  // 2. Create user
  await User.create({ name, email, password });

  // 3. Redirect to login instead of home
  return res.redirect("/login");
}

async function handleUserLogIn(req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.matchPassword(email, password);

    const token = setUser(user);
    res.cookie("uid", token);

    return res.redirect("/");
  } catch (err) {
    return res.render("login", { error: err.message });
  }
}



module.exports={
    handleUserSignUp,
    handleUserLogIn,
};