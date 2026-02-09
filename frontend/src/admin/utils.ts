// Utility functies voor filters, sorting, formatting
import { format } from "date-fns";
import { Member } from "./types";

export function formatDate(date: string | Date, formatStr = "dd-MM-yyyy") {
  return format(new Date(date), formatStr);
}

export function filterMembers(members: Member[], query: string) {
  return members.filter((m) =>
    (m.firstName + " " + m.lastName + " " + m.email)
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
}

export function sortMembers(members: Member[], key: keyof Member, asc = true) {
  return [...members].sort((a, b) => {
    if (a[key] && b[key]) {
      return asc
        ? String(a[key]).localeCompare(String(b[key]))
        : String(b[key]).localeCompare(String(a[key]));
    }
    return 0;
  });
}
