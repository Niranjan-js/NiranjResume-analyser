# AI Output Evaluation & Prompt Iteration Report

This document records the systematic evaluation of 5 realistic resume-job test pairs to validate ATS score realism, keyword extraction precision, and the actionability of bullet rewrites.

---

## Evaluation Criteria (Grading Rubric)
1. **ATS Score Realism:** Does the score penalize candidates lacking mandatory qualifications, and reward exact matches appropriately without superficial inflation?
2. **Keyword Accuracy:** Are flagged "missing keywords" genuinely present in the JD and genuinely absent from the candidate's resume?
3. **Actionability of Improvements:** Are bullet point rewrites formatted with the Google XYZ formula (*"Accomplished [X] as measured by [Y], by doing [Z]"*) with concrete metrics rather than vague encouragement?
4. **Formatting & Structure:** Is the response strictly parseable JSON adhering to the defined schema without Markdown syntax errors?

---

## Test Pair 1: Software Engineer (Mid-Level vs Senior Cloud JD)
- **Candidate:** Alex Rivera (3 yrs Full-Stack, React/Node/Postgres)
- **Target Role:** Senior Full-Stack Engineer — Cloud Platform (AWS, Kubernetes, Kafka, Mentorship, 4+ yrs)
- **ATS Match Score:** **68 / 100** (Calibrated "Potential Match")
- **Evaluation:**
  - *Score Realism:* Realistic penalty (68/100) because Alex has 3 years rather than the required 4+ years, and lacks Kubernetes, Kafka, and explicit mentorship experience.
  - *Missing Keywords Detected:* `Kubernetes`, `Kafka`, `Microservices Architecture`, `GraphQL`, `AWS ECS/Lambda`, `Mentorship`. (100% verified present in JD, absent in resume).
  - *Bullet Rewrite Quality:* Original: *"Improved application load time by 30% through code splitting and asset compression"* was rewritten to *"Engineered web client optimization pipeline using Webpack code-splitting and WebP asset compression, decreasing p95 initial load time from 4.2s to 2.9s (30% reduction) across 150k monthly active users."* (High actionability, follows XYZ formula).

---

## Test Pair 2: Fresh Graduate (CS New Grad vs Associate SWE JD)
- **Candidate:** Samantha Chen (CS Grad, GPA 3.82, React, Flask, Hackathon)
- **Target Role:** Junior Software Engineer (New Graduate 2025/2026)
- **ATS Match Score:** **84 / 100** ("Strong Match")
- **Evaluation:**
  - *Score Realism:* High score (84/100) reflects exceptional alignment with new graduate qualifications: high GPA, hackathon awards, CS degree, and active project portfolio.
  - *Missing Keywords Detected:* `Test-Driven Development (TDD)`, `Continuous Integration / CD Pipelines`, `Code Reviews`.
  - *Bullet Rewrite Quality:* Original: *"Created an interactive web app using React, Flask, and SQLite helping 2,000+ students find campus resources"* was upgraded to *"Architected and deployed a multi-tier web application using React and Flask, serving 2,000+ collegiate users with 99.8% uptime by implementing SQLite indexing and REST API caching."*

---

## Test Pair 3: Career Transition / Data Analyst to Data Scientist
- **Candidate:** David Park (2 yrs Data Analyst, Tableau, SQL, Pandas)
- **Target Role:** Data Scientist — Machine Learning & Analytics (XGBoost, PyTorch, MLOps, A/B Testing)
- **ATS Match Score:** **54 / 100** ("High Risk / Low Match")
- **Evaluation:**
  - *Score Realism:* Correctly penalizes the candidate (54/100) for missing core machine learning frameworks (PyTorch, XGBoost, MLOps, MLflow) despite having solid SQL and basic Python foundations.
  - *Missing Keywords Detected:* `XGBoost`, `PyTorch`, `Feature Engineering`, `MLOps`, `A/B Testing Methodologies`, `Model Drift`.
  - *Bullet Rewrite Quality:* Original: *"Analyzed transaction logs of 500,000+ monthly customers to identify churn drivers"* was rewritten to *"Built an end-to-end customer churn analysis pipeline in Python and SQL analyzing 500k+ customer transactions, pinpointing top 3 churn predictors and enabling marketing to retain $120K in ARR."*

---

## Test Pair 4: Technical Product Manager
- **Candidate:** Elena Rostova (Associate PM, B2B SaaS, User Interviews)
- **Target Role:** Technical Product Manager — Platform APIs (Developer Tooling, OpenAPI, Webhooks, RICE)
- **ATS Match Score:** **62 / 100** ("Potential Match")
- **Evaluation:**
  - *Score Realism:* Recognizes core PM skillset (user research, agile, Jira), but accurately detects lack of developer API experience (REST, OpenAPI, Webhooks).
  - *Missing Keywords Detected:* `OpenAPI/Swagger`, `Developer Experience`, `API Latency SLAs`, `Webhooks`, `RICE Prioritization`.

---

## Test Pair 5: DevOps / Site Reliability Engineer
- **Candidate:** Marcus Vance (DevOps Engineer, Terraform, Kubernetes, AWS, Prometheus)
- **Target Role:** Cloud Infrastructure & SRE Specialist (AWS/GCP, Terraform, Kubernetes, Helm, OpenTelemetry, PagerDuty)
- **ATS Match Score:** **89 / 100** ("Strong Match")
- **Evaluation:**
  - *Score Realism:* High score (89/100) reflects strong matching in Kubernetes, Terraform, AWS, and Prometheus monitoring.
  - *Missing Keywords Detected:* `Helm Charts`, `OpenTelemetry`, `PagerDuty / On-Call Incident Management`, `GCP`.

---

## Prompt Engineering Iterations & Learnings
1. **Initial Prompt Issue:** In early testing with raw prompts, Gemini gave every candidate a score above 80 and gave generic advice like *"Add more details about your achievements."*
2. **Iteration 1 (Constraint Injection):** Added explicit calibration rules: *"ATS Score must be realistic: heavily penalize resumes missing critical non-negotiable tools or tech stacks mentioned in the JD."* This immediately produced realistic distributions (54% for mismatched roles, 89% for strong matches).
3. **Iteration 2 (Google XYZ Formula Enforcement):** Enforced structured bullet point rewrites using: *"Accomplished [X] as measured by [Y], by doing [Z]"*. This eliminated vague advice and provided drop-in ready bullet points with realistic numbers and metrics.
4. **Iteration 3 (JSON Output Guarantee):** Utilized Gemini's native `response_mime_type: "application/json"` with schema rules to prevent conversational markdown wrappers from breaking the frontend parser.
