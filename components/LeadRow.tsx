import React from 'react';
import { Lead } from '../types';
import { ExternalLink, Mail, Smartphone, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface LeadRowProps {
  lead: Lead;
}

const LeadRow: React.FC<LeadRowProps> = ({ lead }) => {
  const isAnalyzed = lead.status === 'completed';
  const isAnalyzing = lead.status === 'analyzing';

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="p-4">
        <div className="font-semibold text-gray-900">{lead.name}</div>
        <div className="text-sm text-gray-500 truncate max-w-xs">{lead.address}</div>
        {lead.mapUri && (
          <a href={lead.mapUri} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline inline-flex items-center gap-1 mt-1">
            View on Maps <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </td>
      
      <td className="p-4">
        {isAnalyzing && <div className="text-blue-500 text-sm animate-pulse">Scanning website...</div>}
        {isAnalyzed && (
          <div className="space-y-1">
            {lead.website && lead.website !== 'Not found' ? (
              <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:underline flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> {new URL(lead.website).hostname}
              </a>
            ) : (
              <span className="text-sm text-gray-400 flex items-center gap-1"><XCircle className="w-3 h-3" /> No Website</span>
            )}
            
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Mail className="w-3 h-3" /> {lead.email || 'N/A'}
            </div>
          </div>
        )}
        {!isAnalyzed && !isAnalyzing && <span className="text-gray-400 text-sm">-</span>}
      </td>

      <td className="p-4">
        {isAnalyzed ? (
          <div className="flex items-center gap-2">
             {lead.mobileFriendly ? (
               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                 <CheckCircle className="w-3 h-3 mr-1" /> Optimized
               </span>
             ) : (
               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                 <AlertTriangle className="w-3 h-3 mr-1" /> Not Mobile Friendly
               </span>
             )}
          </div>
        ) : (
           <span className="text-gray-400 text-sm">-</span>
        )}
      </td>

      <td className="p-4 w-1/3">
        {isAnalyzed ? (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
             <div className="text-xs font-bold text-blue-800 uppercase mb-1 tracking-wider">AI Generated Pitch</div>
             <p className="text-sm text-gray-700 italic">"{lead.pitch}"</p>
             <div className="mt-2 text-xs text-red-600 font-medium">Weakness: {lead.weakness}</div>
          </div>
        ) : (
          <span className="text-gray-400 text-sm italic">Waiting for analysis...</span>
        )}
      </td>
    </tr>
  );
};

export default LeadRow;
