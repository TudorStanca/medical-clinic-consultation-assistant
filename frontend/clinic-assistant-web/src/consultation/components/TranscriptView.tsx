import { useEffect, useRef } from "react";
import { Box, Chip, Paper, Typography } from "@mui/material";
import type { TranscriptSegment } from "@/consultation/props";

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
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Typography variant="subtitle2">Transcriere</Typography>
        {isPreview && <Chip label="preview" size="small" color="warning" variant="outlined" />}
      </Box>
      <Paper
        variant="outlined"
        sx={{ p: 2, height: 320, overflowY: "auto", fontFamily: "monospace", fontSize: 13 }}
      >
        {segments.length === 0 ? (
          <Typography color="text.secondary" sx={{ fontFamily: "monospace" }}>
            Transcrierea va apărea aici…
          </Typography>
        ) : (
          segments.map((seg, i) => (
            <Box key={i} mb={0.5}>
              <Box component="span" sx={{ color: "text.secondary", mr: 1 }}>
                [{formatMs(seg.startMs)}]
              </Box>
              {seg.text}
            </Box>
          ))
        )}
        <div ref={bottomRef} />
      </Paper>
    </Box>
  );
};

export default TranscriptView;
