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

    setMessages(prev => [...prev, { id: Date.now(), text, sender: "user" }]);
    setInputValue("");

    setTimeout(() => {
      if (flowState === "awaiting_problem_company") {
        setTempData(prev => ({ ...prev, company: text }));
        setFlowState("awaiting_problem_desc");
        setMessages(prev => [...prev, { id: Date.now(), text: "Thanks. Now, please describe the exact issue or problem you are facing.", sender: "bot" }]);
        return;
      }

      if (flowState === "awaiting_problem_desc") {
        const problem = text;
        setFlowState("idle");
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
        setFlowState("idle");
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

      const lowerInput = text.toLowerCase();
      const productAnswer = getProductAnswer(lowerInput);

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
          className="mb-4 flex h-[500px] max-h-[calc(100vh-8rem)] w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-xl duration-300 animate-in slide-in-from-bottom-5 sm:w-[380px]"
        >
          <div className="flex items-center justify-between border-b border-zinc-100 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 p-1.5">
                <Image
                  src="/icon.svg"
                  alt="Karibu VMS logo"
                  width={30}
                  height={30}
                  className="h-7 w-7 object-contain"
                />
              </div>
              <div>
                <h2 id="karibu-support-chat-title" className="text-sm font-semibold text-zinc-900">karibu-vms Support</h2>
                <p className="text-[12px] text-zinc-500">We reply instantly</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close support chat"
              className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-700"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-zinc-50/50 p-5" aria-live="polite">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-[85%] flex-col gap-2 ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <div className={`px-4 py-3 text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "rounded-2xl rounded-br-sm bg-blue-600 text-white shadow-sm"
                      : "rounded-2xl rounded-bl-sm border border-zinc-100 bg-white text-zinc-700 shadow-sm"
                  }`}>
                    <span>{msg.text}</span>
                  </div>
                  {msg.action && (
                    <a
                      href={msg.action.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                    >
                      <HelpCircle size={14} /> {msg.action.label}
                    </a>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="border-t border-zinc-100 bg-white p-4">
            {flowState === "idle" && (
              <div className="no-scrollbar mb-1 flex gap-2 overflow-x-auto pb-3">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      sendMessage(action.text);
                    }}
                    className="whitespace-nowrap rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1.5 text-xs font-medium text-blue-700 transition-all hover:border-blue-200 hover:bg-blue-100"
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
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-4 pr-12 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button type="submit" aria-label="Send support message" disabled={!inputValue.trim()} className="absolute right-1.5 top-1.5 rounded-xl bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
                <Send size={16} />
              </button>
            </form>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close Karibu VMS assistant" : "Open Karibu VMS assistant"}
        aria-controls="karibu-support-chat"
        aria-expanded={isOpen}
        className={`flex h-14 w-14 items-center justify-center rounded-full border shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
          isOpen ? "rotate-90 border-blue-100 bg-white" : "border-transparent bg-blue-600 shadow-blue-500/30"
        }`}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-blue-700" />
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
    </div>
  );
}
