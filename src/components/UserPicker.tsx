import { Avatar, Autocomplete, TextField } from "@mui/material";
import type { User } from "../types/user";

type UserPickerProps = {
  users: User[];
  value: string;
  onChange: (userId: string) => void;
  label: string;
};

export function UserPicker({ users, value, onChange, label }: UserPickerProps) {
  const selectedUser = users.find((user) => user.id === value) ?? null;

  return (
    <Autocomplete
      options={users}
      value={selectedUser}
      getOptionLabel={(option) => option.fullName}
      onChange={(_, newValue) => {
        onChange(newValue?.id ?? "");
      }}
      renderOption={(props, option) => (
        <li {...props}>
          <Avatar src={option.avatar} sx={{ width: 24, height: 24, mr: 1 }}>
            {option.fullName.charAt(0)}
          </Avatar>

          {option.fullName}
        </li>
      )}
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  );
}
