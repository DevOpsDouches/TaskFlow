import React, { useState, useEffect } from 'react';
import { User, LogOut, Plus, Trash2, Edit2, Check, X, CheckCircle2, Sparkles } from 'lucide-react';
import { AuthService } from './services/AuthService';
import { TodoService } from './services/TodoService';

function App() {
  const [screen, setScreen] = useState('welcome');
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [newTask, setNewTask] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadTodos();
    }
  }, [user]);

  const loadTodos = async () => {
    if (!user) return;
    const result = await TodoService.getTodos(user.userId, user.token);
    if (result.success) {
      setTodos(result.todos);
    }
  };

  const showSuccessAnimation = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleLogin = async () => {
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setLoading(true);
    
    const result = await AuthService.login(formData.username, formData.password);
    
    if (result.success) {
      setUser({
        username: result.username,
        userId: result.userId,
        token: result.token
      });
      showSuccessAnimation('Welcome back!');
      setTimeout(() => {
        setScreen('dashboard');
        setFormData({ username: '', password: '' });
      }, 1500);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleCreateAccount = async () => {
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setLoading(true);
    
    const result = await AuthService.createAccount(formData.username, formData.password);
    
    if (result.success) {
      setError('');
      showSuccessAnimation('Account created successfully!');
      setTimeout(() => {
        setScreen('login');
        setFormData({ username: '', password: '' });
      }, 1500);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
    setTodos([]);
    setScreen('welcome');
  };

  const handleAddTodo = async () => {
    if (!newTask.trim()) return;
    
    const result = await TodoService.createTodo(user.userId, newTask, user.token);
    if (result.success) {
      setTodos([...todos, result.todo]);
      setNewTask('');
      showSuccessAnimation('Task added!');
    } else {
      setError(result.message || 'Failed to add task');
    }
  };

  // FIX: Changed from todo.id to todo.todo_id
  const handleToggleTodo = async (todoId) => {
    const todo = todos.find(t => t.todo_id === todoId);
    if (!todo) {
      setError('Todo not found');
      return;
    }
    
    const result = await TodoService.updateTodo(user.userId, todoId, {
      completed: !todo.completed
    }, user.token);
    
    if (result.success) {
      setTodos(todos.map(t => t.todo_id === todoId ? result.todo : t));
      setError(''); // Clear any previous errors
    } else {
      setError(result.message || 'Failed to update task');
    }
  };

  // FIX: Changed from todo.id to todo.todo_id
  const handleDeleteTodo = async (todoId) => {
    const result = await TodoService.deleteTodo(user.userId, todoId, user.token);
    if (result.success) {
      setTodos(todos.filter(t => t.todo_id !== todoId));
      showSuccessAnimation('Task deleted!');
      setError(''); // Clear any previous errors
    } else {
      setError(result.message || 'Failed to delete task');
    }
  };

  // FIX: Changed from todo.id to todo.todo_id
  const handleStartEdit = (todo) => {
    setEditingId(todo.todo_id);
    setEditingText(todo.task);
  };

  // FIX: Changed from todo.id to todo.todo_id
  const handleSaveEdit = async (todoId) => {
    if (!editingText.trim()) return;
    
    const result = await TodoService.updateTodo(user.userId, todoId, {
      task: editingText
    }, user.token);
    
    if (result.success) {
      setTodos(todos.map(t => t.todo_id === todoId ? result.todo : t));
      setEditingId(null);
      setEditingText('');
      showSuccessAnimation('Task updated!');
      setError(''); // Clear any previous errors
    } else {
      setError(result.message || 'Failed to update task');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  // Success Notification Component
  const SuccessNotification = () => (
    <div className={`fixed top-8 right-8 z-50 ${showSuccess ? 'success-animation' : 'opacity-0 pointer-events-none'}`}>
      <div className="glass-white rounded-2xl px-6 py-4 flex items-center space-x-3 shadow-2xl">
        <CheckCircle2 className="text-green-500" size={24} />
        <span className="font-semibold text-gray-800">{successMessage}</span>
      </div>
    </div>
  );

  // Welcome Screen
  if (screen === 'welcome') {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center p-4 overflow-hidden">
        {/* Decorative floating elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '2s'}}></div>
        
        <div className="glass-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center relative z-10 fade-in-scale">
          <div className="mb-8 float">
            <div className="inline-block p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mb-4">
              <Sparkles className="text-white" size={48} />
            </div>
            <h1 className="text-5xl font-bold gradient-text mb-3">TaskFlow</h1>
            <p className="text-gray-600 text-lg">Your elegant task manager</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => setScreen('login')}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg btn-glow"
            >
              Login
            </button>
            
            <button
              onClick={() => setScreen('createAccount')}
              className="w-full glass text-indigo-700 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
            >
              Create Account
            </button>
          </div>
          
          <p className="text-gray-500 text-sm mt-8">
            Manage your tasks with style ✨
          </p>
        </div>
      </div>
    );
  }

  // Login Screen
  if (screen === 'login') {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center p-4">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="glass-white rounded-3xl shadow-2xl p-10 max-w-md w-full relative z-10 fade-in-scale">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mb-4">
              <User className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to continue</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                onKeyPress={(e) => handleKeyPress(e, handleLogin)}
                className="w-full px-5 py-4 glass-card rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400 font-medium"
              />
            </div>
            
            <div>
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                onKeyPress={(e) => handleKeyPress(e, handleLogin)}
                className="w-full px-5 py-4 glass-card rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400 font-medium"
              />
            </div>
            
            {error && (
              <div className="glass bg-red-50/80 text-red-600 px-4 py-3 rounded-xl text-sm font-medium success-animation">
                {error}
              </div>
            )}
            
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg btn-glow"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
            
            <button
              onClick={() => {
                setScreen('welcome');
                setError('');
                setFormData({ username: '', password: '' });
              }}
              className="w-full text-gray-600 py-3 hover:text-gray-800 font-medium transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Create Account Screen
  if (screen === 'createAccount') {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center p-4">
        <div className="absolute top-20 left-20 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="glass-white rounded-3xl shadow-2xl p-10 max-w-md w-full relative z-10 fade-in-scale">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl mb-4">
              <User className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-2">Create Account</h2>
            <p className="text-gray-600">Join TaskFlow today</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                onKeyPress={(e) => handleKeyPress(e, handleCreateAccount)}
                className="w-full px-5 py-4 glass-card rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400 font-medium"
              />
            </div>
            
            <div>
              <input
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                onKeyPress={(e) => handleKeyPress(e, handleCreateAccount)}
                className="w-full px-5 py-4 glass-card rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400 font-medium"
              />
            </div>
            
            {error && (
              <div className="glass bg-red-50/80 text-red-600 px-4 py-3 rounded-xl text-sm font-medium success-animation">
                {error}
              </div>
            )}
            
            <button
              onClick={handleCreateAccount}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 rounded-xl font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg btn-glow"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>
            
            <button
              onClick={() => {
                setScreen('welcome');
                setError('');
                setFormData({ username: '', password: '' });
              }}
              className="w-full text-gray-600 py-3 hover:text-gray-800 font-medium transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Screen
  return (
    <div className="min-h-screen animated-bg p-4 md:p-8">
      <SuccessNotification />
      
      {/* Decorative elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse pointer-events-none" style={{animationDelay: '1s'}}></div>
      
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="glass-white rounded-2xl shadow-lg p-6 mb-6 slide-in-up">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl">
                <User className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Welcome back,</p>
                <h2 className="text-2xl font-bold gradient-text">
                  {user?.username}
                </h2>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-5 py-2.5 glass hover:bg-red-50/80 text-red-600 rounded-xl transition-all duration-300 transform hover:scale-105 font-medium"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass-white rounded-2xl p-6 slide-in-left">
            <p className="text-gray-600 text-sm font-medium mb-1">Total Tasks</p>
            <p className="text-3xl font-bold gradient-text">{todos.length}</p>
          </div>
          <div className="glass-white rounded-2xl p-6 slide-in-left" style={{animationDelay: '0.1s'}}>
            <p className="text-gray-600 text-sm font-medium mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-600">{todos.filter(t => t.completed).length}</p>
          </div>
          <div className="glass-white rounded-2xl p-6 slide-in-left" style={{animationDelay: '0.2s'}}>
            <p className="text-gray-600 text-sm font-medium mb-1">Pending</p>
            <p className="text-3xl font-bold text-orange-600">{todos.filter(t => !t.completed).length}</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="glass bg-red-50/80 text-red-600 px-4 py-3 rounded-xl text-sm font-medium mb-6 success-animation">
            {error}
          </div>
        )}

        {/* Add Todo */}
        <div className="glass-white rounded-2xl shadow-lg p-6 mb-6 slide-in-up">
          <div className="flex space-x-3">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, handleAddTodo)}
              placeholder="What needs to be done?"
              className="flex-1 px-5 py-4 glass-card rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400 font-medium"
            />
            <button
              onClick={handleAddTodo}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center space-x-2 shadow-lg transform hover:scale-105 btn-glow"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Add Task</span>
            </button>
          </div>
        </div>

        {/* Todo List */}
        <div className="glass-white rounded-2xl shadow-lg p-6 fade-in-scale">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold gradient-text">My Tasks</h2>
            {todos.length > 0 && (
              <span className="text-sm text-gray-500 font-medium">
                {todos.filter(t => t.completed).length} of {todos.length} completed
              </span>
            )}
          </div>
          
          {todos.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-block p-4 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl mb-4">
                <Sparkles className="text-purple-600" size={48} />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks yet!</h3>
              <p className="text-gray-500">Create your first task to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* FIX: Changed key from todo.id to todo.todo_id */}
              {todos.map((todo, index) => (
                <div
                  key={todo.todo_id}
                  className="stagger-item todo-item flex items-center space-x-4 p-4 glass-card rounded-xl hover:shadow-md"
                  style={{animationDelay: `${index * 0.05}s`}}
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggleTodo(todo.todo_id)}
                    className="w-6 h-6 text-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 cursor-pointer transition-all"
                  />
                  
                  {/* FIX: Changed condition from editingId === todo.id to editingId === todo.todo_id */}
                  {editingId === todo.todo_id ? (
                    <>
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, () => handleSaveEdit(todo.todo_id))}
                        className="flex-1 px-4 py-2 glass-card rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(todo.todo_id)}
                        className="text-green-600 hover:text-green-700 p-2 hover:bg-green-50 rounded-lg transition-all"
                      >
                        <Check size={20} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <X size={20} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span
                        className={`flex-1 font-medium transition-all ${
                          todo.completed
                            ? 'line-through text-gray-400'
                            : 'text-gray-800'
                        }`}
                      >
                        {todo.task}
                      </span>
                      <button
                        onClick={() => handleStartEdit(todo)}
                        className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      {/* FIX: Changed from todo.id to todo.todo_id */}
                      <button
                        onClick={() => handleDeleteTodo(todo.todo_id)}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
