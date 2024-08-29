import { Router } from "express";
import { body, param } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router();

// Ruta para crear cuenta
router.post(
  "/create-account",
  body("name").notEmpty().withMessage("El nombre no puede ir vacio"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("El password es muy corto, minimo 8 caracteres"),
  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Los password no coinciden");
    }
    return true;
  }),
  body("email").isEmail().withMessage("E-mail no valido"),
  handleInputErrors,
  AuthController.createAccount
);

// Ruta para confirmar una cuenta usando un token
router.post(
  "/confirm-account",
  body("token").notEmpty().withMessage("El token no puede ir vacio"),
  handleInputErrors,
  AuthController.confirmAccount
);

// Ruta para iniciar sesión
router.post(
  "/login",
  body("email").isEmail().withMessage("E-mail no valido"),
  body("password").notEmpty().withMessage("El password no puede ir vacio"),
  handleInputErrors,
  AuthController.login
);

// Ruta para solicitar un nuevo código de confirmación
router.post(
  "/request-code",
  body("email").isEmail().withMessage("E-mail no valido"),
  handleInputErrors,
  AuthController.requestConfirmationCode
);

// Ruta para solicitar un cambio de contraseña
router.post(
  "/forgot-password",
  body("email").isEmail().withMessage("E-mail no valido"),
  handleInputErrors,
  AuthController.forgotPassword
);

// Ruta para validar el token de cambio de contraseña
router.post(
  "/validate-token",
  body("token").notEmpty().withMessage("El token no puede ir vacio"),
  handleInputErrors,
  AuthController.validateToken
);

// Ruta para actualizar la contraseña usando un token
router.post(
  "/update-password/:token",
  param("token").isNumeric().withMessage("Token no valido"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("El password es muy corto, minimo 8 caracteres"),
  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Los password no coinciden");
    }
    return true;
  }),
  handleInputErrors,
  AuthController.updatePasswordWithToken
);

// Ruta para obtener la información del usuario autenticado
router.get("/user", authenticate, AuthController.user);

// Rutas para actualizar el perfil del usuario autenticado
router.put(
  "/profile",
  authenticate,
  body("name").notEmpty().withMessage("El nombre no puede ir vacio"),
  body("email").isEmail().withMessage("E-mail no valido"),
  handleInputErrors,
  AuthController.updateProfile
);

// Ruta para actualizar la contraseña del usuario autenticado
router.post(
  "/update-password",
  authenticate,
  body("current_password")
    .notEmpty()
    .withMessage("El password actual no puede ir vacio"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("El password es muy corto, minimo 8 caracteres"),
  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Los password no coinciden");
    }
    return true;
  }),
  handleInputErrors,
  AuthController.updateCurrentUserPassword
);

// Ruta para verificar la contraseña del usuario autenticado
router.post(
  "/check-password",
  authenticate,
  body("password").notEmpty().withMessage("El password no puede ir vacio"),
  handleInputErrors,
  AuthController.checkPassword
  
);

export default router;
