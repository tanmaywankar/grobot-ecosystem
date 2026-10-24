import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import grobotImage from "../assets/GrobotLoginImage.webp";

export default function SignupView() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Connect your auth code here
    console.log("Signup submitted:", { name, email, password });
  };

  const handleGitHubSignup = () => {
    // Connect your GitHub OAuth here
    console.log("GitHub OAuth triggered");
  };

  const handleGoogleSignup = () => {
    // Connect your Google OAuth here
    console.log("Google OAuth triggered");
  };

  return (
    <div className="min-h-screen w-full bg-canvas flex items-center justify-center p-4 sm:p-6 lg:p-8 select-none">
      {/* Centered bounded container capped on wide displays */}
      <div className="w-full max-w-[1180px] mx-auto flex items-center justify-center lg:justify-between gap-8 xl:gap-14">
        
        {/* Left Hero Card - Hidden on mobile & tablet (< lg), visible only on computers (lg+) */}
        <div className="hidden lg:flex lg:w-[48%] xl:w-[46%] max-w-[520px] h-[620px] max-h-[calc(100vh-4rem)] bg-[#1F211F] rounded-3xl p-8 xl:p-10 flex-col justify-between shadow-2xl shrink-0">
          <div>
            <h2 className="text-2xl sm:text-3xl font-medium text-text-main tracking-tight leading-snug">
              Let’s get you setup
            </h2>
            <p className="text-base sm:text-lg font-medium text-mint mt-1">
              with GROBOT
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center py-6">
            <img
              src={grobotImage}
              alt="Grobot Planter Robot"
              className="w-full max-w-[340px] xl:max-w-[380px] object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Right Section: Form - full width on mobile/tablet, centered */}
        <div className="w-full flex-1 flex items-center justify-center py-4 px-2 sm:px-4">
          <div className="w-full max-w-[380px] sm:max-w-[420px] flex flex-col justify-center">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-medium text-text-main tracking-tight">
                Create account
              </h1>
              <p className="text-xs sm:text-sm font-light text-text-muted mt-1">
                Start monitoring and nurturing your plants.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Full Name Field */}
              <div>
                <label className="text-sm font-medium text-text-main mb-1.5 block">
                  Full Name
                </label>
                <div className="flex items-center bg-[#242724] focus-within:bg-[#292D29] focus-within:ring-1 focus-within:ring-mint/50 rounded-xl px-3.5 py-2.5 sm:py-3 transition-all">
                  <User size={18} className="text-text-muted shrink-0 mr-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full bg-transparent text-sm text-text-main placeholder-text-muted/60 outline-none"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="text-sm font-medium text-text-main mb-1.5 block">
                  Email
                </label>
                <div className="flex items-center bg-[#242724] focus-within:bg-[#292D29] focus-within:ring-1 focus-within:ring-mint/50 rounded-xl px-3.5 py-2.5 sm:py-3 transition-all">
                  <Mail size={18} className="text-text-muted shrink-0 mr-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent text-sm text-text-main placeholder-text-muted/60 outline-none"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="text-sm font-medium text-text-main mb-1.5 block">
                  Password
                </label>
                <div className="flex items-center bg-[#242724] focus-within:bg-[#292D29] focus-within:ring-1 focus-within:ring-mint/50 rounded-xl px-3.5 py-2.5 sm:py-3 transition-all">
                  <Lock size={18} className="text-text-muted shrink-0 mr-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full bg-transparent text-sm text-text-main placeholder-text-muted/60 outline-none tracking-normal"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="text-text-muted hover:text-text-main transition-colors ml-2 cursor-pointer outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Sign up Button */}
              <button
                type="submit"
                className="w-full py-2.5 sm:py-3 px-6 rounded-full bg-mint text-[#181A19] font-medium text-sm sm:text-base hover:brightness-105 active:scale-[0.99] transition-all shadow-md cursor-pointer mt-2"
              >
                Create account
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-5 sm:my-6">
              <div className="w-full border-t border-[#292D29]" />
              <span className="absolute bg-canvas px-3 text-xs font-light text-text-muted">
                or continue with
              </span>
            </div>

            {/* OAuth Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {/* GitHub Button */}
              <button
                type="button"
                onClick={handleGitHubSignup}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#242724] hover:bg-[#2B2F2B] text-text-main font-medium text-xs sm:text-sm transition-all cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <svg className="size-4 fill-current text-mint" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </button>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignup}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#242724] hover:bg-[#2B2F2B] text-text-main font-medium text-xs sm:text-sm transition-all cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <svg className="size-4 fill-current text-mint" viewBox="0 0 24 24">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
                <span>Google</span>
              </button>
            </div>

            {/* Switch to Sign In */}
            <p className="text-center text-xs sm:text-sm font-light text-text-muted mt-5 sm:mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-mint font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
