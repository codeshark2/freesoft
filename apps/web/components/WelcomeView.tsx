export function WelcomeView() {
  return (
    <div className="flex items-center justify-center h-full p-12">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">Voice AI Testing Tool</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Test your voice pipeline with real-time ASR → LLM → TTS processing
        </p>
        <div className="space-y-4 text-left">
          <h3 className="font-semibold text-lg">Getting Started:</h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Enter your API keys in the left panel</li>
            <li>Configure your system prompt and voice settings</li>
            <li>Click "Start Session" to begin testing</li>
            <li>Speak into your microphone to test the pipeline</li>
          </ol>
        </div>
        <div className="mt-8 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
          <p className="font-semibold mb-2">Privacy Notice:</p>
          <p>
            Your API keys are never stored. They exist only in memory during your
            session and are cleared when you close the application.
          </p>
        </div>
      </div>
    </div>
  );
}
