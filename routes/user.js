const express=require("express");
const {handleUserSignUp,handleUserLogIn}=require("../controllers/user");
const router=express.Router();
router.post("/signup",handleUserSignUp);
router.post("/login",handleUserLogIn);
router
module.exports=router;