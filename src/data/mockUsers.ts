import type { User } from "../types/user";

const USERS_PER_GENDER = 150;

const womenFirstNames = [
  "Maria",
  "Anna",
  "Sofia",
  "Emma",
  "Olivia",
  "Isabella",
  "Mia",
  "Amelia",
  "Charlotte",
  "Harper",
  "Evelyn",
  "Abigail",
  "Emily",
  "Elizabeth",
  "Avery",
];

const menFirstNames = [
  "Alex",
  "John",
  "David",
  "Liam",
  "Noah",
  "Oliver",
  "Elijah",
  "James",
  "William",
  "Benjamin",
  "Lucas",
  "Henry",
  "Theodore",
  "Jack",
  "Levi",
];

const lastNames = [
  "Smith",
  "Novak",
  "Wilson",
  "Brown",
  "Davis",
  "Miller",
  "Garcia",
  "Rodriguez",
  "Martinez",
  "Anderson",
  "Taylor",
  "Thomas",
  "Moore",
  "Jackson",
  "White",
  "Harris",
  "Martin",
  "Thompson",
  "Robinson",
  "Clark",
];

function createUsers(
  count: number,
  firstNames: string[],
  avatarFolder: "men" | "women",
  startIndex: number
): User[] {
  return Array.from({ length: count }, (_, index) => {
    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[Math.floor(index / firstNames.length) % lastNames.length];

    return {
      id: `user-${startIndex + index}`,
      fullName: `${firstName} ${lastName}`,
      avatar: `https://randomuser.me/api/portraits/${avatarFolder}/${
        index % 100
      }.jpg`,
    };
  });
}

export const mockUsers: User[] = [
  ...createUsers(USERS_PER_GENDER, womenFirstNames, "women", 1),
  ...createUsers(USERS_PER_GENDER, menFirstNames, "men", USERS_PER_GENDER + 1),
];
