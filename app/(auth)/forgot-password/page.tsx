"use client";

import AuthLayout from "@/components/layout/AuthLayout";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";

const supabase = createClient();

type FormInputs = {
  email: string;
};

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>();

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      alert(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-3xl md:text-4xl font-semibold mb-2 md:mb-3 text-black font-poppins">
        Forgot Password
      </h1>

      <p className="text-gray-500 mb-4 md:mb-8 font-poppins text-sm md:text-base">
        Remember your password?{" "}
        <Link
          href="/signin"
          className="text-[#38cb89] font-medium hover:underline"
        >
          Sign In
        </Link>
      </p>

      {sent ? (
        <div className="space-y-4 font-poppins">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm font-medium">
              Password reset link sent!
            </p>
            <p className="text-green-600 text-xs mt-1">
              Check your email inbox and click the link to reset your password.
            </p>
          </div>
          <button
            onClick={() => setSent(false)}
            className="text-sm text-gray-500 hover:text-black transition-colors underline"
          >
            Didn&apos;t receive the email? Try again
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 md:space-y-8 flex flex-col font-poppins w-full"
        >
          <div>
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Please enter a valid email",
                },
              })}
              placeholder="Email address"
              className="w-full border-b border-gray-300 py-3 text-sm focus:outline-none focus:border-black bg-transparent"
            />
            {errors.email && (
              <p className="text-red-500 text-xs pt-2">
                {errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white rounded-lg py-3 text-base font-medium hover:bg-gray-800 transition-colors"
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
