
'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, Bot, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    isAdmin: boolean;
  };
  receiver: {
    id: string;
    name: string;
    isAdmin: boolean;
  };
}

interface ChatModalProps {
  onClose: () => void;
}

export function ChatModal({ onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Establecer conexión SSE
    connectToStream();
    
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectToStream = () => {
    try {
      const eventSource = new EventSource('/api/chat/stream');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        setIsLoading(false);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'messages') {
            setMessages(prevMessages => {
              const newMessages = data.data;
              const existingIds = new Set(prevMessages.map(m => m.id));
              const filteredNew = newMessages.filter((m: Message) => !existingIds.has(m.id));
              return [...prevMessages, ...filteredNew];
            });
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        setIsConnected(false);
        setIsLoading(false);
        // Reconectar después de 5 segundos
        setTimeout(() => connectToStream(), 5000);
      };
    } catch (error) {
      console.error('Error connecting to stream:', error);
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage.trim(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleBotAssist = async () => {
    if (!newMessage.trim() || isBotThinking) return;

    setIsBotThinking(true);
    try {
      const response = await fetch('/api/chat/bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage.trim(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error con bot:', error);
    } finally {
      setIsBotThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });
  };

  const isBot = (message: Message) => {
    return message.content.startsWith('🤖');
  };

  return (
    <div 
      className="netflix-modal"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white focus:text-white focus:bg-gray-800 p-2 -ml-2"
              autoFocus
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Volver
            </Button>
            <div className="h-6 w-px bg-gray-600 mx-2" />
            <MessageCircle className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-semibold text-white">
              Chat en Tiempo Real
            </h2>
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <div className="flex items-center text-green-400 text-xs">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse" />
                  En línea
                </div>
              ) : (
                <div className="flex items-center text-red-400 text-xs">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-1" />
                  Desconectado
                </div>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Mensajes */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Conectando al chat...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">¡Hola! Soy tu asistente virtual</p>
              <p className="text-gray-500 text-sm mb-4">
                Puedo ayudarte con información sobre películas, canales y la plataforma
              </p>
              <div className="text-xs text-gray-600 space-y-1">
                <p>💡 Pregúntame sobre géneros de películas</p>
                <p>📺 Información sobre canales disponibles</p>
                <p>🎬 Recomendaciones personalizadas</p>
                <p>❓ Ayuda con el uso de la plataforma</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    message.sender.isAdmin && !isBot(message) ? 'justify-start' : 
                    isBot(message) ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-lg ${
                      isBot(message)
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : message.sender.isAdmin
                        ? 'bg-gray-700 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium flex items-center">
                        {isBot(message) && <Bot className="w-3 h-3 mr-1" />}
                        {message.sender.name}
                      </span>
                      <span className="text-xs opacity-75">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </motion.div>
              ))}
              
              {/* Indicador de bot pensando */}
              {isBotThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <div className="flex items-center text-xs font-medium mb-1">
                      <Bot className="w-3 h-3 mr-1" />
                      Asistente IA
                    </div>
                    <div className="flex items-center text-sm">
                      <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                      Pensando...
                      <div className="flex space-x-1 ml-2">
                        <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
                        <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input de mensaje */}
        <div className="p-6 border-t border-gray-700">
          <form onSubmit={handleSendMessage} className="space-y-3">
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe tu mensaje o pregunta..."
                className="flex-1 netflix-input"
                disabled={isSending || isBotThinking}
                maxLength={500}
              />
              <Button
                type="submit"
                disabled={!newMessage.trim() || isSending || isBotThinking}
                className="netflix-button"
              >
                {isSending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {/* Botón del bot */}
            <div className="flex justify-center">
              <Button
                type="button"
                onClick={handleBotAssist}
                disabled={!newMessage.trim() || isBotThinking || isSending}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                {isBotThinking ? (
                  <div className="flex items-center">
                    <Sparkles className="w-3 h-3 mr-1 animate-spin" />
                    Preguntando al Asistente IA...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Bot className="w-3 h-3 mr-1" />
                    Preguntar al Asistente IA
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
