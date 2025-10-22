# Current Game Odds - Elimination Branch

*Last Updated: Based on commit 30c1cbb*

---

## 🎲 Round Draw Probabilities

### Before All Relics Taken
- **Loot**: 50%
- **Trap**: 40%
- **Relic**: 10%

### After All 3 Relics Taken
- **Loot**: 60%
- **Trap**: 40%

---

## 💰 Loot Draw Percentages

Percentage of remaining prize pool drawn:

| Loot Draw # | Range | Average |
|-------------|-------|---------|
| **Draws 1-2** | 20%-35% | 27.5% |
| **Draws 3-4** | 30%-45% | 37.5% |
| **Draws 5-6** | 40%-55% | 47.5% |
| **Draws 7+** | 45%-60% | 52.5% |

### Loot Distribution
- **88%** goes to players (split equally)
- **12%** goes to escape bonus pool

---

## ⚠️ Elimination Rates (Progressive)

Percentage of remaining players eliminated per round:

| Unique Trap Types | Elimination Rate |
|-------------------|------------------|
| **0** | 0% |
| **1** | 20% |
| **2** | 30% |
| **3** | 40% |
| **4** | 50% |
| **5** | 60% |
| **6** | 70% |

**Formula**: `10% + (trapTypes × 10%)`

---

## 🚨 Instant Game Over

- **Duplicate Trap**: 100% game over (any trap drawn twice = instant death for all)

---

## ✨ Relic Mechanics

### Discovery
- **Max Relics**: 3 total in game
- **Discovery Chance**: 10% per round (before all found)
- **Availability**: Next turn after discovery

### Relic Raffle (When Players Escape)

**Raffle Threshold**: `6.5% × number of available relics`

Examples:
- 1 relic available: Raffle held if <6.5% of players escape
- 2 relics available: Raffle held if <13% of players escape
- 3 relics available: Raffle held if <19.5% of players escape

**If raffle held**:
- Each escaping player has equal chance to win
- Each player can win max 1 relic
- Multiple relics raffled if available

**If too many escape**:
- No raffle held
- Relics remain in vault

---

## 🏃 AI Player Escape Rates

### Players with LESS than $10,000

**Base Rates (by trap count)**:
- 0 traps: 0.1%
- 1 trap: 0.5%
- 2 traps: 2%
- 3+ traps: 5% + (3% per additional trap)

**Bonus Pool Incentives**:
- Bonus pool > $100,000: +3%
- Bonus pool > 10% of prize pool (but < $100k): +1%

### Players with $10,000+

**Base Rate**: 5%

**Trap Risk Incentive**: +3% per trap

**Escape Bonus Incentive**:
- Bonus pool > $100,000: +15% 🔥
- Otherwise: Up to +10% based on pool size

**Relic Incentive**: +4% per available relic (max +15%)

**Newly Discovered Relic**: +5%

### Examples

**Low loot player ($5k) with 1 trap, $50k bonus**:
- Base: 0.5%
- Total: **0.5%** (very reluctant)

**High loot player ($12k) with 2 traps, $150k bonus, 2 relics**:
- Base: 5%
- Traps: +6%
- Bonus: +15%
- Relics: +8%
- Total: **34%** (very likely to escape)

**Player with $12k, 3 traps, $120k bonus, new relic just found**:
- Base: 5%
- Traps: +9%
- Bonus: +15%
- New relic: +5%
- Total: **34%** (mass exodus likely)

---

## 🎯 Manual Player Escape

When YOU press "Escape with Loot":

**Other Players Escape Rate**:
- Base: 8%
- Bonus pool > $100k: +20%
- Otherwise: Based on pool size (up to +12%)
- Relics: +4% per relic (max +15%)
- Newly discovered relic: +5%

**Example**: If you escape with $150k bonus pool and 2 relics:
- 8% + 20% + 8% = **36%** of other players escape with you

---

## 💀 Game End Probabilities

### Expected Game Length

