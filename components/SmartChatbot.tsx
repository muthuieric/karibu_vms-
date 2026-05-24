"use client";

import Image from "next/image";
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

const PRIVATE_DASHBOARD_RESPONSE =
  "For security reasons, this action must be done from your dashboard by an authorized user.";

const suggestedQuestions = [
  "What is Karibu VMS?",
  "How does visitor self check-in work?",
  "What can guards do?",
  "What can admins manage?",
  "What is included in Basic?",
  "What is included in Premium?",
  "Can I assign guards to entry points?",
  "Can I customize visitor forms?",
  "Can visitors agree to entry terms?",
  "Is visitor information secure?",
  "How do I contact support?",
];

function includesAny(input: string, keywords: string[]) {
  return keywords.some((keyword) => input.includes(keyword));
}

function getProductAnswer(input: string) {
  if (
    includesAny(input, [
      "show today's visitors",
      "show todays visitors",
      "today's visitors",
      "todays visitors",
      "show visitors",
      "visitor id numbers",
      "id numbers",
      "reset password",
      "export records",
      "payment history",
      "unlock company",
      "delete visitor",
    ])
  ) {
    return PRIVATE_DASHBOARD_RESPONSE;
  }

  if (includesAny(input, ["what is karibu", "what is karibu vms", "about karibu", "about karibu vms"])) {
    return "Karibu VMS is a modern visitor management system for secure check-in, guard workflows, host confirmation, and building access records.";
  }

  if (includesAny(input, ["self check-in", "self check in", "visitor check-in", "visitor check in", "how does visitor"])) {
    return "Visitors scan a gate QR code, complete the self check-in form, accept entry terms, and submit their visit details for the security team to review.";
  }

  if (includesAny(input, ["qr", "code", "registration"])) {
    return "Each gate can use a QR code for visitor registration, helping visitors open the correct self check-in page for that entry point.";
  }

  if (includesAny(input, ["guard", "guards", "security team"])) {
    return "Guards can register visitors, review submitted details, capture required information, manage check-ins, and support checkout at the gate.";
  }

  if (includesAny(input, ["admin", "dashboard", "manage"])) {
    return "Admins can manage visitor rules, guards, departments, hosts, entry points, restricted visitor alerts, and visitor access settings from the dashboard.";
  }

  if (includesAny(input, ["host confirmation", "host confirm", "host approval", "notify host"])) {
    return "Host confirmation helps notify the right host about a visitor so the visit can be reviewed or approved according to the building workflow.";
  }

  if (includesAny(input, ["custom form", "custom forms", "visitor rules", "rules", "entry terms", "terms", "consent"])) {
    return "Admins can configure visitor rules, custom form fields, required photos, host selection, and entry terms so visitors know what they are agreeing to.";
  }

  if (includesAny(input, ["department", "departments", "hosts"])) {
    return "Departments and hosts keep people organized, making it easier for visitors and guards to select who is being visited.";
  }

  if (includesAny(input, ["entry point", "entry points", "gate", "gates", "assign guards"])) {
    return "Karibu VMS supports multiple gates or entry points, and guards can be assigned to the places where they work.";
  }

  if (includesAny(input, ["restricted", "blacklist", "alert", "alerts", "denied"])) {
    return "Restricted visitor alerts help security teams spot people who should not be allowed in, based on records configured by authorized admins.";
  }

  if (includesAny(input, ["basic", "free"])) {
    return "Basic includes the core digital visitor workflow for check-in, visitor records, guard use, and essential building access tracking.";
  }

  if (includesAny(input, ["premium", "otp", "phone verification", "verification"])) {
    return "Premium adds advanced visitor rules, host confirmation, digital visitor passes, and a choice of QR Pass Verification or SMS OTP Verification as the active verification method.";
  }

  if (includesAny(input, ["pricing", "price", "cost", "pay", "plan", "subscription"])) {
    return "Karibu VMS has Basic and Premium options. Basic covers core visitor management, while Premium adds more advanced security and workflow features.";
  }

  if (includesAny(input, ["privacy", "secure", "security", "data", "records"])) {
    return "Karibu VMS is designed for authorized access, clear visitor consent, and secure handling of visitor information for access-control purposes.";
  }

  if (includesAny(input, ["support", "contact", "demo", "sales"])) {
    return "You can contact support or request a demo from the website. Tell me your organization details and I can help connect you with the team.";
  }

  return null;
}

