import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  Gift,
  Home,
  Menu,
  Play,
  PlayCircle,
  Trophy,
  UserRound,
  X,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  ShieldCheck,
  Plus,
  Users,
  Flame,
  WalletCards,
  Target,
  Medal,
  ArrowUpRight,
  Star,
  LockKeyhole,
  Send,
  BadgeCheck,
  CalendarDays,
  Info,
  Shield,
  ClipboardCheck,
  ListChecks,
  HelpCircle,
} from "lucide-react";

import { ADS, LEADERBOARD, GOAL, GIFT_REWARDS } from "./data";

const load = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
};

const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in private/restricted browsers.
  }
};

export default function App() {
  const todayKey = new Date().toISOString().slice(0, 10);
  const storedDay = load("dayKey", todayKey);
  const fresh = storedDay !== todayKey;

  const [page, setPage] = useState("home");
  const [open, setOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const [watched, setWatched] = useState(() =>
    fresh ? [] : load("watched", [])
  );

  const [today, setToday] = useState(() =>
    fresh ? 0 : load("today", 0)
  );

  const [todayEarnings, setTodayEarnings] = useState(() =>
    fresh ? 0 : load("todayEarnings", 0)
  );

  const [life, setLife] = useState(() => load("life", 0));

  const [activity, setActivity] = useState(() =>
    fresh ? [] : load("activity", [])
  );

  const [history, setHistory] = useState(() =>
    load("history", [])
  );

  const [giftEntry, setGiftEntry] = useState(() =>
    load("giftEntry", null)
  );

  const [claimedReward, setClaimedReward] = useState(() =>
    load("claimedReward", null)
  );

  const [lastGoalDate, setLastGoalDate] = useState(() =>
    load("lastGoalDate", null)
  );

  const [streak, setStreak] = useState(() =>
    fresh ? 0 : load("streak", 0)
  );

  const [supportIssue, setSupportIssue] = useState(() =>
    load("supportIssue", "")
  );

  const [supportMessage, setSupportMessage] = useState(() =>
    load("supportMessage", "")
  );

  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("idle");
  const [left, setLeft] = useState(0);
  const [progress, setProgress] = useState(0);

  const timerRef = useRef(null);
  const loadingRef = useRef(null);

  const available = useMemo(
    () => ADS.filter((ad) => !watched.includes(ad.id)),
    [watched]
  );

  const goal = GOAL || ADS.length;
  const balance = 2450 + life;

  useEffect(() => {
    save("dayKey", todayKey);
    save("watched", watched);
    save("today", today);
    save("todayEarnings", todayEarnings);
    save("life", life);
    save("activity", activity);
    save("history", history);
    save("giftEntry", giftEntry);
    save("claimedReward", claimedReward);
    save("lastGoalDate", lastGoalDate);
    save("streak", streak);
    save("supportIssue", supportIssue);
    save("supportMessage", supportMessage);
  }, [
    watched,
    today,
    todayEarnings,
    life,
    activity,
    history,
    giftEntry,
    claimedReward,
    lastGoalDate,
    streak,
    supportIssue,
    supportMessage,
    todayKey,
  ]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(loadingRef.current);
    };
  }, []);

  const dynamicBoard = useMemo(() => {
    const base = LEADERBOARD.map((item) => ({ ...item }));

    const user = {
      name: "You",
      points: life,
      ads: history.length,
      avatar: "YO",
      isUser: true,
    };

    return [...base, user]
      .sort((a, b) => b.points - a.points)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
  }, [life, history.length]);

  const userRank =
    dynamicBoard.find((item) => item.isUser)?.rank ||
    dynamicBoard.length;

  const winner = userRank <= 3;

  const stopTimer = () => {
    clearInterval(timerRef.current);
    clearTimeout(loadingRef.current);

    timerRef.current = null;
    loadingRef.current = null;
  };

  const closeWatch = () => {
    stopTimer();

    setSelected(null);
    setStatus("idle");
    setLeft(0);
    setProgress(0);
  };

  const watch = (ad) => {
    if (!ad) return;

    if (selected) return;

    if (watched.includes(ad.id)) return;

    stopTimer();

    setSelected(ad);
    setStatus("loading");
    setLeft(ad.duration);
    setProgress(0);

    loadingRef.current = setTimeout(() => {
      if (!selected) {
        setStatus("watching");

        let remaining = ad.duration;

        timerRef.current = setInterval(() => {
          remaining = Math.max(0, remaining - 1);

          setLeft(remaining);

          const percentage =
            ((ad.duration - remaining) / ad.duration) * 100;

          setProgress(percentage);

          if (remaining <= 0) {
            stopTimer();

            setProgress(100);
            setStatus("completed");

            setWatched((current) => {
              if (current.includes(ad.id)) return current;
              return [...current, ad.id];
            });

            setToday((current) => current + 1);

            // IMPORTANT:
            // Uses the reward attached to the selected ad.
            setTodayEarnings((current) => current + ad.reward);
            setLife((current) => current + ad.reward);

            const now = Date.now();

            setHistory((current) => [
              ...current,
              {
                id: now,
                reward: ad.reward,
                brand: ad.brand,
                adId: ad.id,
                date: todayKey,
              },
            ]);

            setActivity((current) => [
              {
                id: now,
                reward: ad.reward,
                brand: ad.brand,
                time: "just now",
              },
              ...current,
            ]);

            const completedAds = watched.length + 1;

            if (
              completedAds >= goal &&
              lastGoalDate !== todayKey
            ) {
              const yesterday = new Date(
                Date.now() - 86400000
              )
                .toISOString()
                .slice(0, 10);

              setStreak((current) =>
                lastGoalDate === yesterday
                  ? current + 1
                  : Math.max(1, current + 1)
              );

              setLastGoalDate(todayKey);
            }
          }
        }, 1000);
      }
    }, 650);
  };

  const nav = (nextPage) => {
    setPage(nextPage);
    setOpen(false);
  };

  const reset = () => {
    localStorage.clear();
    window.location.reload();
  };

  const saveSupport = () => {
    save("supportIssue", supportIssue);
    save("supportMessage", supportMessage);
  };

  return (
    <div className="shell">
      {showSplash && (
        <div className="splash">
          <div className="splash-glow" />

          <div className="splash-card">
            <div className="splash-logo">V</div>

            <span className="splash-kicker">
              WELCOME TO
            </span>

            <h1>VELOOP Rewards & Giveaways</h1>

            <p>
              Watch ads • Earn VE points • Climb the leaderboard
            </p>

            <button onClick={() => setShowSplash(false)}>
              Enter Veloop
              <ArrowUpRight />
            </button>

            <small>
              Demo experience · Click to continue
            </small>
          </div>
        </div>
      )}

      <aside className={open ? "side open" : "side"}>
        <div className="brand">
          <div className="logo-mark">V</div>

          <div>
            <strong>VELOOP</strong>
            <small>Rewards & Giveaways</small>
          </div>

          <button
            className="close"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>

        <nav>
          <button
            className={page === "home" ? "active" : ""}
            onClick={() => nav("home")}
          >
            <Home />
            Dashboard
          </button>

          <button
            className={page === "watch" ? "active" : ""}
            onClick={() => nav("watch")}
          >
            <PlayCircle />
            Watch & Earn
          </button>

          <button
            className={page === "rewards" ? "active" : ""}
            onClick={() => nav("rewards")}
          >
            <Gift />
            Rewards
          </button>

          <button
            className={page === "leaderboard" ? "active" : ""}
            onClick={() => nav("leaderboard")}
          >
            <Trophy />
            Leaderboard
          </button>

          <button
            className={page === "profile" ? "active" : ""}
            onClick={() => nav("profile")}
          >
            <UserRound />
            Profile
          </button>

          <button
            className={page === "how" ? "active" : ""}
            onClick={() => nav("how")}
          >
            <ListChecks />
            How It Works
          </button>

          <button
            className={page === "safety" ? "active" : ""}
            onClick={() => nav("safety")}
          >
            <Shield />
            Eligibility & Safety
          </button>
        </nav>

        <div className="side-art">
          <div className="headphone">V</div>

          <div className="script">
            Watch
            <br />
            Earn
            <br />
            Win
          </div>

          <b>
            Your Time
            <br />
            <span>=</span>
            <br />
            VE Rewards
          </b>
        </div>
      </aside>

      <main>
        <header>
          <div className="head-left">
            <button
              className="menu"
              onClick={() => setOpen(true)}
            >
              <Menu />
            </button>

            <div className="welcome">
              <div className="avatar-group">
                <Users />
              </div>

              <div>
                <strong>
                  Welcome to VELOOP 👋
                </strong>

                <small>
                  Track your demo activity and progress
                </small>
              </div>
            </div>
          </div>

          <div className="head-right">
            <Bell className="bell" />

            <div className="balance">
              <span>VE</span>
              <b>{balance.toLocaleString()}</b>
              <Plus />
            </div>

            <div className="profile-avatar">V</div>

            <ChevronDown />
          </div>
        </header>

        {page === "home" && (
          <HomePage
            balance={balance}
            watched={watched}
            todayEarnings={todayEarnings}
            setPage={setPage}
            goal={goal}
            userRank={userRank}
            streak={streak}
            winner={winner}
          />
        )}

        {page === "watch" && (
          <WatchPage
            watched={watched}
            today={today}
            todayEarnings={todayEarnings}
            life={life}
            balance={balance}
            available={available}
            activity={activity}
            watch={watch}
            setPage={setPage}
            goal={goal}
            streak={streak}
          />
        )}

        {page === "leaderboard" && (
          <LeaderboardPage
            balance={balance}
            today={today}
            todayEarnings={todayEarnings}
            watched={watched}
            setPage={setPage}
            board={dynamicBoard}
            userRank={userRank}
            winner={winner}
            claimedReward={claimedReward}
            setClaimedReward={setClaimedReward}
          />
        )}

        {page === "rewards" && (
          <RewardsPage
            balance={balance}
            setPage={setPage}
            userRank={userRank}
            winner={winner}
            claimedReward={claimedReward}
            setClaimedReward={setClaimedReward}
          />
        )}

        {page === "profile" && (
          <ProfilePage
            balance={balance}
            watched={watched}
            today={today}
            goal={goal}
            streak={streak}
            userRank={userRank}
            winner={winner}
            giftEntry={giftEntry}
            setGiftEntry={setGiftEntry}
            supportIssue={supportIssue}
            setSupportIssue={setSupportIssue}
            supportMessage={supportMessage}
            setSupportMessage={setSupportMessage}
            saveSupport={saveSupport}
            setPage={setPage}
          />
        )}

        {page === "how" && (
          <HowItWorksPage setPage={setPage} />
        )}

        {page === "safety" && (
          <SafetyPage setPage={setPage} />
        )}

        <footer>
          © 2026 Veloop Rewards & Giveaways
          <span>|</span>
          Watch
          <span>•</span>
          Earn
          <span>•</span>
          Win
          <small>
            Demo rewards & points experience
          </small>
        </footer>

        <button
          className="reset-fab"
          title="Reset demo"
          onClick={reset}
        >
          ↻
        </button>
      </main>

      {selected && (
        <div className="modal">
          <div className="watch-modal">
            <button
              className="modal-x"
              onClick={closeWatch}
            >
              <X />
            </button>

            {status === "loading" && (
              <div className="state">
                <LoaderCircle className="spin" />

                <h2>
                  Loading advertisement…
                </h2>

                <p>
                  Preparing your reward session.
                </p>
              </div>
            )}

            {status === "watching" && (
              <div className="state">
                <div className="fake">
                  <img
                    src={selected.image}
                    alt={selected.title}
                  />

                  <div>
                    <b>{selected.brand}</b>
                    <small>
                      SPONSORED PREVIEW
                    </small>
                  </div>
                </div>

                <div className="timer">
                  <span>
                    Watching advertisement
                  </span>

                  <b>{left}s</b>
                </div>

                <div className="bar">
                  <i
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>

                <p>
                  Please keep this window open until
                  the timer reaches zero.
                </p>
              </div>
            )}

            {status === "completed" && (
              <div className="state">
                <div className="success">
                  ✓
                </div>

                <h2>
                  Reward successful!
                </h2>

                <p>
                  You earned{" "}
                  <b>
                    +{selected.reward} VE
                  </b>{" "}
                  for completing{" "}
                  {selected.brand}.
                </p>

                <span className="note">
                  <ShieldCheck />
                  Reward added to your demo balance
                </span>

                <button
                  className="continue"
                  onClick={closeWatch}
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function HomePage({
  balance,
  watched,
  todayEarnings,
  setPage,
  goal,
  userRank,
  streak,
  winner,
}) {
  const progress = Math.min(
    100,
    (watched.length / goal) * 100
  );

  return (
    <section className="page home-page">
      <div className="dashboard-hero card">
        <div className="dashboard-copy">
          <span className="eyebrow">
            VELOOP • LIVE REWARDS DASHBOARD
          </span>

          <h1>
            Make every minute{" "}
            <span>count.</span>
          </h1>

          <p>
            Track your VE points, daily target,
            leaderboard position and reward progress
            from one polished dashboard.
          </p>

          <div className="dashboard-actions">
            <button
              onClick={() => setPage("watch")}
            >
              <Play />
              Watch & Earn
              <ArrowUpRight />
            </button>

            <button
              className="secondary"
              onClick={() => setPage("profile")}
            >
              <WalletCards />
              Wallet & Settings
            </button>
          </div>

          <div className="hero-trust">
            <span>
              <CheckCircle2 />
              Activity saved on this device
            </span>

            <span>
              <Target />
              Daily target: {goal} ads
            </span>
          </div>
        </div>

        <div className="dashboard-balance">
          <span>DEMO VE BALANCE</span>

          <strong>
            {balance.toLocaleString()}
          </strong>

          <small>points available</small>

          <div className="balance-pulse">
            +
          </div>
        </div>
      </div>

      <div className="overview-grid">
        <div className="card overview">
          <div className="overview-icon">
            <PlayCircle />
          </div>

          <b>
            {watched.length}/{goal}
          </b>

          <small>
            Today's ads completed
          </small>
        </div>

        <div className="card overview">
          <div className="overview-icon">
            <WalletCards />
          </div>

          <b>
            +{todayEarnings} VE
          </b>

          <small>
            Today's actual ad rewards
          </small>
        </div>

        <div className="card overview">
          <div className="overview-icon">
            <Trophy />
          </div>

          <b>
            #{userRank}
          </b>

          <small>
            Current leaderboard rank
          </small>
        </div>

        <div className="card overview">
          <div className="overview-icon">
            <Gift />
          </div>

          <b>
            {winner ? "Eligible" : "Top 3 needed"}
          </b>

          <small>
            Current giveaway status
          </small>
        </div>
      </div>

      <div className="dashboard-lower">
        <div className="dashboard-target card">
          <div className="section-title">
            <h3>
              <Target />
              Daily Target
            </h3>

            <span>
              {Math.round(progress)}%
            </span>
          </div>

          <div className="target-track">
            <i
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="target-foot">
            <b>
              {watched.length} of {goal} ads
            </b>

            <button
              onClick={() => setPage("watch")}
            >
              Continue
              <ArrowUpRight />
            </button>
          </div>
        </div>

        <div className="support-card card">
          <div className="support-icon">
            <HelpCircle />
          </div>

          <div>
            <span className="eyebrow">
              NEED HELP?
            </span>
          </div>
           
