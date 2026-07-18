"use client";

import { useTransition } from "react";
import { markJournalComplete } from "@/app/actions";
import { POINTS } from "@/lib/challenges";
import { Star } from "@/components/star";

const JOURNAL_QUESTIONS = [
  "Si tuvieras que describirte en 3 palabras que NUNCA has usado por el miedo al qué dirán, ¿cuáles serían? ¿Por qué esas y no las que sí usas?",
  "¿Qué es algo que haces diferente a como lo haría cualquier otra persona?",
  "¿Qué rasgo tuyo que antes veías como defecto, hoy ves como tu mayor fortaleza?",
  "¿Cuándo fue la última vez que hiciste algo y pensaste "esto es tan yo"? ¿Qué fue?",
  "¿Qué dirían de ti las personas que más te conocen que tú nunca dirías de ti mismo?",
  "¿Qué parte de ti intentas esconder o suavizar cuando estás frente a personas nuevas?",
  "¿Qué tipo de contenido, arte o historia te hace sentir que alguien te leyó la mente?",
  "¿Qué temas podrías hablar durante horas sin cansarte, aunque nadie te lo pidiera?",
  "¿Qué es lo que más te emociona de lo que haces o quieres hacer? No del resultado, del proceso.",
  "¿Qué harías con tu tiempo si el dinero no fuera una variable?",
  "¿Qué es algo en lo que crees profundamente que la mayoría de personas no cree?",
  "¿Qué tres marcas, personas o proyectos admiras tanto que a veces piensas "yo quiero algo así"? ¿Qué tienen en común?",
  "Si tu vida fuera una película, ¿de qué género sería y quién la dirigiría?",
  "¿Qué tipo de espacios físicos te hacen sentir más tú? (cafés, estudios, naturaleza, ciudades, silencio…)",
  "¿Qué canciones o artistas sientes que describen tu energía mejor que tú mismo?",
  "¿Qué estética visual te atrae de forma instintiva?",
  "Si tu marca fuera un personaje de serie o película, ¿quién sería y por qué?",
  "¿Qué parte de ti has estado esperando "el momento perfecto" para mostrar?",
  "¿Qué cosas harías diferente si supieras que nadie te va a juzgar?",
  "¿Qué es algo que sabes hacer muy bien pero que minimizas porque sientes que "todo el mundo lo hace"?",
  "¿Qué consejo le darías a alguien en tu misma situación que tú mismo no te has dado?",
  "¿Cómo quieres que se sienta alguien después de interactuar contigo, aunque sea por primera vez?",
  "¿Qué quieres que recuerden de ti cuando ya no estés?",
  "Si pudieras cambiar UNA cosa en la vida de las personas que te conocen, ¿qué sería?",
  "¿Qué mensaje llevas años queriendo decirle al mundo que todavía no has dicho con claridad?",
  "¿En qué se parece lo que quieres construir a algo que ya existe, y en qué es completamente diferente?",
  "Si dentro de 5 años alguien hablara de ti con admiración, ¿qué te gustaría que dijeran?",
  "¿Has detectado tus monstruos mentales, esos que no te dejan avanzar y te bloquean? Escríbelos para que cada que los sientas regresar los puedas identificar.",
];

function getTodayQuestion(): string {
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  return JOURNAL_QUESTIONS[dayIndex % JOURNAL_QUESTIONS.length];
}

export default function JournalCard({ done }: { done: boolean }) {
  const [pending, startTransition] = useTransition();
  const question = getTodayQuestion();

  return (
    <div
      className="rounded-2xl border p-5"
      style={done
        ? { borderColor: "var(--brand-yellow)", backgroundColor: "#fffdf0" }
        : { borderColor: "#e5e5e5", backgroundColor: "white" }
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
            Reto diario
          </p>
          <h3 className="mt-1 text-base font-bold lowercase text-neutral-900">
            journaling
          </h3>
          <p className="mt-1 text-sm font-normal text-neutral-600">
            Escribe una página de journal — reflexión libre, autoconocimiento.
          </p>
          <div className="mt-3 rounded-xl border px-3 py-2.5" style={{ backgroundColor: done ? "#fff8e1" : "#fdf4ff", borderColor: "var(--brand-pink)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--brand-pink)" }}>
              ✦ pregunta de hoy
            </p>
            <p className="text-sm text-neutral-700 leading-relaxed italic">
              {question}
            </p>
          </div>
          <p className="mt-2 text-xs font-normal text-neutral-400">
            +{POINTS.JOURNAL_DAILY} puntos
          </p>
        </div>

        {done ? (
          <span
            className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm"
            style={{ backgroundColor: "var(--brand-yellow)" }}
          >
            <Star size={16} />
          </span>
        ) : (
          <button
            disabled={pending}
            onClick={() => startTransition(() => markJournalComplete())}
            className="mt-1 flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "var(--brand-pink)" }}
          >
            {pending ? "…" : "hecho"}
          </button>
        )}
      </div>

      {done && (
        <p className="mt-3 text-xs font-normal text-neutral-500 flex items-center gap-1">
          <Star size={12} />
          completado hoy · +{POINTS.JOURNAL_DAILY} pts sumados
        </p>
      )}
    </div>
  );
}
