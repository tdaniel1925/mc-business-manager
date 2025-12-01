/**
 * Bland.ai Voice Agent Client
 *
 * This client integrates with Bland.ai for AI-powered voice calling.
 * Documentation: https://docs.bland.ai
 */

export interface BlandCallOptions {
  phoneNumber: string;
  prompt?: string;
  voice?: string;
  transferNumber?: string;
  maxDuration?: number;
  amd?: boolean; // Answering machine detection
  waitForGreeting?: boolean;
  record?: boolean;
  webhookUrl?: string;
  metadata?: Record<string, string>;
}

export interface BlandCallResponse {
  callId: string;
  status: string;
  message?: string;
}

export interface BlandCallStatus {
  callId: string;
  status: "queued" | "ringing" | "in-progress" | "completed" | "failed" | "no-answer" | "busy";
  duration?: number;
  answeredBy?: "human" | "machine";
  transcript?: string;
  summary?: string;
  recording_url?: string;
}

export interface BlandAgentConfig {
  name: string;
  voice: string;
  prompt: string;
  firstSentence?: string;
  interruptionThreshold?: number;
  model?: string;
}

class BlandClient {
  private apiKey: string;
  private baseUrl = "https://api.bland.ai/v1";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.BLAND_API_KEY || "";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.apiKey) {
      throw new Error("Bland.ai API key not configured");
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: this.apiKey,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Bland API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Initiate an outbound call
   */
  async makeCall(options: BlandCallOptions): Promise<BlandCallResponse> {
    return this.request<BlandCallResponse>("/calls", {
      method: "POST",
      body: JSON.stringify({
        phone_number: options.phoneNumber,
        task: options.prompt,
        voice: options.voice || "nat",
        transfer_phone_number: options.transferNumber,
        max_duration: options.maxDuration || 300,
        amd: options.amd ?? true,
        wait_for_greeting: options.waitForGreeting ?? true,
        record: options.record ?? true,
        webhook: options.webhookUrl,
        metadata: options.metadata,
      }),
    });
  }

  /**
   * Get call status and details
   */
  async getCallStatus(callId: string): Promise<BlandCallStatus> {
    return this.request<BlandCallStatus>(`/calls/${callId}`);
  }

  /**
   * End an active call
   */
  async endCall(callId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/calls/${callId}/end`, {
      method: "POST",
    });
  }

  /**
   * Get call transcript
   */
  async getTranscript(callId: string): Promise<{ transcript: string }> {
    return this.request<{ transcript: string }>(`/calls/${callId}/transcript`);
  }

  /**
   * Get call recording URL
   */
  async getRecording(callId: string): Promise<{ url: string }> {
    return this.request<{ url: string }>(`/calls/${callId}/recording`);
  }

  /**
   * Create or update an AI agent
   */
  async createAgent(config: BlandAgentConfig): Promise<{ agentId: string }> {
    return this.request<{ agentId: string }>("/agents", {
      method: "POST",
      body: JSON.stringify({
        name: config.name,
        voice: config.voice,
        prompt: config.prompt,
        first_sentence: config.firstSentence,
        interruption_threshold: config.interruptionThreshold || 100,
        model: config.model || "base",
      }),
    });
  }

  /**
   * Get agent details
   */
  async getAgent(agentId: string): Promise<BlandAgentConfig & { agentId: string }> {
    return this.request<BlandAgentConfig & { agentId: string }>(`/agents/${agentId}`);
  }

  /**
   * List all agents
   */
  async listAgents(): Promise<Array<BlandAgentConfig & { agentId: string }>> {
    return this.request<Array<BlandAgentConfig & { agentId: string }>>("/agents");
  }

  /**
   * Delete an agent
   */
  async deleteAgent(agentId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/agents/${agentId}`, {
      method: "DELETE",
    });
  }

  /**
   * Batch initiate multiple calls
   */
  async makeBatchCalls(
    calls: Array<BlandCallOptions & { leadId?: string }>
  ): Promise<Array<BlandCallResponse & { leadId?: string }>> {
    type CallResult = BlandCallResponse & { leadId?: string };
    const results = await Promise.allSettled(
      calls.map(async (call): Promise<CallResult> => {
        const response = await this.makeCall(call);
        return { ...response, leadId: call.leadId };
      })
    );

    return results
      .filter((r): r is PromiseFulfilledResult<CallResult> => r.status === "fulfilled")
      .map((r) => r.value);
  }
}

// Export singleton instance
export const blandClient = new BlandClient();

// Export class for custom instances
export { BlandClient };

// MCA-specific voice scripts
export const mcaVoiceScripts = {
  coldOutbound: {
    systemPrompt: `You are Alex, a friendly business funding specialist from {{company_name}}.
Your goal is to qualify small business owners for merchant cash advance funding.

Key qualification questions:
1. Business type and industry
2. Time in business (need 6+ months)
3. Monthly revenue (need $10k+ minimum)
4. Current funding needs or challenges
5. Best time for a more detailed conversation

Be conversational, not salesy. Listen actively. If they qualify, offer to have a funding specialist call them back or transfer if available.

If they're not interested, politely thank them and ask if they know any business owners who might benefit.`,

    openingScript: `Hi, is this {{contact_name}}? Great! This is Alex calling from {{company_name}}.
I'm reaching out to business owners in {{industry}} to let them know about some funding options that have helped similar businesses grow.
Do you have just a minute to hear about how we've helped businesses like yours access working capital?`,

    objectionHandling: {
      not_interested: "I completely understand. Before I let you go, is it the timing, or is there something specific about business funding that doesn't seem right for you?",
      already_have_funding: "That's great you have options! Many of our clients use us alongside existing funding. Just curious - are you happy with your current rates and terms?",
      bad_credit: "Actually, we work with a wide range of credit profiles. It's more about your business's cash flow. Would you be open to a quick assessment?",
      too_busy: "I totally get it - you're running a business! When would be a better time for a 5-minute call? I can call back whenever works for you.",
    },
  },

  warmFollowUp: {
    systemPrompt: `You are Alex from {{company_name}}, following up on a previous conversation about business funding.

Your goal is to:
1. Remind them of your previous conversation
2. Ask if they've had time to think about their funding needs
3. Address any questions or concerns
4. If interested, schedule a call with a funding specialist

Be warm and personable. Reference any notes from the previous conversation.`,

    openingScript: `Hi {{contact_name}}, this is Alex from {{company_name}}. We spoke {{time_since_last_contact}} ago about some funding options for your business.
I wanted to follow up and see if you've had a chance to think about what we discussed. Is this still a good time to chat?`,
  },

  inboundQualification: {
    systemPrompt: `You are Alex, answering calls for {{company_name}}, a business funding company.

Your goal is to:
1. Thank them for calling
2. Understand their business funding needs
3. Qualify them based on: time in business (6+ months), monthly revenue ($10k+), business type
4. If qualified, collect their information and schedule a call with a specialist
5. If not qualified, explain what they need and offer to follow up later

Be helpful and professional. Make them feel valued.`,

    openingScript: `Thank you for calling {{company_name}}! This is Alex. I'd love to help you explore your business funding options.
May I ask what prompted your call today?`,
  },
};
