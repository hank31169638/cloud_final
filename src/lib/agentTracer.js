import { trace, context, SpanStatusCode } from '@opentelemetry/api';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';

/**
 * OpenTelemetry Integration for Agent Tracing
 * Captures agent execution flow for waterfall visualization
 */

class AgentTracer {
  constructor() {
    this.provider = new WebTracerProvider();
    this.provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
    this.provider.register();
    this.tracer = trace.getTracer('nexus-ai-agent-tracer');
    this.traces = [];
  }

  /**
   * Start a new trace for an agent execution
   */
  startTrace(userInput) {
    const traceId = `trace-${Date.now()}`;
    const trace = {
      id: traceId,
      timestamp: new Date().toISOString(),
      userInput,
      steps: [],
      totalDuration: 0,
      status: 'running'
    };

    this.traces.push(trace);
    return traceId;
  }

  /**
   * Add a step to a trace
   */
  addStep(traceId, type, data) {
    const trace = this.traces.find(t => t.id === traceId);
    if (!trace) return;

    const startTime = trace.steps.length > 0 
      ? trace.steps[trace.steps.length - 1].startTime + trace.steps[trace.steps.length - 1].duration
      : 0;

    const step = {
      type, // 'thought', 'tool_call', 'response'
      startTime,
      duration: data.duration || 0,
      ...data
    };

    trace.steps.push(step);
    trace.totalDuration = startTime + step.duration;
  }

  /**
   * Complete a trace
   */
  completeTrace(traceId, status = 'success') {
    const trace = this.traces.find(t => t.id === traceId);
    if (trace) {
      trace.status = status;
    }
  }

  /**
   * Get all traces
   */
  getTraces() {
    return this.traces;
  }

  /**
   * Get a specific trace
   */
  getTrace(traceId) {
    return this.traces.find(t => t.id === traceId);
  }

  /**
   * Create a span for OpenTelemetry
   */
  createSpan(name, attributes = {}) {
    return this.tracer.startSpan(name, {
      attributes
    });
  }

  /**
   * Simulate agent execution with tracing
   */
  async simulateAgentExecution(userInput, callback) {
    const traceId = this.startTrace(userInput);
    const span = this.createSpan('agent_execution', { userInput });

    try {
      // Step 1: Agent Thought
      const thoughtSpan = this.createSpan('agent_thought', { parent: span });
      const thoughtStart = Date.now();
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));
      const thoughtDuration = Date.now() - thoughtStart;
      
      this.addStep(traceId, 'thought', {
        content: 'Analyzing the user query and planning the approach...',
        duration: thoughtDuration
      });
      thoughtSpan.setStatus({ code: SpanStatusCode.OK });
      thoughtSpan.end();

      // Step 2: Tool Call (if needed)
      if (callback?.useTool) {
        const toolSpan = this.createSpan('tool_call', { parent: span });
        const toolStart = Date.now();
        const toolResult = await callback.useTool();
        const toolDuration = Date.now() - toolStart;
        
        this.addStep(traceId, 'tool_call', {
          tool: toolResult.tool,
          params: toolResult.params,
          duration: toolDuration
        });
        toolSpan.setStatus({ code: SpanStatusCode.OK });
        toolSpan.end();

        // Step 3: Process Tool Result
        const processSpan = this.createSpan('process_result', { parent: span });
        const processStart = Date.now();
        await new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 200));
        const processDuration = Date.now() - processStart;
        
        this.addStep(traceId, 'thought', {
          content: 'Processing tool results and formulating response...',
          duration: processDuration
        });
        processSpan.setStatus({ code: SpanStatusCode.OK });
        processSpan.end();
      }

      // Step 4: Final Response
      const responseSpan = this.createSpan('generate_response', { parent: span });
      const responseStart = Date.now();
      const response = callback?.generateResponse ? 
        await callback.generateResponse() : 
        'Response generated successfully';
      const responseDuration = Date.now() - responseStart;
      
      this.addStep(traceId, 'response', {
        content: response,
        duration: responseDuration
      });
      responseSpan.setStatus({ code: SpanStatusCode.OK });
      responseSpan.end();

      this.completeTrace(traceId, 'success');
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();

      return { traceId, success: true };
    } catch (error) {
      this.completeTrace(traceId, 'failed');
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      span.end();
      return { traceId, success: false, error: error.message };
    }
  }
}

// Singleton instance
export const agentTracer = new AgentTracer();

export default AgentTracer;
