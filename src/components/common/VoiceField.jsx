import { Mic, MicOff } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

function VoiceField({
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  textarea = false,
  lang = "mr-IN",
}) {
  const [listening, setListening] = useState(false);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  const startVoice = () => {
    if (isIOS) {
      toast.error("iPhone वर browser voice typing supported नाही. Keyboard mic वापरा.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Voice typing not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.start();
    setListening(true);

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;

      onChange({
        target: {
          name,
          value: value ? value + " " + text : text,
        },
      });

      setListening(false);
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        toast.error("Microphone permission blocked");
      } else if (event.error === "no-speech") {
        toast.error("No speech detected");
      } else if (event.error === "audio-capture") {
        toast.error("Microphone not found");
      } else if (event.error === "network") {
        toast.error("Voice typing requires internet connection");
      } else {
        toast.error("Voice typing failed");
      }

      setListening(false);
    };

    recognition.onend = () => setListening(false);
  };

  return (
    <div className="voice-field">
      {textarea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      )}

      <button type="button" className="voice-btn" onClick={startVoice}>
        {listening ? <MicOff size={17} /> : <Mic size={17} />}
      </button>
    </div>
  );
}

export default VoiceField;