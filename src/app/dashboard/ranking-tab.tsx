import { Star, PinkStar } from "@/components/star";

interface RankUser {
  id: string;
  full_name: string;
  points_total: number;
}

interface Props {
  users: RankUser[];
  currentUserId: string;
}

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
      <p className="mb-4 text-xs font-normal text-neutral-400 flex items-center gap-1">
        <Star size={12} />
        top 3 al final de las 5 semanas ganan premios
      </p>

      <div className="flex flex-col gap-2">
        {users.map((user, index) => {
          const rank = index + 1;
          const isMe = user.id === currentUserId;
          const isTop3 = rank <= 3;

          return (
            <div
              key={user.id}
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={
                isMe
                  ? { backgroundColor: "var(--brand-pink)", color: "white" }
                  : isTop3
                  ? { backgroundColor: "var(--brand-blue)" }
                  : { backgroundColor: "white", border: "1px solid #f0f0f0" }
              }
            >
              {/* Rank */}
              <div className="w-7 flex-shrink-0 text-center">
                {isTop3 ? (
                  <PinkStar size={18} />
                ) : (
                  <span className={`text-sm font-medium ${isMe ? "text-white/70" : "text-neutral-400"}`}>
                    {rank}
                  </span>
                )}
              </div>

              {/* Name */}
              <p className={`flex-1 truncate text-sm font-bold lowercase ${isMe ? "text-white" : "text-neutral-900"}`}>
                {user.full_name}
                {isMe && (
                  <span className="ml-2 text-xs font-normal opacity-70">(tú)</span>
                )}
              </p>

              {/* Points */}
              <div
                className="flex-shrink-0 flex items-center gap-1 rounded-full px-2.5 py-1"
                style={isMe ? { backgroundColor: "rgba(255,255,255,0.25)" } : { backgroundColor: "rgba(0,0,0,0.06)" }}
              >
                <Star size={11} />
                <span className={`text-xs font-bold tabular-nums ${isMe ? "text-white" : "text-neutral-900"}`}>
                  {user.points_total}
                </span>
                <span className={`text-[10px] font-normal ${isMe ? "text-white/70" : "text-neutral-500"}`}>pts</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
