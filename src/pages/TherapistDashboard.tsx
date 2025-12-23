import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Professional } from '@/lib/types';
import { Shield, Plus, Sparkles, BookHeart, MessageCircle, Loader2, Trash2, X } from 'lucide-react';

interface WellnessExercise {
  id: string;
  title: string;
  description: string;
  instructions: string;
  category: string;
  icon: string;
  author_id: string;
  created_at: string;
}

interface Story {
  id: string;
  title: string;
  description: string;
  category: string;
  content: any;
  author_id: string;
  is_professional_content: boolean;
  created_at: string;
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function TherapistDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Professional | null>(null);
  const [exercises, setExercises] = useState<WellnessExercise[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'exercises' | 'stories' | 'messages'>('overview');
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [showStoryForm, setShowStoryForm] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    // Load professional profile
    const { data: profData } = await supabase
      .from('professionals')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!profData) {
      toast({ title: "Not authorized", description: "You need a professional account.", variant: "destructive" });
      navigate('/');
      return;
    }

    setProfile(profData as Professional);

    // Load exercises
    const { data: exData } = await supabase
      .from('wellness_exercises')
      .select('*')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });
    setExercises((exData as WellnessExercise[]) || []);

    // Load stories
    const { data: stData } = await supabase
      .from('stories')
      .select('*')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });
    setStories((stData as Story[]) || []);

    // Load messages
    const { data: msgData } = await supabase
      .from('direct_messages')
      .select('*')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false });
    setMessages((msgData as Message[]) || []);

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-safe-lavender flex items-center justify-center">
          <Shield className="w-8 h-8 text-accent-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{profile?.full_name}</h1>
          <p className="text-muted-foreground">{profile?.title}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { id: 'overview', label: 'Overview', icon: Shield },
          { id: 'exercises', label: 'Exercises', icon: Sparkles },
          { id: 'stories', label: 'Stories', icon: BookHeart },
          { id: 'messages', label: `Messages ${messages.filter(m => !m.is_read).length > 0 ? `(${messages.filter(m => !m.is_read).length})` : ''}`, icon: MessageCircle },
        ].map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'safe' : 'outline'}
            onClick={() => setActiveTab(tab.id as any)}
            className="gap-2"
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-3 gap-4 animate-slide-up">
          <StatCard title="Exercises Created" value={exercises.length} icon={Sparkles} color="bg-safe-sky" />
          <StatCard title="Stories Shared" value={stories.length} icon={BookHeart} color="bg-safe-coral-light" />
          <StatCard title="Messages" value={messages.length} icon={MessageCircle} color="bg-safe-lavender" />
        </div>
      )}

      {activeTab === 'exercises' && (
        <ExercisesTab
          exercises={exercises}
          userId={user?.id || ''}
          onRefresh={loadData}
          showForm={showExerciseForm}
          setShowForm={setShowExerciseForm}
        />
      )}

      {activeTab === 'stories' && (
        <StoriesTab
          stories={stories}
          userId={user?.id || ''}
          onRefresh={loadData}
          showForm={showStoryForm}
          setShowForm={setShowStoryForm}
        />
      )}

      {activeTab === 'messages' && (
        <MessagesTab messages={messages} userId={user?.id || ''} onRefresh={loadData} />
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-3xl font-semibold">{value}</p>
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  );
}

