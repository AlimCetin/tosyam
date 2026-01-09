import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Loader2, AlertCircle, CheckCircle2, Clock, Sparkles, Target, Zap, Trash2 } from 'lucide-react';

// API Service Layer
const API_BASE_URL = 'http://localhost:5000/api';

const apiService = {
  getTasks: async () => {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    if (!response.ok) throw new Error('Görevler yüklenemedi');
    return response.json();
  },
  createTask: async (task) => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    if (!response.ok) throw new Error('Görev eklenemedi');
    return response.json();
  },
  updateTaskStatus: async (id, status) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Görev durumu güncellenemedi');
    return response.json();
  }
};

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-8 right-8 z-[9999] animate-slide-in">
      <div className="glass-card p-5 min-w-[320px] border border-white/30 shadow-2xl backdrop-blur-xl bg-white/10">
        <div className="flex items-center gap-3">
          <div className="neomorph-circle flex items-center justify-center">
            {type === 'success' ? <CheckCircle2 className="text-emerald-400" size={24} /> : <AlertCircle className="text-rose-400" size={24} />}
          </div>
          <p className="text-white font-semibold text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

// Task Card Component with Glassmorphism
const TaskCard = ({ task, onStatusChange, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === task.status) return;
    setIsUpdating(true);
    await onStatusChange(task.id, newStatus);
    setIsUpdating(false);
  };

  const getNextAction = () => {
    if (task.status === 'Todo') return { status: 'InProgress', label: 'Başlat', icon: Zap, color: 'from-blue-400 to-cyan-400' };
    if (task.status === 'InProgress') return { status: 'Done', label: 'Tamamla', icon: CheckCircle2, color: 'from-emerald-400 to-green-400' };
    return { status: 'Todo', label: 'Yeniden', icon: Target, color: 'from-slate-400 to-slate-600' };
  };

  const action = getNextAction();
  const ActionIcon = action.icon;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`glass-card group cursor-pointer transition-all duration-500 ${
        isHovered ? 'scale-105 shadow-glow' : 'scale-100'
      }`}
    >
      <div className="p-6 relative">
        {/* Floating orb effect */}
        <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-gradient-to-br from-blue-400/30 to-blue-600/30 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Title with kinetic typography */}
        <h3 className="text-white font-black text-xl mb-3 leading-tight tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-300 group-hover:to-blue-500 transition-all duration-300">
          {task.title}
        </h3>

        {/* Description */}
        <p className="text-white/70 text-sm leading-relaxed mb-4 line-clamp-3">
          {task.description}
        </p>

        {/* Footer with neomorph buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-white/50 text-xs">
            <Clock size={14} />
            <span>{new Date(task.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onDelete(task.id)}
              className="neomorph-btn-sm group/delete"
            >
              <Trash2 size={14} className="text-white/60 group-hover/delete:text-rose-400 transition-colors" />
            </button>
            
            {isUpdating ? (
              <div className="neomorph-btn-sm">
                <Loader2 className="animate-spin text-white/60" size={14} />
              </div>
            ) : (
              <button
                onClick={() => handleStatusChange(action.status)}
                className={`neomorph-btn-action bg-gradient-to-r ${action.color} text-white font-bold text-xs px-4 py-2 rounded-xl hover:shadow-xl transition-all duration-300 flex items-center gap-2`}
              >
                <ActionIcon size={14} />
                {action.label}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Bento Section Component
const BentoSection = ({ title, count, status, tasks, onStatusChange, onDelete, gradient, icon: Icon }) => {
  return (
    <div className="glass-card-section h-full flex flex-col">
      {/* Header with gradient */}
      <div className={`relative overflow-hidden rounded-t-3xl p-6 bg-gradient-to-br ${gradient}`}>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="neomorph-circle-white">
              <Icon size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-black text-2xl tracking-tight">{title}</h2>
              <p className="text-white/70 text-sm font-medium mt-1">{count} görev</p>
            </div>
          </div>
          <div className="neomorph-count text-white font-black text-4xl">
            {count}
          </div>
        </div>
        
        {/* Floating orbs */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/20 blur-3xl" />
      </div>

      {/* Tasks container */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4 min-h-[500px]">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className="neomorph-circle-empty mb-4">
              <Icon size={32} className="text-white/30" />
            </div>
            <p className="text-white/40 text-sm font-medium">Görev yok</p>
          </div>
        ) : (
          tasks.map((task, idx) => (
            <div
              key={task.id}
              className="animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <TaskCard task={task} onStatusChange={onStatusChange} onDelete={onDelete} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Modal Component with Glassmorphism
const TaskModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Todo'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback(() => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Başlık zorunludur';
    else if (formData.title.length < 3) newErrors.title = 'Başlık en az 3 karakter olmalıdır';
    if (!formData.description.trim()) newErrors.description = 'Açıklama zorunludur';
    return newErrors;
  }, [formData]);

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
    setFormData({ title: '', description: '', status: 'Todo' });
    setErrors({});
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-4 animate-fade-in overflow-y-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="glass-modal relative z-10 w-full max-w-xl animate-scale-in">
        {/* Header */}
        <div className="relative overflow-hidden rounded-t-3xl p-8 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700">
          <div className="relative z-10 flex items-center gap-4">
            <div className="neomorph-circle-white">
              <Sparkles size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-black text-3xl tracking-tight">Yeni Görev</h2>
              <p className="text-white/80 text-sm mt-1">Hedefini belirle ve başla</p>
            </div>
          </div>
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-white/20 blur-3xl" />
        </div>

        {/* Form */}
        <div className="p-8 space-y-6">
          <div>
            <label className="block text-gray-800 text-sm font-bold mb-3">Başlık</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`neomorph-input ${errors.title ? 'border-rose-400/50' : ''}`}
              placeholder="Görev başlığını gir..."
            />
            {errors.title && (
              <p className="text-rose-500 text-xs mt-2 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.title}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-800 text-sm font-bold mb-3">Açıklama</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className={`neomorph-input resize-none ${errors.description ? 'border-rose-400/50' : ''}`}
              placeholder="Detayları açıkla..."
            />
            {errors.description && (
              <p className="text-rose-500 text-xs mt-2 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.description}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-800 text-sm font-bold mb-3">Durum</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="neomorph-input"
            >
              <option value="Todo">📋 Yapılacak</option>
              <option value="InProgress">⚡ Devam Ediyor</option>
              <option value="Done">✅ Tamamlandı</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 neomorph-btn-secondary"
              disabled={isSubmitting}
            >
              İptal
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 neomorph-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2 className="animate-spin" size={20} /> Ekleniyor...</>
              ) : (
                <><Plus size={20} /> Ekle</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App
export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockTasks = [
        {
          id: 1,
          title: 'Backend API Geliştirme',
          description: 'RESTful API endpoints oluştur ve test et. Authentication, validation ve error handling ekle.',
          status: 'InProgress',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Database Migration',
          description: 'PostgreSQL için migration scriptleri hazırla. Entity ilişkilerini ve indexleri tanımla.',
          status: 'Todo',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 3,
          title: 'Unit Test Yazımı',
          description: 'Servis katmanı için kapsamlı unit testler yaz. Coverage %80 üzerine çıkar.',
          status: 'Done',
          createdAt: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: 4,
          title: 'Frontend Component Library',
          description: 'Modern ve responsive UI component library seç ve implement et.',
          status: 'InProgress',
          createdAt: new Date(Date.now() - 259200000).toISOString()
        },
        {
          id: 5,
          title: 'Docker Configuration',
          description: 'Development ve production için Docker container yapılandırması.',
          status: 'Todo',
          createdAt: new Date(Date.now() - 345600000).toISOString()
        }
      ];
      setTasks(mockTasks);
    } catch (err) {
      setError(err.message);
      showToast('Görevler yüklenirken hata oluştu', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const newTask = {
        ...taskData,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      setTasks(prev => [newTask, ...prev]);
      showToast('Görev eklendi! 🎉', 'success');
    } catch (err) {
      showToast('Görev eklenirken hata oluştu', 'error');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, status: newStatus } : task
      ));
      showToast('Durum güncellendi ✨', 'success');
    } catch (err) {
      showToast('Hata oluştu', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      setTasks(prev => prev.filter(task => task.id !== id));
      showToast('Görev silindi 🗑️', 'success');
    } catch (err) {
      showToast('Silme hatası', 'error');
    }
  };

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
  }, []);

  const tasksByStatus = useMemo(() => ({
    Todo: tasks.filter(t => t.status === 'Todo'),
    InProgress: tasks.filter(t => t.status === 'InProgress'),
    Done: tasks.filter(t => t.status === 'Done')
  }), [tasks]);

  const sections = [
    {
      title: 'YAPILACAK',
      status: 'Todo',
      tasks: tasksByStatus.Todo,
      gradient: 'from-slate-500 via-slate-600 to-slate-700',
      icon: Target,
      count: tasksByStatus.Todo.length
    },
    {
      title: 'DEVAM EDİYOR',
      status: 'InProgress',
      tasks: tasksByStatus.InProgress,
      gradient: 'from-blue-500 via-cyan-500 to-blue-600',
      icon: Zap,
      count: tasksByStatus.InProgress.length
    },
    {
      title: 'TAMAMLANDI',
      status: 'Done',
      tasks: tasksByStatus.Done,
      gradient: 'from-emerald-500 via-green-500 to-emerald-600',
      icon: CheckCircle2,
      count: tasksByStatus.Done.length
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-bg">
        <div className="text-center">
          <div className="neomorph-loader mb-6">
            <Loader2 className="animate-spin text-white" size={48} />
          </div>
          <p className="text-white font-bold text-xl tracking-wide">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-bg">
      {/* Floating orbs background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-orb orb-1" />
        <div className="floating-orb orb-2" />
        <div className="floating-orb orb-3" />
      </div>

      {/* Header */}
      <header className="glass-header sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="neomorph-logo">
                <Sparkles className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-white font-black text-4xl tracking-tighter bg-clip-text">
                  TASK<span className="text-transparent bg-gradient-to-r from-blue-300 to-blue-500 bg-clip-text">FLOW</span>
                </h1>
                <p className="text-white/60 text-sm font-medium mt-1">Modern Görev Yönetimi · {tasks.length} Görev</p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="neomorph-btn-primary-large"
            >
              <Plus size={24} />
              <span>Yeni Görev</span>
            </button>
          </div>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <main className="relative z-10 max-w-[1800px] mx-auto px-6 py-8">
        <div className="bento-grid">
          {sections.map((section, idx) => (
            <div
              key={section.status}
              className="animate-slide-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <BentoSection
                {...section}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      </main>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <style>{`
        .animated-bg {
          background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 25%, #90CAF9 50%, #64B5F6 75%, #E3F2FD 100%);
          background-size: 400% 400%;
          animation: gradient-shift 15s ease infinite;
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .floating-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          animation: float 20s ease-in-out infinite;
        }

        .orb-1 {
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, #42A5F5, #1E88E5);
          top: -200px;
          left: -200px;
        }

        .orb-2 {
          width: 500px;
          height: 500px;
          background: linear-gradient(135deg, #64B5F6, #42A5F5);
          top: 50%;
          right: -250px;
          animation-delay: -7s;
        }

        .orb-3 {
          width: 450px;
          height: 450px;
          background: linear-gradient(135deg, #90CAF9, #64B5F6);
          bottom: -200px;
          left: 30%;
          animation-delay: -14s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(50px, -50px) rotate(120deg); }
          66% { transform: translate(-50px, 50px) rotate(240deg); }
        }

        .glass-header {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        }

        .glass-card-section {
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 28px;
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
        }

        .glass-modal {
          background: #FFFFFF;
          backdrop-filter: none;
          border: 2px solid rgba(66, 165, 245, 0.3);
          border-radius: 32px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .shadow-glow {
          box-shadow: 0 0 40px rgba(66, 165, 245, 0.4), 0 12px 48px rgba(0, 0, 0, 0.2);
        }

        .neomorph-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 8px 8px 16px rgba(0, 0, 0, 0.2), -8px -8px 16px rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .neomorph-circle-white {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          box-shadow: 8px 8px 20px rgba(0, 0, 0, 0.15), -8px -8px 20px rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .neomorph-circle-empty {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.03);
          box-shadow: inset 4px 4px 8px rgba(0, 0, 0, 0.1), inset -4px -4px 8px rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .neomorph-count {
          opacity: 0.2;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }

        .neomorph-btn-sm {
          padding: 8px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.15), -4px -4px 8px rgba(255, 255, 255, 0.08);
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .neomorph-btn-sm:hover {
          box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2), -2px -2px 4px rgba(255, 255, 255, 0.1);
          transform: translateY(1px);
        }

        .neomorph-btn-action {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .neomorph-btn-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3);
        }

        .neomorph-input {
          width: 100%;
          padding: 16px;
          border-radius: 16px;
          background: #F5F5F5;
          border: 2px solid #E0E0E0;
          color: #333;
          font-size: 14px;
          transition: all 0.3s;
          box-shadow: none;
        }

        .neomorph-input:focus {
          outline: none;
          border-color: rgba(33, 150, 243, 0.5);
          box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
        }

        .neomorph-input::placeholder {
          color: rgba(0, 0, 0, 0.4);
        }

        .neomorph-btn-primary {
          padding: 14px 28px;
          border-radius: 16px;
          background: linear-gradient(135deg, #42A5F5, #1E88E5);
          color: white;
          font-weight: 700;
          box-shadow: 0 8px 24px rgba(66, 165, 245, 0.4);
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .neomorph-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(66, 165, 245, 0.5);
        }

        .neomorph-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .neomorph-btn-secondary {
          padding: 14px 28px;
          border-radius: 16px;
          background: #F5F5F5;
          border: 2px solid #E0E0E0;
          color: #666;
          font-weight: 700;
          transition: all 0.3s;
        }

        .neomorph-btn-secondary:hover:not(:disabled) {
          background: #EEEEEE;
          border-color: #BDBDBD;
        }

        .neomorph-btn-primary-large {
          padding: 16px 32px;
          border-radius: 20px;
          background: linear-gradient(135deg, #2196F3, #1976D2);
          color: white;
          font-weight: 800;
          font-size: 16px;
          box-shadow: 0 12px 32px rgba(33, 150, 243, 0.4);
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .neomorph-btn-primary-large:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 40px rgba(33, 150, 243, 0.5);
        }

        .neomorph-logo {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
          box-shadow: 8px 8px 24px rgba(0, 0, 0, 0.2), -8px -8px 24px rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse-glow 3s ease-in-out infinite;
        }

        .neomorph-loader {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 12px 12px 32px rgba(0, 0, 0, 0.2), -12px -12px 32px rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 8px 8px 24px rgba(0, 0, 0, 0.2), -8px -8px 24px rgba(255, 255, 255, 0.1), 0 0 20px rgba(33, 150, 243, 0.3);
          }
          50% {
            box-shadow: 8px 8px 24px rgba(0, 0, 0, 0.2), -8px -8px 24px rgba(255, 255, 255, 0.1), 0 0 40px rgba(33, 150, 243, 0.5);
          }
        }

        .bento-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
        }

        @media (max-width: 1400px) {
          .bento-grid {
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .bento-grid {
            grid-template-columns: 1fr;
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.4s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}