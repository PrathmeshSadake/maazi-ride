import {
  SignInFormData,
  SignUpFormData,
  FormValidationErrors,
  AuthError,
  AuthErrorDetails,
} from "./auth.types";

// Form validation functions
export const validateEmail = (email: string): string | undefined => {
  if (!email) return "Email is required";
  if (!email.includes("@")) return "Please enter a valid email address";
  if (email.length < 5) return "Email must be at least 5 characters";
  return undefined;
};

export const validatePassword = (password: string): string | undefined => {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  return undefined;
};

export const validateName = (name: string): string | undefined => {
  if (!name) return "Name is required";
  if (name.length < 2) return "Name must be at least 2 characters";
  if (name.length > 50) return "Name must be less than 50 characters";
  return undefined;
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): string | undefined => {
  if (!confirmPassword) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords do not match";
  return undefined;
};

// Form validation
export const validateSignInForm = (
  data: SignInFormData
): FormValidationErrors => {
  const errors: FormValidationErrors = {};

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;

  return errors;
};

export const validateSignUpForm = (
  data: SignUpFormData
): FormValidationErrors => {
  const errors: FormValidationErrors = {};

  const nameError = validateName(data.name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;

  if (data.confirmPassword !== undefined) {
    const confirmPasswordError = validateConfirmPassword(
      data.password,
      data.confirmPassword
    );
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
  }

  return errors;
};

// Error mapping
export const mapAuthError = (error: string | Error): AuthErrorDetails => {
  const errorMessage = typeof error === "string" ? error : error.message;

  if (
    errorMessage.includes("CredentialsSignin") ||
    errorMessage.includes("Invalid credentials")
  ) {
    return {
      type: "InvalidCredentials",
      message:
        "Invalid email or password. Please check your credentials and try again.",
      field: "general",
    };
  }

  if (errorMessage.includes("email") && errorMessage.includes("already")) {
    return {
      type: "EmailAlreadyExists",
      message:
        "An account with this email already exists. Please sign in instead.",
      field: "email",
    };
  }

  if (errorMessage.includes("password") && errorMessage.includes("weak")) {
    return {
      type: "WeakPassword",
      message: "Password is too weak. Please choose a stronger password.",
      field: "password",
    };
  }

  if (errorMessage.includes("email") && errorMessage.includes("invalid")) {
    return {
      type: "InvalidEmail",
      message: "Please enter a valid email address.",
      field: "email",
    };
  }

  if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
    return {
      type: "NetworkError",
      message: "Network error. Please check your connection and try again.",
    };
  }

  return {
    type: "UnknownError",
    message: errorMessage || "Something went wrong. Please try again.",
  };
};

// Toast message helpers
export const getSuccessMessage = (
  action: "signin" | "signup" | "roleSelection"
): string => {
  switch (action) {
    case "signin":
      return "Welcome back! You've been signed in successfully.";
    case "signup":
      return "Account created successfully! Please sign in to continue.";
    case "roleSelection":
      return "Great! Your account has been set up successfully.";
    default:
      return "Success!";
  }
};

// Loading state helpers
export const getLoadingMessage = (
  action: "signin" | "signup" | "google" | "roleSelection"
): string => {
  switch (action) {
    case "signin":
      return "Signing in...";
    case "signup":
      return "Creating account...";
    case "google":
      return "Connecting with Google...";
    case "roleSelection":
      return "Setting up your account...";
    default:
      return "Loading...";
  }
};

// Form state helpers
export const hasFormErrors = (errors: FormValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};

export const getFirstError = (
  errors: FormValidationErrors
): string | undefined => {
  const errorKeys = Object.keys(errors) as (keyof FormValidationErrors)[];
  return errorKeys.length > 0 ? errors[errorKeys[0]] : undefined;
};

// Debounce utility for real-time validation
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
