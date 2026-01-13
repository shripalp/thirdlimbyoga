import { defineType, defineField } from "sanity";

export const scheduleItemType = defineType({
  name: "scheduleItem",
  title: "Schedule Item",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Class name", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "day",
      title: "Day",
      type: "string",
      options: { list: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "time", title: "Time (e.g., 6:00 PM)", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "isOnline", title: "Online", type: "boolean", initialValue: true }),
    defineField({ name: "location", title: "Location (for in-person)", type: "string" }),
    defineField({ name: "notes", title: "Notes", type: "text", rows: 2 }),
  ],
});
