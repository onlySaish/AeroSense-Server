import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  changeCurrentPassword,
  checkAuth,
  forgotPassword,
  getCurrentUserDetails,
  googleAuth,
  refreshAccessToken,
  resetPassword,
  sendOtp,
  updateAccountDetails,
  updateAvatar,
  userLogin,
  userLogout,
  userRegister,
  verifyOtp,
  verifyToken
} from "../controllers/user.controller.js";

const router = Router();
router.route("/send-otp").post(sendOtp);
router.route("/verify-otp").post(verifyOtp);
router.route("/register").post(upload.single("avatar"),userRegister);
router.route("/login").post(userLogin);
router.route("/google-auth").get(googleAuth);

router.route("/forgot-password").post(forgotPassword);
router.route("/verify-token/:token").post(verifyToken);
router.route("/reset-password").post(resetPassword);

//Secure Routes
router.route("/logout").post(verifyJWT, userLogout);
router.route('/check').get(verifyJWT,checkAuth);
router.route("/refresh-token").post(refreshAccessToken);

router.route("/currentUser").get(verifyJWT,getCurrentUserDetails);
router.route("/changePassword").patch(verifyJWT,changeCurrentPassword);
router.route("/updateAccountDetails").patch(verifyJWT,updateAccountDetails);
router.route("/updateAvatar").patch(verifyJWT,upload.single("avatar"),updateAvatar);

export default router;