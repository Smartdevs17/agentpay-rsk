"use client";

import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Wallet, CheckCircle2, Bitcoin } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { PremiumButton } from "../components/ui/PremiumButton";
import { GlassCard } from "../components/ui/GlassCard";
import { useWallet } from "../context/WalletContext";

export default function Home() {
  const { address, connect } = useWallet();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navbar address={address ?? undefined} onConnect={connect} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rsk-orange/10 border border-rsk-orange/20 text-rsk-orange text-sm font-medium mb-8"
            >
              <Bitcoin className="h-4 w-4" />
              <span>Secured by Rootstock Smart Contracts</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl sm:text-7xl font-bold tracking-tight mb-6"
            >
              The Next-Gen Pay Rail for{" "}
              <span className="text-gradient">Freelance Gigs</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg sm:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              AgentPay RSK deploys decentralized escrow on Rootstock. 
              Funds are only released when milestones are met, secured by Bitcoin's security.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <PremiumButton variant="premium" size="lg" onClick={() => window.location.href = '/dashboard'}>
                Launch Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </PremiumButton>
              <PremiumButton variant="outline" size="lg" onClick={() => window.open('https://explorer.testnet.rootstock.io/address/0x593e4ca205d04f1fa4d7db94c5690747d18b8da1', '_blank')}>
                View Contract
              </PremiumButton>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 relative z-20">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">Why AgentPay RSK?</h2>
            <p className="text-white/50 text-lg">Built for the future of trustless freelance work</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <GlassCard key={i} delay={i * 0.1}>
                <div className="w-12 h-12 rounded-xl premium-gradient flex items-center justify-center mb-6 shadow-lg shadow-rsk-orange/10">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-white/60 leading-relaxed">{feature.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works / CTA */}
      <section className="py-24 px-4 bg-white/5">
        <div className="container mx-auto max-w-4xl text-center">
          <GlassCard className="py-16 px-8" hover={false}>
            <h2 className="text-4xl font-bold mb-6">Ready to work trustlessly?</h2>
            <p className="text-xl text-white/60 mb-10">
              Join the Bitcoin-secured freelance ecosystem on Rootstock today.
            </p>
            <PremiumButton variant="premium" size="lg" onClick={connect}>
              {address ? "Wallet Connected" : "Connect Your Wallet"}
            </PremiumButton>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-white/40 text-sm">
        <p>© 2026 AgentPay RSK. Built on Rootstock.</p>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Zap,
    title: "Instant Release",
    description: "No more waiting days for bank transfers. RBTC payments are released instantly upon milestone verification.",
  },
  {
    icon: Shield,
    title: "Bitcoin Secured",
    description: "Your escrow funds are locked on Rootstock, inheriting the legendary security of the Bitcoin network.",
  },
  {
    icon: CheckCircle2,
    title: "Smart Verification",
    description: "Integration with AI agents to verify GitHub commits match the agreed-upon scope automatically.",
  },
];
