import type { Message } from '@extension/storage';
import { Actors } from '@extension/storage';
import { ACTOR_PROFILES } from '../types/message';
import { memo } from 'react';

interface MessageListProps {
  messages: Message[];
  isDarkMode?: boolean;
  userDisplayName?: string;
}

export default memo(function MessageList({
  messages,
  isDarkMode = false,
  userDisplayName = 'You',
}: MessageListProps) {
  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <MessageBlock
          key={`${message.actor}-${message.timestamp}-${index}`}
          message={message}
          isSameActor={index > 0 ? messages[index - 1].actor === message.actor : false}
          isDarkMode={isDarkMode}
          userDisplayName={userDisplayName}
        />
      ))}
    </div>
  );
});

interface MessageBlockProps {
  message: Message;
  isSameActor: boolean;
  isDarkMode?: boolean;
  userDisplayName: string;
}

function MessageBlock({ message, isSameActor, isDarkMode = false, userDisplayName }: MessageBlockProps) {
  if (!message.actor) {
    console.error('No actor found');
    return <div />;
  }
  const actor = ACTOR_PROFILES[message.actor as keyof typeof ACTOR_PROFILES];
  const isProgress = message.content === 'Showing progress...';
  const isUser = message.actor === Actors.USER;
  const displayName = isUser ? userDisplayName : actor.name;
  const initials = userInitials(userDisplayName);

  return (
    <div className={`message-row ${isSameActor ? 'is-same' : 'is-new'} ${isUser ? 'is-user' : 'is-agent'}`}>
      {!isSameActor && (
        <div className="message-avatar" style={{ backgroundColor: actor.iconBackground }} aria-hidden>
          {isUser ? (
            <span className="message-avatar-initials">{initials}</span>
          ) : (
            <img src={actor.icon} alt="" className="message-avatar-icon" />
          )}
        </div>
      )}
      {isSameActor && <div className="message-avatar-spacer" />}

      <div className="message-body">
        {!isSameActor && <div className={`message-actor ${isDarkMode ? 'is-dark' : 'is-light'}`}>{displayName}</div>}

        <div className={`message-bubble ${isDarkMode ? 'is-dark' : 'is-light'} ${isUser ? 'is-user' : ''}`}>
          {isProgress ? (
            <div className={`message-progress-track ${isDarkMode ? 'is-dark' : 'is-light'}`}>
              <div className="message-progress-bar" />
            </div>
          ) : (
            <div className="message-content">{message.content}</div>
          )}
          {!isProgress && (
            <div className={`message-time ${isDarkMode ? 'is-dark' : 'is-light'}`}>
              {formatTimestamp(message.timestamp)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Y';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

/**
 * Formats a timestamp (in milliseconds) to a readable time string for the message list.
 */
function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const date = new Date(timestamp);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const messageDate = new Date(timestamp);
  messageDate.setHours(0, 0, 0, 0);

  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (messageDate.getTime() === today.getTime()) {
    return timeStr;
  }
  if (messageDate.getTime() === yesterday.getTime()) {
    return `Yesterday ${timeStr}`;
  }
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${timeStr}`;
}
