interface RankUser {
  id: string;
  full_name: string;
  points_total: number;
}

interface Props {
  users: RankUser[];
  currentUserId: string;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default function RankingTab({ users, currentUserId }: Props) {
  if (users.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-neutral-400">
        Aún no hay participantes en el ranking.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <p className="mb-4 text-xs text-neutral-400">
        Top 3 al final de las 5 semanas ganan premios.
      </p>

      <div className="flex flex-col gap-2">
        {users.map((user, index) => {
          const rank = index + 1;
          const isMe = user.id === currentUserId;
          const isTop3 = rank <= 3;

          return (
            <div
              key={user.id}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                isMe
                  ? "bg-neutral-900 text-white"
                  : isTop3
                  ? "bg-neutral-50"
                  : "bg-white border border-neutral-100"
              }`}
            >
              {/* Rank */}
              <div className="w-7 flex-shrink-0 text-center">
                {isTop3 ? (
                  <span className="text-base">{MEDALS[rank - 1]}</span>
                ) : (
                  <span className={`text-sm font-medium ${isMe ? "text-neutral-300" : "text-neutral-400"}`}>
                    {rank}
                  </span>
                )}
              </div>

              {/* Name */}
              <p className={`flex-1 truncate text-sm font-medium ${isMe ? "text-white" : "text-neutral-900"}`}>
                {user.full_name}
                {isMe && (
                  <span className={`ml-2 text-xs font-normal ${isMe ? "text-neutral-400" : "text-neutral-400"}`}>
                    (tú)
                  </span>
                )}
              </p>

              {/* Points */}
              <p className={`flex-shrink-0 text-sm font-semibold tabular-nums ${isMe ? "text-white" : "text-neutral-900"}`}>
                {user.points_total} <span className={`text-xs font-normal ${isMe ? "text-neutral-400" : "text-neutral-500"}`}>pts</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
