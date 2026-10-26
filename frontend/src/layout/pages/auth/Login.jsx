import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../../layout/pages/auth/Login.css";
import AuthLayout from "../../../Component/auth/auth/AuthLayout";
import api from '../../../api/axios';
import { login } from "../../../api/auth";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(formData.email.trim(), formData.password);
      window.location.assign("/products");
    } catch (error) {
    console.error("Login failed:", error);

    setMessage(
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "Unable to sign in. Please try again."
    );
  } 
    finally{
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="WELCOME BACK"
      title="Sign in to Northstar"
      description="Your next favourite thing is just around the corner."
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="email">Email address</label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />

          {errors.email && (
            <small id="email-error" className="error">
              {errors.email}
            </small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>

          <div className="password-input-wrapper">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? "password-error" : undefined
              }
            />

            <button
              className="password-toggle"
              type="button"
              onClick={() => setShowPassword((previous) => !previous)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {errors.password && (
            <small id="password-error" className="error">
              {errors.password}
            </small>
          )}
        </div>

        <div className="forgot-password-row">
          <span>Secure access to your account</span>
          <button
            className="text-button"
            type="button"
            onClick={() =>
              setErrors({
                form: "Password recovery will be available in a later step.",
              })
            }
          >
            Forgot password?
          </button>
        </div>

        {errors.form && (
          <p className="form-message" role="status">
            {errors.form}
          </p>
        )}

      <button className="submit-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
        {!isSubmitting && <span aria-hidden="true">→</span>}
      </button>

      {message && (
        <p className="form-message" role="status">
          {message}
        </p>
      )}
      </form>

      <div className="login-prompt">
        New to Northstar?{" "}
        <Link to="/register">Create an account</Link>
      </div>
    </AuthLayout>
  );
}

export default Login;