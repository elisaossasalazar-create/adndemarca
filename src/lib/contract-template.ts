export interface ContractBlank {
  id: string;
  before: string;
  after: string;
  placeholder: string;
}

// Plantilla provisional del "contrato consigo misma". La redacción final se
// definirá en una iteración posterior; esta estructura de espacios en blanco
// se mantiene igual aunque cambie el texto.
export const CONTRACT_TEMPLATE: ContractBlank[] = [
  {
    id: "compromiso",
    before: "Me comprometo a ",
    after: " durante estas 5 semanas.",
    placeholder: "ej. escribir mi journal todos los días",
  },
  {
    id: "recordar",
    before: "Cuando sienta ganas de rendirme, voy a recordar que ",
    after: ".",
    placeholder: "ej. esto lo hago por mí",
  },
  {
    id: "final",
    before: "Al final de este curso quiero poder decir que ",
    after: ".",
    placeholder: "ej. construí una marca que me representa",
  },
  {
    id: "persona",
    before: "La persona en la que me quiero convertir al terminar este reto es alguien que ",
    after: ".",
    placeholder: "ej. actúa en vez de solo pensarlo",
  },
];

export type ContractAnswers = Record<string, string>;
