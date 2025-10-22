# ELIMINATION MODE - Game Design Document

## Overview
This is a fundamentally different game mode where **traps cause progressive elimination** instead of instant game-over.

---

## Core Mechanic: Progressive Elimination

### How It Works
1. When a **NEW trap type** is discovered → Elimination rate increases by 10%
2. **Every subsequent round** → That percentage of remaining players are eliminated
3. Eliminated players **get NO rewards** from that point forward
4. Game continues until **all players eliminated** or **prize pool depleted**

### Elimination Rates

| Trap Types Found | Elimination Rate | Players Eliminated per Round |
|------------------|------------------|------------------------------|
| 0 | 0% | None |
| 1 | **10%** | ~50 players (from 500) |
| 2 | **20%** | ~90 players (from 450) |
| 3 | **30%** | ~108 players (from 360) |
| 4 | **40%** | ~101 players (from 252) |
| 5 | **50%** | ~75 players (from 151) |
| 6 | **60%** | ~46 players (from 76) |

---

## Major Differences from Original Mode

| Feature | Original Mode | Elimination Mode |
|---------|---------------|------------------|
| **Trap Outcome** | 2nd duplicate = instant death | Progressive elimination |
| **Game Length** | ~10 rounds (fast) | ~20-30 rounds (longer) |
| **Trap Strategy** | Avoid duplicates | Escape before too many types |
| **Survival** | Binary (alive or dead) | Gradual attrition |
| **Player Count** | Stable until game over | Constantly decreasing |
| **Tension** | Sudden death fear | Watching numbers dwindle |

---

## Strategic Implications

### For Players

**Early Game (0-1 trap types):**
- Low elimination rate (0-10%)
- Safe to hunt for more loot
- Build up your share

**Mid Game (2-3 trap types):**
- Moderate elimination (20-30%)
- Decision point: escape or push luck?
- $10k breakeven becomes harder to reach

**Late Game (4+ trap types):**
- High elimination (40%+)
- Every round, half your competition dies
- Escape NOW or lose everything

### Optimal Strategy

**Conservative:** Escape at 2 trap types with $6k-$8k
**Balanced:** Escape at 3 trap types with $8k-$10k
**Aggressive:** Stay through 4+ trap types, aim for $12k+

---

## Game End Scenarios

### 1. All Players Eliminated 💀
- Elimination rate caught everyone
- Happens if 5-6 trap types discovered
- Game Over screen shows total eliminated

### 2. Prize Pool Depleted 💰
- Money runs out before players
- Rare in this mode
- Final raffle for remaining relics

### 3. Player Escapes Manually 🏃
- You choose to leave
- Take your share + bonus
- Avoid elimination

---

## Example Game Flow

**Round 1-3:** Normal hunting, loot accumulation
**Round 4:** 🚨 First trap (Security Guard) → 10% elimination starts NEXT round
**Round 5:** ⚠️ 50 players eliminated, loot draw
**Round 6:** ⚠️ 45 players eliminated, loot draw
**Round 7:** 🚨 Second trap (Laser Fields) → 20% elimination starts NEXT round
**Round 8:** ⚠️ 81 players eliminated, loot draw
**Round 9:** ⚠️ 65 players eliminated, escape bonus pool huge
**Round 10:** 🚨 Third trap (Hounds) → 30% elimination starts NEXT round
**Round 11:** ⚠️ Mass exodus (150 players escape due to $100k+ bonus pool)
**Round 12:** ⚠️ 53 players eliminated from remaining 200
**Round 13-20:** Continued attrition...
**Round 21:** 💀 Last 5 players eliminated → Game Over

---

## Configuration Details

### Current Settings (Elimination Branch)
- **Trap probability:** 40% (High Risk mode)
- **Loot percentages:** 20-60% (Aggressive)
- **Escape bonus:** 12% (High incentive)
- **Elimination trigger:** At START of each round
- **No instant death:** Duplicates allowed

### Elimination Calculation
```javascript
eliminationRate = uniqueTrapTypes.size × 0.10
playersEliminated = floor(playerCount × eliminationRate)
```

---

## UI/UX Considerations

### What Players See

**When New Trap Discovered:**
> 🚨 NEW TRAP TYPE! Security Guard 👮 discovered! Elimination rate now 10% per round (1 trap type(s) active).

**Each Round Start:**
> ⚠️ TRAP ELIMINATION! 50 players caught (10% elimination rate with 1 trap type(s)). 450 players remain.

**Game Over (All Eliminated):**
> 💀 ALL PLAYERS ELIMINATED! Everyone was caught by the traps!

### Player Count Display
Shows:
- Active players (can still win)
- Eliminated players (caught, no rewards)
- Escaped players (took their share and left)

---

## Balance Considerations

### Advantages
✅ Longer games = more strategic depth
✅ No instant death = less frustration
✅ Progressive difficulty = tension builds
✅ More time to reach $10k breakeven
✅ Elimination creates urgency to escape

### Challenges
⚠️ Games may be too long (~30+ rounds)
⚠️ 50% elimination rate might feel too harsh
⚠️ Players might escape too early (missing content)
⚠️ Prize pool may deplete less often
⚠️ Less "sudden death" excitement

### Potential Adjustments
- Increase elimination rate to 15% per trap type (faster)
- Cap elimination at 50% max (less harsh late game)
- Reduce trap probability to 30% (slower buildup)
- Add bonus rewards for surviving 5+ trap types

---

## Testing Checklist

- [ ] Confirm elimination happens each round
- [ ] Verify unique trap types tracked correctly
- [ ] Test all 6 trap types can be discovered
- [ ] Ensure eliminated players don't get loot
- [ ] Check game ends when all players eliminated
- [ ] Verify UI shows elimination messages
- [ ] Test escape with various trap counts
- [ ] Confirm relic raffles work with elimination
- [ ] Test $100k bonus pool exodus scenarios
- [ ] Verify game length (~20-30 rounds)

---

## Future Enhancements

### Possible Features
1. **Elimination Protection**: Items/relics that reduce elimination rate
2. **Revival Mechanic**: Chance to save eliminated players
3. **Trap Disarming**: Spend loot to remove a trap type
4. **Elimination Threshold**: Game ends at 10 players (not 0)
5. **Survivor Bonus**: Extra rewards for lasting many rounds
6. **Visual Indicators**: Show elimination rate in UI
7. **Elimination History**: Track who got eliminated when
8. **Last Stand**: Special event when <10 players remain

---

## Comparison: Which Mode to Play?

### Play Original Mode if you want:
- **Fast games** (5-10 minutes)
- **High tension** (one mistake = death)
- **Quick rounds** (~10 rounds)
- **Sudden death** excitement

### Play Elimination Mode if you want:
- **Strategic depth** (longer games)
- **Survival challenge** (beat the odds)
- **Progressive difficulty** (watch the carnage)
- **More time** to reach $10k breakeven

---

**Current Branch:** `elimination`
**Based On:** High Risk/Reward mode + 12% escape bonus + Enhanced escape incentives
**Status:** ⚠️ Testing - Not yet pushed to production


