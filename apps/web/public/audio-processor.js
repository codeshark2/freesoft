// Audio worklet processor for capturing microphone audio
class AudioCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.chunkCount = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];

    if (input && input.length > 0) {
      const inputData = input[0]; // Get first channel

      // Debug: Check if we're receiving non-zero audio
      this.chunkCount++;
      if (this.chunkCount === 1 || this.chunkCount % 100 === 0) {
        // Calculate RMS (root mean square) to check audio level
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        console.log(`[Worklet] Chunk ${this.chunkCount}: RMS level = ${rms.toFixed(6)}, first samples:`,
          Array.from(inputData.slice(0, 5)).map(v => v.toFixed(4)));
      }

      // Convert float32 to int16 PCM
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }

      // Send to main thread
      this.port.postMessage(pcmData.buffer, [pcmData.buffer]);
    }

    return true; // Keep processor alive
  }
}

registerProcessor('audio-capture-processor', AudioCaptureProcessor);