**With 40% trap rate and 50% loot rate:**
- Expected traps per round: 0.4
- Expected unique traps before duplicate: ~3.67
- Rounds between traps: ~2.5
- **Expected game length**: ~9-10 rounds before duplicate

**With elimination (20-70% rates):**
- Player count drops dramatically
- All eliminated in ~12-15 rounds (if no duplicate hit first)

### Ways Game Can End

1. **Duplicate Trap** (Most likely): ~80%
   - Probability increases with each trap
   - After 3 unique traps: ~50% chance next trap is duplicate

2. **All Players Eliminated** (Moderate): ~15%
   - Requires 4-5 unique traps without duplicate
   - High elimination rates + no escapes

3. **Prize Pool Depleted** (Very rare): <5%
   - Would need 25+ loot rounds
   - Extremely unlikely

4. **Player Escapes** (You decide): Variable
   - Strategic choice
   - Usually happens rounds 5-10

---

## 📊 Statistical Expectations

### Per 100 Games

**Game Ends By**:
- Duplicate trap: ~75 games
- All eliminated: ~15 games
- Prize pool empty: ~3 games
- Player escaped: ~7 games (you chose)

**Average Outcomes**:
- **Game length**: 9-11 rounds
- **Traps found**: 3-4 unique types
- **Player earnings**: $7,000-$9,000
- **Players reaching $10k**: ~30-40%

### Trap Duplicate Probability

| Unique Traps | Next Trap Duplicate Chance |
|--------------|---------------------------|
| 0 | 0% |
| 1 | 16.7% (1/6) |
| 2 | 33.3% (2/6) |
| 3 | 50% (3/6) |
| 4 | 66.7% (4/6) |
| 5 | 83.3% (5/6) |
| 6 | 100% (next guaranteed duplicate) |

---

## 🎮 Key Thresholds

### Important Breakpoints

**$10,000 Player Loot**:
- Changes AI behavior from cautious to normal
- Escape rates increase significantly
- Generally takes 15-18 loot rounds to reach

**$100,000 Escape Bonus Pool**:
- **MAJOR** escape trigger
- +15-20% escape rate for high-loot players
- Creates "mass exodus" scenarios
- Typically reached after 5-7 loot rounds

**3 Unique Trap Types**:
- 50% chance next trap is duplicate = game over
- 40% elimination rate (200 players die per round)
- Critical decision point for escaping

**5+ Unique Trap Types**:
- 60-70% elimination (catastrophic attrition)
- 83%+ chance of duplicate next
- Extreme danger zone

---

## 🧮 Formula Summary

**Elimination Rate**: `10% + (uniqueTrapTypes × 10%)`

**Escape Bonus**: `totalLoot × 12%`

**Player Loot**: `totalLoot × 88% ÷ playerCount`

**Escape Rate Base (AI)**:
- `5%` if loot ≥ $10k
- `0.1% - 5%` if loot < $10k (trap dependent)

**Duplicate Probability**: `uniqueTrapTypes ÷ 6`

**Relic Raffle Threshold**: `6.5% × availableRelics`

---

## 🎲 Luck Factor

**High Variance Elements**:
1. Loot percentage (20-60% range)
2. Trap timing (when duplicates hit)
3. Relic discoveries (10% chance)
4. AI escape timing (can swing 20-40%)

**More Predictable**:
1. Elimination rates (fixed percentages)
2. Escape bonus (always 12%)
3. Duplicate probability (deterministic)

---

## 🔄 Comparison to Main Branch

| Mechanic | Main Branch | Elimination Branch |
|----------|-------------|-------------------|
| Trap probability | 25% | 40% |
| Duplicate outcome | Game over | Game over |
| Elimination | None | 20-70% progressive |
| Loot ranges | 5-40% | 20-60% |
| Escape bonus | 5% | 12% |
| Game length | 16-18 rounds | 9-11 rounds |
| Relic chance | 12.5% | 10% |

---

*All values subject to change during testing and balancing*

