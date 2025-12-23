import { BookOpen } from 'lucide-react';

const cards = [
  { title: 'Understanding Emotions', emoji: '🎭', content: 'Emotions are natural responses to life. They're not "good" or "bad" - they're information about what matters to you.' },
  { title: 'Stress vs Anxiety', emoji: '⚡', content: 'Stress is a response to a specific situation. Anxiety is worry about what might happen. Both are manageable with the right tools.' },
  { title: 'Healthy Coping', emoji: '🌱', content: 'Healthy coping helps you process feelings. Unhealthy coping (like avoidance) offers short-term relief but long-term problems.' },
  { title: 'When to Seek Help', emoji: '🤝', content: 'If feelings interfere with daily life for weeks, or you have thoughts of self-harm, reach out to a trusted adult or professional.' },
  { title: 'Self-Compassion', emoji: '💚', content: 'Treat yourself like you would a good friend. Mistakes are part of being human. Be gentle with yourself.' },
  { title: 'Building Resilience', emoji: '🏔️', content: 'Resilience isn\'t about not feeling pain. It\'s about having tools and support to navigate difficult times.' },
];

export default function Learn() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-safe-warm mx-auto mb-4 flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-foreground" />
        </div>
        <h1 className="text-2xl font-semibold mb-2">Learn</h1>
        <p className="text-muted-foreground">Youth-friendly mental health education</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {cards.map((card, i) => (
          <div key={i} className="bg-card rounded-2xl p-6 border border-border shadow-soft animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
            <span className="text-3xl mb-3 block">{card.emoji}</span>
            <h3 className="text-lg font-medium mb-2">{card.title}</h3>
            <p className="text-sm text-muted-foreground">{card.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
