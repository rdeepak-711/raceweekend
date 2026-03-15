'use client';

import { useActionState } from 'react';
import { submitContactForm, ContactFormState } from '@/app/contact/actions';
import { motion } from 'framer-motion';

const initialState: ContactFormState = {
  errors: {},
  message: null,
  success: false,
};

export default function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState);

  if (state.success) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-2xl bg-[var(--accent-teal)]/10 border border-[var(--accent-teal)]/20 text-center"
      >
        <div className="text-4xl mb-4">🏁</div>
        <h3 className="font-display font-black text-2xl text-white uppercase italic mb-2">Message Received</h3>
        <p className="text-[var(--text-secondary)]">{state.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 text-sm font-bold text-[var(--accent-teal)] hover:underline"
        >
          Send another message
        </button>
      </motion.div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-2 ml-1">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-5 py-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-white placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-teal)]/50 focus:outline-none transition-colors"
            placeholder="Max Verstappen"
          />
          {state.errors?.name && (
            <p className="mt-1 text-xs text-red-500">{state.errors.name[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-2 ml-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full px-5 py-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-white placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-teal)]/50 focus:outline-none transition-colors"
            placeholder="max@redbull.com"
          />
          {state.errors?.email && (
            <p className="mt-1 text-xs text-red-500">{state.errors.email[0]}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-2 ml-1">
          Subject
        </label>
        <select
          id="subject"
          name="subject"
          className="w-full px-5 py-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-white focus:border-[var(--accent-teal)]/50 focus:outline-none transition-colors appearance-none"
        >
          <option value="Feature Request">💡 Feature Request</option>
          <option value="Bug Report">🐛 Bug Report</option>
          <option value="Partnership">🤝 Partnership</option>
          <option value="General Inquiry">🏁 General Inquiry</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-2 ml-1">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full px-5 py-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-white placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-teal)]/50 focus:outline-none transition-colors resize-none"
          placeholder="What's on your mind?"
        ></textarea>
        {state.errors?.message && (
          <p className="mt-1 text-xs text-red-500">{state.errors.message[0]}</p>
        )}
      </div>

      {state.message && !state.success && (
        <p className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-5 rounded-xl bg-white text-black font-black uppercase tracking-[0.2em] text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl"
      >
        {isPending ? 'INITIALIZING SEND...' : 'SEND MESSAGE →'}
      </button>
    </form>
  );
}
