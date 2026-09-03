/**
 * Meta WhatsApp Cloud API Integration for S.A. Public School
 * Official direct integration via Meta Graph API (Free tier: 1000 conversations/month)
 */

import { WhatsAppLog } from '../src/types.js';

export interface WhatsAppSendParams {
  studentName: string;
  parentPhone: string;
  classInfo: string;
  date: string;
}

export async function sendWhatsAppAbsentAlert(
  params: WhatsAppSendParams
): Promise<{ success: boolean; log: WhatsAppLog }> {
  const { studentName, parentPhone, classInfo, date } = params;

  // Clean phone number (Ensure country code, e.g. +91 for India)
  let formattedPhone = parentPhone.replace(/\D/g, '');
  if (formattedPhone.length === 10) {
    formattedPhone = `91${formattedPhone}`;
  }

  const messageText = `Dear Parent, your child ${studentName} of Class ${classInfo} was marked ABSENT on ${date}. - S.A. Public School`;
  const timestamp = new Date().toISOString();
  const logId = `WA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;
  const templateName = process.env.META_WHATSAPP_TEMPLATE_NAME || 'student_absent_alert';

  // Check if real Meta Cloud API credentials are configured
  if (phoneNumberId && accessToken && accessToken.trim() !== '') {
    try {
      const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
      
      // Attempt sending with pre-approved template, or fallback to standard text message
      const payload = {
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: studentName },
                { type: 'text', text: classInfo },
                { type: 'text', text: date },
              ],
            },
          ],
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as any;

      if (response.ok) {
        const log: WhatsAppLog = {
          id: logId,
          timestamp,
          studentName,
          parentPhone: `+${formattedPhone}`,
          classInfo,
          date,
          message: messageText,
          status: 'sent',
          metaMessageId: data.messages?.[0]?.id || 'meta-msg-id',
        };
        return { success: true, log };
      } else {
        // If template fails, try standard text message
        const textPayload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedPhone,
          type: 'text',
          text: { preview_url: false, body: messageText },
        };

        const textResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(textPayload),
        });

        const textData = (await textResponse.json()) as any;

        if (textResponse.ok) {
          const log: WhatsAppLog = {
            id: logId,
            timestamp,
            studentName,
            parentPhone: `+${formattedPhone}`,
            classInfo,
            date,
            message: messageText,
            status: 'sent',
            metaMessageId: textData.messages?.[0]?.id,
          };
          return { success: true, log };
        }

        const log: WhatsAppLog = {
          id: logId,
          timestamp,
          studentName,
          parentPhone: `+${formattedPhone}`,
          classInfo,
          date,
          message: messageText,
          status: 'failed',
          error: data.error?.message || 'Meta API returned error',
        };
        return { success: false, log };
      }
    } catch (err: any) {
      console.error('WhatsApp API dispatch error:', err);
      const log: WhatsAppLog = {
        id: logId,
        timestamp,
        studentName,
        parentPhone: `+${formattedPhone}`,
        classInfo,
        date,
        message: messageText,
        status: 'failed',
        error: err?.message || 'Network error connecting to Meta WhatsApp Cloud API',
      };
      return { success: false, log };
    }
  }

  // Graceful Live Simulation mode when Meta API keys are pending setup
  console.log(`[WhatsApp Simulation] Alert dispatched to +${formattedPhone}: "${messageText}"`);
  const log: WhatsAppLog = {
    id: logId,
    timestamp,
    studentName,
    parentPhone: `+${formattedPhone}`,
    classInfo,
    date,
    message: messageText,
    status: 'simulated',
    metaMessageId: `sim_${Date.now()}`,
  };

  return { success: true, log };
}
