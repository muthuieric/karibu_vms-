"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Send, HelpCircle } from "lucide-react";

type ChatMessage = {
  id: number;
  text: string;
  sender: "bot" | "user";
  action?: {
    label: string;
    url: string;
  };
};

export default function SmartChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, text: "Hi, I can help you understand how karibu-vms works, guide you to registration, or connect you with support.", sender: "bot" }
  ]);
  const [inputValue, setInputValue] = useState("");
  
  // Advanced State Machine for Routing
  const [flowState, setFlowState] = useState<
    "idle" | 
    "awaiting_problem_company" | 
    "awaiting_problem_desc" |
    "awaiting_reg_name" |
    "awaiting_reg_company" |
    "awaiting_reg_location" |
    "awaiting_reg_industry"
  >("idle");
  
  const [tempData, setTempData] = useState({ 
    name: "", 
    company: "", 
    location: "", 
    industry: "", 
    problem: "" 
  });
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (messageText: string) => {
    const text = messageText.trim();
    if (!text) return;

    // Add User Message immediately
    setMessages(prev => [...prev, { id: Date.now(), text, sender: "user" }]);
    setInputValue("");

    // Simulate thinking delay
    setTimeout(() => {
      
      // ==========================================
      // FLOW 1: SUPPORT TICKET (High Priority)
      // ==========================================
      if (flowState === "awaiting_problem_company") {
        setTempData(prev => ({ ...prev, company: text }));
        setFlowState("awaiting_problem_desc");
        setMessages(prev => [...prev, { id: Date.now(), text: "Thanks. Now, please describe the exact issue or problem you are facing.", sender: "bot" }]);
        return;
      }

      if (flowState === "awaiting_problem_desc") {
        const problem = text;
        setFlowState("idle"); // Reset flow
        
        const waText = encodeURIComponent(`*Support Ticket*\nCompany: ${tempData.company}\nIssue: ${problem}`);
        const waLink = `https://wa.me/254706123513?text=${waText}`;
        
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          text: "I've drafted your support ticket. Click the button below to send it directly to our technical team on WhatsApp so we can resolve this immediately.", 
          sender: "bot",
          action: { label: "Send Ticket to Support", url: waLink }
        }]);
        setTempData({ name: "", company: "", location: "", industry: "", problem: "" });
        return;
      }

      // ==========================================
      // FLOW 2: REGISTRATION & SALES QUALIFICATION
      // ==========================================
      if (flowState === "awaiting_reg_name") {
        setTempData(prev => ({ ...prev, name: text }));
        setFlowState("awaiting_reg_company");
        setMessages(prev => [...prev, { id: Date.now(), text: `Nice to meet you, ${text}! What is the name of your organization?`, sender: "bot" }]);
        return;
      }

      if (flowState === "awaiting_reg_company") {
        setTempData(prev => ({ ...prev, company: text }));
        setFlowState("awaiting_reg_location");
        setMessages(prev => [...prev, { id: Date.now(), text: "Got it. Where is your organization located?", sender: "bot" }]);
        return;
      }

      if (flowState === "awaiting_reg_location") {
        setTempData(prev => ({ ...prev, location: text }));
        setFlowState("awaiting_reg_industry");
        setMessages(prev => [...prev, { id: Date.now(), text: "And finally, what type of organization is this? (e.g., Office, School, Apartment)", sender: "bot" }]);
        return;
      }

      if (flowState === "awaiting_reg_industry") {
        const industry = text;
        setFlowState("idle"); // Reset flow
        
        const waText = encodeURIComponent(`*New Setup Request*\nName: ${tempData.name}\nOrganization: ${tempData.company}\nLocation: ${tempData.location}\nType: ${industry}\n\n*Note:* Client completed the chatbot intake. Let's get them set up!`);
        const waLink = `https://wa.me/254706123513?text=${waText}`;
        
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          text: "Perfect! I have all your details. Click the button below to connect directly with our team on WhatsApp to finalize your setup.", 
          sender: "bot",
          action: { label: "Chat with Team", url: waLink }
        }]);
        setTempData({ name: "", company: "", location: "", industry: "", problem: "" });
        return;
      }

      // ==========================================
      // FLOW 3: IDLE KEYWORD RECOGNITION & FALLBACK
      // ==========================================
      const lowerInput = text.toLowerCase();
      
      // Catch Greetings first
      if (lowerInput.match(/\b(hi|hello|hey|hii|heya|greetings)\b/)) {
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          text: "Hello! 👋 How can I help you today? I can help you understand how karibu-vms works, guide you to registration, or connect you with support.", 
          sender: "bot" 
        }]);
      }
      else if (lowerInput.includes("support") || lowerInput.includes("problem") || lowerInput.includes("issue") || lowerInput.includes("ticket") || lowerInput.includes("help") || lowerInput.includes("error")) {
        setFlowState("awaiting_problem_company");
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          text: "I can help with that. Let's create a support ticket. First, what is your organization's name?", 
          sender: "bot" 
        }]);
      }
      else if (lowerInput.includes("pric") || lowerInput.includes("cost") || lowerInput.includes("pay") || lowerInput.includes("plan") || lowerInput.includes("subscription")) {
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          text: "Our pricing is transparent and designed to scale with your visitor volume. You only pay for what you use. Type 'Start setup' to get an account and a custom quote!", 
          sender: "bot"
        }]);
      } 
      else if (lowerInput.includes("how") || lowerInput.includes("work") || lowerInput.includes("feature") || lowerInput.includes("detail") || lowerInput.includes("about")) {
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          text: "karibu-vms replaces manual visitor books with a digital process for check-in, verification, approval, checkout, and visitor records. Everything is managed seamlessly from one place.", 
          sender: "bot" 
        }]);
      } 
      else if (lowerInput.includes("setup") || lowerInput.includes("register") || lowerInput.includes("buy") || lowerInput.includes("trial") || lowerInput.includes("sales") || lowerInput.includes("start")) {
        setFlowState("awaiting_reg_name");
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          text: "Let's get your organization set up! To start, what is your name?", 
          sender: "bot"
        }]);
      } 
      // FALLBACK: WhatsApp Routing for unknown questions
      else {
        const waText = encodeURIComponent(`Hi, I have a question from the website: "${text}"`);
        const waLink = `https://wa.me/254706123513?text=${waText}`;

        setMessages(prev => [...prev, { 
          id: Date.now(), 
          text: "I might need a human to help with that. Please click the button below to ask our team directly on WhatsApp.", 
          sender: "bot",
          action: { label: "Ask on WhatsApp", url: waLink }
        }]);
      }

    }, 600);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const quickActions = [
    { label: "Get help", text: "I need help with an issue" },
    { label: "Ask about pricing", text: "Tell me about pricing" },
    { label: "Start setup", text: "I want to start setup" }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="w-[calc(100vw-3rem)] sm:w-[380px] h-[500px] max-h-[calc(100vh-8rem)] bg-white border border-zinc-100 shadow-xl rounded-3xl flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Chat Header */}
          <div className="bg-white border-b border-zinc-100 p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold tracking-tighter text-sm shrink-0 border border-blue-100">
                k.
              </div>
              <div>
                <h3 className="font-semibold text-sm text-zinc-900">karibu-vms Support</h3>
                <p className="text-[12px] text-zinc-500">We reply instantly</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 p-2 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-zinc-50/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] flex flex-col gap-2 ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <div className={`px-4 py-3 text-sm leading-relaxed ${
                    msg.sender === "user" 
                    ? "bg-blue-600 text-white rounded-2xl rounded-br-sm shadow-sm" 
                    : "bg-white border border-zinc-100 text-zinc-700 rounded-2xl rounded-bl-sm shadow-sm"
                  }`}>
                    <span dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  </div>
                  {msg.action && (
                    <a 
                      href={msg.action.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:bg-blue-700 transition-colors inline-flex items-center gap-2 mt-1"
                    >
                      <HelpCircle size={14} /> {msg.action.label}
                    </a>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-zinc-100">
            {/* Quick Actions (Only show if bot is idle) */}
            {flowState === "idle" && (
              <div className="flex gap-2 overflow-x-auto pb-3 mb-1 no-scrollbar">
                {quickActions.map((action, i) => (
                  <button 
                    key={i} 
                    onClick={() => {
                      sendMessage(action.text);
                    }}
                    className="whitespace-nowrap px-3.5 py-1.5 bg-blue-50 border border-blue-100 hover:border-blue-200 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-full transition-all"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="relative mt-2">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..." 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-zinc-900"
              />
              <button type="submit" disabled={!inputValue.trim()} className="absolute right-1.5 top-1.5 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border transition-all duration-300 hover:scale-105 active:scale-95 ${
          isOpen ? "bg-white border-zinc-200 rotate-90" : "bg-blue-600 border-transparent shadow-blue-500/30"
        }`}
      >
        {isOpen ? (
          <X className="text-zinc-900 w-6 h-6" />
        ) : (
          <div className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-lg">
            k.
          </div>
        )}
      </button>

      {/* Tailwind utility to hide scrollbars cleanly */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
