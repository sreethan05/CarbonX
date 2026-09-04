import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PhoneCall, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  MessageSquare, 
  User, 
  Sparkles, 
  Mic, 
  Volume2,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FAQS = [
  {
    q: "How often does the satellite scan my farm?",
    a: "Sentinel-2 scans every 5 days. CarbonX processes these multispectral readings and updates your crop health (NDVI) index every Thursday at 06:00 AM IST."
  },
  {
    q: "When do I get my UPI payout?",
    a: "As soon as a corporate buyer wins the bid on your carbon credit batch, the funds are instantly locked in escrow and cleared to your linked bank account via UPI in less than 3 minutes."
  },
  {
    q: "What if my trees are damaged by a storm?",
    a: "Please report it to your local FPO coordinator immediately. Our satellite detects loss of canopy cover and logs it under micro-insurance parameters to protect your baseline credit score."
  }
];

export default function SupportCenter() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Namaste! I am CarbonX Sahayak. How can I help you with your carbon credits today?', time: 'Just now' }
  ]);
  const [inputText, setInputText] = useState('');
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Add user message
    const userMsg = { sender: 'user', text, time: 'Just now' };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    // Generate responsive bot reply after 1s
    setTimeout(() => {
      let botReply = '';
      const query = text.toLowerCase();

      if (query.includes('payout') || query.includes('money') || query.includes('withdraw') || query.includes('upi')) {
        botReply = 'Your UPI payout transfers instantly after auction completion. Average bank settlement time is under 3 minutes.';
      } else if (query.includes('scan') || query.includes('satellite') || query.includes('ndvi')) {
        botReply = 'Our Sentinel satellites scan your plot coordinates every 5 days. You can view the NDVI trends under Sat Analytics.';
      } else if (query.includes('tree') || query.includes('damage') || query.includes('storm')) {
        botReply = 'Please alert your local FPO leader. The satellite logs canopy changes to coordinate micro-insurance payouts.';
      } else {
        botReply = 'Thank you for reaching out. I have shared this request with your village FPO officer. They will call you shortly.';
      }

      setMessages(prev => [...prev, { sender: 'bot', text: botReply, time: 'Just now' }]);
    }, 1000);
  };

  const handleVoiceListen = () => {
    setListening(true);
    setTimeout(() => {
      setListening(false);
      handleSendMessage("When will my UPI payout clear?");
    }, 2500);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="pb-24 px-4 pt-4 max-w-md mx-auto bg-earth-cream min-h-screen text-earth-dark font-sans flex flex-col justify-between">
      
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <button 
            onClick={() => navigate('/farmer-dashboard')}
            className="flex items-center justify-center p-2 rounded-xl bg-white border border-earth-green/10 text-earth-muted hover:text-earth-dark"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-sm font-black tracking-wider uppercase text-earth-dark">Village Voice & Support</h2>
          <div className="w-9 h-9" />
        </div>

        {/* Multi-lingual Voice helpline banner */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-earth-green text-earth-cream rounded-3xl p-5 border border-earth-green/20 mb-6 shadow-md relative overflow-hidden"
        >
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-start gap-3">
            <div className="p-3 bg-white/10 rounded-2xl text-earth-accent">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-earth-accent font-bold uppercase tracking-wider">FPO Multilingual Toll-Free Support</span>
              <h3 className="text-lg font-black text-white mt-1">1800-419-8800</h3>
              <p className="text-[10px] text-white/60 mt-1 leading-relaxed">
                Speak directly with agronomists in Telugu, Hindi, Kannada, Tamil, or Marathi. Available 24/7.
              </p>
              <a 
                href="tel:18004198800"
                className="mt-3.5 inline-flex items-center gap-1.5 bg-earth-accent text-earth-dark px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <span>Call Helpline Now</span>
                <PhoneCall className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* FAQs Dropdown Accordion */}
        <h4 className="text-xs font-bold text-earth-muted uppercase tracking-wider mb-3 px-1">Common Questions</h4>
        <div className="space-y-3 mb-6">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-earth-green/10 overflow-hidden shadow-sm">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 flex items-center justify-between text-left transition-all hover:bg-earth-green/5"
              >
                <span className="text-xs font-bold text-earth-dark pr-4 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-earth-green shrink-0" />
                  {faq.q}
                </span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-earth-muted shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-earth-muted shrink-0" />
                )}
              </button>
              
              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-earth-green/5 bg-earth-green/[0.02]"
                  >
                    <p className="p-4 text-xs text-earth-muted leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Multilingual Conversational AI Chatbot simulation */}
      <div className="bg-white rounded-3xl border border-earth-green/10 shadow-sm flex flex-col h-96 overflow-hidden">
        {/* Chatbot Header */}
        <div className="bg-earth-dark text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-earth-accent/25 flex items-center justify-center text-earth-accent border border-earth-accent/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold">Sahayak Carbon Assistant</h4>
              <p className="text-[8px] text-earth-accent font-mono">ONLINE ● AI AGENT</p>
            </div>
          </div>
          <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded-full font-bold">
            TELUGU / HINDI / EN
          </span>
        </div>

        {/* Message area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-xs">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center ${
                msg.sender === 'user' 
                  ? 'bg-earth-green text-white' 
                  : 'bg-earth-accent text-earth-dark'
              }`}>
                {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              </div>
              <div className={`p-3 rounded-2xl max-w-[75%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-earth-green text-white rounded-tr-none'
                  : 'bg-earth-green/5 text-earth-dark rounded-tl-none border border-earth-green/5'
              }`}>
                <p>{msg.text}</p>
                <span className={`block text-[8px] mt-1 text-right ${
                  msg.sender === 'user' ? 'text-white/50' : 'text-earth-muted'
                }`}>{msg.time}</span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick chip responses */}
        <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none text-[10px]">
          <button 
            onClick={() => handleSendMessage("When is the next satellite scan?")}
            className="px-2.5 py-1 bg-earth-green/5 hover:bg-earth-green/10 text-earth-green border border-earth-green/10 rounded-full font-bold transition-all"
          >
            Next satellite scan?
          </button>
          <button 
            onClick={() => handleSendMessage("How do I link a different UPI ID?")}
            className="px-2.5 py-1 bg-earth-green/5 hover:bg-earth-green/10 text-earth-green border border-earth-green/10 rounded-full font-bold transition-all"
          >
            Link another UPI?
          </button>
        </div>

        {/* Voice typing overlay / controls */}
        {listening && (
          <div className="bg-earth-green/10 px-4 py-2 border-t border-earth-green/5 flex items-center justify-between text-xs text-earth-green animate-pulse">
            <span className="flex items-center gap-1.5 font-bold">
              <Mic className="w-4 h-4 text-earth-green" />
              Listening to Village Voice (Telugu)...
            </span>
            <span className="text-[10px] font-mono">0:02</span>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 border-t border-earth-green/5 flex gap-2">
          <button 
            type="button"
            onClick={handleVoiceListen}
            className={`p-3 rounded-xl border flex items-center justify-center transition-all ${
              listening 
                ? 'bg-red-500 border-red-600 text-white animate-bounce' 
                : 'bg-white border-earth-green/10 text-earth-muted hover:text-earth-dark hover:border-earth-green'
            }`}
            title="Use Voice (Speak in any Indian language)"
          >
            <Mic className="w-4 h-4" />
          </button>
          <input
            type="text"
            placeholder="Ask Sahayak in Hindi, Telugu or English..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 px-4 py-3 bg-earth-green/5 border border-earth-green/10 rounded-xl text-xs focus:outline-none focus:border-earth-green focus:bg-white transition-all"
          />
          <button
            onClick={() => handleSendMessage()}
            className="p-3 bg-earth-green text-white hover:bg-earth-dark rounded-xl transition-all flex items-center justify-center shadow-md shadow-earth-green/10"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
