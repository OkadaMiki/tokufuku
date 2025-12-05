import { DAILY_CHALLENGE_EXP } from "@/constants/categories";
import type { ChallengeId, PlayerData } from "@/lib/playerData";
import { calculateExpUpdate, getRequiredExp } from "./calculator";

// デイリーチャレンジ完了
export const completeDailyChallenge = (
  player: PlayerData,
  id: ChallengeId,
): PlayerData => {
  const current = player.dailyChallenge?.completed || {};
  if (current[id]) return player; // 既に完了済みなら何もしない

  // 経験値加算
  const gain = DAILY_CHALLENGE_EXP[id] || 0;
  const { level, exp, totalExp } = calculateExpUpdate(player, gain);

  console.log(
    `Daily Challenge '${id}' Complete! +${gain} XP → Lv${level} (${exp}/${getRequiredExp(level)})`,
  );

  return {
    ...player,
    level,
    exp,
    totalExp,
    dailyChallenge: {
      completed: {
        ...current,
        [id]: true,
      },
    },
  };
};
