import { Avatar, Autocomplete, TextField } from "@mui/material";
import type { User } from "../types/user";

type MultiUserPickerProps = {
  users: User[];
  value: string[];
  onChange: (userIds: string[]) => void;
};

// Multi-user picker for attendees. The event data stays lightweight by storing
// only user IDs, while Autocomplete renders names and avatars.
export function MultiUserPicker({
  users,
  value,
  onChange,
}: MultiUserPickerProps) {
  const selectedUsers = users.filter((user) => value.includes(user.id));

  return (
    <Autocomplete
      multiple
      options={users}
      value={selectedUsers}
      getOptionLabel={(option) => option.fullName}
      onChange={(_, newUsers) => {
        onChange(newUsers.map((user) => user.id));
      }}
      renderOption={(props, option) => (
        <li {...props}>
          <Avatar
            src={option.avatar}
            sx={{
              width: 24,
              height: 24,
              mr: 1,
            }}
          >
            {option.fullName.charAt(0)}
          </Avatar>

          {option.fullName}
        </li>
      )}
      renderInput={(params) => <TextField {...params} label="Attendees" />}
    />
  );
}
