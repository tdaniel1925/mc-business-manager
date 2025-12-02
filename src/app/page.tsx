"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  ClipboardCheck,
  DollarSign,
  Users,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  FileText,
  Phone,
  Mail,
  Calendar,
  Target,
  Megaphone,
  CheckCircle2,
  ArrowRight,
  Star,
} from "lucide-react";
import { CalModal } from "@/components/cal-modal";

const features = [
  {
    icon: ClipboardCheck,
    title: "Smart Underwriting",
    description:
      "AI-powered risk assessment with automated FICO scoring, paper grading, and stacking detection to make faster, smarter funding decisions.",
  },
  {
    icon: FileText,
    title: "Deal Pipeline",
    description:
      "Track every deal from application to funding with a visual pipeline. Never lose track of where a deal stands in the process.",
  },
  {
    icon: Building2,
    title: "Merchant Management",
    description:
      "Complete merchant profiles with business details, owner information, bank analysis, and full document management.",
  },
  {
    icon: DollarSign,
    title: "Collections & Payments",
    description:
      "Automated payment tracking, ACH management, and collection workflows to maximize your portfolio performance.",
  },
  {
    icon: Users,
    title: "Broker Portal",
    description:
      "Manage broker relationships, track commissions, and automate payouts with tiered commission structures.",
  },
  {
    icon: Megaphone,
    title: "Marketing Automation",
    description:
      "Built-in campaign management, voice agents, social media scheduling, and lead generation tools all in one place.",
  },
  {
    icon: Phone,
    title: "AI Voice Agents",
    description:
      "Automated outbound calling campaigns with AI-powered voice agents for lead qualification and follow-ups.",
  },
  {
    icon: Mail,
    title: "CRM & Communications",
    description:
      "Full CRM with contact management, email tracking, task automation, and activity logging.",
  },
  {
    icon: Calendar,
    title: "Scheduling & Tasks",
    description:
      "Integrated calendar, task management, and team collaboration tools to keep your team organized.",
  },
];

const benefits = [
  "Reduce underwriting time by 70%",
  "Increase deal close rates by 35%",
  "Automate repetitive tasks",
  "Real-time portfolio analytics",
  "Multi-user collaboration",
  "Bank statement analysis",
  "Stacking detection alerts",
  "Commission tracking",
];

const stats = [
  { value: "55+", label: "Database Models" },
  { value: "30+", label: "Dashboard Pages" },
  { value: "10", label: "Pipeline Stages" },
  { value: "8", label: "User Roles" },
];

export default function LandingPage() {
  const [isCalModalOpen, setIsCalModalOpen] = useState(false);

  return (
    <>
      <CalModal isOpen={isCalModalOpen} onClose={() => setIsCalModalOpen(false)} />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">MCA Manager</span>
                <p className="text-[10px] text-gray-400 -mt-1">by BotMakers</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-gray-300 hover:text-white transition-colors px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400">
              All-in-One MCA Management Platform
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            The Complete Platform for
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Merchant Cash Advance
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
            Streamline your entire MCA operation from lead generation to collections.
            Underwriting, CRM, marketing automation, and portfolio management — all in
            one powerful platform built by BotMakers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              Live Demo
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setIsCalModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors border border-gray-700"
            >
              Let&apos;s Talk
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Demo credentials: admin@mca.com / admin123
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need to Scale Your MCA Business
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Replace multiple tools with one integrated platform designed specifically
              for MCA funders, ISOs, and brokers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 hover:border-blue-500/50 transition-colors group"
              >
                <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Built for MCA Professionals Who Want Results
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Stop juggling spreadsheets, multiple CRMs, and disconnected tools. MCA
                Manager brings everything together so you can focus on what matters —
                funding deals and growing your business.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/20 rounded-2xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-semibold text-white">
                  Underwriting Intelligence
                </h3>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Risk Score</span>
                    <span className="text-2xl font-bold text-green-400">78</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full"
                      style={{ width: "78%" }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900/50 rounded-xl p-4">
                    <p className="text-gray-400 text-sm mb-1">Paper Grade</p>
                    <p className="text-2xl font-bold text-blue-400">A</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-xl p-4">
                    <p className="text-gray-400 text-sm mb-1">FICO Score</p>
                    <p className="text-2xl font-bold text-white">712</p>
                  </div>
                </div>

                <div className="bg-gray-900/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-medium">Stacking Alert: Low Risk</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            ))}
          </div>

          <blockquote className="text-2xl sm:text-3xl text-white font-medium mb-8">
            &ldquo;MCA Manager transformed our operation. We&apos;ve cut underwriting time
            in half and increased our funding volume by 40% in just three months.&rdquo;
          </blockquote>

          <div>
            <p className="text-white font-semibold">Michael Torres</p>
            <p className="text-gray-400">CEO, Premier Funding Solutions</p>
          </div>
        </div>
      </section>

      {/* Lead List Integration Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-900/30 via-cyan-900/20 to-gray-900/50 border-y border-cyan-500/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-cyan-500/10 rounded-full border border-cyan-500/30 mb-6">
              <span className="text-cyan-400 font-semibold text-sm uppercase tracking-wider">
                Your Complete MCA Business in a Box
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              Pull Marketing Lists Directly<br />Into Your System
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Connect with premium lead providers like <span className="text-cyan-400 font-semibold">Audience Lab</span> and <span className="text-cyan-400 font-semibold">Apollo</span> to automatically import fresh, qualified prospects directly into your MCA workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20 hover:border-cyan-500/40 transition-all">
              <div className="w-14 h-14 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Instant Lead Import</h3>
              <p className="text-gray-400">
                Automatically sync leads from multiple data providers directly into your CRM. No manual CSV uploads or data entry required.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20 hover:border-cyan-500/40 transition-all">
              <div className="w-14 h-14 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Fully Customizable</h3>
              <p className="text-gray-400">
                Tailor every aspect of your MCA business workflow. From underwriting criteria to commission structures, it&apos;s your system, your way.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20 hover:border-cyan-500/40 transition-all">
              <div className="w-14 h-14 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">All-in-One Solution</h3>
              <p className="text-gray-400">
                CRM, underwriting, funding management, broker portals, marketing automation, and analytics - everything you need in one powerful platform.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full border border-cyan-500/30">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-white">AL</div>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-white">AP</div>
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-white">+</div>
              </div>
              <span className="text-cyan-300 font-medium">Connect with Audience Lab, Apollo, and more premium data providers</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Transform Your MCA Business?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join hundreds of MCA professionals who trust MCA Manager to power their
              operations. Start your free trial today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors"
              >
                Live Demo
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                onClick={() => setIsCalModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors"
              >
                Let&apos;s Talk
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white">MCA Manager</span>
                <p className="text-xs text-gray-400">by BotMakers</p>
              </div>
            </div>

            <div className="flex items-center gap-8 text-gray-400">
              <Link href="/login" className="hover:text-white transition-colors">
                Live Demo
              </Link>
              <button
                onClick={() => setIsCalModalOpen(true)}
                className="hover:text-white transition-colors"
              >
                Let&apos;s Talk
              </button>
            </div>

            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} BotMakers. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}
