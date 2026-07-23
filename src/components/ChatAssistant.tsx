'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface Attachment {
  name: string;
  type: 'image' | 'file' | 'voice';
  url: string;
  duration?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  attachment?: Attachment;
  isEscalation?: boolean;
  isFailed?: boolean;
}

type Mode = 'shopping' | 'support' | 'seller';

interface MockChat {
  id: string;
  name: string;
  issue: string;
  status: 'PENDING' | 'ACTIVE' | 'CLOSED';
  assignedTo: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  history: { sender: string; content: string; time: string }[];
}

interface Metrics {
  resolvedTickets: number;
  openTickets: number;
  avgResponseTime: string;
  customerSatisfaction: string;
  popularQuestions: { question: string; percentage: number }[];
  hourlyActivity: { hour: string; sessions: number }[];
}

export default function ChatAssistant() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeMode, setActiveMode] = useState<Mode>('shopping');
  const [inputText, setInputText] = useState('');
  
  // Advanced features state
  const [chatLang, setChatLang] = useState<string>('en');
  const [voiceRepliesEnabled, setVoiceRepliesEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // Connection/Retry states
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Admin / Dashboard Panel
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminTab, setAdminTab] = useState<'chats' | 'analytics'>('chats');
  const [selectedConsoleChatId, setSelectedConsoleChatId] = useState<string>('C-4192');
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  // Ticket Form
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketPriority, setTicketPriority] = useState('MEDIUM');

  // Emojis and files
  const [showEmojis, setShowEmojis] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  // Simulated recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Playback states
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<Record<string, number>>({});
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Simulated Database Live Chats
  const [mockChats, setMockChats] = useState<MockChat[]>([
    { 
      id: 'C-4192', 
      name: 'Hans M. (Munich)', 
      issue: 'Iznik bowl crated shipping delay', 
      status: 'PENDING', 
      assignedTo: 'Unassigned', 
      priority: 'HIGH',
      history: [
        { sender: 'Hans M.', content: 'My Iznik ceramic bowl says it is held at departures. Why is that?', time: '09:00 AM' },
        { sender: 'System', content: 'Crated verification checks in progress.', time: '09:05 AM' }
      ]
    },
    { 
      id: 'C-8821', 
      name: 'Aisha K. (Sindh)', 
      issue: 'Ajrak dye approval request', 
      status: 'ACTIVE', 
      assignedTo: 'Sarah K.', 
      priority: 'MEDIUM',
      history: [
        { sender: 'Aisha K.', content: 'Can I upload the indigo dye certification pdf?', time: '08:45 AM' },
        { sender: 'Sarah K.', content: 'Yes, please attach the document here. I will transfer it to the Curation Board.', time: '08:50 AM' }
      ]
    },
    { 
      id: 'C-1024', 
      name: 'Jane B. (London)', 
      issue: 'Escrow payment release inquiry', 
      status: 'PENDING', 
      assignedTo: 'Unassigned', 
      priority: 'MEDIUM',
      history: [
        { sender: 'Jane B.', content: 'The rug has arrived. How do I release funds to Fatima?', time: '07:15 AM' }
      ]
    },
  ]);

  const welcomeMessage = `Hello
Welcome to Britsync Market.
I am your AI Commerce Assistant.
I can help you discover products, answer questions, track orders, explain Elite Verification, help makers sell globally and connect you with our support team.
How may I help you today?`;

  const [histories, setHistories] = useState<Record<Mode, Message[]>>({
    shopping: [{ id: 'welcome-shop', role: 'assistant', content: welcomeMessage, timestamp: new Date() }],
    support: [{ id: 'welcome-support', role: 'assistant', content: welcomeMessage, timestamp: new Date() }],
    seller: [{ id: 'welcome-seller', role: 'assistant', content: welcomeMessage, timestamp: new Date() }],
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Lazy load chat histories only when window opens
  useEffect(() => {
    if (isOpen) {
      loadHistoryFromDBOrLocalStorage();
      loadMetrics();
    }
  }, [isOpen, activeMode]);

  // Load chat histories
  const loadHistoryFromDBOrLocalStorage = async () => {
    setIsConnecting(true);
    setConnectionError(null);
    try {
      const response = await fetch(`/api/chat/history?mode=${activeMode}`);
      if (response.ok) {
        const data = await response.json();
        if (data.history && data.history.length > 0) {
          setHistories(prev => ({
            ...prev,
            [activeMode]: data.history.map((h: any) => ({
              ...h,
              timestamp: new Date(h.timestamp)
            }))
          }));
          setIsConnecting(false);
          return;
        }
      }
    } catch (e) {
      console.warn('DB history load failed, trying local storage fallback', e);
    }

    // Local Storage fallback for guest users
    const cached = localStorage.getItem(`britsync_chat_history_${activeMode}`);
    if (cached) {
      try {
        setHistories(prev => ({
          ...prev,
          [activeMode]: JSON.parse(cached).map((h: any) => ({
            ...h,
            timestamp: new Date(h.timestamp)
          }))
        }));
      } catch (e) {
        console.error('Local history parse failed', e);
      }
    }
    setIsConnecting(false);
  };

  // Sync to local storage & DB
  const persistChatHistory = async (newHistory: Message[]) => {
    localStorage.setItem(`britsync_chat_history_${activeMode}`, JSON.stringify(newHistory));
    try {
      await fetch('/api/chat/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: activeMode,
          history: newHistory
        })
      });
    } catch (e) {
      console.error('Failed to sync history to DB', e);
    }
  };

  // Load metrics from API endpoint
  const loadMetrics = () => {
    fetch('/api/chat/analytics')
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(err => console.error('Failed to load metrics', err));
  };

  // Sync viewed product path to history
  useEffect(() => {
    if (pathname && pathname.startsWith('/products/')) {
      const parts = pathname.split('/');
      const productId = parts[parts.length - 1];
      if (productId && productId !== 'products') {
        try {
          const history = localStorage.getItem('britsync_browsing_history');
          const historyList = history ? JSON.parse(history) : [];
          if (!historyList.includes(productId)) {
            historyList.push(productId);
            if (historyList.length > 8) historyList.shift();
            localStorage.setItem('britsync_browsing_history', JSON.stringify(historyList));
          }
        } catch (e) {
          console.error('Error saving browsing history:', e);
        }
      }
    }
  }, [pathname]);

  // Scroll bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [histories, activeMode, isTyping]);

  // Reset unread count on open
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setUnreadCount(0);
    }
  }, [isOpen, isMinimized]);

  // Recording seconds timer hook
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (totalSeconds: number) => {
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleEmojiClick = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setShowEmojis(false);
  };

  const triggerFileUpload = () => fileInputRef.current?.click();
  const triggerImageUpload = () => imageInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const mockUrl = type === 'image' ? URL.createObjectURL(file) : '#';
    setPendingAttachment({
      name: file.name,
      type: type,
      url: mockUrl
    });
    e.target.value = '';
  };

  const startRecording = () => setIsRecording(true);
  const stopRecording = () => {
    setIsRecording(false);
    const duration = formatDuration(recordingSeconds);
    setPendingAttachment({
      name: `Voice Record (${duration})`,
      type: 'voice',
      url: '#',
      duration: duration
    });
  };

  const toggleAudio = (msgId: string, durationStr?: string) => {
    if (playingAudioId === msgId) {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      setPlayingAudioId(null);
    } else {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      setPlayingAudioId(msgId);
      const secs = durationStr ? parseInt(durationStr.split(':')[1]) + parseInt(durationStr.split(':')[0]) * 60 : 5;
      audioIntervalRef.current = setInterval(() => {
        setAudioProgress(prev => {
          const progress = prev[msgId] || 0;
          if (progress >= 100) {
            if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
            setPlayingAudioId(null);
            return { ...prev, [msgId]: 0 };
          }
          return { ...prev, [msgId]: progress + (100 / (secs * 10)) };
        });
      }, 100);
    }
  };

  // Speak Text TTS
  const handleSpeakText = (msgId: string, text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (speakingMsgId === msgId) {
        window.speechSynthesis.cancel();
        setSpeakingMsgId(null);
        return;
      }
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#_~`|\[\]()]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const langLocales: Record<string, string> = {
        en: 'en-US', fr: 'fr-FR', de: 'de-DE', es: 'es-ES', it: 'it-IT', ar: 'ar-AE', ur: 'ur-PK'
      };
      utterance.lang = langLocales[chatLang] || 'en-US';
      utterance.onend = () => setSpeakingMsgId(null);
      setSpeakingMsgId(msgId);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Speech to Text Web API Recognition
  const toggleSpeechToText = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        const langLocales: Record<string, string> = {
          en: 'en-US', fr: 'fr-FR', de: 'de-DE', es: 'es-ES', it: 'it-IT', ar: 'ar-AE', ur: 'ur-PK'
        };
        recognition.lang = langLocales[chatLang] || 'en-US';
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (e: any) => {
          const transcript = e.results[0][0].transcript;
          setInputText(prev => prev + (prev.length > 0 ? ' ' : '') + transcript);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
        recognition.start();
      } else {
        alert('Web Speech Recognition is not supported in this browser. Please use Chrome or Edge.');
      }
    }
  };

  const compileMemoryPayload = () => {
    if (typeof window === 'undefined') return {};
    const wishlist = JSON.parse(localStorage.getItem('britsync_wishlist') || '[]');
    const browsingHistory = JSON.parse(localStorage.getItem('britsync_browsing_history') || '[]');
    return {
      wishlist: wishlist.map((item: any) => item.id),
      browsingHistory,
      userPreferences: {
        country: 'Pakistan',
        category: 'Leather',
        maxPrice: '150'
      }
    };
  };

  // Automatic Reconnect & Retry Logic
  const handleSendMessage = async (e?: React.FormEvent, customText?: string, retryMsg?: Message) => {
    if (e) e.preventDefault();
    const textToSend = retryMsg ? retryMsg.content : (customText || inputText);
    if (!textToSend.trim() && !pendingAttachment) return;

    if (!retryMsg) {
      setInputText('');
      setPendingAttachment(null);
    }

    const userMsg: Message = retryMsg ? { ...retryMsg, isFailed: false } : {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
      attachment: pendingAttachment || undefined
    };

    const currentMode = activeMode;
    let modeHistory = histories[currentMode];
    
    // Update local history
    if (!retryMsg) {
      modeHistory = [...modeHistory, userMsg];
      setHistories(prev => ({
        ...prev,
        [currentMode]: modeHistory
      }));
    } else {
      setHistories(prev => ({
        ...prev,
        [currentMode]: prev[currentMode].map(m => m.id === retryMsg.id ? userMsg : m)
      }));
    }

    setIsTyping(true);
    setConnectionError(null);

    // Call API with Reconnect/Retry loop
    let retries = 0;
    const maxRetries = 2;
    let success = false;
    let response: Response | null = null;

    while (retries <= maxRetries && !success) {
      try {
        const memoryPayload = compileMemoryPayload();
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: modeHistory,
            mode: currentMode,
            browsingHistory: memoryPayload.browsingHistory || [],
            memory: memoryPayload,
            lang: chatLang
          })
        });

        if (response.ok) {
          success = true;
        } else {
          throw new Error('Server returned error status');
        }
      } catch (err) {
        retries++;
        if (retries <= maxRetries) {
          setConnectionError(`Network glitch. Reconnecting... (Attempt ${retries}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
    }

    if (!success || !response || !response.body) {
      setIsTyping(false);
      setConnectionError('Network timed out. Click failed message to retry.');
      setHistories(prev => ({
        ...prev,
        [currentMode]: prev[currentMode].map(m => m.id === userMsg.id ? { ...m, isFailed: true } : m)
      }));
      return;
    }

    setConnectionError(null);
    setIsTyping(false);

    try {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let assistantText = '';
      const aiMsgId = `ai-${Date.now()}`;

      setHistories(prev => ({
        ...prev,
        [currentMode]: [
          ...prev[currentMode],
          { id: aiMsgId, role: 'assistant', content: '', timestamp: new Date() }
        ]
      }));

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          assistantText += decoder.decode(value);
          
          setHistories(prev => {
            const updated = prev[currentMode].map(m => {
              if (m.id === aiMsgId) {
                const isEscalation = assistantText.includes('Human Support') || assistantText.includes('coordination paths');
                return { ...m, content: assistantText, isEscalation };
              }
              return m;
            });
            return { ...prev, [currentMode]: updated };
          });
        }
      }

      // Sync and save history
      setHistories(prev => {
        const finalHistory = prev[currentMode];
        persistChatHistory(finalHistory);
        return prev;
      });

      if (voiceRepliesEnabled) {
        handleSpeakText(aiMsgId, assistantText);
      }

      // Refresh metrics in case a ticket was added in DB
      if (textToSend.toLowerCase().includes('create ticket')) {
        setTimeout(loadMetrics, 1000);
      }

    } catch (err) {
      console.error(err);
      setIsTyping(false);
    }
  };

  const handleTicketFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDesc.trim()) return;
    setShowTicketForm(false);
    const subject = ticketSubject;
    const desc = ticketDesc;
    setTicketSubject('');
    setTicketDesc('');
    await handleSendMessage(undefined, `create ticket: ${subject} - ${desc} (Priority: ${ticketPriority})`);
  };

  const handleLiveChatConnection = () => {
    const currentMode = activeMode;
    setHistories(prev => ({
      ...prev,
      [currentMode]: [
        ...prev[currentMode],
        { id: `sys-${Date.now()}`, role: 'system', content: 'Connecting to Britsync Curation Representative...', timestamp: new Date() }
      ]
    }));
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setHistories(prev => ({
        ...prev,
        [currentMode]: [
          ...prev[currentMode],
          { id: `sys-ok-${Date.now()}`, role: 'system', content: 'Sarah K. has joined the conversation.', timestamp: new Date() },
          { id: `agent-${Date.now()}`, role: 'agent', content: 'Hello! I am Sarah, your Live Britsync Representative. I have loaded your workspace session, previous orders, and AI memory context. How can I help resolve your issue today?', timestamp: new Date() }
        ]
      }));
    }, 2000);
  };

  const handleAgentConsoleAction = (chatId: string, action: 'TAKE' | 'TRANSFER' | 'ASSIGN' | 'CLOSE') => {
    setMockChats(prev => prev.map(c => {
      if (c.id === chatId) {
        if (action === 'TAKE') return { ...c, status: 'ACTIVE', assignedTo: 'You (Admin)' };
        if (action === 'CLOSE') return { ...c, status: 'CLOSED' };
        if (action === 'TRANSFER') return { ...c, assignedTo: 'Curation Advisory Board' };
        if (action === 'ASSIGN') return { ...c, assignedTo: 'Tariq M. (Field Inspector)' };
      }
      return c;
    }));
  };

  const getSuggestions = () => {
    const suggestionsMap: Record<string, Record<Mode, string[]>> = {
      en: {
        shopping: ['Show me handmade leather bags from Pakistan', 'Find Elite verified ceramic products', 'Recommend sustainable home decor', 'Show GI products under 100'],
        support: ['Track my orders', 'What is your return policy?', 'How does escrow protect me?', 'What is the Authenticity Passport?'],
        seller: ['How do I register as a maker?', 'How do I upload a new product?', 'What is my current wallet balance?', 'How do I apply for Elite Verification?']
      },
      fr: {
        shopping: ['Sacs en cuir faits main du Pakistan', 'Produits céramiques vérifiés Elite', 'Décoration durable', 'Produits GI à moins de 100'],
        support: ['Suivre mes commandes', 'Quelle est la politique de retour?', 'Comment fonctionnent les paiements?', 'Qu\'est-ce que le passeport d\'authenticité?'],
        seller: ['Comment s\'inscrire comme fabricant?', 'Comment ajouter un produit?', 'Quel est le solde de mon portefeuille?', 'Demander un audit Elite']
      },
      de: {
        shopping: ['Handgemachte Ledertaschen aus Pakistan', 'Elite verifizierte Keramikprodukte', 'Nachhaltige Wohnkultur', 'GI-Produkte unter 100'],
        support: ['Bestellungen verfolgen', 'Wie lauten die Rückgaberichtlinien?', 'Wie funktioniert Treuhand?', 'Was ist der Echtheitspass?'],
        seller: ['Wie registriere ich mich?', 'Wie lade ich Produkte hoch?', 'Wie hoch ist mein Kontostand?', 'Elite-Verifizierung beantragen']
      },
      es: {
        shopping: ['Bolsos de cuero hechos a mano de Pakistán', 'Cerámica verificada Elite', 'Decoración sostenible', 'Productos GI menores a 100'],
        support: ['Rastrear mis pedidos', '¿Cuál es la política de devolución?', '¿Cómo funciona el depósito en garantía?', '¿Qué es el Pasaporte de Autenticidad?'],
        seller: ['¿Cómo registrarse como creador?', '¿Cómo subir un producto?', '¿Cuál es el saldo de mi billetera?', 'Solicitar inspección Elite']
      },
      it: {
        shopping: ['Borse in pelle fatte a mano dal Pakistan', 'Ceramica Elite verificata', 'Arredamento sostenibile', 'Prodotti GI sotto i 100'],
        support: ['Traccia i miei ordini', 'Quali sono le politiche di reso?', 'Come funziona il deposito di garanzia?', 'Cos\'è il passaporto di autenticità?'],
        seller: ['Come registrarsi come artigiano?', 'Come caricare un produto?', 'Qual è il saldo del mio portafoglio?', 'Richiedi verifica Elite']
      },
      ar: {
        shopping: ['أكياس جلدية مصنوعة يدويًا من باكستان', 'منتجات السيراميك النخبة التحقق منها', 'ديكور المنزل المستدام', 'منتجات GI تحت 100'],
        support: ['تتبع طلباتي', 'ما هي سياسة الإرجاع؟', 'كيف يحميني الضمان؟', 'ما هو جواز سفر الأصالة؟'],
        seller: ['كيف أتسجل كصانع؟', 'كيف أقوم برفع منتج جديد؟', 'ما هو رصيد محفظتي الحالي؟', 'طلب تدقيق النخبة']
      },
      ur: {
        shopping: ['پاکستان سے بنے چمڑے کے بیگ دکھائیں', 'ایلیٹ تصدیق شدہ مٹی کی مصنوعات تلاش کریں', 'پائیدار ہوم ڈیکور کی سفارش کریں', '100 سے کم قیمت والے جی آئی پروڈکٹس'],
        support: ['میرے آرڈر ٹریک کریں', 'واپسی کی پالیسی کیا ہے؟', 'ایسکرو ادائیگی کیسے کام کرتی ہے؟', 'تصدیقی پاسپورٹ کیا ہے؟'],
        seller: ['دستکار کی رجسٹریشن کیسے ہوگی؟', 'نئی پروڈکٹ اپ لوڈ کیسے کریں؟', 'میرے والیٹ کا بیلنس کتنا ہے؟', 'ایلیٹ معائنہ کی درخواست']
      }
    };
    return suggestionsMap[chatLang]?.[activeMode] || suggestionsMap['en'][activeMode];
  };

  const handleSuggestionClick = (suggestionText: string) => {
    setInputText(suggestionText);
  };

  const renderFormattedMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h4 key={idx} style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0.75rem 0 0.25rem', color: 'var(--primary)' }}>{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('#### ')) {
        return <h5 key={idx} style={{ fontSize: '0.95rem', fontWeight: '600', margin: '0.5rem 0 0.2rem', color: 'var(--primary)' }}>{line.replace('#### ', '')}</h5>;
      }
      if (line.trim() === '---') {
        return <hr key={idx} style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.08)', margin: '0.75rem 0' }} />;
      }

      let isBullet = false;
      let displayLine = line;
      if (line.startsWith('* ') || line.startsWith('- ')) {
        isBullet = true;
        displayLine = line.substring(2);
      }

      const parts = [];
      let currentIdx = 0;
      const regex = /(\*\*|[*])(.*?)\1|(!?\[)(.*?)(?:\]\((.*?)\))/g;
      let match;
      
      while ((match = regex.exec(displayLine)) !== null) {
        const matchIdx = match.index;
        if (matchIdx > currentIdx) {
          parts.push(displayLine.substring(currentIdx, matchIdx));
        }

        if (match[1]) {
          parts.push(<strong key={matchIdx} style={{ fontWeight: '700' }}>{match[2]}</strong>);
        } else if (match[3] === '![') {
          parts.push(
            <img 
              key={matchIdx} 
              src={match[5]} 
              alt={match[4]} 
              style={{ width: '100%', borderRadius: '12px', marginTop: '0.5rem', marginBottom: '0.5rem', border: '1px solid rgba(0,0,0,0.1)' }} 
            />
          );
        } else if (match[3] === '[') {
          parts.push(
            <a 
              key={matchIdx} 
              href={match[5]} 
              style={{ color: 'var(--accent)', textDecoration: 'underline', fontWeight: '500' }}
            >
              {match[4]}
            </a>
          );
        }
        currentIdx = regex.lastIndex;
      }

      if (currentIdx < displayLine.length) {
        parts.push(displayLine.substring(currentIdx));
      }

      const content = parts.length > 0 ? parts : displayLine;
      
      return isBullet 
        ? <div key={idx} style={{ display: 'flex', gap: '0.5rem', margin: '0.2rem 0 0.2rem 0.5rem' }}>
            <span>•</span>
            <span style={{ flex: 1 }}>{content}</span>
          </div>
        : <p key={idx} style={{ margin: '0.35rem 0', minHeight: '1.2rem', lineHeight: '1.5' }}>{content}</p>;
    });
  };

  const selectedConsoleChat = mockChats.find(c => c.id === selectedConsoleChatId);
  const emojis = ['⭐', '🛡️', '📦', '🚚', '🔄', '🔒', '📜', '🎁', '👍', '❤️', '😊', '👜', '🏺', '💸', '🗺️', '🎙️'];

  return (
    <>
      {/* 1. FLOATING ACTION BUTTON */}
      <motion.div 
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        animate={{
          scale: isOpen && !isMinimized ? 0 : 1,
          rotate: isOpen && !isMinimized ? 90 : 0,
          y: isOpen && !isMinimized ? 50 : 0
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          backgroundColor: '#1F4B43',
          color: '#FAF9F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 30px rgba(31, 75, 67, 0.35)',
          zIndex: 9999,
          border: '2px solid #C8A45D',
        }}
        whileHover={{ scale: 1.08, y: -4, boxShadow: '0 12px 40px rgba(31, 75, 67, 0.45)' }}
      >
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            backgroundColor: '#C8A45D',
            color: '#1F4B43',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            border: '2px solid #1F4B43'
          }}>{unreadCount}</span>
        )}
        <span style={{
          position: 'absolute',
          bottom: '2px',
          right: '2px',
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          backgroundColor: '#388E3C',
          border: '2.5px solid #1F4B43'
        }} />
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </motion.div>

      {/* 2. CHAT WINDOW CONTAINER */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.85, y: 80 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              width: isMinimized ? '320px' : isExpanded ? '960px' : '460px',
              height: isMinimized ? '55px' : isExpanded ? '85vh' : '720px'
            }}
            exit={{ opacity: 0, scale: 0.85, y: 80 }}
            transition={{ type: 'spring', damping: 24, stiffness: 220 }}
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              maxHeight: 'calc(100vh - 4rem)',
              maxWidth: 'calc(100vw - 4rem)',
              borderRadius: '24px',
              boxShadow: '0 16px 60px rgba(0, 0, 0, 0.18)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid var(--glass-border)',
            }}
            className="glass"
          >
            {/* HEADER BAR */}
            <div style={{
              backgroundColor: 'var(--primary)',
              color: '#FAF9F6',
              padding: '1rem 1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: isMinimized ? 'pointer' : 'default',
              flexShrink: 0,
              height: '60px'
            }}
            onClick={() => {
              if (isMinimized) setIsMinimized(false);
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}>
                    BS
                  </div>
                  <span style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#388E3C',
                    border: '2px solid var(--primary)'
                  }} />
                </div>

                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    BRITSYNC
                    <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--accent)', color: 'var(--primary)', padding: '1px 5px', borderRadius: '4px', fontWeight: 'bold' }}>AI</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                    Online Assistant
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {/* Multilingual Selector */}
                {!isMinimized && (
                  <select
                    value={chatLang}
                    onChange={(e) => setChatLang(e.target.value)}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#FAF9F6',
                      fontSize: '0.75rem',
                      padding: '2px 4px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    <option value="en" style={{ color: '#000' }}>🇺🇸 EN</option>
                    <option value="fr" style={{ color: '#000' }}>🇫🇷 FR</option>
                    <option value="de" style={{ color: '#000' }}>🇩🇪 DE</option>
                    <option value="es" style={{ color: '#000' }}>🇪🇸 ES</option>
                    <option value="it" style={{ color: '#000' }}>🇮🇹 IT</option>
                    <option value="ar" style={{ color: '#000' }}>🇦🇪 AR</option>
                    <option value="ur" style={{ color: '#000' }}>🇵🇰 UR</option>
                  </select>
                )}

                {/* Voice Replies Toggle */}
                {!isMinimized && (
                  <button
                    onClick={() => setVoiceRepliesEnabled(!voiceRepliesEnabled)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.05rem',
                      cursor: 'pointer',
                      opacity: voiceRepliesEnabled ? 1 : 0.4
                    }}
                    title={voiceRepliesEnabled ? "Mute Voice Replies" : "Enable Auto Voice Replies (Text-to-Speech)"}
                  >
                    🔊
                  </button>
                )}

                {/* Support/Admin console toggle */}
                {!isMinimized && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAdminPanel(!showAdminPanel);
                    }}
                    style={{
                      background: showAdminPanel ? 'var(--accent)' : 'rgba(255,255,255,0.15)',
                      border: 'none',
                      borderRadius: '6px',
                      color: showAdminPanel ? 'var(--primary)' : 'inherit',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}
                  >
                    💻 Dashboard
                  </button>
                )}

                {/* Minimize */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(!isMinimized);
                  }}
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0.25rem', opacity: 0.8 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>

                {/* Expand */}
                {!isMinimized && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                    style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0.25rem', opacity: 0.8 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {isExpanded 
                        ? <path d="M4 14h6v6M20 10h-6V4" />
                        : <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                      }
                    </svg>
                  </button>
                )}

                {/* Close */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.8 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            {/* CHAT WINDOW BODY CONTAINER */}
            {!isMinimized && (
              <div style={{
                flex: 1,
                display: 'flex',
                overflow: 'hidden',
                backgroundColor: 'var(--surface)'
              }}>
                {/* LEFT PANE: MAIN ACTIVE CHAT VIEW */}
                <div style={{
                  flex: 1,
                  display: (showAdminPanel && !isExpanded) ? 'none' : 'flex',
                  flexDirection: 'column',
                  borderRight: (isExpanded && showAdminPanel) ? '1px solid var(--chat-border)' : 'none',
                  overflow: 'hidden'
                }}>
                  {/* 3-MODE SELECTOR BAR */}
                  <div style={{
                    display: 'flex',
                    backgroundColor: 'var(--surface)',
                    borderBottom: '1px solid var(--chat-border)',
                    padding: '0.25rem',
                    gap: '0.25rem',
                    flexShrink: 0
                  }}>
                    {(['shopping', 'support', 'seller'] as Mode[]).map((mode) => {
                      const isActive = activeMode === mode;
                      const label = mode === 'shopping' ? 'Shopping' : mode === 'support' ? 'Support' : 'Seller Hub';
                      const icon = mode === 'shopping' 
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                        : mode === 'support'
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line></svg>;

                      return (
                        <button
                          key={mode}
                          onClick={() => {
                            setActiveMode(mode);
                            setShowTicketForm(false);
                          }}
                          style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            padding: '0.6rem 0',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: isActive ? '600' : '400',
                            backgroundColor: isActive ? 'var(--secondary)' : 'transparent',
                            color: isActive ? 'var(--primary)' : 'var(--text)',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {icon}
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {/* TICKET FORM / MESSAGE VIEW AREA (Simple Ternary syntax) */}
                  {showTicketForm ? (
                    <form onSubmit={handleTicketFormSubmit} style={{
                      flex: 1,
                      backgroundColor: 'var(--surface)',
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      overflowY: 'auto'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: 0, fontWeight: '600' }}>🎫 Create Support Ticket</h3>
                        <button type="button" onClick={() => setShowTicketForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Subject</label>
                        <input 
                          type="text" 
                          value={ticketSubject}
                          onChange={(e) => setTicketSubject(e.target.value)}
                          placeholder="e.g. Broken packaging on arrival" 
                          required
                          style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '0.85rem' }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Details / Inquiry Description</label>
                        <textarea 
                          value={ticketDesc}
                          onChange={(e) => setTicketDesc(e.target.value)}
                          placeholder="Please describe your issue or question in detail. Mention any order numbers."
                          required
                          rows={4}
                          style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '0.85rem', fontFamily: 'inherit' }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Priority</label>
                        <select 
                          value={ticketPriority}
                          onChange={(e) => setTicketPriority(e.target.value)}
                          style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '0.85rem' }}
                        >
                          <option value="LOW">Low (General Inquiry)</option>
                          <option value="MEDIUM">Medium (Product question / shipping help)</option>
                          <option value="HIGH">High (Refunds / Damaged delivery)</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" onClick={() => setShowTicketForm(false)} style={{ flex: 1, padding: '0.75rem', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '8px', background: 'none', cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" style={{ flex: 1, padding: '0.75rem', border: 'none', borderRadius: '8px', backgroundColor: 'var(--primary)', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>Submit Ticket</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      {/* MESSAGE HISTORY */}
                      <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem',
                        backgroundColor: 'var(--chat-overlay)',
                        position: 'relative'
                      }}>
                        {/* Auto-reconnect notification bar */}
                        {connectionError && (
                          <div style={{
                            position: 'sticky',
                            top: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: '#D32F2F',
                            color: 'white',
                            padding: '0.5rem',
                            borderRadius: '8px',
                            textAlign: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            zIndex: 1000,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                          }}>
                            ⚠️ {connectionError}
                          </div>
                        )}

                        {isConnecting && (
                          <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
                            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Loading chat log...</span>
                          </div>
                        )}

                        {histories[activeMode].map((msg) => {
                          const isUser = msg.role === 'user';
                          const isSystem = msg.role === 'system';
                          const isAgent = msg.role === 'agent';

                          if (isSystem) {
                            return (
                              <div 
                                key={msg.id} 
                                style={{
                                  alignSelf: 'center',
                                  backgroundColor: 'var(--chat-muted)',
                                  color: 'var(--text)',
                                  padding: '0.4rem 0.8rem',
                                  borderRadius: '12px',
                                  fontSize: '0.75rem',
                                  fontStyle: 'italic',
                                  textAlign: 'center',
                                  border: '1px dashed rgba(0,0,0,0.1)',
                                  width: '90%'
                                }}
                              >
                                ⚙️ {msg.content}
                              </div>
                            );
                          }

                          return (
                            <div 
                              key={msg.id} 
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isUser ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                                alignSelf: isUser ? 'flex-end' : 'flex-start'
                              }}
                            >
                              <span style={{ fontSize: '0.65rem', opacity: 0.6, marginBottom: '0.2rem', padding: '0 0.25rem' }}>
                                {isUser ? 'You' : isAgent ? 'Sarah (Live Agent)' : 'AI Assistant'} • {formatTime(msg.timestamp)}
                              </span>

                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}>
                                {!isUser && (
                                  <button
                                    type="button"
                                    onClick={() => handleSpeakText(msg.id, msg.content)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      fontSize: '0.95rem',
                                      padding: '2px',
                                      opacity: speakingMsgId === msg.id ? 1 : 0.4,
                                      color: speakingMsgId === msg.id ? 'var(--accent)' : 'inherit',
                                      alignSelf: 'center'
                                    }}
                                    title="Voice Playback"
                                  >
                                    🔊
                                  </button>
                                )}

                                <div style={{
                                  padding: '0.85rem 1.1rem',
                                  borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                  backgroundColor: msg.isFailed ? '#FFCDD2' : isUser ? 'var(--primary)' : isAgent ? 'var(--secondary)' : 'var(--surface)',
                                  color: msg.isFailed ? '#B71C1C' : isUser ? '#FAF9F6' : isAgent ? 'var(--primary)' : 'var(--text)',
                                  boxShadow: 'var(--shadow-sm)',
                                  fontSize: '0.9rem',
                                  border: isUser ? 'none' : '1px solid var(--chat-muted)',
                                  wordBreak: 'break-word',
                                  whiteSpace: 'pre-line',
                                  cursor: msg.isFailed ? 'pointer' : 'default'
                                }}
                                onClick={() => {
                                  if (msg.isFailed) {
                                    handleSendMessage(undefined, undefined, msg);
                                  }
                                }}
                                title={msg.isFailed ? "Message delivery failed. Click to retry." : ""}
                                >
                                  {msg.attachment && (
                                    <div style={{ marginBottom: '0.75rem' }}>
                                      {msg.attachment.type === 'image' && (
                                        <img 
                                          src={msg.attachment.url} 
                                          alt="Attached Upload" 
                                          style={{ maxWidth: '100%', borderRadius: '12px', maxHeight: '180px', objectFit: 'cover' }} 
                                        />
                                      )}

                                      {msg.attachment.type === 'file' && (
                                        <div style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '0.5rem',
                                          padding: '0.5rem',
                                          borderRadius: '8px',
                                          backgroundColor: isUser ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)',
                                          fontSize: '0.8rem'
                                        }}>
                                          <span>📄</span>
                                          <span style={{ textDecoration: 'underline', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {msg.attachment.name}
                                          </span>
                                        </div>
                                      )}

                                      {msg.attachment.type === 'voice' && (
                                        <div style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '0.5rem',
                                          padding: '0.5rem 0.75rem',
                                          borderRadius: '12px',
                                          backgroundColor: isUser ? 'rgba(255,255,255,0.15)' : 'var(--secondary)',
                                          color: isUser ? '#FAF9F6' : 'var(--primary)',
                                          minWidth: '200px'
                                        }}>
                                          <button
                                            type="button"
                                            onClick={() => toggleAudio(msg.id, msg.attachment?.duration)}
                                            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.2rem', padding: 0 }}
                                          >
                                            {playingAudioId === msg.id ? '⏸' : '▶'}
                                          </button>

                                          <div style={{ flex: 1, height: '4px', backgroundColor: isUser ? 'rgba(255,255,255,0.3)' : 'rgba(31, 75, 67, 0.2)', borderRadius: '2px', position: 'relative', overflow: 'hidden' }}>
                                            <div style={{
                                              position: 'absolute',
                                              left: 0,
                                              top: 0,
                                              bottom: 0,
                                              width: `${audioProgress[msg.id] || 0}%`,
                                              backgroundColor: isUser ? '#FAF9F6' : 'var(--primary)'
                                            }} />
                                          </div>

                                          {playingAudioId === msg.id && (
                                            <div style={{ display: 'flex', gap: '2px', height: '14px', alignItems: 'center' }}>
                                              <div style={{ width: '2px', height: '80%', backgroundColor: 'currentColor', animation: 'voiceBarShimmer 0.8s infinite alternate' }} />
                                              <div style={{ width: '2px', height: '40%', backgroundColor: 'currentColor', animation: 'voiceBarShimmer 0.8s infinite alternate 0.2s' }} />
                                            </div>
                                          )}

                                          <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                                            {msg.attachment.duration || '0:05'}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {msg.content ? renderFormattedMarkdown(msg.content) : null}

                                  {msg.isFailed && (
                                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', marginTop: '0.4rem', textDecoration: 'underline' }}>
                                      ⚠️ Failed to send. Click to retry.
                                    </div>
                                  )}

                                  {msg.isEscalation && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                                      <button onClick={handleLiveChatConnection} style={{ padding: '0.5rem', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', textAlign: 'left' }}>
                                        💬 Connect to Live Chat Agent (Sarah)
                                      </button>
                                      <button onClick={() => setShowTicketForm(true)} style={{ padding: '0.5rem', backgroundColor: 'var(--secondary)', color: 'var(--primary)', border: '1px solid var(--accent)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', textAlign: 'left' }}>
                                        🎫 Create a Support Ticket in DB
                                      </button>
                                      <button onClick={() => handleSendMessage(undefined, "Schedule support callback")} style={{ padding: '0.5rem', backgroundColor: 'var(--surface)', color: 'var(--text)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', textAlign: 'left' }}>
                                        📞 Schedule a Telephone Call
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {isTyping && (
                          <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                            <div style={{
                              padding: '0.75rem 1.1rem',
                              borderRadius: '18px 18px 18px 4px',
                              backgroundColor: 'var(--surface)',
                              boxShadow: 'var(--shadow-sm)',
                              border: '1px solid rgba(0,0,0,0.04)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--primary)', borderRadius: '50%', display: 'inline-block', animation: 'dotShimmer 1.2s infinite' }} />
                              <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--primary)', borderRadius: '50%', display: 'inline-block', animation: 'dotShimmer 1.2s infinite 0.2s' }} />
                              <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--primary)', borderRadius: '50%', display: 'inline-block', animation: 'dotShimmer 1.2s infinite 0.4s' }} />
                            </div>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      {/* QUICK SUGGESTIONS */}
                      <div style={{
                        padding: '0.5rem 1rem',
                        display: 'flex',
                        gap: '0.5rem',
                        overflowX: 'auto',
                        flexShrink: 0,
                        backgroundColor: 'var(--chat-overlay)',
                        borderTop: '1px solid var(--chat-border)'
                      }} className="scrollbar-hidden">
                        {getSuggestions().map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(s)}
                            style={{
                              flexShrink: 0,
                              padding: '0.4rem 0.8rem',
                              backgroundColor: 'var(--surface)',
                              border: '1px solid var(--chat-border)',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              color: 'var(--primary)',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = 'var(--accent)';
                              e.currentTarget.style.backgroundColor = 'var(--secondary)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
                              e.currentTarget.style.backgroundColor = 'var(--surface)';
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>

                      {/* INPUT PANEL FOR CHAT */}
                      <div style={{
                        padding: '0.75rem 1rem 1rem',
                        backgroundColor: 'var(--surface)',
                        borderTop: '1px solid var(--chat-border)',
                        position: 'relative',
                        flexShrink: 0
                      }}>
                        {showEmojis && (
                          <div style={{
                            position: 'absolute',
                            bottom: '100%',
                            left: '1rem',
                            backgroundColor: 'var(--surface)',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: '16px',
                            padding: '0.5rem',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(8, 1fr)',
                            gap: '0.4rem',
                            boxShadow: 'var(--shadow-lg)',
                            zIndex: 10002,
                            width: '280px'
                          }}>
                            {emojis.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => handleEmojiClick(emoji)}
                                style={{ background: 'none', border: 'none', fontSize: '1.25rem', padding: '0.25rem', cursor: 'pointer', borderRadius: '6px' }}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}

                        <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e, 'file')} style={{ display: 'none' }} />
                        <input type="file" accept="image/*" ref={imageInputRef} onChange={(e) => handleFileChange(e, 'image')} style={{ display: 'none' }} />

                        {pendingAttachment && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: 'var(--secondary)',
                            padding: '0.4rem 0.75rem',
                            borderRadius: '12px',
                            marginBottom: '0.5rem',
                            fontSize: '0.8rem',
                            color: 'var(--primary)'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span>{pendingAttachment.type === 'image' ? '🖼️' : pendingAttachment.type === 'voice' ? '🎙️' : '📄'}</span>
                              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '320px' }}>
                                {pendingAttachment.name}
                              </span>
                            </div>
                            <button type="button" onClick={() => setPendingAttachment(null)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                          </div>
                        )}

                        <form onSubmit={handleSendMessage} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={triggerFileUpload}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', padding: '0.35rem', cursor: 'pointer', opacity: 0.8, display: 'flex', alignItems: 'center' }}
                            title="Attach Document"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={triggerImageUpload}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', padding: '0.35rem', cursor: 'pointer', opacity: 0.8, display: 'flex', alignItems: 'center' }}
                            title="Attach Photo"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                              <circle cx="8.5" cy="8.5" r="1.5"></circle>
                              <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowEmojis(!showEmojis)}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', padding: '0.35rem', cursor: 'pointer', opacity: 0.8, display: 'flex', alignItems: 'center' }}
                            title="Emojis"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                              <line x1="9" y1="9" x2="9.01" y2="9"></line>
                              <line x1="15" y1="9" x2="15.01" y2="9"></line>
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={toggleSpeechToText}
                            style={{
                              background: isListening ? 'rgba(211,47,47,0.15)' : 'none',
                              border: 'none',
                              color: isListening ? '#D32F2F' : 'var(--primary)',
                              padding: '0.35rem',
                              cursor: 'pointer',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              animation: isListening ? 'pulseShimmer 1.2s infinite' : 'none'
                            }}
                            title="Voice Input (Speech-to-Text)"
                          >
                            🎙️
                          </button>

                          <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={isListening ? "Listening..." : isRecording ? "Recording..." : "Ask AI or speak..."}
                            disabled={isRecording}
                            style={{
                              flex: 1,
                              padding: '0.75rem 1rem',
                              border: '1px solid var(--chat-border)',
                              borderRadius: '24px',
                              fontSize: '0.9rem',
                              backgroundColor: 'var(--chat-input-bg)',
                              color: 'var(--text)',
                              height: '42px'
                            }}
                          />

                          <button
                            type="button"
                            onMouseDown={startRecording}
                            onMouseUp={stopRecording}
                            onTouchStart={startRecording}
                            onTouchEnd={stopRecording}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: isRecording ? '#D32F2F' : 'var(--primary)',
                              padding: '0.35rem',
                              cursor: 'pointer',
                              opacity: 0.8,
                              display: 'flex',
                              alignItems: 'center',
                              position: 'relative'
                            }}
                            title="Hold to Record Voice Note"
                          >
                            {isRecording && (
                              <span style={{
                                position: 'absolute',
                                top: '-35px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                backgroundColor: '#D32F2F',
                                color: 'white',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.65rem',
                                whiteSpace: 'nowrap',
                                animation: 'pulseShimmer 1s infinite'
                              }}>
                                Rec {formatDuration(recordingSeconds)}
                              </span>
                            )}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: isRecording ? 'pulseShimmer 1s infinite' : 'none' }}>
                              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                              <line x1="12" y1="19" x2="12" y2="23"></line>
                              <line x1="8" y1="23" x2="16" y2="23"></line>
                            </svg>
                          </button>

                          <button
                            type="submit"
                            disabled={!inputText.trim() && !pendingAttachment}
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              backgroundColor: (!inputText.trim() && !pendingAttachment) ? '#ccc' : 'var(--primary)',
                              color: '#FAF9F6',
                              border: 'none',
                              cursor: (!inputText.trim() && !pendingAttachment) ? 'default' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: 'translateX(1px)' }}>
                              <line x1="22" y1="2" x2="11" y2="13"></line>
                              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                          </button>
                        </form>
                      </div>
                    </>
                  )}
                </div>

                {/* RIGHT PANE: SUPPORT DASHBOARD & LIVE CHATS CONSOLE */}
                {showAdminPanel && (isExpanded || !isOpen) && (
                  <div style={{
                    width: isExpanded ? '480px' : '100%',
                    backgroundColor: 'var(--surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'auto',
                    padding: '1.5rem',
                    gap: '1.25rem',
                    borderLeft: isExpanded ? '1px solid var(--chat-border)' : 'none'
                  }}>
                    <div style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '0.75rem' }}>
                      <h3 style={{ fontSize: '1.3rem', color: 'var(--primary)', margin: 0, fontWeight: '600' }}>💻 Support Workspace</h3>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                        <button
                          onClick={() => setAdminTab('chats')}
                          style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            backgroundColor: adminTab === 'chats' ? 'var(--primary)' : 'var(--secondary)',
                            color: adminTab === 'chats' ? '#fff' : 'var(--primary)'
                          }}
                        >
                          💬 Live Chats ({mockChats.filter(c => c.status !== 'CLOSED').length})
                        </button>
                        <button
                          onClick={() => setAdminTab('analytics')}
                          style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            backgroundColor: adminTab === 'analytics' ? 'var(--primary)' : 'var(--secondary)',
                            color: adminTab === 'analytics' ? '#fff' : 'var(--primary)'
                          }}
                        >
                          📊 System Metrics
                        </button>
                      </div>
                    </div>

                    {/* TAB 1: LIVE CHATS LIST & ACTIONS */}
                    {adminTab === 'chats' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {mockChats.map((c) => {
                            const isSelected = c.id === selectedConsoleChatId;
                            return (
                              <div 
                                key={c.id} 
                                onClick={() => setSelectedConsoleChatId(c.id)}
                                style={{
                                  padding: '0.85rem',
                                  borderRadius: '12px',
                                  border: isSelected ? '1px solid var(--accent)' : '1px solid rgba(0,0,0,0.08)',
                                  backgroundColor: isSelected ? 'var(--secondary)' : 'var(--background)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.4rem',
                                  opacity: c.status === 'CLOSED' ? 0.6 : 1
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)' }}>{c.id}</span>
                                  <div style={{ display: 'flex', gap: '0.25rem', marginLeft: 'auto' }}>
                                    <span style={{
                                      fontSize: '0.6rem',
                                      backgroundColor: c.priority === 'HIGH' ? '#FFCDD2' : '#FFE0B2',
                                      color: c.priority === 'HIGH' ? '#B71C1C' : '#E65100',
                                      padding: '1px 5px',
                                      borderRadius: '4px',
                                      fontWeight: 'bold'
                                    }}>{c.priority}</span>
                                    <span style={{
                                      fontSize: '0.6rem',
                                      backgroundColor: c.status === 'ACTIVE' ? '#C8E6C9' : '#FFF9C4',
                                      color: c.status === 'ACTIVE' ? '#1B5E20' : '#F57F17',
                                      padding: '1px 5px',
                                      borderRadius: '4px',
                                      fontWeight: 'bold'
                                    }}>{c.status}</span>
                                  </div>
                                </div>

                                <strong style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{c.name}</strong>
                                <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  *{c.issue}*
                                </p>
                                <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>Assigned: **{c.assignedTo}**</span>
                              </div>
                            );
                          })}
                        </div>

                        {selectedConsoleChat && (
                          <div style={{
                            marginTop: '0.5rem',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: '14px',
                            padding: '1rem',
                            backgroundColor: 'var(--background)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem'
                          }}>
                            <strong style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>Console Viewer: {selectedConsoleChat.id}</strong>
                            
                            <div style={{
                              backgroundColor: 'var(--surface)',
                              borderRadius: '8px',
                              padding: '0.5rem',
                              maxHeight: '130px',
                              overflowY: 'auto',
                              fontSize: '0.75rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.4rem',
                              border: '1px solid rgba(0,0,0,0.04)'
                            }}>
                              {selectedConsoleChat.history.map((h, i) => (
                                <div key={i}>
                                  <span style={{ fontWeight: 'bold' }}>{h.sender}: </span>
                                  <span>{h.content}</span>
                                </div>
                              ))}
                            </div>

                            {selectedConsoleChat.status !== 'CLOSED' && (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                <button
                                  type="button"
                                  onClick={() => handleAgentConsoleAction(selectedConsoleChat.id, 'TAKE')}
                                  style={{ padding: '0.45rem', border: 'none', borderRadius: '6px', fontSize: '0.7rem', backgroundColor: 'var(--primary)', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                  🤝 Take Chat
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAgentConsoleAction(selectedConsoleChat.id, 'TRANSFER')}
                                  style={{ padding: '0.45rem', border: '1px solid var(--primary)', borderRadius: '6px', fontSize: '0.7rem', backgroundColor: 'transparent', color: 'var(--primary)', cursor: 'pointer' }}
                                >
                                  ➡️ Transfer Board
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAgentConsoleAction(selectedConsoleChat.id, 'ASSIGN')}
                                  style={{ padding: '0.45rem', border: '1px solid var(--accent)', borderRadius: '6px', fontSize: '0.7rem', backgroundColor: 'var(--secondary)', color: 'var(--primary)', cursor: 'pointer' }}
                                >
                                  🔬 Assign Inspector
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAgentConsoleAction(selectedConsoleChat.id, 'CLOSE')}
                                  style={{ padding: '0.45rem', border: 'none', borderRadius: '6px', fontSize: '0.7rem', backgroundColor: '#D32F2F', color: '#fff', cursor: 'pointer' }}
                                >
                                  ✓ Close Chat
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 2: SYSTEM ANALYTICS & POPULAR QUESTIONS */}
                    {adminTab === 'analytics' && metrics && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Metrics Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: 'var(--background)', border: '1px solid rgba(0,0,0,0.06)' }}>
                            <span style={{ fontSize: '0.65rem', opacity: 0.7, display: 'block' }}>Resolved Tickets</span>
                            <strong style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>{metrics.resolvedTickets}</strong>
                          </div>
                          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: 'var(--background)', border: '1px solid rgba(0,0,0,0.06)' }}>
                            <span style={{ fontSize: '0.65rem', opacity: 0.7, display: 'block' }}>Open Tickets</span>
                            <strong style={{ fontSize: '1.2rem', color: '#B71C1C' }}>{metrics.openTickets}</strong>
                          </div>
                          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: 'var(--background)', border: '1px solid rgba(0,0,0,0.06)' }}>
                            <span style={{ fontSize: '0.65rem', opacity: 0.7, display: 'block' }}>Avg Response Time</span>
                            <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{metrics.avgResponseTime}</strong>
                          </div>
                          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: 'var(--background)', border: '1px solid rgba(0,0,0,0.06)' }}>
                            <span style={{ fontSize: '0.65rem', opacity: 0.7, display: 'block' }}>CSAT Satisfaction</span>
                            <strong style={{ fontSize: '1.1rem', color: '#388E3C' }}>{metrics.customerSatisfaction}</strong>
                          </div>
                        </div>

                        {/* Popular Questions */}
                        <div style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '0.85rem', backgroundColor: 'var(--background)' }}>
                          <strong style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem', color: 'var(--primary)' }}>🔥 Popular Customer Inquiries</strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {metrics.popularQuestions.map((q, idx) => (
                              <div key={idx} style={{ fontSize: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                  <span>{q.question}</span>
                                  <span style={{ fontWeight: 'bold' }}>{q.percentage}%</span>
                                </div>
                                <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                                  <div style={{ width: `${q.percentage}%`, height: '100%', backgroundColor: 'var(--accent)' }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Conversation Analytics Load chart */}
                        <div style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '0.85rem', backgroundColor: 'var(--background)' }}>
                          <strong style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem', color: 'var(--primary)' }}>📈 Hourly Conversation Load</strong>
                          <div style={{ display: 'flex', gap: '0.5rem', height: '100px', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 0.5rem' }}>
                            {metrics.hourlyActivity.map((h, i) => (
                              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '4px' }}>
                                <div style={{ 
                                  width: '70%', 
                                  height: `${h.sessions * 1.5}px`, 
                                  maxHeight: '75px', 
                                  backgroundColor: 'var(--primary)', 
                                  borderRadius: '3px 3px 0 0',
                                  transition: 'height 0.4s ease'
                                }} />
                                <span style={{ fontSize: '0.55rem', opacity: 0.7 }}>{h.hour}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {!isExpanded && (
                      <button 
                        type="button"
                        onClick={() => setShowAdminPanel(false)}
                        style={{
                          marginTop: 'auto',
                          padding: '0.7rem',
                          backgroundColor: 'var(--primary)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '0.8rem'
                        }}
                      >
                        Return to User Chat
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes dotShimmer {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes pulseShimmer {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.12); opacity: 0.75; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes voiceBarShimmer {
          0% { height: 30%; }
          100% { height: 100%; }
        }
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      ` }} />
    </>
  );
}
