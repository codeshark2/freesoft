import Header from "@/components/dashboard/Header";
import VendorSection from "@/components/dashboard/VendorSection";
import TestConsole from "@/components/dashboard/TestConsole";
import MetricsPanel from "@/components/dashboard/MetricsPanel";
import WaveformVisualizer from "@/components/dashboard/WaveformVisualizer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background matrix-bg">
      {/* Scanline overlay effect */}
      <div className="fixed inset-0 scanline pointer-events-none z-50 opacity-30" />
      
      <Header />
      
      <main className="container py-8 px-4 space-y-8">
        {/* Hero Section */}
        <section className="text-center space-y-4 py-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold">
            <span className="text-foreground">Test Your </span>
            <span className="text-primary glow-text-cyan">Voice AI</span>
            <span className="text-foreground"> Pipeline</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Compare ASR, LLM, and TTS vendors side-by-side. 
            <span className="text-accent"> Open source</span> and built for the AI community.
          </p>
        </section>

        {/* Metrics Dashboard */}
        <MetricsPanel />

        {/* Main Grid - Vendors + Console */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <VendorSection />
          </div>
          <div className="space-y-6">
            <TestConsole />
            <WaveformVisualizer isActive={false} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>
            Built with 💚 for the{" "}
            <span className="text-primary">AI Community</span>
            {" "}• Open Source on{" "}
            <a 
              href="https://github.com/codeshark2/freevoicetesting" 
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
