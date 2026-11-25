"""Pulls the profile, repositories, languages and commits of the GitHub account into src/data/github.generated.json.
Run:  pnpm sync:github   (needs an authenticated `gh` CLI).  Private repos only contribute aggregate numbers + dates;
their commit messages are never written to the file."""
import json, os, subprocess, sys, datetime, collections

os.environ["NO_COLOR"] = "1"
for _k in ("CLICOLOR_FORCE", "GH_FORCE_TTY", "FORCE_COLOR"):
    os.environ.pop(_k, None)
OUT = os.path.join(os.path.dirname(__file__), "..", "src", "data", "github.generated.json")


def gh(*args):
    r = subprocess.run(["gh", "api", *args], capture_output=True, text=True)
    if r.returncode:
        return None
    o = r.stdout
    i = min([x for x in (o.find("["), o.find("{")) if x >= 0] or [0])
    return json.loads(o[i:])


user = gh("user")
repos = gh("user/repos?per_page=100&affiliation=owner")
out_repos = []
lang_total = collections.Counter()
days = collections.Counter()
per_day_repo = collections.defaultdict(lambda: collections.Counter())
feed = []
for r in sorted(repos, key=lambda x: x["created_at"]):
    n = r["full_name"]
    langs = gh(f"repos/{n}/languages") or {}
    commits = gh(f"repos/{n}/commits?per_page=100") or []
    for k, b in langs.items():
        lang_total[k] += b
    dates = []
    for c in commits:
        dt = c["commit"]["author"]["date"]
        dates.append(dt)
        days[dt[:10]] += 1
        per_day_repo[dt[:10]][r["name"]] += 1
        if not r["private"]:
            feed.append({"repo": r["name"], "date": dt, "msg": c["commit"]["message"].split("\n")[0][:140]})
    out_repos.append({
        "name": r["name"], "private": r["private"], "url": r["html_url"], "homepage": r["homepage"],
        "createdAt": r["created_at"], "pushedAt": r["pushed_at"], "language": r["language"],
        "languages": langs, "commits": len(commits), "commitDates": dates, "hasPages": r["has_pages"],
    })

feed.sort(key=lambda x: x["date"], reverse=True)
data = {
    "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
    "profile": {k: user.get(k) for k in ["login", "name", "bio", "company", "location", "email", "avatar_url", "html_url", "created_at", "public_repos", "followers"]},
    "social": [s["url"] for s in (gh(f"users/{user['login']}/social_accounts") or [])],
    "repos": out_repos,
    "languages": [{"name": k, "bytes": v} for k, v in lang_total.most_common()],
    "totalCommits": sum(days.values()),
    "days": [{"date": d, "count": c, "repos": dict(per_day_repo[d])} for d, c in sorted(days.items())],
    "feed": feed[:60],
}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
json.dump(data, open(OUT, "w"), ensure_ascii=False, indent=1)
print("repos", len(out_repos), "commits", data["totalCommits"], "langs", len(lang_total), "days", len(days), "feed", len(feed))
