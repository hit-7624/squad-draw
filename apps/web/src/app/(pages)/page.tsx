import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Zap,
  Palette,
  Share2,
  Github,
  ArrowRight,
  MessageSquare,
  SlidersHorizontal,
  Instagram,
  Twitter,
  Mail,
} from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo.svg" alt="Squad Draw" className="w-32 h-auto" />
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link href="/signin" className="text-muted-foreground hover:text-primary transition-colors">
              Sign In
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <a href="https://github.com/hit-7624/squad-draw" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">Star on GitHub</span>
            </a>
            <ThemeToggle />
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/signup">
                Start Drawing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Ready to Create and{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                Collaborate
              </span>{" "}
              Together?
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Start drawing, sketching, and brainstorming with your team in real-time. Free to use and open source.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg">
                <Link href="/signup">
                  Start Drawing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-lg"
              >
                <a href="https://github.com/hit-7624/squad-draw" target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-5 w-5" />
                  Star on GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
              ✨ Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Drawing & Collaboration Tools</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to create, collaborate, and share your ideas with your team.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="h-6 w-6 text-primary" />}
              title="Real-time Collaboration"
              description="Work together with your team in real-time. See cursors, edits, and changes as they happen."
            />
            <FeatureCard
              icon={<Palette className="h-6 w-6 text-primary" />}
              title="Rich Drawing Tools"
              description="Complete set of drawing tools including shapes, text, arrows, and freehand drawing."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-primary" />}
              title="Lightning Fast"
              description="Optimized for performance with a smooth drawing experience and instant synchronization across devices."
            />
            <FeatureCard
              icon={<MessageSquare className="h-6 w-6 text-primary" />}
              title="Real-time Chat"
              description="Communicate with your team directly in the drawing room with our integrated real-time chat."
            />
            <FeatureCard
              icon={<Share2 className="h-6 w-6 text-primary" />}
              title="Easy Sharing"
              description="Share your drawings with a simple link. Control permissions and collaborate with anyone, anywhere."
            />
            <FeatureCard
              icon={<SlidersHorizontal className="h-6 w-6 text-primary" />}
              title="Styling Controls"
              description="Fine-tune your creations with controls for stroke, background color, opacity, and more."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
              📝 How It Works
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Process, Amazing Results</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get started with collaborative drawing in just a few simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <HowItWorksStep
              step="01"
              title="Create or Join"
              description="Start a new drawing board or join an existing one with a simple link to get started."
            />
            <HowItWorksStep
              step="02"
              title="Draw & Collaborate"
              description="Use our intuitive tools to draw, sketch, and brainstorm. See your teammates' changes in real-time."
            />
            <HowItWorksStep
              step="03"
              title="Share & Export"
              description="Share your creation with a link or export your drawings to use them anywhere."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary/10 to-orange-400/10 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Start Creating Together?</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of teams already using Squad Draw for their collaborative drawing needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg">
                <Link href="/signup">
                  Start Drawing Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Free forever • No credit card required • Open source</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-around items-center">
            <div className="flex items-center mb-8 md:mb-0">
              <Link href="/" className="flex items-center">
                 <img src="/logo.svg" alt="Squad Draw" className="w-60 h-auto" />
              </Link>
            </div>
            <div className="mb-8 md:mb-0">
                <h3 className="font-semibold text-lg mb-4">Get in touch with me</h3>
                <div className="flex flex-col space-y-3">
                    <a href="mailto:hitjasoliya@icloud.com" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                        <Mail className="h-5 w-5 mr-2" />
                        Mail
                    </a>
                    <a href="https://github.com/hit-7624" target="_blank" rel="noopener noreferrer" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                        <Github className="h-5 w-5 mr-2" />
                        GitHub
                    </a>
                    <a href="https://x.com/hit_7624" target="_blank" rel="noopener noreferrer" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                        <Twitter className="h-5 w-5 mr-2" />
                        X (Twitter)
                    </a>
                    <a href="https://www.instagram.com/hit_7624" target="_blank" rel="noopener noreferrer" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                        <Instagram className="h-5 w-5 mr-2" />
                        Instagram
                    </a>
                </div>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground mt-12 pt-8 border-t border-border">
            <p>© {new Date().getFullYear()} Squad Draw. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Helper component for feature cards
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-background border border-border rounded-lg p-6 hover:border-primary/30 transition-colors hover:shadow-lg">
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

// Helper component for "How It Works" steps
function HowItWorksStep({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mb-6 mx-auto">
        {step}
      </div>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
