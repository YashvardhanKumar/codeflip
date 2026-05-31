"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth-provider";
import apiClient from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Users, Trophy, Target } from "lucide-react";
import Logo from "@/components/logo";

export default function SignupPage() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    name: "",
    password: "",
    password2: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.password2) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiClient.post("auth/register/", formData);
      login(response.data.token, response.data.user);
    } catch (error: any) {
      const errors = error.response?.data;
      if (typeof errors === 'object') {
        Object.values(errors).flat().forEach((err: any) => toast.error(err as string));
      } else {
        toast.error("Registration failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0a0a0b] overflow-hidden">
      {/* Decorative Side */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-700" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center space-y-8 px-12"
        >
          <div className="inline-flex p-4 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
            <Logo />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-white tracking-tight">Join the Elite.</h2>
            <p className="text-slate-400 text-lg max-w-md mx-auto">
              Start your journey today and become part of the fastest growing community of developers.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              { icon: <Trophy size={18} />, title: "Ranked", desc: "Climb the global board" },
              { icon: <Target size={18} />, title: "Precision", desc: "Perfect your logic" },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-primary mb-2">{item.icon}</div>
                <div className="text-white font-bold text-sm">{item.title}</div>
                <div className="text-slate-500 text-xs">{item.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col relative overflow-y-auto">
        <div className="absolute top-8 left-8 lg:left-12">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-all group">
            <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
              <ArrowLeft size={18} />
            </div>
            <span className="font-medium text-sm">Return Home</span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-20 py-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[450px] space-y-8"
          >
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Create your account</h1>
              <p className="text-slate-500 dark:text-slate-400">
                Enter your details to get started with CodeFlip
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-xs uppercase tracking-widest font-bold text-slate-500">Username</Label>
                  <Input
                    id="username"
                    placeholder="fast_racer"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    className="bg-white dark:bg-[#161618] border-slate-200 dark:border-white/5 h-11 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs uppercase tracking-widest font-bold text-slate-500">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Alex Johnson"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-white dark:bg-[#161618] border-slate-200 dark:border-white/5 h-11 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-widest font-bold text-slate-500">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-white dark:bg-[#161618] border-slate-200 dark:border-white/5 h-11 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs uppercase tracking-widest font-bold text-slate-500">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min. 8 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="bg-white dark:bg-[#161618] border-slate-200 dark:border-white/5 h-11 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password2" className="text-xs uppercase tracking-widest font-bold text-slate-500">Confirm</Label>
                  <Input
                    id="password2"
                    type="password"
                    placeholder="Repeat password"
                    value={formData.password2}
                    onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
                    required
                    className="bg-white dark:bg-[#161618] border-slate-200 dark:border-white/5 h-11 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-base font-bold shadow-xl shadow-primary/20 transition-all active:scale-[0.98]" 
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Create Free Account"}
                </Button>
              </div>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-white/5" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-50 dark:bg-[#0a0a0b] px-2 text-slate-500">Already a racer?</span>
              </div>
            </div>

            <div className="text-center">
              <Link href="/login" className="inline-flex items-center text-sm font-bold text-primary hover:underline">
                Sign in to your account
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="p-8 text-center text-xs text-slate-400">
          © 2026 CodeFlip Platform. All rights reserved.
        </div>
      </div>
    </div>
  );
}
