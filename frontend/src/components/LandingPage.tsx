import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="header fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gradient">CodeVision</h1>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary focus-ring"
          >
            Login
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24">
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto text-center animate-fade-in">
            <h1 className="hero-title mb-6">
              Code Visualization Made Simple
            </h1>
            <p className="hero-subtitle text-slate-600">
              Understand complex codebases instantly with AI-powered visualization and analysis
            </p>
            
            <div className="grid grid-auto-fit mt-16">
              <div className="feature-card">
                <h3 className="text-xl font-semibold mb-4">Function Mapping</h3>
                <p className="text-slate-600">
                  Visualize relationships between functions and trace code flow through your entire codebase
                </p>
              </div>

              <div className="feature-card">
                <h3 className="text-xl font-semibold mb-4">AI Context</h3>
                <p className="text-slate-600">
                  Get intelligent explanations of code functionality powered by advanced language models
                </p>
              </div>

              <div className="feature-card">
                <h3 className="text-xl font-semibold mb-4">Quick Onboarding</h3>
                <p className="text-slate-600">
                  Help new team members understand your codebase structure and patterns rapidly
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary mt-16 focus-ring"
            >
              Get Started
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;