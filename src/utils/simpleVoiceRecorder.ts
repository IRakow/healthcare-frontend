export function recordVoice(onComplete: (blob: Blob) => void) {
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    const mediaRecorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      onComplete(blob);
    };

    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), 5000); // Record 5 seconds
  });
}