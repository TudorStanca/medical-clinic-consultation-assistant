import { useRef } from "react";

const useAudioWebSocket = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pausedRef = useRef(false);

  const startStreaming = async (sessionId: string) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const audioContext = new AudioContext({ sampleRate: 16000 });
    audioContextRef.current = audioContext;

    await audioContext.audioWorklet.addModule("/audio-processor.js");

    const source = audioContext.createMediaStreamSource(stream);
    const workletNode = new AudioWorkletNode(audioContext, "pcm-processor");
    workletNodeRef.current = workletNode;

    const proto = location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${proto}//${location.host}/ws/audio/${sessionId}`);
    wsRef.current = ws;

    await new Promise<void>((resolve, reject) => {
      ws.onopen = () => resolve();
      ws.onerror = (e) => reject(e);
    });

    workletNode.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
      if (pausedRef.current) {
        return;
      }
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(event.data);
      }
    };

    // Connect to a silent destination to avoid mic feedback through speakers
    const silentDest = audioContext.createMediaStreamDestination();
    source.connect(workletNode);
    workletNode.connect(silentDest);
  };

  const pauseStreaming = async () => {
    pausedRef.current = true;
    if (audioContextRef.current?.state === "running") {
      await audioContextRef.current.suspend();
    }
  };

  const resumeStreaming = async () => {
    if (audioContextRef.current?.state === "suspended") {
      await audioContextRef.current.resume();
    }
    pausedRef.current = false;
  };

  const stopStreaming = () => {
    pausedRef.current = false;

    workletNodeRef.current?.disconnect();
    workletNodeRef.current = null;

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    audioContextRef.current?.close();
    audioContextRef.current = null;

    wsRef.current?.close(1000, "Session ended");
    wsRef.current = null;
  };

  return { startStreaming, stopStreaming, pauseStreaming, resumeStreaming };
};

export default useAudioWebSocket;
