import { Autocomplete, TextField } from "@mui/material";
import type { Tag } from "../types/tag";

type TagPickerProps = {
  tags: Tag[];
  value: string[];
  onChange: (tagIds: string[]) => void;
};

// Reusable tag selector used by filters and the event dialog. Like users, tags
// are stored on events as IDs and resolved to labels for display.
export function TagPicker({ tags, value, onChange }: TagPickerProps) {
  const selectedTags = tags.filter((tag) => value.includes(tag.id));

  return (
    <Autocomplete
      multiple
      options={tags}
      value={selectedTags}
      getOptionLabel={(option) => option.title}
      onChange={(_, newTags) => {
        onChange(newTags.map((tag) => tag.id));
      }}
      renderInput={(params) => <TextField {...params} label="Tags" />}
    />
  );
}
