/**
 * Typing Indicator - Google-style pulsing dots
 * @author Dr. Ernesto Lee
 */

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 mb-6">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
        <span className="text-white text-sm">🤖</span>
      </div>

      {/* Dots */}
      <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-bl-sm">
        <div className="flex gap-1">
          <div
            className="w-2 h-2 rounded-full bg-muted-foreground/40"
            style={{ animation: 'pulse 1.4s infinite ease-in-out', animationDelay: '0s' }}
          />
          <div
            className="w-2 h-2 rounded-full bg-muted-foreground/40"
            style={{ animation: 'pulse 1.4s infinite ease-in-out', animationDelay: '0.2s' }}
          />
          <div
            className="w-2 h-2 rounded-full bg-muted-foreground/40"
            style={{ animation: 'pulse 1.4s infinite ease-in-out', animationDelay: '0.4s' }}
          />
        </div>
      </div>
    </div>
  );
}
