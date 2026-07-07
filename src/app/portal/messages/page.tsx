'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const INK = '#111111';
const CREAM = '#FAFAF7';
const HAIRLINE = 'rgba(17,17,17,0.08)';
const BUTTER = '#F9D96A';
const DIM = 'rgba(17,17,17,0.45)';
const MID = 'rgba(17,17,17,0.65)';

type Sender = 'tenant' | 'manager';

type Message = {
  id: string;
  sender: Sender;
  senderName: string;
  text: string;
  timestamp: string;
};

const MOCK_MESSAGES: Message[] = [
  {
    id: 'm1',
    sender: 'tenant',
    senderName: 'Maya Hernandez',
    text: 'Hi, I submitted a maintenance request for the kitchen faucet that has been leaking. Just wanted to follow up and see if someone has been assigned yet.',
    timestamp: '2026-06-02T09:15:00',
  },
  {
    id: 'm2',
    sender: 'manager',
    senderName: 'David Chen',
    text: 'Hi Maya! Thanks for reaching out. I can see the request came in this morning. I\'ve assigned it to our plumber, Carlos. He should be able to come by within the next 48 hours.',
    timestamp: '2026-06-02T10:32:00',
  },
  {
    id: 'm3',
    sender: 'tenant',
    senderName: 'Maya Hernandez',
    text: 'Great, thank you! Is there a specific time window I should expect? I work from home most days so I\'m flexible.',
    timestamp: '2026-06-02T10:45:00',
  },
  {
    id: 'm4',
    sender: 'manager',
    senderName: 'David Chen',
    text: 'Carlos typically does his rounds between 9am-12pm. I\'ll ask him to text you 30 minutes before he arrives. Would Wednesday morning work for you?',
    timestamp: '2026-06-02T11:08:00',
  },
  {
    id: 'm5',
    sender: 'tenant',
    senderName: 'Maya Hernandez',
    text: 'Wednesday morning works perfectly. I\'ll be here all morning. Thanks for coordinating!',
    timestamp: '2026-06-02T11:22:00',
  },
  {
    id: 'm6',
    sender: 'manager',
    senderName: 'David Chen',
    text: 'You\'re welcome! I\'ve confirmed with Carlos for Wednesday between 9-11am. He\'ll reach out directly. Let me know if you need anything else.',
    timestamp: '2026-06-02T14:05:00',
  },
];

const fmtTimestamp = (s: string) => {
  const d = new Date(s);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' at ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

export default function MessagesPage() {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(MOCK_MESSAGES);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: Message = {
      id: `m${messages.length + 1}`,
      sender: 'tenant',
      senderName: 'Maya Hernandez',
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages([...messages, msg]);
    setNewMessage('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)' }}>
      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 28,
          fontWeight: 500,
          color: INK,
          margin: '0 0 4px',
          letterSpacing: '-0.02em',
        }}
      >
        Messages
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: 13,
          color: DIM,
          margin: '0 0 24px',
        }}
      >
        Conversation with property management
      </p>

      {/* Messages thread */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          paddingBottom: 16,
        }}
      >
        {messages.map((msg) => {
          const isTenant = msg.sender === 'tenant';
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isTenant ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 6,
                  flexDirection: isTenant ? 'row-reverse' : 'row',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 4,
                    backgroundColor: isTenant ? 'rgba(17,17,17,0.06)' : BUTTER + '40',
                    color: isTenant ? MID : '#92700C',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {isTenant ? 'You' : 'Manager'}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: 11,
                    color: DIM,
                  }}
                >
                  {fmtTimestamp(msg.timestamp)}
                </span>
              </div>

              <div
                style={{
                  maxWidth: '85%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  backgroundColor: isTenant ? INK : CREAM,
                  color: isTenant ? '#FFFFFF' : INK,
                  borderTopRightRadius: isTenant ? 4 : 12,
                  borderTopLeftRadius: isTenant ? 12 : 4,
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: 13,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {msg.text}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Compose */}
      <form
        onSubmit={handleSend}
        style={{
          display: 'flex',
          gap: 10,
          paddingTop: 16,
          borderTop: `1px solid ${HAIRLINE}`,
        }}
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '12px 16px',
            border: `1px solid ${HAIRLINE}`,
            borderRadius: 10,
            fontFamily: 'var(--font-inter)',
            fontSize: 14,
            color: INK,
            outline: 'none',
            backgroundColor: '#FFFFFF',
          }}
        />
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          style={{
            padding: '12px 24px',
            backgroundColor: INK,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 10,
            fontFamily: 'var(--font-inter)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          Send
        </motion.button>
      </form>
    </div>
  );
}
