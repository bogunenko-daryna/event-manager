import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import LinkIcon from "@mui/icons-material/Link";
import { Box, Divider, IconButton, Paper, Stack, Tooltip } from "@mui/material";
import { useEffect, useRef } from "react";
import { sanitizeRichText } from "../utils/richText";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

// A small rich-text editor built with MUI controls. It stores sanitized HTML so
// event descriptions can keep formatting without allowing unsafe markup.
export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const lastHtmlRef = useRef("");

  // Keep the editable DOM in sync when a different event is opened, but avoid
  // replacing the HTML while the user is typing because that moves the cursor.
  useEffect(() => {
    const safeValue = sanitizeRichText(value);

    if (lastHtmlRef.current === safeValue || !editorRef.current) {
      return;
    }

    if (document.activeElement === editorRef.current) {
      return;
    }

    editorRef.current.innerHTML = safeValue;
    lastHtmlRef.current = safeValue;
  }, [value]);

  function emitChange(html: string) {
    const safeValue = sanitizeRichText(html);

    lastHtmlRef.current = safeValue;
    onChange(safeValue);
  }

  function runCommand(command: string, commandValue?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitChange(editorRef.current?.innerHTML ?? "");
  }

  function addLink() {
    const url = window.prompt("Paste a URL");

    if (!url || !/^https?:\/\//.test(url)) {
      return;
    }

    runCommand("createLink", url);
  }

  return (
    <Paper variant="outlined" sx={{ mt: 1, overflow: "hidden" }}>
      <Stack
        direction="row"
        spacing={0.5}
        sx={{
          alignItems: "center",
          bgcolor: "background.default",
          borderBottom: 1,
          borderColor: "divider",
          p: 0.75,
        }}
      >
        <Tooltip title="Bold">
          <IconButton size="small" onClick={() => runCommand("bold")}>
            <FormatBoldIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Italic">
          <IconButton size="small" onClick={() => runCommand("italic")}>
            <FormatItalicIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem />

        <Tooltip title="Bulleted list">
          <IconButton
            size="small"
            onClick={() => runCommand("insertUnorderedList")}
          >
            <FormatListBulletedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Link">
          <IconButton size="small" onClick={addLink}>
            <LinkIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Box
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(event) => emitChange(event.currentTarget.innerHTML)}
        sx={{
          minHeight: 132,
          p: 1.5,
          outline: "none",
          "&:focus": {
            boxShadow: "inset 0 0 0 2px rgba(37, 99, 235, 0.28)",
          },
          "& p": {
            my: 0.5,
          },
          "& ul": {
            my: 0.5,
            pl: 3,
          },
          "& a": {
            color: "primary.main",
          },
        }}
      />
    </Paper>
  );
}
