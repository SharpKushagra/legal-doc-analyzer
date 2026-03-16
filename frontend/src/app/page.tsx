'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ShieldCheck, Zap, FileText, CheckCircle2, TrendingUp, Search } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-50" />
        <div className="container px-4 md:px-6 relative">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto"
          >
            <motion.div variants={item}>
              <Badge variant="secondary" className="px-4 py-1.5 rounded-full text-sm font-medium border border-primary/20 bg-primary/10 text-primary">
                v2.0 Enterprise Release • AI Powered
              </Badge>
            </motion.div>

            <motion.h1 variants={item} className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading track-tight text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/60 leading-[1.1]">
              Legal Document Analysis, <br />
              <span className="text-primary bg-clip-text">Reimagined by AI</span>
            </motion.h1>

            <motion.p variants={item} className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Automate clause extraction, risk detection, and compliance checks with
              extraordinary precision. Built for modern legal teams who demand speed and security.
            </motion.p>

            <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 pt-4 w-full justify-center">
              <Link href="/signup">
                <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto shadow-xl shadow-primary/20">
                  Start Analyzing Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg w-full sm:w-auto backdrop-blur-sm bg-background/50">
                  Sign In
                </Button>
              </Link>
            </motion.div>

            {/* Mockup */}
            <motion.div
              variants={item}
              className="mt-12 rounded-xl border bg-card/50 shadow-2xl overflow-hidden w-full aspect-[16/9] relative group max-w-5xl mx-auto ring-1 ring-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
              <div className="absolute top-0 w-full h-8 bg-muted/80 border-b flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="p-8 pt-16 grid grid-cols-12 gap-6 h-full font-mono text-xs opacity-80">
                <div className="col-span-3 h-full bg-muted/30 rounded-lg animate-pulse" />
                <div className="col-span-9 space-y-4">
                  <div className="h-32 bg-muted/30 rounded-lg animate-pulse delay-75" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-40 bg-muted/30 rounded-lg animate-pulse delay-100" />
                    <div className="h-40 bg-muted/30 rounded-lg animate-pulse delay-150" />
                  </div>
                </div>
              </div>

              {/* Floating Overlay Card */}
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute bottom-10 right-10 z-20 w-80 p-4 bg-card/90 backdrop-blur-md border rounded-xl shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-red-500/20 text-red-500">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Critical Risk Detected</p>
                    <p className="text-xs text-muted-foreground">Force Majeure Clause</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  &quot;Missing explicit pandemic coverage triggers high liability.&quot;
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-muted/30 border-y border-border/50">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold font-heading">Enterprise-Grade Document Intelligence</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Replace hours of manual review with seconds of AI processing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FileText className="h-6 w-6 text-indigo-500" />}
              title="Clause Extraction"
              description="Automatically identifies and extracts key legal clauses, definitions, and obligations from complex PDFs."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-6 w-6 text-emerald-500" />}
              title="Risk Analysis"
              description="Scans for high-risk terms, missing protections, and unfavorable indemnification language."
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6 text-amber-500" />}
              title="Compliance Checks"
              description="Ensures documents adhere to GDPR, CCPA, and custom organizational compliance frameworks."
            />
            <FeatureCard
              icon={<Search className="h-6 w-6 text-purple-500" />}
              title="AI Q&A"
              description="Ask questions about your documents in plain English and get cited, accurate answers instantly."
            />
            <FeatureCard
              icon={<CheckCircle2 className="h-6 w-6 text-blue-500" />}
              title="Comparative Review"
              description="Upload multiple versions and instantly spot redlines, deletions, and subtle logic changes."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-rose-500" />}
              title="Instant Summaries"
              description="Generate executive summaries tailored for different stakeholders (Legal, Finance, CEO)."
            />
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-20 border-b border-border/40">
        <div className="container text-center">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8">Trusted by Legal Teams at</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Mock Logos */}
            <div className="text-xl font-bold flex items-center gap-2"><div className="w-6 h-6 bg-current rounded-full" /> ACME Corp</div>
            <div className="text-xl font-bold flex items-center gap-2"><div className="w-6 h-6 bg-current rounded-md" /> LegalFlow</div>
            <div className="text-xl font-bold flex items-center gap-2"><div className="w-6 h-6 bg-current rotate-45" /> LexisNext</div>
            <div className="text-xl font-bold flex items-center gap-2"><div className="w-6 h-6 bg-current rounded-full border-2" /> GlobalLaw</div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="bg-background/50 hover:bg-background transition-colors hover:shadow-lg border-muted-foreground/10 group">
      <CardHeader>
        <div className="mb-4 w-12 h-12 rounded-lg bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  )
}