export default function SmartChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, text: "Hi, I can answer public questions about Karibu VMS, visitor check-in, guard workflows, admin tools, pricing, privacy, or support.", sender: "bot" }
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
        const waLink = `https://wa.me/254702104690?text=${waText}`;
        
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
        const waLink = `https://wa.me/254702104690?text=${waText}`;
        
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
      const productAnswer = getProductAnswer(lowerInput);
      
      // Catch Greetings first
      if (lowerInput.match(/\b(hi|hello|hey|hii|heya|greetings)\b/)) {
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          text: "Hello. I can help with public Karibu VMS questions about self check-in, guards, admins, pricing, privacy, or support.", 
          sender: "bot" 
        }]);
      }
      else if (productAnswer) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: productAnswer,
          sender: "bot"
        }]);
      }
      else if (lowerInput.includes("problem") || lowerInput.includes("issue") || lowerInput.includes("ticket") || lowerInput.includes("error")) {
        setFlowState("awaiting_problem_company");
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          text: "I can help with that. Let's create a support ticket. First, what is your organization's name?", 
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
        const waLink = `https://wa.me/254702104690?text=${waText}`;

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
    ...suggestedQuestions.map((question) => ({ label: question, text: question })),
    { label: "Start setup", text: "I want to start setup" },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {isOpen && (
        <section
          id="karibu-support-chat"
          role="dialog"
          aria-modal="false"
          aria-labelledby="karibu-support-chat-title"
          className="w-[calc(100vw-3rem)] sm:w-[380px] h-[500px] max-h-[calc(100vh-8rem)] bg-white border border-zinc-100 shadow-xl rounded-3xl flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-5 duration-300"
        >
          
          {/* Chat Header */}
          <div className="bg-white border-b border-zinc-100 p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 p-1.5">
                <Image
                  src="/icon.svg"
                  alt="Karibu VMS logo"
                  width={30}
                  height={30}
                  className="h-7 w-7 object-contain"
                />
              </div>
              <div>
                <h2 id="karibu-support-chat-title" className="font-semibold text-sm text-zinc-900">karibu-vms Support</h2>
                <p className="text-[12px] text-zinc-500">We reply instantly</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close support chat"
              className="text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 p-2 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-zinc-50/50" aria-live="polite">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] flex flex-col gap-2 ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <div className={`px-4 py-3 text-sm leading-relaxed ${
                    msg.sender === "user" 
                    ? "bg-blue-600 text-white rounded-2xl rounded-br-sm shadow-sm" 
                    : "bg-white border border-zinc-100 text-zinc-700 rounded-2xl rounded-bl-sm shadow-sm"
                  }`}>
                    <span>{msg.text}</span>
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
                    type="button"
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
              <label htmlFor="support-chat-message" className="sr-only">Support chat message</label>
              <input 
                id="support-chat-message"
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..." 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-zinc-900"
              />
              <button type="submit" aria-label="Send support message" disabled={!inputValue.trim()} className="absolute right-1.5 top-1.5 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
                <Send size={16} />
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Floating Toggle Button */}
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close Karibu VMS assistant" : "Open Karibu VMS assistant"}
        aria-controls="karibu-support-chat"
        aria-expanded={isOpen}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border transition-all duration-300 hover:scale-105 active:scale-95 ${
          isOpen ? "bg-white border-blue-100 rotate-90" : "bg-blue-600 border-transparent shadow-blue-500/30"
        }`}
      >
        {isOpen ? (
          <X className="text-blue-700 w-6 h-6" />
        ) : (
          <Image
            src="/icon.svg"
            alt=""
            width={30}
            height={30}
            className="h-8 w-8 object-contain"
            aria-hidden="true"
          />
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
