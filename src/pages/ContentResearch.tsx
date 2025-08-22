import React, { useState } from 'react';
import { useResearchStore } from '@/store/research';
import { runResearch } from '@/lib/research';
import { batchGenerate } from '@/lib/generate';
import { useBrandStore } from '@/store/brands';
import { useProviderStore } from '@/store/providers';

export default function ContentResearchPage() {
  const { query, setQuery, sources, toggleSource, ideas, setIdeas } = useResearchStore();
  const { activeBrand } = useBrandStore();
  const { config: providerConfig } = useProviderStore();
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [count, setCount] = useState(5);

  async function onSearch() {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const results = await runResearch(query, sources);
      setIdeas(results);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Research failed';
      alert(errorMessage);
    } finally { setLoading(false); }
  }

  async function onUseForGeneration() {
    if (!activeBrand) { alert('Create or select a brand first.'); return; }
    if (!ideas.length) { alert('Run research first.'); return; }
    setGenLoading(true);
    try {
      await batchGenerate(['caption','post','image','video'], count, activeBrand.id, providerConfig);
      alert('Generation triggered. Check the Generated tab.');
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Generation failed';
      alert(errorMessage);
    } finally { setGenLoading(false); }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Content Research</h1>

      <div className="flex gap-2 items-center">
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="Search topic, niche, or competitor..."
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
        />
        <button className="px-4 py-2 rounded bg-black text-white" onClick={onSearch} disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {(['tavily','reddit','hn','wikipedia'] as const).map(s => (
          <label key={s} className="flex items-center gap-2 text-sm border rounded px-3 py-2">
            <input type="checkbox" checked={sources[s]} onChange={()=>toggleSource(s)} />
            {s.toUpperCase()}
          </label>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Ideas ({ideas.length})</h2>
          <div className="flex items-center gap-3">
            <label className="text-sm">Count
              <input type="number" min={1} max={10} value={count} onChange={(e)=>setCount(parseInt(e.target.value||'5',10))} className="ml-2 w-16 border rounded px-2 py-1"/>
            </label>
            <button className="px-3 py-2 rounded bg-indigo-600 text-white" onClick={onUseForGeneration} disabled={genLoading || !ideas.length}>
              {genLoading ? 'Generating…' : 'Use for Generation'}
            </button>
          </div>
        </div>

        <ul className="divide-y border rounded">
          {ideas.map((idea)=> (
            <li key={idea.id} className="p-3 space-y-1">
              <div className="font-medium">{idea.topic}</div>
              <div className="text-sm text-gray-600">{idea.angle}</div>
              {!!idea.keywords?.length && <div className="text-xs text-gray-500">Keywords: {idea.keywords.join(', ')}</div>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
