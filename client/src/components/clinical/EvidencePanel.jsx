import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ExternalLink, BookOpen, FileText, Activity } from 'lucide-react';

/**
 * EvidencePanel Component
 * Displays research evidence sources from AI-generated content
 * Shows PubMed articles with clickable links and study type indicators
 */
const EvidencePanel = ({ metadata }) => {
  if (!metadata?.evidenceSources || metadata.evidenceSources.length === 0) {
    return null;
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'systematicReviews':
        return <BookOpen className="h-4 w-4" />;
      case 'randomizedTrials':
        return <Activity className="h-4 w-4" />;
      case 'guidelines':
        return <FileText className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      systematicReviews: 'Systematic Review',
      randomizedTrials: 'RCT',
      guidelines: 'Guideline'
    };
    return labels[category] || 'Research';
  };

  const getCategoryColor = (category) => {
    const colors = {
      systematicReviews: 'bg-blue-100 text-blue-800',
      randomizedTrials: 'bg-green-100 text-green-800',
      guidelines: 'bg-purple-100 text-purple-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="mt-4 border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-blue-900 flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Evidence Sources
        </CardTitle>
        <p className="text-xs text-blue-700 mt-1">
          This recommendation is based on current research evidence
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {metadata.evidenceSources.map((source, index) => (
          <div 
            key={source.pmid || index} 
            className="bg-white p-3 rounded-md border border-blue-200 hover:shadow-sm transition-shadow"
          >
            {/* Study Type Badge */}
            {source.category && (
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  variant="secondary"
                  className={`text-xs flex items-center gap-1 ${getCategoryColor(source.category)}`}
                >
                  {getCategoryIcon(source.category)}
                  {getCategoryLabel(source.category)}
                </Badge>
                {source.year && (
                  <span className="text-xs text-gray-500">
                    {source.year}
                  </span>
                )}
              </div>
            )}

            {/* Article Title */}
            <a 
              href={`https://pubmed.ncbi.nlm.nih.gov/${source.pmid}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-start gap-2 group"
            >
              <span className="flex-1">{source.title}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>

            {/* Authors */}
            {source.authors && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                {source.authors}
              </p>
            )}

            {/* PMID */}
            <p className="text-xs text-gray-500 mt-1">
              PMID: {source.pmid}
            </p>
          </div>
        ))}

        {/* Metadata Footer */}
        {metadata.diagnosisCode && (
          <div className="pt-2 border-t border-blue-200 text-xs text-blue-700">
            <span className="font-medium">Diagnosis:</span> {metadata.diagnosisCode}
            {metadata.diagnosisDescription && (
              <span className="ml-1">- {metadata.diagnosisDescription}</span>
            )}
          </div>
        )}

        {metadata.validationStatus && (
          <div className="text-xs text-blue-700">
            <span className="font-medium">Validation:</span>{' '}
            {metadata.validationStatus === 'approved' 
              ? '✓ Clinically approved' 
              : '✓ Approved with modifications'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EvidencePanel;
