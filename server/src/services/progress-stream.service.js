const EventEmitter = require('events');

/**
 * Progress Stream Service
 * Manages Server-Sent Events for AI Agent progress tracking
 */
class ProgressStreamService {
  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(100); // Support many concurrent streams
    this.streams = new Map(); // sessionId -> response object
  }

  /**
   * Register SSE connection for a session
   */
  registerStream(sessionId, res, req) {
    console.log(`[ProgressStream] Client connected: ${sessionId}`);
    
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Send initial connection event
    this.sendEvent(res, { type: 'connected', sessionId });

    // Create event handler for this session
    const eventHandler = (data) => {
      if (data.sessionId === sessionId) {
        this.sendEvent(res, data);
      }
    };

    // Register handler and store stream
    this.emitter.on('progress', eventHandler);
    this.streams.set(sessionId, { res, eventHandler });

    // Clean up on disconnect
    req.on('close', () => {
      console.log(`[ProgressStream] Client disconnected: ${sessionId}`);
      this.emitter.removeListener('progress', eventHandler);
      this.streams.delete(sessionId);
    });
  }

  /**
   * Send an event to SSE client
   */
  sendEvent(res, data) {
    try {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      console.error('[ProgressStream] Failed to send event:', error);
    }
  }

  /**
   * Emit progress event for a session
   */
  emit(sessionId, data) {
    this.emitter.emit('progress', { ...data, sessionId, timestamp: new Date().toISOString() });
  }

  /**
   * Emit phase start event
   */
  emitPhaseStart(sessionId, phase) {
    this.emit(sessionId, {
      type: 'phase',
      phase,
      status: 'started',
      message: `Starting ${phase.replace('_', ' ')} phase`
    });
  }

  /**
   * Emit phase complete event
   */
  emitPhaseComplete(sessionId, phase, duration) {
    this.emit(sessionId, {
      type: 'phase',
      phase,
      status: 'complete',
      message: `Completed ${phase.replace('_', ' ')} phase`,
      data: { duration }
    });
  }

  /**
   * Emit tool call event
   */
  emitToolCall(sessionId, toolName, parameters, result) {
    this.emit(sessionId, {
      type: 'tool_call',
      message: `Executing tool: ${toolName}`,
      tool: {
        name: toolName,
        parameters,
        result: result ? this.truncateResult(result) : null
      }
    });
  }

  /**
   * Emit AI response event
   */
  emitAIResponse(sessionId, content, context = '') {
    this.emit(sessionId, {
      type: 'ai_response',
      message: context || 'AI response received',
      content: typeof content === 'string' ? content : JSON.stringify(content, null, 2)
    });
  }

  /**
   * Emit completion event
   */
  emitComplete(sessionId, result) {
    this.emit(sessionId, {
      type: 'complete',
      message: 'Process completed successfully',
      result
    });
  }

  /**
   * Emit error event
   */
  emitError(sessionId, error) {
    this.emit(sessionId, {
      type: 'error',
      message: error.message || 'An error occurred',
      error: error.stack || error.toString()
    });
  }

  /**
   * Truncate large results for streaming
   */
  truncateResult(result) {
    const str = typeof result === 'string' ? result : JSON.stringify(result);
    const maxLength = 500;
    
    if (str.length <= maxLength) {
      return result;
    }
    
    return str.substring(0, maxLength) + '... (truncated)';
  }

  /**
   * Close stream for a session
   */
  closeStream(sessionId) {
    const stream = this.streams.get(sessionId);
    if (stream) {
      this.emitter.removeListener('progress', stream.eventHandler);
      this.streams.delete(sessionId);
      console.log(`[ProgressStream] Stream closed: ${sessionId}`);
    }
  }

  /**
   * Get active stream count
   */
  getActiveStreamCount() {
    return this.streams.size;
  }
}

// Singleton instance
const progressStreamService = new ProgressStreamService();

module.exports = progressStreamService;
