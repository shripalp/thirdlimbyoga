import { defineType, defineField } from "sanity";

export const classType = defineType({
  name: "class",
  title: "Class",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "level",
      title: "Level",
      type: "string",
      options: { list: ["Beginner", "All levels", "Intermediate", "Advanced"] },
    }),
    defineField({
      name: "durationMin",
      title: "Duration (minutes)",
      type: "number",
    }),
    defineField({
      name: "shortDescription",
      title: "Short description",
      type: "text",
      rows: 3,
    }),
  ],
});
