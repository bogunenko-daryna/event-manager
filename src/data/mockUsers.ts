import type { User } from "../types/user";

const names = [
  "Alex Johnson",
  "Maria Smith",
  "John Brown",
  "Anna Novak",
  "David Miller",
  "Sofia Wilson",
];

export const mockUsers: User[] = Array.from({ length: 300 }, (_, index) => ({
  id: `user-${index + 1}`,
  fullName: names[index % names.length] + ` ${index + 1}`,
  avatar: index < 5 ? `https://i.pravatar.cc/150?img=${index + 1}` : undefined,
}));
