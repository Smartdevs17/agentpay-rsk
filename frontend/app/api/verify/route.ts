import { NextRequest, NextResponse } from "next/server";

// AI-powered scope verification via GitHub diff analysis
// Uses Claude API to check if PR/commits match the defined work scope

export async function POST(req: NextRequest) {
  try {
    const { githubUrl, scope } = await req.json();

    if (!githubUrl || !scope) {
      return NextResponse.json({ error: "Missing githubUrl or scope" }, { status: 400 });
    }

    // Extract owner/repo/PR from GitHub URL
    const prMatch = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
    const commitMatch = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)\/commit\/([a-f0-9]+)/);
    const repoMatch = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);

    let diffContent = "";
    let context = "";

    if (prMatch) {
      const [, owner, repo, pr] = prMatch;
      // Fetch PR diff from GitHub API (public repos, no auth needed)
      const diffRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pr}`, {
        headers: { Accept: "application/vnd.github.v3.diff" },
      });
      if (!diffRes.ok) {
        return NextResponse.json({ error: "Failed to fetch PR diff. Ensure the repo is public." }, { status: 400 });
      }
      diffContent = await diffRes.text();
      context = `Pull Request #${pr} in ${owner}/${repo}`;
    } else if (commitMatch) {
      const [, owner, repo, sha] = commitMatch;
      const diffRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${sha}`, {
        headers: { Accept: "application/vnd.github.v3.diff" },
      });
      if (!diffRes.ok) {
        return NextResponse.json({ error: "Failed to fetch commit diff. Ensure the repo is public." }, { status: 400 });
      }
      diffContent = await diffRes.text();
      context = `Commit ${sha.slice(0, 7)} in ${owner}/${repo}`;
    } else if (repoMatch) {
      const [, owner, repo] = repoMatch;
      // Fetch recent commits
      const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=5`);
      if (!commitsRes.ok) {
        return NextResponse.json({ error: "Failed to fetch repo commits. Ensure the repo is public." }, { status: 400 });
      }
      const commits = await commitsRes.json();
      const summaries = commits.map((c: any) => `- ${c.sha.slice(0, 7)}: ${c.commit.message.split("\n")[0]}`).join("\n");
      diffContent = `Recent commits:\n${summaries}`;
      context = `Repository ${owner}/${repo}`;
    } else {
      return NextResponse.json({ error: "Invalid GitHub URL. Use a PR, commit, or repo link." }, { status: 400 });
    }

    // Trim diff to avoid token limits
    const maxDiffLength = 12000;
    const trimmedDiff = diffContent.length > maxDiffLength
      ? diffContent.slice(0, maxDiffLength) + "\n\n... [diff truncated]"
      : diffContent;

    // Call Claude API for verification
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI verification not configured. Set ANTHROPIC_API_KEY." }, { status: 500 });
    }

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `You are a code review AI agent for AgentPay, a freelance escrow platform on Rootstock. Your job is to verify whether delivered work matches the agreed scope.

## Agreed Work Scope
${scope}

## GitHub Context: ${context}

## Code Changes / Diff
${trimmedDiff}

## Your Task
Analyze the code changes and determine if they satisfy the agreed work scope. Consider:
1. Do the changes address the core requirements in the scope?
2. Are there any major scope items that appear missing?
3. Is the work quality reasonable (not placeholder/stub code)?

Respond in this exact JSON format:
{
  "verdict": "PASS" or "FAIL",
  "confidence": number between 0-100,
  "summary": "2-3 sentence summary of your assessment",
  "matched_items": ["list of scope items that are addressed"],
  "missing_items": ["list of scope items that appear missing or incomplete"]
}

Respond with ONLY the JSON, no markdown formatting.`,
          },
        ],
      }),
    });

    if (!claudeRes.ok) {
      const errText = await claudeRes.text();
      console.error("Claude API error:", errText);
      return NextResponse.json({ error: "AI verification failed. Try again later." }, { status: 500 });
    }

    const claudeData = await claudeRes.json();
    const rawText = claudeData.content?.[0]?.text || "";

    try {
      const result = JSON.parse(rawText);
      return NextResponse.json({
        verdict: result.verdict,
        confidence: result.confidence,
        summary: result.summary,
        matchedItems: result.matched_items || [],
        missingItems: result.missing_items || [],
        context,
      });
    } catch {
      // If Claude didn't return valid JSON, return the raw text
      return NextResponse.json({
        verdict: "FAIL",
        confidence: 0,
        summary: rawText.slice(0, 300),
        matchedItems: [],
        missingItems: ["Could not parse AI response"],
        context,
      });
    }
  } catch (err: any) {
    console.error("Verification error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
