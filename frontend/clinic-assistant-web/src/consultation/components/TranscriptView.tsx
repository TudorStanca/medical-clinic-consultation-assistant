import { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import type { TranscriptSegment } from "@/consultation/props";
import { MS_LIGHT, MS_FONTS } from "@/theme/tokens";

const T = MS_LIGHT;

const formatMs = (ms: number): string => {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
};

interface Props {
  segments: TranscriptSegment[];
  isPreview: boolean;
}

const TranscriptView = ({ segments, isPreview }: Props) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [segments]);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "10px" }}>
        <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: T.text, fontFamily: MS_FONTS.sans }}>
          Transcriere
        </Typography>
        {isPreview && (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              px: "9px",
              py: "3px",
              borderRadius: "999px",
              background: T.warningSoft,
            }}
          >
            <Typography sx={{ fontSize: "0.6563rem", fontWeight: 600, letterSpacing: "0.05em", color: T.warning }}>
              PREVIEW
            </Typography>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          height: 280,
          overflowY: "auto",
          border: `1px solid ${T.border}`,
          borderRadius: "10px",
          p: "14px 16px",
          background: T.bg,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {segments.length === 0 ? (
          <Typography sx={{ color: T.textDim, fontFamily: MS_FONTS.mono, fontSize: "0.8125rem", lineHeight: 1.6 }}>
            Transcrierea va apărea aici…
          </Typography>
        ) : (
          segments.map((seg, i) => (
            <Box key={i} sx={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <Typography
                sx={{
                  fontFamily: MS_FONTS.mono,
                  fontSize: "0.75rem",
                  color: T.accent,
                  flexShrink: 0,
                  lineHeight: 1.6,
                  fontWeight: 500,
                }}
              >
                [{formatMs(seg.startMs)}]
              </Typography>
              <Typography sx={{ fontSize: "0.875rem", color: T.text, lineHeight: 1.6, fontFamily: MS_FONTS.sans }}>
                {seg.text}
              </Typography>
            </Box>
          ))
        )}
        <div ref={bottomRef} />
      </Box>
    </Box>
  );
};

export default TranscriptView;
