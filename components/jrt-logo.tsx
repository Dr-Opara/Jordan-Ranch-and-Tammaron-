type JrtLogoProps = {
  compact?: boolean;
  showTagline?: boolean;
  className?: string;
};

export default function JrtLogo({ compact = false, showTagline = false, className = "" }: JrtLogoProps) {
  return (
    <div className={`jrt-logo ${compact ? "jrt-logo-compact" : ""} ${className}`.trim()} aria-label="JRT.Community">
      <div className="jrt-logo-mark" aria-hidden="true">
        <div className="jrt-logo-roof" />
        <div className="jrt-logo-windows">
          <span /><span /><span /><span />
        </div>
        <div className="jrt-logo-letters">JRT</div>
        <div className="jrt-logo-swoosh" />
      </div>
      {!compact && (
        <div className="jrt-logo-wordmark">
          <strong>JRT.</strong><span>COMMUNITY</span>
        </div>
      )}
      {showTagline && <div className="jrt-logo-tagline">STRONGER TOGETHER. BETTER EVERY DAY.</div>}
    </div>
  );
}
