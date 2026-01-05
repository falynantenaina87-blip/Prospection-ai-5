import React, { useState, useCallback } from 'react';
import { Download, Bot, Sparkles, Map, ShieldCheck } from 'lucide-react';
import SearchForm from './components/SearchForm';
import LeadRow from './components/LeadRow';
import { Lead, SearchParams } from './types';
import { searchLeads, enrichLeadWithAI } from './services/geminiService';
import { validateLeadData } from './utils/validation';

const App: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (params: SearchParams) => {
    setIsSearching(true);
    setLeads([]);
    setError(null);
    setSearchParams(params);

    try {
      const results = await searchLeads(params.activity, params.city);
      if (results.length === 0) {
        setError("No leads found in this area via Maps Grounding. Try a larger city or different keyword.");
      } else {
        setLeads(results);
      }
    } catch (err) {
      setError("Failed to fetch leads from Google Maps. Please check your API key and quota.");
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleEnrichAll = useCallback(async () => {
    if (!searchParams) return;
    setIsAnalyzing(true);

    const leadsToProcess = leads.filter(l => l.status === 'discovered');
    const BATCH_SIZE = 3;
    
    for (let i = 0; i < leadsToProcess.length; i += BATCH_SIZE) {
      const batch = leadsToProcess.slice(i, i + BATCH_SIZE);
      
      await Promise.all(batch.map(async (lead) => {
        setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: 'analyzing' } : l));

        const data = await enrichLeadWithAI(lead, searchParams.activity);

        setLeads(prev => prev.map(l => {
          if (l.id === lead.id) {
             const updatedLead = { 
              ...l, 
              ...data, 
              mobileFriendly: data.isMobileFriendly,
              status: 'completed' as const
            };
            // Apply Rigorous Validation immediately after enrichment
            return validateLeadData(updatedLead);
          }
          return l;
        }));
      }));
    }

    setIsAnalyzing(false);
  }, [leads, searchParams]);

  // Updated to be Google Sheets Compatible (CSV)
  const exportToGoogleSheetsCSV = () => {
    try {
      // Validate all leads before export just in case
      const validatedLeads = leads.map(validateLeadData);

      const headers = [
        "Nom de l'entreprise", 
        "Adresse", 
        "Site Web (Validé)", 
        "Email (Validé)", 
        "Téléphone (Nettoyé)", 
        "Mobile Friendly", 
        "Point Faible", 
        "Pitch Commercial"
      ];
      
      const rows = validatedLeads.map(l => [
        `"${l.name.replace(/"/g, '""')}"`,
        `"${l.address.replace(/"/g, '""')}"`,
        `"${l.cleanWebsite || l.website || ''}"`,
        `"${l.cleanEmail || l.email || ''}"`,
        `"${l.cleanPhone || l.phone || ''}"`,
        l.mobileFriendly ? "Oui" : "Non",
        `"${l.weakness?.replace(/"/g, '""') || ''}"`,
        `"${l.pitch?.replace(/"/g, '""') || ''}"`
      ]);

      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" // UTF-8 BOM for Excel/Sheets compatibility
        + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `prospects_${searchParams?.city || 'export'}_sheets_ready.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Export failed", e);
      setError("Erreur lors de la génération du fichier CSV.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Bot className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Prospection IA
            </h1>
          </div>
          <div className="text-sm text-gray-500 hidden md:block">
            Powered by Gemini 2.5 Flash & Google Maps
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Expert Digital Audit Tool</h2>
          <p className="text-gray-600">
            Extract leads, validate data rigorously, and generate expert sales pitches.
          </p>
        </div>

        <SearchForm onSearch={handleSearch} isLoading={isSearching} />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <Map className="w-5 h-5" />
            {error}
          </div>
        )}

        {leads.length > 0 && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">Results:</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {leads.length} found
                </span>
              </div>
              
              <div className="flex gap-3">
                 {!isAnalyzing && leads.some(l => l.status === 'discovered') && (
                  <button 
                    onClick={handleEnrichAll}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    Enrich & Analyze
                  </button>
                 )}
                 {isAnalyzing && (
                   <button disabled className="flex items-center gap-2 px-4 py-2 bg-indigo-400 text-white text-sm font-medium rounded-lg cursor-wait">
                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                     Analysing...
                   </button>
                 )}
                 
                 <button 
                  onClick={exportToGoogleSheetsCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                  title="Export validated data for Google Sheets"
                 >
                   <Download className="w-4 h-4" />
                   Google Sheets Export
                 </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                    <th className="p-4 font-semibold w-1/4">Business Info</th>
                    <th className="p-4 font-semibold w-1/5">Digital Presence (Validated)</th>
                    <th className="p-4 font-semibold w-1/6">Audit</th>
                    <th className="p-4 font-semibold">Expert Pitch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map((lead) => (
                    <LeadRow key={lead.id} lead={lead} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
