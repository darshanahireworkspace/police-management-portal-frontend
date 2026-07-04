import { Mic, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function AIVoiceAssistant() {
  const [listening, setListening] = useState(false);
  const navigate = useNavigate();

  const normalizeCommand = (text) => {
    return text
      .toLowerCase()
      .replace(/[.,!?]/g, "")
      .trim();
  };

  const cleanSearchText = (command) => {
    return command
      .replace("search", "")
      .replace("find", "")
      .replace("show", "")
      .replace("open", "")
      .replace("mandal", "")
      .replace("temple", "")
      .replace("mandir", "")
      .replace("मंडळ", "")
      .replace("मंदिर", "")
      .replace("दाखवा", "")
      .replace("शोधा", "")
      .replace("ओपन", "")
      .trim();
  };

  const handleCommand = (rawText) => {
    const command = normalizeCommand(rawText);

    toast.success(`Heard: ${rawText}`);

    if (
      command.includes("high risk") ||
      command.includes("high-risk") ||
      command.includes("danger") ||
      command.includes("sensitive") ||
      command.includes("जास्त रिस्क") ||
      command.includes("हाय रिस्क") ||
      command.includes("धोकादायक")
    ) {
      localStorage.setItem("mapCommand", "highRisk");
      navigate("/map-view");
      return;
    }

    if (
      command.includes("map") ||
      command.includes("location") ||
      command.includes("नकाशा") ||
      command.includes("लोकेशन")
    ) {
      navigate("/map-view");
      return;
    }

    if (
      command.includes("dashboard") ||
      command.includes("home") ||
      command.includes("डॅशबोर्ड")
    ) {
      navigate("/dashboard");
      return;
    }

    if (
      command.includes("report") ||
      command.includes("reports") ||
      command.includes("रिपोर्ट")
    ) {
      navigate("/reports");
      return;
    }

    if (
      command.includes("analytics") ||
      command.includes("analysis") ||
      command.includes("अनॅलिटिक्स")
    ) {
      navigate("/analytics");
      return;
    }

    if (
      command.includes("religious") ||
      command.includes("mandir") ||
      command.includes("temple") ||
      command.includes("मंदिर") ||
      command.includes("masjid") ||
      command.includes("mosque") ||
      command.includes("मस्जिद")
    ) {
      navigate("/religious-places");
      return;
    }

    if (
      command.includes("festival") ||
      command.includes("mandal") ||
      command.includes("ganesh") ||
      command.includes("utsav") ||
      command.includes("मंडळ") ||
      command.includes("गणेश")
    ) {
      localStorage.setItem("mapSearch", cleanSearchText(command));
      navigate("/map-view");
      return;
    }

    if (
      command.includes("search") ||
      command.includes("find") ||
      command.includes("show") ||
      command.includes("शोध") ||
      command.includes("दाखव")
    ) {
      localStorage.setItem("mapSearch", cleanSearchText(command));
      navigate("/map-view");
      return;
    }

    localStorage.setItem("mapSearch", command);
    navigate("/map-view");
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Voice assistant not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "mr-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.start();
    setListening(true);

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      handleCommand(text);
      setListening(false);
    };

    recognition.onerror = () => {
      toast.error("Voice command failed. Please try again.");
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };
  };

  return (
    <button
      className={`ai-voice-btn ${listening ? "listening" : ""}`}
      onClick={startListening}
      title="AI Voice Assistant"
    >
      {listening ? <X size={22} /> : <Mic size={22} />}
    </button>
  );
}

export default AIVoiceAssistant;