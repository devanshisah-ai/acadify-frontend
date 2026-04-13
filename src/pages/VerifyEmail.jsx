import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import CanvasLayout from "../canvas/CanvasLayout";
import Card from "../components/ui/Card";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the URL.");
      return;
    }

    api.get(`/auth/verify-email?token=${token}`)
      .then(() => {
        setStatus("success");
        setMessage("Email verified successfully! You can now log in.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err?.response?.data?.message || "Verification failed or link has expired."
        );
      });
  }, []);

  return (
    <CanvasLayout>
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <Card variant="glass" className="w-full max-w-md p-10 text-center">
          {status === "verifying" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-400 text-sm"
            >
              Verifying your email, please wait...
            </motion.p>
          )}

          {status === "success" && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-white text-xl font-semibold mb-2">Email Verified!</h2>
              <p className="text-green-400 text-sm mb-6">{message}</p>
              <Link
                to="/login"
                className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
              >
                Go to Login →
              </Link>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-5xl mb-4">❌</div>
              <h2 className="text-white text-xl font-semibold mb-2">Verification Failed</h2>
              <p className="text-red-400 text-sm mb-6">{message}</p>
              <Link
                to="/signup"
                className="inline-block px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              >
                Back to Signup
              </Link>
            </motion.div>
          )}
        </Card>
      </div>
    </CanvasLayout>
  );
}