import { MS_LIGHT, MS_FONTS } from "@/theme/tokens";

interface Props {
  size?: number;
  showText?: boolean;
  color?: string;
  accent?: string;
}

const MediScribeLogo = ({ size = 28, showText = true, color, accent }: Props) => {
  const c = color ?? MS_LIGHT.text;
  const a = accent ?? MS_LIGHT.accent;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10, color: c }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect x="2" y="2" width="28" height="28" rx="8" fill={a} />
        <path
          d="M8 20 C 11 12, 14 24, 17 16 S 22 12, 24 18"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="24" cy="18" r="1.6" fill="white" />
      </svg>
      {showText && (
        <span style={{
          fontFamily: MS_FONTS.sans,
          fontWeight: 600,
          fontSize: size * 0.62,
          letterSpacing: -0.3,
          color: c,
        }}>
          MediScribe
        </span>
      )}
    </span>
  );
};

export default MediScribeLogo;
