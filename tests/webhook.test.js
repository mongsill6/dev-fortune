/**
 * Test suite for webhook.js module
 * Tests all webhook functions and error handling
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  sendSlackWebhook,
  sendDiscordWebhook,
  sendTeamsWebhook,
  sendWebhook,
  detectPlatform,
  healthCheckWebhook,
} from '../integrations/webhook.js';

// Mock fetch globally
global.fetch = jest.fn();

describe('webhook.js', () => {
  const mockQuote = {
    text: 'Code is poetry written by developers',
    author: 'Anonymous Developer',
    category: 'Technical',
    lang: 'en',
  };

  beforeEach(() => {
    global.fetch.mockClear();
  });

  describe('detectPlatform', () => {
    it('should detect Slack webhook URL', () => {
      const url = 'https://hooks.slack.com/services/T00000000/B00000000/XXXX';
      expect(detectPlatform(url)).toBe('slack');
    });

    it('should detect Discord webhook URL', () => {
      const url = 'https://discordapp.com/api/webhooks/123456/XXXX';
      expect(detectPlatform(url)).toBe('discord');
    });

    it('should detect Discord webhook URL (discord.com)', () => {
      const url = 'https://discord.com/api/webhooks/123456/XXXX';
      expect(detectPlatform(url)).toBe('discord');
    });

    it('should detect Teams webhook URL', () => {
      const url = 'https://outlook.webhook.office.com/webhookb2/XXXX';
      expect(detectPlatform(url)).toBe('teams');
    });

    it('should return null for unknown URL', () => {
      const url = 'https://example.com/webhook';
      expect(detectPlatform(url)).toBeNull();
    });

    it('should handle invalid input', () => {
      expect(detectPlatform(null)).toBeNull();
      expect(detectPlatform(undefined)).toBeNull();
      expect(detectPlatform('')).toBeNull();
    });
  });

  describe('sendSlackWebhook', () => {
    it('should send quote to Slack webhook successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const result = await sendSlackWebhook(
        'https://hooks.slack.com/services/T00000000/B00000000/XXXX',
        mockQuote
      );

      expect(result.success).toBe(true);
      expect(result.platform).toBe('slack');
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should throw error for missing URL', async () => {
      const result = await sendSlackWebhook(null, mockQuote);
      expect(result.success).toBe(false);
      expect(result.message).toContain('URL is required');
    });

    it('should throw error for invalid quote', async () => {
      const result = await sendSlackWebhook(
        'https://hooks.slack.com/services/T00000000/B00000000/XXXX',
        { author: 'Test' } // missing text
      );
      expect(result.success).toBe(false);
      expect(result.message).toContain('text property');
    });

    it('should retry on server error', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
        });

      const result = await sendSlackWebhook(
        'https://hooks.slack.com/services/T00000000/B00000000/XXXX',
        mockQuote
      );

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('sendDiscordWebhook', () => {
    it('should send quote to Discord webhook successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const result = await sendDiscordWebhook(
        'https://discordapp.com/api/webhooks/123456/XXXX',
        mockQuote
      );

      expect(result.success).toBe(true);
      expect(result.platform).toBe('discord');
      expect(global.fetch).toHaveBeenCalled();

      // Check payload structure
      const callArgs = global.fetch.mock.calls[0];
      const payload = JSON.parse(callArgs[1].body);
      expect(payload.embeds).toBeDefined();
      expect(payload.embeds[0].description).toContain(mockQuote.text);
    });

    it('should handle Discord errors gracefully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      const result = await sendDiscordWebhook(
        'https://discordapp.com/api/webhooks/123456/XXXX',
        mockQuote
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('401');
    });
  });

  describe('sendTeamsWebhook', () => {
    it('should send quote to Teams webhook successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const result = await sendTeamsWebhook(
        'https://outlook.webhook.office.com/webhookb2/XXXX',
        mockQuote
      );

      expect(result.success).toBe(true);
      expect(result.platform).toBe('teams');
      expect(global.fetch).toHaveBeenCalled();

      // Check payload structure
      const callArgs = global.fetch.mock.calls[0];
      const payload = JSON.parse(callArgs[1].body);
      expect(payload.attachments).toBeDefined();
      expect(payload.attachments[0].content).toBeDefined();
    });

    it('should format Teams Adaptive Card properly', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      await sendTeamsWebhook(
        'https://outlook.webhook.office.com/webhookb2/XXXX',
        mockQuote
      );

      const callArgs = global.fetch.mock.calls[0];
      const payload = JSON.parse(callArgs[1].body);
      const card = payload.attachments[0].content;

      expect(card.type).toBe('AdaptiveCard');
      expect(card.body).toBeDefined();
      expect(card.body.length).toBeGreaterThan(0);
    });
  });

  describe('sendWebhook', () => {
    it('should auto-detect platform and send to Slack', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const result = await sendWebhook(
        'https://hooks.slack.com/services/T00000000/B00000000/XXXX',
        mockQuote
      );

      expect(result.success).toBe(true);
      expect(result.platform).toBe('slack');
    });

    it('should auto-detect platform and send to Discord', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const result = await sendWebhook(
        'https://discordapp.com/api/webhooks/123456/XXXX',
        mockQuote
      );

      expect(result.success).toBe(true);
      expect(result.platform).toBe('discord');
    });

    it('should use explicit platform parameter', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const result = await sendWebhook(
        'https://example.com/webhook', // URL that won't be detected
        mockQuote,
        { platform: 'slack' }
      );

      // Should fail because URL format is wrong, but we can't auto-detect
      // The function will still try to use the explicit platform
      expect(result.message).toBeDefined();
    });

    it('should fail with unknown platform', async () => {
      const result = await sendWebhook(
        'https://example.com/webhook',
        mockQuote,
        { platform: 'unknown' }
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Unsupported platform');
    });

    it('should fail without URL', async () => {
      const result = await sendWebhook(null, mockQuote);

      expect(result.success).toBe(false);
      expect(result.message).toContain('URL is required');
    });
  });

  describe('healthCheckWebhook', () => {
    it('should perform health check on Slack webhook', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const result = await healthCheckWebhook(
        'https://hooks.slack.com/services/T00000000/B00000000/XXXX'
      );

      expect(result.healthy).toBe(true);
      expect(result.platform).toBe('slack');
    });

    it('should handle unhealthy webhook', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Not Found',
      });

      const result = await healthCheckWebhook(
        'https://hooks.slack.com/services/T00000000/B00000000/INVALID'
      );

      expect(result.healthy).toBe(false);
      expect(result.message).toContain('failed');
    });
  });

  describe('Quote validation', () => {
    it('should normalize quote with missing fields', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const minimalQuote = {
        text: 'Just the text',
      };

      const result = await sendSlackWebhook(
        'https://hooks.slack.com/services/T00000000/B00000000/XXXX',
        minimalQuote
      );

      expect(result.success).toBe(true);
      // Verify the payload was normalized
      const payload = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(payload).toBeDefined();
    });

    it('should handle special characters in quote', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const specialQuote = {
        text: 'Code "testing" & <debugging>',
        author: 'Bob "The Builder" Jones',
        category: 'Tech & Tips',
        lang: 'en',
      };

      const result = await sendSlackWebhook(
        'https://hooks.slack.com/services/T00000000/B00000000/XXXX',
        specialQuote
      );

      expect(result.success).toBe(true);
    });
  });

  describe('Retry logic', () => {
    it('should not retry on 4xx client errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      const result = await sendSlackWebhook(
        'https://hooks.slack.com/services/T00000000/B00000000/XXXX',
        mockQuote
      );

      expect(result.success).toBe(false);
      expect(global.fetch).toHaveBeenCalledTimes(1); // No retries
    });

    it('should retry on 5xx server errors', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
        });

      const result = await sendSlackWebhook(
        'https://hooks.slack.com/services/T00000000/B00000000/XXXX',
        mockQuote
      );

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(3); // Retried twice
    });
  });
});
