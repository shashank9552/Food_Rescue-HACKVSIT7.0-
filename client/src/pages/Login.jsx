import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { LogIn, UserPlus, Mail, Lock, User, Loader } from 'lucide-react';

export default function Login() {
  const { login, signup, loginWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/select-role";

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (isSignUp) {
        await signup(data.email, data.password, data.name);
        toast.success("Account created successfully!");
        navigate("/select-role");
      } else {
        await login(data.email, data.password);
        toast.success("Welcome back!");
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const user = await loginWithGoogle();
      toast.success("Authenticated with Google!");
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      toast.error("Google authentication failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-text flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden dark:bg-bg-dark dark:text-text-dark">
      {/* Dynamic graphic accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="font-bold text-white text-xl">F</span>
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-text tracking-tight dark:text-text-dark">
          {isSignUp ? "Join Food Rescue AI" : "Welcome back"}
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-text-dark/70">
          {isSignUp ? "Create your account and start saving food" : "Access your matching dashboard"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-card py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-border dark:bg-surface-dark dark:border-border-dark">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-text dark:text-text-dark">Full Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="John Doe"
                    {...register('name', { required: "Name is required" })}
                    className="block w-full pl-10 pr-3 py-2 border border-border rounded-xl focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-text dark:bg-bg-dark dark:border-border-dark dark:text-text-dark"
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  placeholder="name@organization.com"
                  {...register('email', { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                  className="block w-full pl-10 pr-3 py-2 border border-border rounded-xl focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-text dark:bg-bg-dark dark:border-border-dark dark:text-text-dark"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password', { 
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                  className="block w-full pl-10 pr-3 py-2 border border-border rounded-xl focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-text dark:bg-bg-dark dark:border-border-dark dark:text-text-dark"
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-text dark:text-text-dark">Confirm Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...register('confirmPassword', { 
                      required: "Password confirmation is required",
                      validate: (val) => {
                        if (watch('password') !== val) {
                          return "Passwords do not match";
                        }
                      }
                    })}
                    className="block w-full pl-10 pr-3 py-2 border border-border rounded-xl focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-text dark:bg-bg-dark dark:border-border-dark dark:text-text-dark"
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <Loader className="w-5 h-5 animate-spin text-white" />
                ) : isSignUp ? (
                  <span className="flex items-center gap-1"><UserPlus className="w-4 h-4" /> Create Account</span>
                ) : (
                  <span className="flex items-center gap-1"><LogIn className="w-4 h-4" /> Sign In</span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center w-full">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-slate-500 dark:bg-surface-dark dark:text-text-dark/70">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full flex justify-center items-center py-2 px-4 border border-border rounded-xl shadow-sm bg-card text-sm font-semibold text-text hover:bg-surface transition-colors disabled:opacity-50 dark:bg-surface-dark dark:border-border-dark dark:text-text-dark dark:hover:bg-bg-dark"
              >
                {googleLoading ? (
                  <Loader className="w-5 h-5 animate-spin text-slate-400" />
                ) : (
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(1, 0, 0, 1, 0, 0)">
                      <path d="M21.35,11.1H12v2.7h5.38C16.88,15.74,14.81,17.2,12,17.2a5.2,5.2,0,1,1,4.92-3.48H20.3a8.2,8.2,0,1,0-8.3,8.48c4.32,0,7.16-2.71,7.93-5.83.21-.86.3-1.7.35-2.22A16,16,0,0,0,21.35,11.1Z" fill="#4285F4" />
                    </g>
                  </svg>
                )}
                <span>Sign in with Google</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-green-600 font-bold hover:underline"
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Create one"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
