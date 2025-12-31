import { useEffect, useState } from 'react';
import { X, Loader2, CheckCircle2, AlertCircle, Clock, Database, Brain, Shield, Sparkles } from 'lucide-react';

/**
 * AI Progress Modal
 * Shows real-time progress of AI Agent execution with all phases, tool calls, and reasoning
 */
const AIProgressModal = ({ isOpen, onClose, sessionId }) => {
  const [events, setEvents] = useState([]);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !sessionId) return;

    // Reset state
    setEvents([]);
    setCurrentPhase(null);
    setIsComplete(false);
    setError(null);

    // Connect to Server-Sent Events
    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_URL}/api/ai/agent/progress/${sessionId}`,
      { withCredentials: true }
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        setEvents(prev => [...prev, {
          ...data,
          timestamp: new Date().toISOString()
        }]);

        if (data.type === 'phase') {
          setCurrentPhase(data.phase);
        }

        if (data.type === 'complete') {
          setIsComplete(true);
          setCurrentPhase(null);
          
          // Resolve the promise with the result
          if (window._agentPromises && window._agentPromises[sessionId]) {
            window._agentPromises[sessionId].resolve(data.result);
            delete window._agentPromises[sessionId];
          }
        }

        if (data.type === 'error') {
          setError(data.message);
          setIsComplete(true);
          
          // Reject the promise with the error
          if (window._agentPromises && window._agentPromises[sessionId]) {
            window._agentPromises[sessionId].reject(new Error(data.message));
            delete window._agentPromises[sessionId];
          }
        }
      } catch (err) {
        console.error('Failed to parse SSE event:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err);
      eventSource.close();
      setError('Connection to AI Agent lost');
      
      // Reject the promise on connection error
      if (window._agentPromises && window._agentPromises[sessionId]) {
        window._agentPromises[sessionId].reject(new Error('Connection to AI Agent lost'));
        delete window._agentPromises[sessionId];
      }
    };

    return () => {
      eventSource.close();
    };
  }, [isOpen, sessionId]);

  if (!isOpen) return null;

  const getPhaseIcon = (phase) => {
    const icons = {
      'planning': Brain,
      'data_gathering': Database,
      'generation': Sparkles,
      'validation': Shield,
      'refinement': Clock
    };
    return icons[phase] || Loader2;
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'complete': return CheckCircle2;
      case 'error': return AlertCircle;
      case 'phase': return Clock;
      case 'tool_call': return Database;
      case 'ai_response': return Brain;
      default: return Loader2;
    }
  };

  const getEventColor = (eventType) => {
    switch (eventType) {
      case 'complete': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'phase': return 'text-blue-600';
      case 'tool_call': return 'text-purple-600';
      case 'ai_response': return 'text-indigo-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            {isComplete ? (
              error ? (
                <AlertCircle className="w-6 h-6 text-red-600" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              )
            ) : (
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                AI Agent Progress
              </h2>
              {currentPhase && (
                <p className="text-sm text-gray-600">
                  Phase: {currentPhase.replace('_', ' ').toUpperCase()}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={!isComplete}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Phase Progress Bar */}
        {!isComplete && currentPhase && (
          <div className="px-6 pt-4">
            <div className="flex items-center gap-2 mb-2">
              {['planning', 'data_gathering', 'generation', 'validation', 'refinement'].map((phase) => {
                const Icon = getPhaseIcon(phase);
                const isActive = phase === currentPhase;
                const isPast = events.some(e => e.phase === phase && e.type === 'phase' && e.status === 'complete');
                
                return (
                  <div
                    key={phase}
                    className={`flex-1 flex items-center gap-2 p-2 rounded-lg transition-all ${
                      isActive ? 'bg-blue-100 border-2 border-blue-500' :
                      isPast ? 'bg-green-50 border-2 border-green-300' :
                      'bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${
                      isActive ? 'text-blue-600 animate-spin' :
                      isPast ? 'text-green-600' :
                      'text-gray-400'
                    }`} />
                    <span className={`text-xs font-medium ${
                      isActive ? 'text-blue-700' :
                      isPast ? 'text-green-700' :
                      'text-gray-500'
                    }`}>
                      {phase.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Events Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {events.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p>Connecting to AI Agent...</p>
              </div>
            </div>
          ) : (
            events.map((event, index) => {
              const Icon = getEventIcon(event.type);
              const colorClass = getEventColor(event.type);

              return (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-300 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colorClass}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${colorClass}`}>
                          {event.type.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      {event.message && (
                        <p className="text-sm text-gray-700 mb-2">
                          {event.message}
                        </p>
                      )}

                      {/* Tool Call Details */}
                      {event.type === 'tool_call' && event.tool && (
                        <div className="mt-2 bg-white rounded p-3 border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Database className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-700">
                              {event.tool.name}
                            </span>
                          </div>
                          {event.tool.parameters && (
                            <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                              {JSON.stringify(event.tool.parameters, null, 2)}
                            </pre>
                          )}
                          {event.tool.result && (
                            <div className="mt-2">
                              <span className="text-xs font-medium text-gray-600">Result:</span>
                              <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto mt-1">
                                {typeof event.tool.result === 'string' 
                                  ? event.tool.result.substring(0, 200) + (event.tool.result.length > 200 ? '...' : '')
                                  : JSON.stringify(event.tool.result, null, 2).substring(0, 200) + '...'
                                }
                              </pre>
                            </div>
                          )}
                        </div>
                      )}

                      {/* AI Response Details */}
                      {event.type === 'ai_response' && event.content && (
                        <div className="mt-2 bg-indigo-50 rounded p-3 border border-indigo-200">
                          <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                            {event.content.substring(0, 300)}
                            {event.content.length > 300 && '...'}
                          </pre>
                        </div>
                      )}

                      {/* Phase Completion */}
                      {event.type === 'phase' && event.status === 'complete' && event.data && (
                        <div className="mt-2 text-xs text-gray-600">
                          <span className="font-medium">Duration:</span> {event.data.duration}ms
                        </div>
                      )}

                      {/* Final Result */}
                      {event.type === 'complete' && event.result && (
                        <div className="mt-2 bg-green-50 rounded p-3 border border-green-200">
                          <div className="text-sm font-medium text-green-700 mb-2">
                            ✓ Process Complete
                          </div>
                          <div className="text-xs text-gray-700 space-y-1">
                            <div>Exercises Generated: {event.result.exerciseCount || 0}</div>
                            <div>Evidence Sources: {event.result.evidenceCount || 0}</div>
                            <div>Total Duration: {event.result.duration}ms</div>
                          </div>
                        </div>
                      )}

                      {/* Error Details */}
                      {event.type === 'error' && (
                        <div className="mt-2 bg-red-50 rounded p-3 border border-red-200">
                          <p className="text-sm text-red-700 font-medium">
                            {event.message}
                          </p>
                          {event.error && (
                            <pre className="text-xs text-red-600 mt-2 overflow-x-auto">
                              {event.error}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {isComplete && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {error ? (
                  <span className="text-red-600 font-medium">Process failed</span>
                ) : (
                  <span className="text-green-600 font-medium">Process completed successfully</span>
                )}
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIProgressModal;
