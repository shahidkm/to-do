import React, { useState, useEffect } from 'react';
import { Check, Trash2, Edit2, Plus, X } from 'lucide-react';

// Real JSON Server API
const API_URL = 'http://localhost:5000/todos';

const api = {
  async getAll() {
    const res = await fetch(API_URL);
    return res.json();
  },

  async create(todo) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todo)
    });
    return res.json();
  },

  async update(id, updates) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async delete(id) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  }
};

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    setLoading(true);
    try {
      const data = await api.getAll();
      setTodos(data);
    } catch (error) {
      console.error('Error loading todos:', error);
    }
    setLoading(false);
  };

  const handleAddTodo = async () => {
    if (newTodo.trim()) {
      try {
        const todo = await api.create({ text: newTodo.trim(), completed: false });
        setTodos([...todos, todo]);
        setNewTodo('');
      } catch (error) {
        console.error('Error adding todo:', error);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };

  const handleToggle = async (id) => {
    const todo = todos.find(t => t.id === id);
    try {
      const updated = await api.update(id, { completed: !todo.completed });
      setTodos(todos.map(t => t.id === id ? updated : t));
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(id);
      setTodos(todos.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const startEdit = (id, text) => {
    setEditingId(id);
    setEditText(text);
  };

  const handleEdit = async (id) => {
    if (editText.trim()) {
      try {
        const updated = await api.update(id, { text: editText.trim() });
        setTodos(todos.map(t => t.id === id ? updated : t));
        setEditingId(null);
        setEditText('');
      } catch (error) {
        console.error('Error editing todo:', error);
      }
    }
  };

  const handleEditKeyPress = (e, id) => {
    if (e.key === 'Enter') {
      handleEdit(id);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">My Todo List</h1>
          <p className="text-blue-400">Stay organized and productive</p>
        </div>

        {/* Add Todo Section */}
        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What needs to be done?"
              className="flex-1 px-4 py-3 rounded-lg border-2 border-blue-200 focus:border-blue-400 focus:outline-none bg-white text-gray-700 placeholder-blue-300"
            />
            <button
              onClick={handleAddTodo}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Add
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-blue-100">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Total: <span className="font-semibold text-blue-600">{todos.length}</span>
            </span>
            <span className="text-gray-600">
              Completed: <span className="font-semibold text-blue-600">{completedCount}</span>
            </span>
            <span className="text-gray-600">
              Pending: <span className="font-semibold text-blue-600">{todos.length - completedCount}</span>
            </span>
          </div>
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-blue-400">Loading...</div>
          ) : todos.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md border border-blue-100">
              <p className="text-blue-300 text-lg">No todos yet. Add one to get started!</p>
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className="bg-white rounded-lg shadow-md p-4 border border-blue-100 hover:shadow-lg transition-shadow"
              >
                {editingId === todo.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyPress={(e) => handleEditKeyPress(e, todo.id)}
                      className="flex-1 px-3 py-2 rounded border-2 border-blue-300 focus:border-blue-500 focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleEdit(todo.id)}
                      className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggle(todo.id)}
                      className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        todo.completed
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-blue-300 hover:border-blue-500'
                      }`}
                    >
                      {todo.completed && <Check size={16} className="text-white" />}
                    </button>
                    <span
                      className={`flex-1 ${
                        todo.completed
                          ? 'line-through text-gray-400'
                          : 'text-gray-700'
                      }`}
                    >
                      {todo.text}
                    </span>
                    <button
                      onClick={() => startEdit(todo.id, todo.text)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}