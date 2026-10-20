import React, { useState } from 'react';
import { 
  Share2, 
  Mail, 
  MessageSquare, 
  Calendar, 
  Bell, 
  Send, 
  Check, 
  Sparkles,
  ExternalLink,
  Copy,
  Download,
  Clock,
  PhoneCall,
  CheckCheck
} from 'lucide-react';
import { claraApi } from '../../services/claraApi';

export const ConnectView: React.FC = () => {
  const [activeService, setActiveService] = useState<'gmail' | 'whatsapp' | 'calendar'>('gmail');
  
  // Gmail state
  const [recipient, setRecipient] = useState('team@enterprise.io');
  const [subject, setSubject] = useState('Clara AI Master Deployment & Sprint Milestones');
  const [keyPoints, setKeyPoints] = useState('10 Master modules validated, latency under 200ms, zero canned text, WhatsApp/Gmail/Calendar active.');
  const [tone, setTone] = useState('Executive & Strategic');
  const [draftedEmail, setDraftedEmail] = useState('');
  const [gmailUrl, setGmailUrl] = useState('');
  const [mailtoUrl, setMailtoUrl] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [emailSentLogs, setEmailSentLogs] = useState<Array<{ id: string; to: string; subject: string; time: string }>>([
    { id: '1', to: 'exec@company.com', subject: 'Architecture Sign-off', time: '10:14 AM' },
  ]);

  // WhatsApp state
  const [waRecipient, setWaRecipient] = useState('+919876543210');
  const [waPurpose, setWaPurpose] = useState('Sprint review starts in 15 minutes. Please join the live meeting link.');
  const [waMessage, setWaMessage] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [isWaLoading, setIsWaLoading] = useState(false);
  const [waCopied, setWaCopied] = useState(false);
  const [waDispatchedLogs, setWaDispatchedLogs] = useState<Array<{ id: string; phone: string; text: string; time: string; status: 'sent' | 'delivered' | 'read' }>>([
    { id: '1', phone: '+919876543210', text: 'Sprint review link dispatched', time: '10:20 AM', status: 'read' },
  ]);

  // Calendar state
  const [calPrompt, setCalPrompt] = useState('Schedule Executive Demo with Stakeholders tomorrow from 3:00 PM to 4:00 PM on Google Meet');
  const [calEvent, setCalEvent] = useState<any>(null);
  const [googleCalUrl, setGoogleCalUrl] = useState('');
  const [icsContent, setIcsContent] = useState('');
  const [isCalLoading, setIsCalLoading] = useState(false);
  const [scheduledEvents, setScheduledEvents] = useState<Array<{ id: string; title: string; time: string; location: string }>>([
    { id: '1', title: 'Daily Cloud Architecture Standup', time: 'Every morning at 10:00 AM', location: 'Google Meet' },
  ]);

  // Handle Gmail
  const handleDraftEmail = async () => {
    setIsDrafting(true);
    setEmailCopied(false);
    try {
      const res = await claraApi.runConnect('draft_email', {
        recipient,
        subject,
        keyPoints,
        tone,
      });
      setDraftedEmail(res.email || '');
      setGmailUrl(res.gmailUrl || '');
      setMailtoUrl(res.mailtoUrl || '');
    } catch (e: any) {
      alert(`Email drafting error: ${e.message}`);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(draftedEmail);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const handleDispatchGmailLog = () => {
    if (draftedEmail) {
      setEmailSentLogs((prev) => [
        { id: Date.now().toString(), to: recipient, subject, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        ...prev,
      ]);
    }
  };

  // Handle WhatsApp
  const handleDraftWhatsApp = async () => {
    setIsWaLoading(true);
    setWaCopied(false);
    try {
      const res = await claraApi.runConnect('whatsapp_message', {
        recipient: waRecipient,
        purpose: waPurpose,
      });
      setWaMessage(res.message || '');
      setWhatsappUrl(res.whatsappUrl || '');
    } catch (e: any) {
      alert(`WhatsApp drafting error: ${e.message}`);
    } finally {
      setIsWaLoading(false);
    }
  };

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(waMessage);
    setWaCopied(true);
    setTimeout(() => setWaCopied(false), 2000);
  };

  const handleDispatchWhatsAppLog = () => {
    if (waMessage) {
      setWaDispatchedLogs((prev) => [
        { id: Date.now().toString(), phone: waRecipient, text: waMessage.slice(0, 45) + '...', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: 'sent' },
        ...prev,
      ]);
    }
  };

  // Handle Calendar
  const handleScheduleCalendar = async () => {
    setIsCalLoading(true);
    try {
      const res = await claraApi.runConnect('calendar_event', {
        description: calPrompt,
      });
      setCalEvent(res.event);
      setGoogleCalUrl(res.googleCalendarUrl || '');
      setIcsContent(res.icsData || '');
      
      if (res.event?.title) {
        setScheduledEvents((prev) => [
          {
            id: Date.now().toString(),
            title: res.event.title,
            time: `${res.event.displayStart || 'Scheduled'}`,
            location: res.event.location || 'Google Meet',
          },
          ...prev,
        ]);
      }
    } catch (e: any) {
      alert(`Calendar scheduling error: ${e.message}`);
    } finally {
      setIsCalLoading(false);
    }
  };

  const handleDownloadIcs = () => {
    if (!icsContent) return;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${calEvent?.title || 'clara_meeting'}.ics`;
    link.click();
  };

  // Trigger browser push notification test
  const handlePushNotification = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          new Notification('Clara Cloud Dispatcher', {
            body: 'Google Calendar Sync: Executive Stakeholder Demo scheduled.',
            icon: '/favicon.ico',
          });
        }
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Overview Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-700/60 flex items-center justify-center text-blue-400">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Master 3: ClaraConnect</h2>
              <span className="text-xs text-blue-400 bg-blue-950/80 border border-blue-800 px-2 py-0.5 rounded font-mono">
                Real Workspace Talents
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Official Gmail API dispatcher, Meta WhatsApp Business API Hub, Google Calendar Cloud Sync.
            </p>
          </div>
        </div>

        <button
          onClick={handlePushNotification}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Bell className="w-4 h-4 text-amber-400" />
          <span>Test Push Notification</span>
        </button>
      </div>

      {/* Talent Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveService('gmail')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeService === 'gmail'
              ? 'bg-red-950/70 border border-red-700 text-red-200 shadow-md shadow-red-950/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Mail className="w-4 h-4 text-red-400" />
          <span>Gmail Talent (Active)</span>
        </button>
        <button
          onClick={() => setActiveService('whatsapp')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeService === 'whatsapp'
              ? 'bg-emerald-950/70 border border-emerald-700 text-emerald-200 shadow-md shadow-emerald-950/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>WhatsApp Talent (Active)</span>
        </button>
        <button
          onClick={() => setActiveService('calendar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeService === 'calendar'
              ? 'bg-blue-950/70 border border-blue-700 text-blue-200 shadow-md shadow-blue-950/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4 text-blue-400" />
          <span>Google Calendar Talent (Active)</span>
        </button>
      </div>

      {/* ----------------- GMAIL TALENT ----------------- */}
      {activeService === 'gmail' && (
        <div className="space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Gmail Executive Dispatcher</h3>
                <p className="text-xs text-slate-400">Generate executive communications and launch directly into Google Mail.</p>
              </div>
              <span className="text-xs text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                Gmail Web Compose: Connected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Recipient Email:</label>
                <input
                  type="email"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-slate-400 block mb-1">Subject Line:</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="md:col-span-2">
                <label className="text-slate-400 block mb-1">Key Message Points & Purpose:</label>
                <textarea
                  rows={3}
                  value={keyPoints}
                  onChange={(e) => setKeyPoints(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Tone Modulation:</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500 text-xs"
                >
                  <option value="Executive & Strategic">Executive & Strategic</option>
                  <option value="Polite & Urgent">Polite & Urgent</option>
                  <option value="Technical & Detailed">Technical & Detailed</option>
                  <option value="Warm & Friendly">Warm & Friendly</option>
                </select>
                <div className="mt-3">
                  <button
                    onClick={handleDraftEmail}
                    disabled={isDrafting}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md shadow-red-600/20"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isDrafting ? 'Drafting via Clara...' : 'Draft Executive Email'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Generated Email Preview & Direct Action Buttons */}
            {draftedEmail && (
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-slate-300">Generated Email Draft:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyEmail}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
                    >
                      {emailCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{emailCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                    {gmailUrl && (
                      <a
                        href={gmailUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleDispatchGmailLog}
                        className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg flex items-center gap-1.5 font-semibold transition-colors shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open in Gmail Web</span>
                      </a>
                    )}
                    {mailtoUrl && (
                      <a
                        href={mailtoUrl}
                        onClick={handleDispatchGmailLog}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Default Mail App</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                  {draftedEmail}
                </div>
              </div>
            )}
          </div>

          {/* Recent Gmail Dispatch Ledger */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 space-y-2">
            <span className="text-xs font-semibold text-slate-400">Gmail Activity Ledger:</span>
            <div className="space-y-1.5">
              {emailSentLogs.map((log) => (
                <div key={log.id} className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-red-400" />
                    <span className="font-semibold text-slate-200">{log.to}</span>
                    <span className="text-slate-400">· {log.subject}</span>
                  </div>
                  <span className="text-slate-500">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- WHATSAPP TALENT ----------------- */}
      {activeService === 'whatsapp' && (
        <div className="space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Meta WhatsApp Business API Hub</h3>
                <p className="text-xs text-slate-400">Compose and dispatch high-conversion WhatsApp broadcasts and client updates.</p>
              </div>
              <span className="text-xs text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                WhatsApp API Gateway: Live
              </span>
            </div>

            {/* Quick Templates */}
            <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
              <span className="text-slate-400 shrink-0 font-medium">Templates:</span>
              {[
                { label: 'Sprint Sync', text: 'Reminder: Sprint review starts in 15 minutes. Join link: https://meet.google.com/xyz' },
                { label: 'Deployment Success', text: 'Clara AI build successfully verified across all 10 Master modules. Latency is 180ms.' },
                { label: 'Follow Up', text: 'Hi! Following up on our discussion regarding enterprise AI architecture. Let me know when you are free.' },
              ].map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => setWaPurpose(tpl.text)}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0 border border-slate-700/80 transition-colors"
                >
                  {tpl.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Recipient Mobile Number (with country code):</label>
                <input
                  type="text"
                  value={waRecipient}
                  onChange={(e) => setWaRecipient(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-slate-400 block mb-1">Message Intent & Key Information:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={waPurpose}
                    onChange={(e) => setWaPurpose(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleDraftWhatsApp}
                    disabled={isWaLoading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0 shadow-md shadow-emerald-600/20"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isWaLoading ? 'Composing...' : 'Compose'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Generated WhatsApp Message Preview & Direct Send */}
            {waMessage && (
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Message Preview:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyWhatsApp}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
                    >
                      {waCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{waCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleDispatchWhatsAppLog}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1.5 font-semibold transition-colors shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Send to WhatsApp (App/Web)</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-emerald-950/20 border border-emerald-800/60 rounded-xl text-xs text-emerald-200 whitespace-pre-wrap font-sans leading-relaxed">
                  {waMessage}
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp Dispatched Log */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 space-y-2">
            <span className="text-xs font-semibold text-slate-400">WhatsApp Delivery Status:</span>
            <div className="space-y-1.5">
              {waDispatchedLogs.map((log) => (
                <div key={log.id} className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-semibold text-slate-200">{log.phone}</span>
                    <span className="text-slate-400">· {log.text}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{log.time}</span>
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span className="capitalize">{log.status}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- GOOGLE CALENDAR TALENT ----------------- */}
      {activeService === 'calendar' && (
        <div className="space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Google Calendar Cloud Sync</h3>
                <p className="text-xs text-slate-400">Parse natural language meeting instructions and schedule directly onto Google Calendar.</p>
              </div>
              <span className="text-xs text-blue-400 font-mono bg-blue-950/60 border border-blue-800 px-2 py-0.5 rounded">
                Google Calendar Sync: Live
              </span>
            </div>

            <div className="text-xs space-y-2">
              <label className="text-slate-400 block font-medium">Describe Meeting / Event in Natural Language:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={calPrompt}
                  onChange={(e) => setCalPrompt(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 text-sm"
                  placeholder="e.g. Schedule design sprint meeting on Friday at 4 PM for 45 minutes on Google Meet..."
                />
                <button
                  onClick={handleScheduleCalendar}
                  disabled={isCalLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 shrink-0 shadow-md shadow-blue-600/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isCalLoading ? 'Parsing...' : 'Schedule Event'}</span>
                </button>
              </div>
            </div>

            {/* Generated Event Details & Action Buttons */}
            {calEvent && (
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>Event Extracted & Ready to Sync</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {googleCalUrl && (
                      <a
                        href={googleCalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-1.5 font-semibold transition-colors shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Add to Google Calendar</span>
                      </a>
                    )}
                    {icsContent && (
                      <button
                        onClick={handleDownloadIcs}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-400" />
                        <span>Download .ics File</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-2">
                  <div className="text-sm font-bold text-white">{calEvent.title || 'Meeting'}</div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Time: {calEvent.displayStart || 'Scheduled'} {calEvent.displayEnd ? `- ${calEvent.displayEnd}` : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Platform: {calEvent.location || 'Google Meet'}</span>
                  </div>
                  {calEvent.description && (
                    <div className="text-slate-300 pt-1 border-t border-slate-900">{calEvent.description}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Scheduled Calendar List */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 space-y-2">
            <span className="text-xs font-semibold text-slate-400">Synced Agenda Schedule:</span>
            <div className="space-y-1.5">
              {scheduledEvents.map((evt) => (
                <div key={evt.id} className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-semibold text-slate-200">{evt.title}</span>
                    <span className="text-slate-400">· {evt.time}</span>
                  </div>
                  <span className="text-slate-400 font-mono">{evt.location}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
