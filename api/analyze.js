// Vercel Serverless Function: /api/analyze
// Securely proxies requests to Google Gemini API using process.env.GEMINI_API_KEY

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const {
      resumeText,
      jobDescription,
      persona = 'universal',
      customPersonaText = '',
      model = 'gemini-1.5-flash',
      clientApiKey = ''
    } = req.body || {};

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        error: 'Missing required fields: both resumeText and jobDescription are required.'
      });
    }

    // Determine API Key: priority to Vercel env variable, then client-provided key
    const apiKey = process.env.GEMINI_API_KEY || clientApiKey;

    if (!apiKey) {
      return res.status(401).json({
        error: 'No Gemini API key found. Please set GEMINI_API_KEY in your Vercel Environment Variables, or enter an API key in the UI settings.'
      });
    }

    // Comprehensive Role Personas for Universal Analysis across all domains
    const PERSONA_CONFIGS = {
      universal: {
        role: "You are an Elite Universal Senior Talent Acquisition Specialist and Head of Hiring with 15+ years of cross-industry hiring experience evaluating candidates across all professions (Technology, Business, Finance, Healthcare, Marketing, Sales, Legal, Operations, Creative, and Education).",
        focus: "Evaluate comprehensive role alignment, mandatory job qualifications/credentials, domain-specific terminology match, verified quantitative impact, core competencies, and professional communication standards tailored strictly to the target Job Description."
      },
      tech: {
        role: "You are a Principal Tech Recruiter and Senior Engineering Hiring Manager at a top Silicon Valley tier-1 tech company with 15+ years of experience hiring software engineers, data scientists, and DevOps practitioners.",
        focus: "Prioritize technical stack alignment, system architecture impact, algorithmic strength, quantifiable metrics (latency, scale, cost savings, throughput), and real engineering contributions."
      },
      business: {
        role: "You are a Senior Corporate Recruiter and Commercial Talent Lead specializing in Business, Marketing, Sales, Product Management, Strategy, and Operations roles.",
        focus: "Prioritize revenue generation, commercial acumen, ROI, KPI attainment, campaign performance, operational efficiency, stakeholder management, and data-driven business decisions."
      },
      healthcare: {
        role: "You are a Senior Healthcare Recruiter, Clinical Credentialing Lead, and Medical Talent Specialist.",
        focus: "Prioritize clinical competencies, compliance, patient care outcomes, regulatory licensing, specialized certifications, medical protocols, and interdisciplinary team collaboration."
      },
      finance_legal: {
        role: "You are an Executive Talent Partner specializing in Accounting, Corporate Finance, Risk Management, Compliance, and Legal roles.",
        focus: "Prioritize regulatory compliance, analytical precision, financial modeling, fiduciary diligence, risk mitigation, audit readiness, and policy execution."
      },
      fresh_grad: {
        role: "You are an Elite University Career Counselor and Early-Career Talent Specialist dedicated to landing ambitious new graduates their dream entry-level and internship roles across all career tracks.",
        focus: "Emphasize coursework relevance, academic capstones, research, hackathons, internships, leadership potential, fast learnability, and high-impact extracurriculars."
      },
      career_changer: {
        role: "You are an Executive Career Transition Specialist and Industry Switch Strategist.",
        focus: "Prioritize framing non-linear career trajectories, extracting universal transferable hard and soft skills, bridging domain vocabulary gaps, and demonstrating rapid domain competency."
      },
      executive: {
        role: "You are an Executive Search Partner and Chief Human Resources Officer consultant advising C-suite, VP, and Director-level leadership talent across all industries.",
        focus: "Focus on P&L ownership, organizational leadership, strategic vision, revenue growth, board alignment, operational excellence, and transformative business outcomes."
      },
      custom: {
        role: customPersonaText
          ? `You are an Expert Hiring Coach and Senior Talent Evaluator operating under user-specified instructions: "${customPersonaText.trim()}"`
          : "You are an Elite Universal Talent Partner and Senior Hiring Coach.",
        focus: customPersonaText
          ? `Strictly adhere to the user's custom evaluation focus: "${customPersonaText.trim()}". Align candidate qualifications and metrics to these criteria.`
          : "Evaluate comprehensive role alignment, verified achievements, and requirements matching for the target job."
      }
    };

    const selectedPersona = PERSONA_CONFIGS[persona] || PERSONA_CONFIGS.universal;

    // Structured System Prompt adhering to Prompt Engineering Framework (ROLE + TASK + FORMAT + RULES)
    const SYSTEM_PROMPT = `${selectedPersona.role}
${selectedPersona.focus}

TASK:
Perform a comprehensive, brutally honest, ATS-grade evaluation comparing the provided Resume against the target Job Description. Compute a calibrated ATS compatibility score (0-100), identify skill & keyword deficits, highlight bullet point improvements with concrete before-and-after rewrites, provide salary guidance, and generate interview readiness questions.

OUTPUT FORMAT:
You MUST respond with valid, parseable JSON matching exactly this schema, without backticks or markdown preamble:
{
  "ats_score": number, // Overall score 0-100 based on realistic ATS scoring algorithms
  "score_breakdown": {
    "keyword_match": number, // 0-100
    "experience_relevance": number, // 0-100
    "skills_alignment": number, // 0-100
    "formatting_clarity": number // 0-100
  },
  "overall_summary": "string (concise 2-3 sentence executive assessment)",
  "verdict": "string ('Strong Match' | 'Potential Match' | 'High Risk / Low Match')",
  "missing_keywords": ["string", "string"], // 5-8 essential keywords present in JD but absent/weak in resume
  "matched_keywords": ["string", "string"], // 5-8 strong matching keywords
  "skill_gap_analysis": {
    "matched_skills": ["string", "string"],
    "missing_hard_skills": ["string", "string"],
    "missing_soft_skills": ["string", "string"]
  },
  "bullet_improvements": [
    {
      "original": "string (an actual weak bullet from the resume)",
      "improved": "string (rewritten using Google XYZ formula: 'Accomplished [X] as measured by [Y], by doing [Z]' with metrics)",
      "reason": "string (why this change significantly boosts ATS & recruiter impact)"
    }
  ],
  "quick_wins": [
    "string (Immediate actionable step 1 to implement in <10 mins)",
    "string (Immediate actionable step 2)",
    "string (Immediate actionable step 3)"
  ],
  "salary_insights": {
    "estimated_range": "string (e.g. '$90,000 - $115,000 USD / yr or ₹12-18 LPA')",
    "seniority_level": "string ('Entry-Level' | 'Mid-Level' | 'Senior' | 'Staff/Lead')"
  },
  "interview_prep_questions": [
    "string (Targeted technical/behavioral interview question derived from the gap between resume and JD)",
    "string (Second high-probability interview question)",
    "string (Third high-probability interview question)"
  ],
  "proof_and_specs_audit": {
    "github_audit": {
      "status": "string ('Verified' | 'Missing Profile Link' | 'Missing Repository Proof')",
      "has_github_link": boolean,
      "has_project_repos": boolean,
      "critique": "string"
    },
    "proof_of_work": {
      "score": number, // 0-100 verifiability score
      "unverified_claims": ["string", "string"], // Claims lacking concrete metrics, proof, or live URLs
      "recommendations": ["string", "string"]
    },
    "missing_technical_specs": [
      {
        "category": "string ('Scale & Throughput' | 'Architecture & Infra' | 'Testing & CI/CD' | 'Version & Tool Specifics')",
        "missing_spec": "string",
        "suggested_addition": "string"
      }
    ],
    "missing_portfolio_elements": ["string", "string"] // e.g. 'Live Deployed URL', 'GitHub Repository Link', 'API Documentation Link'
  }
}

RULES & CONSTRAINTS:
1. ATS Score must be realistic: heavily penalize resumes missing critical non-negotiable tools, qualifications, or core domain skills mentioned in the JD.
2. Return ONLY clean raw JSON. Do not wrap in \`\`\`json or add introductory/conclusion conversational text.
3. Keep bullet improvements realistic to the candidate's background while maximizing impact verbs and quantifiable metrics.
4. Missing keywords must be distinct, highly specific domain nouns/technologies/qualifications, not generic fluff like 'good worker'.
5. Rigorously inspect proof of work: verify if claims cite measurable proof, GitHub repository links (for engineering roles), portfolio/live demos (for creative/product), or verified credentials/licensures/quantified metrics (for business, healthcare, finance, and legal).`;

    const USER_PROMPT = `Please evaluate the following candidate submission:

=== TARGET JOB DESCRIPTION ===
${jobDescription.trim()}

=== CANDIDATE RESUME ===
${resumeText.trim()}
`;

    // Target Gemini API endpoint
    const validModel = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-2.5-flash'].includes(model)
      ? model
      : 'gemini-1.5-flash';

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${validModel}:generateContent?key=${apiKey}`;

    const requestPayload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: USER_PROMPT }]
        }
      ],
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      generationConfig: {
        temperature: 0.2,
        response_mime_type: 'application/json'
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data?.error?.message || response.statusText || 'Gemini API call failed';
      return res.status(response.status).json({
        error: `Gemini API Error (${response.status}): ${errorMessage}`,
        details: data
      });
    }

    const candidate = data.candidates?.[0];
    const rawText = candidate?.content?.parts?.[0]?.text;

    if (!rawText) {
      return res.status(502).json({
        error: 'Gemini returned an empty response. Please verify inputs and try again.',
        details: data
      });
    }

    // Parse output JSON safely
    let parsedResult;
    try {
      // Clean possible accidental markdown codeblock wrapper
      const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
      parsedResult = JSON.parse(cleaned);
    } catch (parseErr) {
      return res.status(500).json({
        error: 'Failed to parse Gemini output as structured JSON.',
        raw: rawText
      });
    }

    return res.status(200).json({
      success: true,
      data: parsedResult,
      meta: {
        model: validModel,
        persona,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Serverless function error:', err);
    return res.status(500).json({
      error: `Internal Server Error: ${err.message || 'Unexpected failure'}`
    });
  }
};
