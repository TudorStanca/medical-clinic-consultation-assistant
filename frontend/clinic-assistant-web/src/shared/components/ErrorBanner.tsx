import { Alert, List, ListItem } from "@mui/material";

interface Props {
  messages: string[];
}

const ErrorBanner = ({ messages }: Props) => {
  if (messages.length === 0) {
    return null;
  }

  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      {messages.length === 1 ? (
        messages[0]
      ) : (
        <List dense disablePadding sx={{ listStyleType: "disc", pl: 2 }}>
          {messages.map((m, i) => (
            <ListItem key={i} sx={{ display: "list-item", p: 0 }}>
              {m}
            </ListItem>
          ))}
        </List>
      )}
    </Alert>
  );
};

export default ErrorBanner;
