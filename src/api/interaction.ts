import { CreateInteractionRequest, InteractionResponse } from './types';

const API_BASE = '/api';

export async function createInteraction(
  request: CreateInteractionRequest
): Promise<InteractionResponse> {
  const response = await fetch(`${API_BASE}/interactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to create interaction: ${response.statusText}`);
  }

  return response.json();
}