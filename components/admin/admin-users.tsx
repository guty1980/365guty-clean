
'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, UserX, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';

interface User {
  id: string;
  name: string;
  allowedDevices: number;
  isSuspended: boolean;
  isAdmin: boolean;
  createdAt: string;
}

interface AdminUsersProps {
  onDataChange: () => void;
}

export function AdminUsers({ onDataChange }: AdminUsersProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    allowedDevices: 1,
    isAdmin: false,
    isSuspended: false,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setShowCreateForm(false);
        resetForm();
        loadUsers();
        onDataChange();
      }
    } catch (error) {
      console.error('Error creando usuario:', error);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setEditingUser(null);
        resetForm();
        loadUsers();
        onDataChange();
      }
    } catch (error) {
      console.error('Error actualizando usuario:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        loadUsers();
        onDataChange();
      }
    } catch (error) {
      console.error('Error eliminando usuario:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      password: '',
      allowedDevices: 1,
      isAdmin: false,
      isSuspended: false,
    });
  };

  const openEditForm = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      password: '',
      allowedDevices: user.allowedDevices,
      isAdmin: user.isAdmin,
      isSuspended: user.isSuspended,
    });
  };

  // Manejar teclas de escape para cerrar modales
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (editingUser) {
        setEditingUser(null);
      } else if (showCreateForm) {
        setShowCreateForm(false);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editingUser, showCreateForm]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestión de Usuarios</h2>
          <p className="text-gray-400">Administra las cuentas de usuario y sus permisos</p>
        </div>
        
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button className="netflix-button">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Crear Nuevo Usuario</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <Label className="text-white">Nombre</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="netflix-input"
                  required
                />
              </div>
              <div>
                <Label className="text-white">Contraseña</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="netflix-input"
                  required
                />
              </div>
              <div>
                <Label className="text-white">Dispositivos Permitidos</Label>
                <Select
                  value={formData.allowedDevices.toString()}
                  onValueChange={(value) => setFormData({ ...formData, allowedDevices: parseInt(value) })}
                >
                  <SelectTrigger className="netflix-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="1">1 dispositivo</SelectItem>
                    <SelectItem value="2">2 dispositivos</SelectItem>
                    <SelectItem value="3">3 dispositivos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isAdmin}
                  onCheckedChange={(checked) => setFormData({ ...formData, isAdmin: checked })}
                />
                <Label className="text-white">Es Administrador</Label>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="netflix-button flex-1">
                  Crear Usuario
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de usuarios */}
      <div className="netflix-admin-grid">
        {users.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-lg p-6 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white font-semibold text-lg">{user.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  {user.isAdmin && (
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                      ADMIN
                    </span>
                  )}
                  {user.isSuspended && (
                    <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded">
                      SUSPENDIDO
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditForm(user)}
                  className="text-gray-400 hover:text-white"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-gray-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex justify-between">
                <span>Dispositivos permitidos:</span>
                <span>{user.allowedDevices}</span>
              </div>
              <div className="flex justify-between">
                <span>Estado:</span>
                <span className={user.isSuspended ? 'text-red-400' : 'text-green-400'}>
                  {user.isSuspended ? 'Suspendido' : 'Activo'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Creado:</span>
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dialog de edición */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Usuario</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div>
              <Label className="text-white">Nombre</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="netflix-input"
                required
              />
            </div>
            <div>
              <Label className="text-white">Nueva Contraseña (opcional)</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="netflix-input"
                placeholder="Dejar vacío para mantener la actual"
              />
            </div>
            <div>
              <Label className="text-white">Dispositivos Permitidos</Label>
              <Select
                value={formData.allowedDevices.toString()}
                onValueChange={(value) => setFormData({ ...formData, allowedDevices: parseInt(value) })}
              >
                <SelectTrigger className="netflix-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="1">1 dispositivo</SelectItem>
                  <SelectItem value="2">2 dispositivos</SelectItem>
                  <SelectItem value="3">3 dispositivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isAdmin}
                onCheckedChange={(checked) => setFormData({ ...formData, isAdmin: checked })}
              />
              <Label className="text-white">Es Administrador</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isSuspended}
                onCheckedChange={(checked) => setFormData({ ...formData, isSuspended: checked })}
              />
              <Label className="text-white">Suspender Usuario</Label>
            </div>
            <div className="flex space-x-2">
              <Button type="submit" className="netflix-button flex-1">
                Guardar Cambios
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingUser(null)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
