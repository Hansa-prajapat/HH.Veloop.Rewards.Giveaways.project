# VELOOP Functional Updates

## Implemented logic
1. **Daily target**: target is derived from the number of ads in `ADS`, so the current 6-ad inventory has a reachable target of 6. If more ads are added later, the target automatically follows the inventory.
2. **Actual earnings**: every completed ad adds its own `reward` value. Today's earnings are stored separately as `todayEarnings` and no longer use a fixed 15 VE multiplier.
3. **Single active ad session**: only one ad can run at a time. Closing the modal clears both the loading timeout and countdown interval, so a closed ad cannot continue earning in the background.
4. **Winner eligibility + persistence**: the user's live leaderboard rank is calculated from stored activity. Only ranks 1–3 are eligible for a gift claim and the profile delivery form stays locked otherwise. Submitted entries are stored in localStorage and remain after refresh.
5. **Dynamic leaderboard**: the user is inserted into the weekly ranking using accumulated VE points and completed ads, then sorted by points.
6. **Daily streak**: completing the full daily target records the completion date and increments the streak on consecutive target-completion days.
7. **Reward claiming**: the Rewards page and Leaderboard claim controls use the live rank and persist the claimed reward in localStorage.
8. **Daily reset**: daily watched ads, today's earnings and recent activity reset when the calendar date changes, while lifetime points remain.

## Demo note
This is still a frontend/localStorage demo. Real multi-user leaderboard, server-side winner verification and real gift fulfilment require a backend/database and authenticated server-side checks.
