import { useState } from "react";

export default function AIAssistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSend = () => {
    if (!input) return;

    const userMsg = { role: "user", text: input };

    const aiMsg = {
      role: "ai",
      text: "I am your AI assistant 🤖 (demo mode)",
    };

    setMessages([...messages, userMsg, aiMsg]);
    setInput("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>AI Assistant</h2>

      {/* MESSAGES */}
      <div>
        {messages.map((m, i) => (
          <p key={i}>
            <b>{m.role}:</b> {m.text}
          </p>
        ))}
      </div>

      {/* INPUT BOX */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type message..."
      />

      <button onClick={handleSend}>Send</button>
    </div>
  );
}
