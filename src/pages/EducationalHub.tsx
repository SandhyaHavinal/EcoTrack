import React, { useState } from 'react';
import { useEcoTrack } from '../context/EcoTrackContext';
import { BookOpen, Search, User, Clock, ArrowLeft } from 'lucide-react';
import type { EducationalArticle } from '../types';

const EducationalHub: React.FC = () => {
  const { articles } = useEcoTrack();
  const [selectedArticle, setSelectedArticle] = useState<EducationalArticle | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'guide' | 'news' | 'tips'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = articles.filter(art => {
    const matchesCategory = categoryFilter === 'all' || art.category === categoryFilter;
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.round(words / wordsPerMinute));
  };

  // Basic Markdown-like renderer for article contents
  const renderArticleMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3 font-outfit">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('#### ')) {
        return <h4 key={idx} className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-4 mb-2">{line.replace('#### ', '')}</h4>;
      }
      if (line.startsWith('* ') || line.startsWith('*   ')) {
        return (
          <li key={idx} className="ml-5 list-disc text-sm text-slate-600 dark:text-slate-300 py-1">
            {line.replace(/^\*\s+/, '')}
          </li>
        );
      }
      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ') || line.startsWith('6. ') || line.startsWith('7. ') || line.startsWith('8. ') || line.startsWith('9. ') || line.startsWith('10. ')) {
        return (
          <li key={idx} className="ml-5 list-decimal text-sm text-slate-600 dark:text-slate-300 py-1">
            {line.replace(/^\d+\.\s+/, '')}
          </li>
        );
      }
      if (line.trim()) {
        const boldRegex = /\*\*(.*?)\*\*/g;
        const parts = [];
        let lastIndex = 0;
        let match;
        
        while ((match = boldRegex.exec(line)) !== null) {
          if (match.index > lastIndex) {
            parts.push(line.substring(lastIndex, match.index));
          }
          parts.push(<strong key={match.index} className="font-bold text-slate-950 dark:text-white">{match[1]}</strong>);
          lastIndex = boldRegex.lastIndex;
        }
        
        if (lastIndex < line.length) {
          parts.push(line.substring(lastIndex));
        }

        return <p key={idx} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed py-1.5">{parts.length > 0 ? parts : line}</p>;
      }
      return <div key={idx} className="h-2"></div>;
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Article Reader View */}
      {selectedArticle ? (
        <div className="space-y-6 max-w-3xl mx-auto">
          <button
            onClick={() => setSelectedArticle(null)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Eco Hub</span>
          </button>

          {/* Article Image Banner */}
          <div className="w-full h-[250px] md:h-[350px] rounded-3xl overflow-hidden relative border border-slate-200 dark:border-slate-800 shadow-md">
            <img 
              src={selectedArticle.coverImage} 
              alt={selectedArticle.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
            
            {/* Title Overlay */}
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
              <span className="px-2.5 py-0.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-[10px] uppercase font-bold tracking-wider">
                {selectedArticle.category}
              </span>
              <h2 className="font-outfit text-2xl md:text-4xl font-extrabold leading-tight">
                {selectedArticle.title}
              </h2>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 items-center text-xs text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-500" />
              <span>By {selectedArticle.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>{getReadingTime(selectedArticle.content)} min read</span>
            </div>
            <div>
              <span>Published: {new Date(selectedArticle.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Article Content */}
          <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 pb-12">
            {renderArticleMarkdown(selectedArticle.content)}
          </div>
        </div>
      ) : (
        <>
          {/* Main Grid View */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-outfit text-3xl font-extrabold tracking-tight">Eco <span className="eco-gradient-text font-bold">Educational Hub</span></h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Learn how climate footprints work and read guides to adopt a zero-waste lifestyle.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full glass-input pl-9 pr-4 py-2 text-xs"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Articles' },
              { id: 'guide', label: 'Guides' },
              { id: 'news', label: 'News' },
              { id: 'tips', label: 'Tips' }
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setCategoryFilter(pill.id as any)}
                className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                  categoryFilter === pill.id 
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/10' 
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Articles Grid */}
          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <div 
                  key={article.articleId}
                  onClick={() => setSelectedArticle(article)}
                  className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md group cursor-pointer hover:translate-y-[-4px] transition-all duration-300"
                >
                  {/* Cover Image */}
                  <div className="w-full h-48 overflow-hidden relative">
                    <img 
                      src={article.coverImage} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-full border border-white/20 bg-slate-950/50 backdrop-blur-md text-[9px] uppercase font-extrabold tracking-wider text-white">
                        {article.category}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-2">
                    <h3 className="font-outfit font-bold text-base group-hover:text-emerald-500 transition-colors line-clamp-1">
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {article.summary}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-emerald-500" />
                        <span>By {article.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{getReadingTime(article.content)} min read</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-100/5">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">No articles found</h4>
              <p className="text-xs text-slate-500 mt-1">Try searching for other keywords or clear filter filters.</p>
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default EducationalHub;