function ExercisesTab({ exercises, userId, onRefresh, showForm, setShowForm }: any) {
  const { toast } = useToast();
  const [form, setForm] = useState({ title: '', description: '', instructions: '', category: 'breathing', icon: '🌬️' });
  const [saving, setSaving] = useState(false);

  const ICONS = ['🌬️', '🧘', '💭', '🎯', '💚', '🌊', '🌸', '✨'];
  const CATEGORIES = ['breathing', 'grounding', 'mindfulness', 'gratitude', 'relaxation'];

  const saveExercise = async () => {
    if (!form.title || !form.description || !form.instructions) return;
    setSaving(true);

    const { error } = await supabase.from('wellness_exercises').insert({
      author_id: userId,
      title: form.title,
      description: form.description,
      instructions: form.instructions,
      category: form.category,
      icon: form.icon,
    });

    if (error) {
      toast({ title: "Error", description: "Failed to save exercise.", variant: "destructive" });
    } else {
      toast({ title: "Exercise created!" });
      setForm({ title: '', description: '', instructions: '', category: 'breathing', icon: '🌬️' });
      setShowForm(false);
      onRefresh();
    }
    setSaving(false);
  };

  const deleteExercise = async (id: string) => {
    await supabase.from('wellness_exercises').delete().eq('id', id);
    onRefresh();
  };

  return (
    <div className="animate-slide-up">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Your Wellness Exercises</h2>
        <Button variant="safe" size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Add Exercise'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl p-5 border border-border mb-6 space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Exercise name" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description" />
          </div>
          <div className="space-y-2">
            <Label>Instructions</Label>
            <Textarea value={form.instructions} onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))} placeholder="Step-by-step instructions..." className="min-h-[100px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-muted border-0">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex gap-1 flex-wrap">
                {ICONS.map(i => (
                  <button key={i} type="button" onClick={() => setForm(p => ({ ...p, icon: i }))} className={`text-xl p-1 rounded ${form.icon === i ? 'bg-primary' : 'hover:bg-muted'}`}>{i}</button>
                ))}
              </div>
            </div>
          </div>
          <Button variant="safe" onClick={saveExercise} disabled={saving} className="w-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Exercise'}
          </Button>
        </div>
      )}

      {exercises.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No exercises yet. Create your first one!</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {exercises.map((ex: any) => (
            <div key={ex.id} className="bg-card rounded-xl p-4 border border-border relative group">
              <button onClick={() => deleteExercise(ex.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </button>
              <span className="text-2xl">{ex.icon}</span>
              <h3 className="font-medium mt-2">{ex.title}</h3>
              <p className="text-sm text-muted-foreground">{ex.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StoriesTab({ stories, userId, onRefresh, showForm, setShowForm }: any) {
  const { toast } = useToast();
  const [form, setForm] = useState({ title: '', description: '', category: 'Mental Health' });
  const [saving, setSaving] = useState(false);

  const saveStory = async () => {
    if (!form.title || !form.description) return;
    setSaving(true);

    // Create a simple story structure
    const content = {
      scenes: [
        { id: 'start', text: 'This is the beginning of your story. Edit this to add your narrative.', choices: [{ text: 'Continue', nextSceneId: 'end' }] },
        { id: 'end', text: 'Thank you for reading.', reflection: 'What did this story make you think about?', isEnding: true }
      ]
    };

    const { error } = await supabase.from('stories').insert({
      author_id: userId,
      title: form.title,
      description: form.description,
      category: form.category,
      content,
      is_professional_content: true,
    });

    if (error) {
      toast({ title: "Error", description: "Failed to save story.", variant: "destructive" });
    } else {
      toast({ title: "Story created!" });
      setForm({ title: '', description: '', category: 'Mental Health' });
      setShowForm(false);
      onRefresh();
    }
    setSaving(false);
  };

  const deleteStory = async (id: string) => {
    await supabase.from('stories').delete().eq('id', id);
    onRefresh();
  };

  return (
    <div className="animate-slide-up">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Your Stories</h2>
        <Button variant="safe" size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Add Story'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl p-5 border border-border mb-6 space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Story title" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What is this story about?" />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g., Anxiety, Family, Self-Care" />
          </div>
          <Button variant="safe" onClick={saveStory} disabled={saving} className="w-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Story'}
          </Button>
        </div>
      )}

      {stories.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No stories yet. Share your first one!</p>
      ) : (
        <div className="space-y-4">
          {stories.map((story: any) => (
            <div key={story.id} className="bg-card rounded-xl p-4 border border-border relative group">
              <button onClick={() => deleteStory(story.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </button>
              <span className="text-xs text-primary">{story.category}</span>
              <h3 className="font-medium">{story.title}</h3>
              <p className="text-sm text-muted-foreground">{story.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MessagesTab({ messages, userId, onRefresh }: any) {
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [reply, setReply] = useState('');
  const { toast } = useToast();

  const sendReply = async () => {
    if (!reply.trim() || !selectedMessage) return;

    await supabase.from('direct_messages').insert({
      sender_id: userId,
      recipient_id: selectedMessage.sender_id,
      content: reply.trim(),
    });

    // Mark as read
    await supabase.from('direct_messages').update({ is_read: true }).eq('id', selectedMessage.id);

    setReply('');
    setSelectedMessage(null);
    onRefresh();
    toast({ title: "Reply sent!" });
  };

  return (
    <div className="animate-slide-up">
      <h2 className="text-lg font-medium mb-4">Messages from Users</h2>

      {messages.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No messages yet.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((msg: any) => (
            <div
              key={msg.id}
              onClick={() => setSelectedMessage(msg)}
              className={`bg-card rounded-xl p-4 border cursor-pointer transition-colors ${
                msg.is_read ? 'border-border' : 'border-primary bg-safe-sage-light'
              }`}
            >
              <div className="flex justify-between items-start">
                <p className="text-sm">{msg.content}</p>
                {!msg.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(msg.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {selectedMessage && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full border border-border shadow-medium">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-medium">Reply to Message</h3>
              <button onClick={() => setSelectedMessage(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-muted rounded-lg p-3 mb-4">
              <p className="text-sm">{selectedMessage.content}</p>
            </div>
            <Textarea
              value={reply}
              onChange={e => setReply(e.target.value)}
              placeholder="Write your reply..."
              className="mb-4"
            />
            <Button variant="safe" onClick={sendReply} className="w-full">
              Send Reply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
