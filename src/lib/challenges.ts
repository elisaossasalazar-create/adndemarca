export interface Challenge {
  id: string; // "w1c1", "w1c2", etc.
  week: number;
  title: string;
  description: string;
}

// Puntos por tipo de reto — valores por defecto; el admin puede sobreescribirlos en /admin
export const POINTS = {
  JOURNAL_DAILY: 10,
  WEEKLY_HOTMART: 50,
  EXTRA_CHALLENGE: 20,
} as const;

export type PointsConfig = { JOURNAL_DAILY: number; WEEKLY_HOTMART: number; EXTRA_CHALLENGE: number };

export const ALL_CHALLENGES: Challenge[] = [
  // ── Semana 1 — Diferencial ──────────────────────────────────────────────
  {
    id: "w1c1",
    week: 1,
    title: "claridad ven a mí",
    description:
      "Si aún te confunde un poco eso que quieres hacer o crear, haz una lista de 10 cosas que te representan, te gustan y te apasionan. Resalta las que quieres que hagan parte de tu marca.",
  },
  {
    id: "w1c2",
    week: 1,
    title: "y mi oferta es?",
    description:
      "Define en una sola frase qué vende, qué le ofrece o qué le soluciona o provee tu marca a las personas a las que quiere llegarles.",
  },
  {
    id: "w1c3",
    week: 1,
    title: "ven te doy una mano…",
    description:
      "Crea una idea de contenido, una idea de producto o servicio que resuelva específicamente una tensión de tu cliente ideal. No tienes que lanzarla ya, solo nombrarla y describirla — ¡pero si la lanzas, mejor!",
  },
  {
    id: "w1c4",
    week: 1,
    title: "démosle la vuelta a la tortilla",
    description:
      "Cambia la forma en la que vendes tu producto o servicio. Identifica qué resuelve ese producto o servicio, y crea unas historias en Instagram en las que comiences abordando la tensión de tu cliente ideal y termines con un CTA clave. Publícalo y muéstranos la evidencia.",
  },
  {
    id: "w1c5",
    week: 1,
    title: "validar, validar, validar",
    description:
      "Crea una encuesta corta (Google Forms, historia de Instagram con caja de preguntas, o WhatsApp) en la que le muestres a las personas en qué quieres que se diferencie tu marca, y pregúntales si estarían dispuestos a comprarte o si verían tu contenido. Ojo: no le digas a la gente que es tu marca — dile que es una marca hipotética para recibir respuestas más honestas.",
  },

  // ── Semana 2 — Narrativa y códigos verbales ──────────────────────────────
  {
    id: "w2c1",
    week: 2,
    title: "new bio, new you",
    description:
      "Reescribe tu biografía de Instagram para que refleje tu narrativa y mézclale tu personalidad. Que yo entre a tu perfil y entienda qué haces y pueda ver tu personalidad entre líneas. Publica el antes/después.",
  },
  {
    id: "w2c2",
    week: 2,
    title: "hello, y tú eres?",
    description:
      "Crea un reel o carrusel en el que te presentes: cuéntame quién eres, qué haces, tu historia y por qué debería seguirte. Publícalo y muéstranos la evidencia.",
  },
  {
    id: "w2c3",
    week: 2,
    title: "haz el diccionario de tu marca",
    description:
      "Escribe una lista de 10 palabras o frases que son muy tú y que harán parte de tu idioma de marca. Dales una descripción que sea muy tu marca y úsalas en un post esta semana. Publícalo y muéstranos la evidencia.",
  },
  {
    id: "w2c4",
    week: 2,
    title: "lo que harías sin que nadie mirara",
    description:
      "Haz una lista de 5 cosas que harías con tu marca si nadie más fuera a verlo o juzgarlo. Elige UNA cosa pequeña de esa lista y publícala esta semana, aunque te dé nervios. Muéstranos la evidencia.",
  },
  {
    id: "w2c5",
    week: 2,
    title: "llamada a un amigo",
    description:
      "Pregúntale a 3 personas que te conocen muy bien qué es lo que sienten que más te representa, cuáles son esas cosas que siempre dicen de ti, y cómo es tu forma de ser. Elige 1 cosa que ellos tengan en común y crea una idea de contenido, producto o servicio. Muéstranos la idea.",
  },

  // ── Semana 3 — Códigos visuales y comunicación ───────────────────────────
  {
    id: "w3c1",
    week: 3,
    title: "la repetición de la repetidera",
    description:
      "Define tu territorio de marca: el mensaje o tema que vas a repetir siempre. Deja la evidencia aquí.",
  },
  {
    id: "w3c2",
    week: 3,
    title: "lo que es tan tú",
    description:
      "Identifica algo que haces, dices o piensas que es completamente tuyo — algo que, si alguien te conoce, sabe que viene de ti. Tradúcelo en UNA nueva idea de producto, servicio o arte. Muéstranos la evidencia.",
  },
  {
    id: "w3c3",
    week: 3,
    title: "el código que se repite",
    description:
      "Elige un elemento visual que vayas a repetir intencionalmente de ahora en adelante y úsalo en 2 publicaciones o historias distintas esta semana. Publícalo y muéstranos la evidencia.",
  },
  {
    id: "w3c4",
    week: 3,
    title: "el antes y el sesgo",
    description:
      "Elige un sesgo cognitivo que viste en clase y reescribe un mensaje de venta o caption usando ese sesgo a propósito. Publica el mensaje.",
  },
  {
    id: "w3c5",
    week: 3,
    title: "del moodboard a la realidad",
    description:
      "Crea un moodboard de tu universo visual (Pinterest, Canva, lo que sea) y luego reinterpreta UNA de esas referencias con tu propio contenido, empaque de producto, set de grabación, portada de una canción, etc. Convierte inspiración en pieza real que te represente.",
  },

  // ── Semana 4 — Redes sociales ────────────────────────────────────────────
  {
    id: "w4c1",
    week: 4,
    title: "mismo mensaje, dos idiomas",
    description:
      "Toma una idea de contenido y publícala en Instagram y TikTok, pero adaptada al “idioma” real de cada plataforma (no la misma pieza copiada y pegada). Compara cómo cambió la ejecución. Publícalo y muéstranos la evidencia.",
  },
  {
    id: "w4c2",
    week: 4,
    title: "make me feel something!!!",
    description:
      "Elige un tipo de emoción visto en la sesión y crea una pieza de contenido diseñada específicamente para provocar esa emoción. Publícala y observa qué tipo de comentarios o reacciones genera.",
  },
  {
    id: "w4c3",
    week: 4,
    title: "mi primera chamba",
    description:
      "Define tu primera serie de contenido: ponle un nombre, crea la estructura y crea el primer guión.",
  },
  {
    id: "w4c4",
    week: 4,
    title: "ay Diosito, se llegó",
    description:
      "Abre tu cuenta de Instagram y TikTok. Muéstranos la evidencia.",
  },
  {
    id: "w4c5",
    week: 4,
    title: "vamos a ordenarlos, ok?",
    description:
      "Crea tu calendario de contenido para la próxima semana completa y compártelo como una historia para comprometerte públicamente. Muéstranos la evidencia.",
  },

  // ── Semana 5 — Estrategias ───────────────────────────────────────────────
  {
    id: "w5c1",
    week: 5,
    title: "mamá diseñe mi primera estrategia",
    description:
      "Elige UNO de los 3 tipos (venta, posicionamiento o fidelización) según lo que tu marca necesite más ahora, y diseña una mini-estrategia concreta: qué vas a hacer, cuándo, en qué canal. Ejecútala esta semana, aunque sea en pequeña escala. Muéstranos la evidencia.",
  },
  {
    id: "w5c2",
    week: 5,
    title: "el insight detrás de todo",
    description:
      "Antes de lanzar cualquier estrategia, identifica un insight cultural o emocional de tu audiencia (algo que viven, sienten o dicen) y úsalo como base para una idea de contenido. Publícala y muéstranos la evidencia.",
  },
  {
    id: "w5c4",
    week: 5,
    title: "el mensaje para el dormido de la clase",
    description:
      "Crea una pieza de contenido dirigida a alguien que ni siquiera sabe que tiene el problema que tú resuelves. No puedes vender solución, solo despertar consciencia. Publícalo y muéstranos la evidencia.",
  },
  {
    id: "w5c5",
    week: 5,
    title: "tu fecha clave",
    description:
      "Identifica una fecha comercial o cultural relevante en las próximas semanas (puede ser algo más nicho de tu industria) y crea el concepto inicial de una estrategia o pieza ligada a esa fecha. Muéstranos la evidencia.",
  },
];

export function getChallengesForWeek(week: number): Challenge[] {
  return ALL_CHALLENGES.filter((c) => c.week === week);
}
