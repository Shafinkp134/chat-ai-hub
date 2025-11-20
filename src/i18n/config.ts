import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "appName": "Cheetha AI",
      "startConversation": "Start a new conversation",
      "askAnything": "Ask me anything! I'm Cheetha, your AI assistant here to help with questions, creative writing, analysis, and more.",
      "typeMessage": "Type your message...",
      "send": "Send",
      "newChat": "New Chat",
      "chatHistory": "Chat History",
      "settings": "Settings",
      "logout": "Logout",
      "pricing": "Pricing",
      "signIn": "Sign In",
      "signUp": "Sign Up",
      "language": "Language"
    }
  },
  es: {
    translation: {
      "appName": "Cheetha AI",
      "startConversation": "Iniciar una nueva conversación",
      "askAnything": "¡Pregúntame cualquier cosa! Soy Cheetha, tu asistente de IA aquí para ayudarte con preguntas, escritura creativa, análisis y más.",
      "typeMessage": "Escribe tu mensaje...",
      "send": "Enviar",
      "newChat": "Nuevo Chat",
      "chatHistory": "Historial de Chat",
      "settings": "Configuración",
      "logout": "Cerrar Sesión",
      "pricing": "Precios",
      "signIn": "Iniciar Sesión",
      "signUp": "Registrarse",
      "language": "Idioma"
    }
  },
  fr: {
    translation: {
      "appName": "Cheetha AI",
      "startConversation": "Démarrer une nouvelle conversation",
      "askAnything": "Demandez-moi n'importe quoi! Je suis Cheetha, votre assistant IA ici pour vous aider avec des questions, de l'écriture créative, des analyses et plus encore.",
      "typeMessage": "Tapez votre message...",
      "send": "Envoyer",
      "newChat": "Nouveau Chat",
      "chatHistory": "Historique des Chats",
      "settings": "Paramètres",
      "logout": "Déconnexion",
      "pricing": "Tarification",
      "signIn": "Se Connecter",
      "signUp": "S'inscrire",
      "language": "Langue"
    }
  },
  de: {
    translation: {
      "appName": "Cheetha AI",
      "startConversation": "Neue Konversation starten",
      "askAnything": "Frag mich alles! Ich bin Cheetha, dein KI-Assistent, der dir bei Fragen, kreativem Schreiben, Analysen und mehr hilft.",
      "typeMessage": "Gib deine Nachricht ein...",
      "send": "Senden",
      "newChat": "Neuer Chat",
      "chatHistory": "Chat-Verlauf",
      "settings": "Einstellungen",
      "logout": "Abmelden",
      "pricing": "Preise",
      "signIn": "Anmelden",
      "signUp": "Registrieren",
      "language": "Sprache"
    }
  },
  zh: {
    translation: {
      "appName": "Cheetha AI",
      "startConversation": "开始新对话",
      "askAnything": "问我任何问题！我是Cheetha，你的AI助手，可以帮助你解答问题、创意写作、分析等。",
      "typeMessage": "输入您的消息...",
      "send": "发送",
      "newChat": "新聊天",
      "chatHistory": "聊天历史",
      "settings": "设置",
      "logout": "登出",
      "pricing": "定价",
      "signIn": "登录",
      "signUp": "注册",
      "language": "语言"
    }
  },
  ja: {
    translation: {
      "appName": "Cheetha AI",
      "startConversation": "新しい会話を始める",
      "askAnything": "何でも聞いてください！私はCheetha、質問、創作、分析などをサポートするAIアシスタントです。",
      "typeMessage": "メッセージを入力...",
      "send": "送信",
      "newChat": "新しいチャット",
      "chatHistory": "チャット履歴",
      "settings": "設定",
      "logout": "ログアウト",
      "pricing": "料金",
      "signIn": "サインイン",
      "signUp": "サインアップ",
      "language": "言語"
    }
  },
  ar: {
    translation: {
      "appName": "Cheetha AI",
      "startConversation": "ابدأ محادثة جديدة",
      "askAnything": "اسألني أي شيء! أنا Cheetha، مساعدك الذكي هنا لمساعدتك في الأسئلة والكتابة الإبداعية والتحليل والمزيد.",
      "typeMessage": "اكتب رسالتك...",
      "send": "إرسال",
      "newChat": "محادثة جديدة",
      "chatHistory": "سجل المحادثات",
      "settings": "الإعدادات",
      "logout": "تسجيل الخروج",
      "pricing": "التسعير",
      "signIn": "تسجيل الدخول",
      "signUp": "إنشاء حساب",
      "language": "اللغة"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
