import { QueueItem, ContentItem } from '@/types';

export interface ICSEvent {
  uid: string;
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  url?: string;
}

export function formatDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function generateICS(events: ICSEvent[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FluxContent//Content Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  events.forEach(event => {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.uid}`,
      `DTSTART:${formatDate(event.start)}`,
      `DTEND:${formatDate(new Date(event.start.getTime() + 30 * 60 * 1000))}`, // 30 minutes duration
      `SUMMARY:${event.summary}`,
      `DESCRIPTION:${event.description || ''}`,
      ...(event.url ? [`URL:${event.url}`] : []),
      `CREATED:${formatDate(new Date())}`,
      `LAST-MODIFIED:${formatDate(new Date())}`,
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  
  return lines.join('\r\n');
}

export function queueToICS(queueItems: QueueItem[], contentItems: ContentItem[]): string {
  const events: ICSEvent[] = queueItems
    .filter(item => item.status === 'SCHEDULED')
    .map(item => {
      const content = contentItems.find(c => c.id === item.contentId);
      
      return {
        uid: `fluxcontent-${item.id}@fluxcontent.app`,
        summary: `Publish ${content?.title || 'Content'} on ${item.platform}`,
        description: `Content: ${content?.title || 'Unknown'}\nPlatform: ${item.platform}\nBrand: ${item.brandId}`,
        start: item.scheduledAt,
        end: new Date(item.scheduledAt.getTime() + 30 * 60 * 1000),
      };
    });

  return generateICS(events);
}

export function downloadICS(icsContent: string, filename = 'content-calendar.ics'): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  window.URL.revokeObjectURL(url);
}

export function createCalendarURL(icsContent: string): string {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  return window.URL.createObjectURL(blob);
}