export const CONTRACT_STATEMENT =
  "me comprometo a NO quedarme con la información que aprenda en el curso, la llevaré a la acción por mucho que me cueste, me rete, o mi mente quiera detenerme, me voy a lanzar";

export interface ContractBlank {
  id: string;
  before: string;
  after: string;
  placeholder: string;
}

export const CONTRACT_TEMPLATE: ContractBlank[] = [
  {
    id: "firma",
    before: "",
    after: "",
    placeholder: "escribe tu nombre para firmar",
  },
];

export type ContractAnswers = Record<string, string>;
