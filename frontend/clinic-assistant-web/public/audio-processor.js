class PcmProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const channelData = inputs[0]?.[0];
    if (!channelData) return true;
    const int16 = new Int16Array(channelData.length);
    for (let i = 0; i < channelData.length; i++) {
      const c = Math.max(-1, Math.min(1, channelData[i]));
      int16[i] = c < 0 ? c * 32768 : c * 32767;
    }
    this.port.postMessage(int16.buffer, [int16.buffer]);
    return true;
  }
}
registerProcessor("pcm-processor", PcmProcessor);
