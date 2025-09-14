import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { notesAPI } from '../services/api';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';

const NotesPage = () => {
  const { user, updateUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const fetchNotes = async () => {
    try {
      const res = await notesAPI.getAll();
      setNotes(res.data.data.notes);
      setError(null);
    } catch (e) {
      setError(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const createNote = async () => {
    if (!title.trim() || !content.trim()) return;
    try {
      await notesAPI.create({ title, content });
      setTitle('');
      setContent('');
      fetchNotes();
    } catch (e) {
      if (e.response?.status === 403) navigate('/upgrade');
    }
  };

  const deleteNote = async (id) => {
    await notesAPI.delete(id);
    fetchNotes();
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage onRetry={fetchNotes} />;

  return (
    <Layout>
      <div className="mb-6 card max-w-md">
        <h3 className="font-semibold mb-3">Add New Note</h3>
        <input className="input mb-3" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea className="textarea mb-3" placeholder="Content" value={content} onChange={e => setContent(e.target.value)} />
        <button onClick={createNote} disabled={!title || !content} className="btn btn-primary flex items-center justify-center w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Note
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {notes.map(note => (
          <div key={note._id} className="card relative">
            <h4 className="font-bold">{note.title}</h4>
            <p className="text-gray-700 whitespace-pre-wrap mt-2">{note.content}</p>
            <button onClick={() => deleteNote(note._id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {user.tenant.subscription === 'free' && notes.length >= 3 && isAdmin() && (
        <div className="mt-8 p-6 border-2 border-yellow-500 bg-yellow-50 rounded">
          <p className="mb-4 font-semibold text-yellow-700">
            You have reached your Free plan note limit (3 notes). Upgrade to Pro for unlimited notes.
          </p>
          <button onClick={() => navigate('/upgrade')} className="btn btn-primary">
            Upgrade to Pro
          </button>
        </div>
      )}
    </Layout>
  );
};

export default NotesPage;
