// pages/api/analyze.js
//
// Uses your company-provided API key and Base URL.
// Works with ANY OpenAI-compatible endpoint — no Azure needed.
// The API key is stored in Vercel environment variables.
// It is NEVER sent to the browser or visible to users.

import OpenAI from "openai";

// These values come from Vercel environment variables you set in Step 5
const client = new OpenAI({
  apiKey:  process.env.COMPANY_API_KEY,   // your company API key
  baseURL: process.env.COMPANY_BASE_URL,  // your company base URL
});

const MODEL = process.env.COMPANY_MODEL;  // your company model name

const TASK_PROMPTS = {
  "SWOT Analysis": `You are a senior strategy consultant.
Perform a detailed SWOT analysis for {company}.
STRENGTHS: 5 key internal strengths with brief explanation.
WEAKNESSES: 5 key internal weaknesses with brief explanation.
OPPORTUNITIES: 5 external market opportunities with brief explanation.
THREATS: 5 external threats with brief explanation.
Use clear headings. Be specific and insightful.`,

  "Financial Analysis": `You are a senior financial analyst.
Financial overview of {company}:
1. Revenue trends (last 3-5 years, estimated if not public)
2. Profitability metrics: gross margin, EBITDA, net margin
3. Key financial ratios and what they signal
4. Debt and balance sheet health
5. Recent investments or acquisitions
6. Market sentiment (if listed)
7. Top 3 financial risks. Flag estimates clearly.`,

  "Competitor Analysis": `You are a competitive intelligence analyst.
Competitive landscape for {company}:
1. Top 5 direct competitors with brief profile
2. How {company} differentiates from each
3. Market share estimates where known
4. Competitor strengths to watch
5. Areas where {company} has clear advantage
6. Emerging disruptors
7. Overall position: Leader/Challenger/Follower and why`,

  "PESTLE Analysis": `You are a strategic analyst.
PESTLE analysis for {company}:
POLITICAL: regulatory and policy impacts.
ECONOMIC: macro trends, inflation, forex.
SOCIAL: demographics, behaviour shifts, ESG.
TECHNOLOGICAL: key tech trends.
LEGAL: compliance, litigation, IP.
ENVIRONMENTAL: carbon, climate risk.
3-4 specific points per category.`,

  "Porter's 5 Forces": `You are a business strategy expert.
Porter's Five Forces for {company}'s industry.
Each force: High/Medium/Low + detailed reasoning.
1. Threat of New Entrants
2. Bargaining Power of Suppliers
3. Bargaining Power of Buyers
4. Threat of Substitutes
5. Competitive Rivalry
Overall attractiveness rating.
Strategic implications for {company}.`,

  "Market Trends": `You are a market research analyst.
Key market trends for {company}:
1. Top 5 macro trends shaping the industry
2. Customer behaviour shifts in past 2 years
3. Tech disruptions expected in next 3 years
4. Regulatory trends
5. High-growth geographic markets
6. M&A and consolidation trends
7. Where is this market heading in 5 years?`,

  "Executive Summary": `You are a management consultant for C-suite.
Executive summary for {company}:
- Company Overview (2-3 sentences)
- Business Model
- Key Metrics (revenue, headcount, market cap if known)
- Strategic Position
- Top 3 Priorities next 2 years
- Top 3 Risks
- Outlook: Bullish/Neutral/Cautious + one-line rationale
Under 400 words. Direct and specific.`,

  "Risk Assessment": `You are an enterprise risk analyst.
Key risks for {company}:
1. Strategic  2. Operational  3. Financial
4. Regulatory/Legal  5. Technology/Cyber  6. Reputational
For each: description, Likelihood (H/M/L), Impact (Severe/Moderate/Minor), mitigation.
End with Top 3 Priority Risks.`,

  "Growth Opportunities": `You are a growth strategy consultant.
Growth opportunities for {company}:
1. Organic Growth: untapped segments, new products
2. Geographic Expansion: which markets and why
3. M&A/Partnerships: what acquisitions would help
4. Digital/AI: new revenue via technology
5. Sustainability: green/ESG opportunities
Rate each: attractiveness (H/M/L), time to value (Short/Medium/Long).
Top 3 recommended moves in priority order.`,

  "Digital Strategy": `You are a digital transformation advisor.
Digital maturity and strategy for {company}:
1. Current digital capabilities
2. Maturity: Beginner/Developing/Advanced/Leader + justification
3. Key tech investments or partnerships
4. AI/ML adoption and use cases
5. Cloud and data infrastructure
6. Digital customer experience quality
7. Cybersecurity posture
8. Top 3 transformation priorities
9. Biggest risk if they don't act`,
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { company, task } = req.body;

  if (!company || !task) {
    return res.status(400).json({ error: "Company name and task are required." });
  }

  const template = TASK_PROMPTS[task];
  if (!template) {
    return res.status(400).json({ error: `Unknown task: ${task}` });
  }

  // Safety check — make sure env vars are set
  if (!process.env.COMPANY_API_KEY || !process.env.COMPANY_BASE_URL || !process.env.COMPANY_MODEL) {
    return res.status(500).json({
      error: "Server configuration missing. Ask admin to check Vercel environment variables: COMPANY_API_KEY, COMPANY_BASE_URL, COMPANY_MODEL",
    });
  }

  const prompt = template.replace(/{company}/g, company);

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are a senior business analyst. Return only your analysis, no preamble.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      top_p: 1.0,
    });

    const result = response.choices[0]?.message?.content?.trim() || "No response from AI.";
    return res.status(200).json({ result });
  } catch (err) {
    console.error("AI error:", err?.message);
    return res.status(500).json({
      error: "AI call failed: " + (err?.message || "Unknown error"),
    });
  }
}
