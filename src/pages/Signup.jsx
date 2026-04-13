import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../api/axios";
import CanvasLayout from "../canvas/CanvasLayout";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

// Password strength checker
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 3) return { score, label: "Moderate", color: "bg-yellow-500" };
  return { score, label: "Strong", color: "bg-green-500" };
};

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[a-zA-Z0-9._%+\-]+@gmail\.com$/.test(formData.email)) {
      newErrors.email = "Only Gmail addresses are allowed (e.g. yourname@gmail.com)";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      if (formData.password.length < 6) newErrors.password = "Minimum 6 characters";
      else if (!/[A-Z]/.test(formData.password)) newErrors.password = "Must include at least one uppercase letter";
      else if (!/[0-9]/.test(formData.password)) newErrors.password = "Must include at least one number";
      else if (!/[^A-Za-z0-9]/.test(formData.password)) newErrors.password = "Must include at least one special character";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError("");
    setSuccessMessage("");

    try {
      await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      setSuccessMessage("✅ Account created! You're registered. Please log in.");
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "STUDENT",
      });

    } catch (err) {
      setApiError(
        err?.response?.data?.message || err?.message || "Signup failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <CanvasLayout>
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 py-12">
        <Card variant="glass" className="w-full max-w-md p-8">

          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm text-gray-400 mb-2">Get started</p>
            <h1 className="font-display font-semibold text-3xl text-white">
              Create your <span className="text-primary">acadify</span> account
            </h1>
          </motion.div>

          {/* Success Message */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center"
              >
                <p className="text-green-400 text-sm font-medium">{successMessage}</p>
                <Link
                  to="/login"
                  className="inline-block mt-3 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors duration-200"
                >
                  Go to Login →
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
              >
                <p className="text-red-400 text-sm">{apiError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!successMessage && (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Full Name */}
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
              />

              {/* Email */}
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />

              {/* Role */}
              <div>
                <label className="text-sm text-gray-300 mb-2 block">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  {["STUDENT", "TEACHER"].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, role }))}
                      className={`p-2 rounded transition-colors duration-200 ${
                        formData.role === role
                          ? "bg-blue-500 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Password with show/hide + strength bar */}
              <div>
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-200 text-xs"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {/* Password Strength Bar */}
                {formData.password && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2"
                  >
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= passwordStrength.score
                              ? passwordStrength.color
                              : "bg-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs ${
                      passwordStrength.score <= 1 ? "text-red-400" :
                      passwordStrength.score <= 3 ? "text-yellow-400" : "text-green-400"
                    }`}>
                      {passwordStrength.label} password
                    </p>
                    <ul className="mt-1 text-xs text-gray-500 space-y-0.5">
                      <li className={/[A-Z]/.test(formData.password) ? "text-green-400" : ""}>• Uppercase letter</li>
                      <li className={/[0-9]/.test(formData.password) ? "text-green-400" : ""}>• Number</li>
                      <li className={/[^A-Za-z0-9]/.test(formData.password) ? "text-green-400" : ""}>• Special character</li>
                      <li className={formData.password.length >= 6 ? "text-green-400" : ""}>• Minimum 6 characters</li>
                    </ul>
                  </motion.div>
                )}
              </div>

              {/* Confirm Password with show/hide */}
              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-200 text-xs"
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>

                {/* Live match indicator */}
                {formData.confirmPassword && (
                  <p className={`text-xs mt-1 ${
                    formData.password === formData.confirmPassword
                      ? "text-green-400"
                      : "text-red-400"
                  }`}>
                    {formData.password === formData.confirmPassword
                      ? "✓ Passwords match"
                      : "✗ Passwords do not match"}
                  </p>
                )}
              </div>

              <Button type="submit" size="large" loading={loading} className="w-full">
                Create Account
              </Button>

            </form>
          )}

          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary hover:text-primary-hover font-medium transition-colors duration-300"
              >
                Sign in
              </Link>
            </p>
          </motion.div>

        </Card>
      </div>
    </CanvasLayout>
  );
}