import { profile } from "@/data/profile";
import { locales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getNotes, getProjects, pageHref } from "@/lib/content";

import type { Command } from "./commands";

const host = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "");

/**
 * Everything the command menu can do on a page in this language: open a
 * case study or a note, jump to a section of the home, or run an action.
 * Built at build time; the menu receives plain data.
 */
export async function getCommands(
  locale: Locale,
  dict: Dictionary,
): Promise<Command[]> {
  const [projects, notes] = await Promise.all([
    getProjects(locale),
    getNotes(locale),
  ]);
  const other = locales.find((l) => l !== locale)!;

  // The home's sections, in page order, named as their headers name them.
  const sections = [
    ["capabilities", dict.capabilities.eyebrow],
    ["work", dict.work.eyebrow],
    ["notes", dict.notes.eyebrow],
    ["process", dict.process.eyebrow],
    ["experience", dict.experience.eyebrow],
    ["stack", dict.stack.eyebrow],
    ["about", dict.about.eyebrow],
    ["contact", dict.contact.eyebrow],
  ] as const;

  return [
    ...projects.map((project): Command => ({
      id: `project-${project.slug}`,
      group: "projects",
      icon: "project",
      label: project.name,
      hint: project.tagline,
      keywords: project.stack,
      action: { type: "navigate", href: project.href },
    })),
    ...notes.map((note): Command => ({
      id: `note-${note.slug}`,
      group: "notes",
      icon: "note",
      label: note.title,
      keywords: note.projects,
      action: { type: "navigate", href: note.href },
    })),
    ...sections.map(([id, label]): Command => ({
      id: `section-${id}`,
      group: "sections",
      icon: "section",
      label,
      keywords: [id],
      action: { type: "navigate", href: `/${locale}#${id}` },
    })),
    {
      id: "colophon",
      group: "sections",
      icon: "note",
      label: dict.command.colophon,
      keywords: ["colophon", "colofón", "stack", "deploy", "ci"],
      action: { type: "navigate", href: pageHref(locale, "colophon") },
    },
    {
      id: "locale",
      group: "actions",
      icon: "language",
      label: dict.command.switchLanguage,
      keywords: ["language", "idioma", "english", "español"],
      action: { type: "locale", locale: other },
    },
    {
      id: "shortcuts",
      group: "actions",
      icon: "keyboard",
      label: dict.command.shortcuts,
      keywords: ["vim", "keys", "help", "atajos", "teclado", "ayuda"],
      action: { type: "help" },
    },
    {
      id: "copy-email",
      group: "actions",
      icon: "copy",
      label: dict.command.copyEmail,
      hint: profile.email,
      keywords: ["email", "contact", "contacto", "correo"],
      action: { type: "copy", text: profile.email },
    },
    {
      id: "github",
      group: "actions",
      icon: "github",
      label: dict.command.github,
      hint: host(profile.links.github),
      action: { type: "external", href: profile.links.github },
    },
    {
      id: "linkedin",
      group: "actions",
      icon: "linkedin",
      label: dict.command.linkedin,
      hint: host(profile.links.linkedin).replace(/\/$/, ""),
      action: { type: "external", href: profile.links.linkedin },
    },
    {
      id: "source",
      group: "actions",
      icon: "source",
      label: dict.command.source,
      hint: host(profile.repository),
      keywords: ["repository", "repositorio", "github", "code", "código"],
      action: { type: "external", href: profile.repository },
    },
  ];
}
