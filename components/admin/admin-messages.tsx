
'use client';

import { useState, useEffect } from 'react';
import { Send, MessageCircle, User, Clock } from 'lucide-react';
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
    name: string;
    isAdmin: boolean;
  };
  receiver: {
    name: string;
    isAdmin: boolean;
  };
}

interface User {
  id: string;
  name: string;
  isAdmin: boolean;
}

export function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadMessages();
    loadUsers();
  }, []);

  // Manejar teclas para navegación
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.ctrlKey && newMessage.trim() && selectedUserId) {
        e.preventDefault();
        const form = document.querySelector('form[onsubmit]') as HTMLFormElement;
        form?.requestSubmit();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [newMessage, selectedUserId]);

  const loadMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.users.filter((user: User) => !user.isAdmin));
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          receiverId: selectedUserId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewMessage('');
        loadMessages();
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Agrupar mensajes por conversación
  const conversationsByUser = messages.reduce((acc, message) => {
    const otherUserId = message.sender.isAdmin ? message.receiverId : message.senderId;
    const otherUserName = message.sender.isAdmin ? message.receiver.name : message.sender.name;
    
    if (!acc[otherUserId]) {
      acc[otherUserId] = {
        userId: otherUserId,
        userName: otherUserName,
        messages: [],
        lastMessage: message,
      };
    }
    
    acc[otherUserId].messages.push(message);
    
    // Actualizar último mensaje si es más reciente
    if (new Date(message.createdAt) > new Date(acc[otherUserId].lastMessage.createdAt)) {
      acc[otherUserId].lastMessage = message;
    }
    
    return acc;
  }, {} as Record<string, { userId: string; userName: string; messages: Message[]; lastMessage: Message }>);

  const conversations = Object.values(conversationsByUser).sort(
    (a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
  );

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Cargando mensajes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Gestión de Mensajes</h2>
        <p className="text-gray-400">Administra las conversaciones con los usuarios</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Panel de envío de mensaje */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-white text-lg font-semibold mb-4">Enviar Mensaje</h3>
          
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="text-white text-sm font-medium block mb-2">
                Destinatario
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full netflix-input"
                required
              >
                <option value="">Seleccionar usuario...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-white text-sm font-medium block mb-2">
                Mensaje
              </label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="w-full netflix-input h-24 resize-none"
                maxLength={500}
                required
                disabled={isSending}
              />
            </div>

            <Button
              type="submit"
              disabled={!newMessage.trim() || !selectedUserId || isSending}
              className="w-full netflix-button"
            >
              {isSending ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Enviando...
                </div>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Mensaje
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Panel de estadísticas */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-white text-lg font-semibold mb-4">Estadísticas</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
              <div className="flex items-center">
                <MessageCircle className="w-5 h-5 text-blue-500 mr-3" />
                <span className="text-white">Total de mensajes</span>
              </div>
              <span className="text-white font-semibold">{messages.length}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
              <div className="flex items-center">
                <User className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-white">Conversaciones activas</span>
              </div>
              <span className="text-white font-semibold">{conversations.length}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-500 mr-3" />
                <span className="text-white">Mensajes no leídos</span>
              </div>
              <span className="text-white font-semibold">
                {messages.filter(m => !m.isRead && m.sender.isAdmin === false).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de conversaciones */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-white text-lg font-semibold mb-4">Conversaciones Recientes</h3>
        
        {conversations.length > 0 ? (
          <div className="space-y-4">
            {conversations.map((conversation, index) => (
              <motion.div
                key={conversation.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-white font-medium">{conversation.userName}</h4>
                    <p className="text-gray-400 text-sm">
                      {conversation.messages.length} mensaje{conversation.messages.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className="text-gray-400 text-xs">
                    {formatTime(conversation.lastMessage.createdAt)}
                  </span>
                </div>

                <div className="bg-gray-600 rounded p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">
                      {conversation.lastMessage.sender.isAdmin ? 'Tú' : conversation.lastMessage.sender.name}:
                    </span>
                  </div>
                  <p className="text-white text-sm">{conversation.lastMessage.content}</p>
                </div>

                <div className="mt-3 flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedUserId(conversation.userId);
                      document.querySelector('textarea')?.focus();
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    Responder
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No hay conversaciones aún</p>
            <p className="text-gray-500 text-sm">
              Los mensajes de los usuarios aparecerán aquí
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
