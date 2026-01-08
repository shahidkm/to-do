import React, { useState, useEffect } from 'react';
import { Check, Trash2, Edit2, Plus, X } from 'lucide-react';
import { supabase } from "../supabase";

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTodos();
  }, []);

  // 📥 Fetch Todos
  const loadTodos = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('ToDo')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error loading todos:", error);
    } else {
      setTodos(data || []);
    }

    setLoading(false);
  };

  // ➕ Add Todo
  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;

    const { data, error } = await supabase
      .from('ToDo')
      .insert([{ title: newTodo.trim(), completed: false }]) // ✅ Use title, not text
      .select()
      .single();

    if (error) {
      console.error("Error adding todo:", error);
    } else {
      setTodos([data, ...todos]);
      setNewTodo('');
    }
  };

  // ⏎ Enter key add
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleAddTodo();
  };

  // ✅ Toggle complete
  const handleToggle = async (id) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const { data, error } = await supabase
      .from('ToDo')
      .update({ completed: !todo.completed })
      .eq('id', id)
      .select()
      .single();

    if (!error) {
      setTodos(todos.map(t => (t.id === id ? data : t)));
    } else {
      console.error("Error toggling todo:", error);
    }
  };

  // ❌ Delete Todo
  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('ToDo')
      .delete()
      .eq('id', id);

    if (!error) {
      setTodos(todos.filter(t => t.id !== id));
    } else {
      console.error("Error deleting todo:", error);
    }
  };

  // ✏️ Start edit
  const startEdit = (id, text) => {
    setEditingId(id);
    setEditText(text);
  };

  // 💾 Save edit
  const handleEdit = async (id) => {
    if (!editText.trim()) return;

    const { data, error } = await supabase
      .from('ToDo')
      .update({ title: editText.trim() }) // ✅ Use title, not text
      .eq('id', id)
      .select()
      .single();

    if (!error) {
      setTodos(todos.map(t => (t.id === id ? data : t)));
      setEditingId(null);
      setEditText('');
    } else {
      console.error("Error editing todo:", error);
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

        {/* Add Todo */}
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="What needs to be done?"
            className="flex-1 px-4 py-3 rounded-lg border-2 border-blue-200 focus:border-blue-400 focus:outline-none"
          />
          <button
            onClick={handleAddTodo}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2"
          >
            <Plus size={20} /> Add
          </button>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-between text-sm">
          <span>Total: <b>{todos.length}</b></span>
          <span>Completed: <b>{completedCount}</b></span>
          <span>Pending: <b>{todos.length - completedCount}</b></span>
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : todos.length === 0 ? (
            <p className="text-center text-blue-400">No todos yet</p>
          ) : (
            todos.map(todo => (
              <div key={todo.id} className="bg-white p-4 rounded-lg shadow flex items-center gap-3">

                {editingId === todo.id ? (
                  <>
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 border px-3 py-2 rounded"
                      autoFocus
                    />
                    <button onClick={() => handleEdit(todo.id)}><Check /></button>
                    <button onClick={cancelEdit}><X /></button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleToggle(todo.id)}
                      className={`w-6 h-6 border rounded flex items-center justify-center ${
                        todo.completed ? 'bg-blue-500 text-white' : ''
                      }`}
                    >
                      {todo.completed && <Check size={16} />}
                    </button>

                    <span className={`flex-1 ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                      {todo.title} {/* ✅ Use title */}
                    </span>

                    <button onClick={() => startEdit(todo.id, todo.title)}>
                      <Edit2 />
                    </button>
                    <button onClick={() => handleDelete(todo.id)}>
                      <Trash2 />
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
