import React from 'react';
import { Calendar, Github, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-base">
                Event<span className="text-indigo-600">Hub</span>
              </p>
              <p className="text-xs text-slate-500">MERN Stack Event Promotion & Discovery Workflow</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
            <span>Role-Based Access Control</span>
            <span>•</span>
            <span>Real-time Filtering</span>
            <span>•</span>
            <span>Production Architecture</span>
          </div>

          <p className="text-xs text-slate-400 flex items-center gap-1">
            Built for Technical Interview Evaluation
          </p>
        </div>
      </div>
    </footer>
  );
};

