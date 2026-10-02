import type { Dictionary } from "./en";

/** Textos de interfaz en español neutro. Debe tener exactamente las claves de `en.ts`. */
export const es = {
  meta: {
    siteName: "Denis Siavichay",
    title: "Denis Siavichay — Software Engineer",
    description:
      "Software engineer que construye los sistemas con los que opera un negocio —cotización, inventario, facturación y producción—, desde el modelo de dominio hasta el pipeline de deploy.",
  },
  a11y: {
    skipToContent: "Saltar al contenido",
    primaryNavigation: "Principal",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    home: "Denis Siavichay, inicio",
    languageSwitcher: "Idioma",
  },
  nav: {
    work: "Proyectos",
    notes: "Notas",
    experience: "Experiencia",
    about: "Sobre mí",
    contact: "Contacto",
  },
  placeholder: {
    role: "Software Engineer",
    body: "Este sitio se está reconstruyendo. Pronto estarán aquí los proyectos, los case studies y las notas de ingeniería.",
  },
  notFound: {
    title: "Esta página no existe.",
    body: "Puede que el enlace sea antiguo o tenga un error.",
    back: "Volver al inicio",
  },
} satisfies Dictionary;
