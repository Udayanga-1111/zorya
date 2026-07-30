# Building an Ethical Guardrail Rulebook for Zorya with Clinical CBT, Astrological Telemetry, and Sri Lankan Regulatory Compliance

## Section 1: Executive Summary & Legal Classification

The arrival of digital solutions and self-enhancement technologies has created an important challenge in terms of regulation and technology[cite: 1]. Zorya has developed a unique solution for achieving behavioral change through its artificial intelligence powered by LangGraph and provides a therapy plan based on astronomical data that is processed by `pyswisseph`[cite: 1]. This unique approach, however, raises a question of Zorya's regulatory classification to ensure avoiding lengthy litigation processes and establishing such solution as a medical device[cite: 1].

### Wellness App vs. Software as a Medical Device (SaMD) Positioning

In accordance with global legal frameworks, Software as a Medical Device (SaMD) is defined as software that has one or more medical purposes but is not part of a physical medical device[cite: 1]. It is worth noting that medical purposes include, but are not limited to, treatment and diagnosis as well as difficult health conditions[cite: 1]. The term “medical purposes” can thus be understood as any activity related to treatment, diagnosis and prevention of health conditions[cite: 1].

With respect to recent revisions, the FDA released guidance regarding what is considered to fall within the “safe zone” as far as consumer health applications are concerned[cite: 1]. In order for software to be classified as general wellness software, its purposes should not extend beyond[cite: 1]:
* Promotion of good health and fitness[cite: 1];
* Assistance in relaxation and maintaining a calm mind[cite: 1];
* Facilitation of acquiring new knowledge, hobbies, or skills that may not be related to any particular health problem[cite: 1].

Whenever a software application makes a health suggestion, comes up with a diagnosis of a disease, or advises a treatment for a health problem, it may be treated as a medical apparatus according to the definition of the Federal Food, Drug, and Cosmetic Act (FDCA)[cite: 1]. It implies that it has to adhere to—apart from following stringent quality management systems (QMS) and cybersecurity regulations—requirements of premarket notification (510(k)), De Novo, or premarket approval (PMA)[cite: 1].

| Feature / Metric | General Wellness Software (Zorya Target) | Software as a Medical Device (SaMD) |
| :--- | :--- | :--- |
| **Intended Use** | Promotes overall health, stress relief, and habitual practice techniques[cite: 1]. | Targeted toward the diagnosis, treatment, prevention, and/or management of specified diseases/disorders[cite: 1]. |
| **Target Population** | Regular people trying to better themselves and gain discipline[cite: 1]. | Individuals suffering from clinical disorders or professionals treating individuals' disorders[cite: 1]. |
| **Primary Clinical Metric** | Progress indicators for overall improvement (e.g., focus periods, hydration, meditation breaks)[cite: 1]. | Outcome variables linked with specific diseases (for example, PHQ-9 score for depression, panic attack)[cite: 1]. |
| **Actionable Outputs** | Probabilistic reminders for daily habits and cognitive reframing exercises[cite: 1]. | Decision making concerning diagnosis, dosage, or clinical intervention[cite: 1]. |
| **Regulatory Burden** | Not subject to FDA medical devices laws but to FTC consumer protection laws[cite: 1]. | Mandatory approval through FDA, QMS, and cybersecurity of medical devices[cite: 1]. |

### Analysis of the 2026 FDA General Wellness Guidance

In January 2026, the FDA published its updated Guidance on General Wellness, which is a positive development for consumer physiological monitoring technologies[cite: 1]. As per the FDA, such products use physiologic parameters and are categorized as general wellness products because their purpose is general wellness rather than medical care[cite: 1]. However, starting in mid-2025, the FDA asserted a stricter position by sending a warning letter to WHOOP regarding its Blood Pressure Insights feature, stating that blood pressure measurement is treated as a medical activity associated in clinical terms with hypertension[cite: 1]. 

As stated in the policy, non-invasive technology for physiologic measurement can be applied for general wellness only when meeting the following criteria[cite: 1]:
1. **Non-invasiveness:** The technology completes its function without skin penetration[cite: 1].
2. **Safety profile:** The sensor technology is inherently safe[cite: 1].
3. **Absence of clinical claim:** The system makes no clinical diagnosis or treatment claims[cite: 1].
4. **Absence of clinical equivalent claim:** The device does not claim equivalence to FDA-approved medical devices[cite: 1].

Examples illustrating these criteria[cite: 1]:
* *Example A (Meets criteria):* A wrist-worn device using non-invasive methods to track sleep quality and heart rate[cite: 1].
* *Example B (Does not meet criteria):* A device determining blood glucose via minimally invasive methods penetrating the skin[cite: 1].
* *Example C (Meets criteria):* A non-invasive device measuring electrolyte levels[cite: 1].

Furthermore, low-risk wellness devices are evaluated as non-medical devices[cite: 1]. Thus, Zorya is explicitly classified as a general wellness product[cite: 1].

---

## Section 2: Ethical Guardrail Matrix

Consumer-oriented behavioral interventions carry the risk of making claims that are deterministic and disempowering[cite: 1]. Historically, astrology relied on deterministic assumptions—that celestial positions predicted unchangeable personal futures, health, and personality traits[cite: 1].

Deterministic framing creates an **external locus of control**, convincing users that their outcomes are controlled entirely by outside forces[cite: 1]. This fosters feelings of helplessness, anxiety, and cognitive paralysis[cite: 1].

Conversely, Cognitive Behavioral Therapy (CBT) establishes an **internal locus of control**[cite: 1]. CBT posits that while individuals cannot control every external event, they retain full agency over their perception and cognitive response to those events[cite: 1].

To combine astronomical calculations with CBT concepts safely, Zorya utilizes cognitive reframing[cite: 1]. The platform applies a probabilistic approach to interpreting astronomical transits and Dashas[cite: 1], anchored in **Fogg's Behavior Model**[cite: 1]:

$$B = MAP$$

Where Behavior ($B$) occurs when Motivation ($M$), Ability ($A$), and a Prompt ($P$) converge simultaneously[cite: 1]. Within Zorya’s architecture, celestial transits act purely as dynamic daily prompts ($P$)[cite: 1]. When user motivation ($M$) is low (e.g., high stress or fatigue), the AI agent actively reduces cognitive friction to increase ability ($A$) by breaking tasks down into low-friction, identity-based micro-habits[cite: 1].

### Prohibited Claims Matrix

| Prohibited Category | Operational Definition | Sample Prohibited Output | Regulatory & Psychological Risk |
| :--- | :--- | :--- | :--- |
| **Clinical Diagnostics** | Statements diagnosing or inferring clinical mental disorders[cite: 1]. | *"Your birth chart shows a Pluto alignment in the 12th house, meaning you have clinical depression."*[cite: 1] | Treats Zorya as a medical device; induces diagnostic apprehension[cite: 1]. |
| **Fatalistic Destiny** | Claims indicating life events are predetermined by celestial movements[cite: 1]. | *"According to the Saturn opposition today, you are going to fail your interview or lose something."*[cite: 1] | Promotes an external locus of control and feelings of powerlessness[cite: 1]. |
| **Medical Guidance** | Suggestions to alter professional medical advice or prescribed medication[cite: 1]. | *"To cope with this nervous transit, you will have to lower the dosage of your prescribed medicine."*[cite: 1] | Imminent physical danger; unauthorized practice of medicine[cite: 1]. |
| **Financial Forecasting** | Explicit predictions regarding money gains, losses, investments, or stocks[cite: 1]. | *"The transit of Mercury means that you will earn money through your cryptocurrency investments."*[cite: 1] | Exposes users to financial loss and the app to financial liability[cite: 1]. |

### Transformational Reframing Rules

To shift from astrological determinism to actionable CBT micro-habits, Zorya translates raw telemetry according to these reframing guidelines[cite: 1]:

| Astronomical Telemetry | Deterministic Framing (Forbidden) | Behavioral Science / CBT Translation | Friction-Reducing Micro-Habit | Locus of Control Shift |
| :--- | :--- | :--- | :--- | :--- |
| **Saturn Transit** *(Friction / Delay)* | *"Saturn is obstructing your career house, hence failures are inevitable."*[cite: 1] | *"In this situation there is a structural conflict, giving us an opportunity to reframe barriers cognitively."*[cite: 1] | *"Break down your main task into three micro-actions and complete the first one for 5 minutes."*[cite: 1] | From external barrier (*"Saturn stops me"*) to internal action (*"I can divide my objective"* )[cite: 1]. |
| **Mars Dasha** *(Aggression / Energy)* | *"Mars is most aggressive. Conflicts and trouble will ensue today."*[cite: 1] | *"This is a high-energy period. Channel this drive constructively to avoid frustration."*[cite: 1] | *"Schedule a quick physical exercise break or a focused 10-minute work sprint."*[cite: 1] | From passive reaction (*"I am angry due to Mars"*) to active control (*"I direct my energy"* )[cite: 1]. |
| **Rahu Transit** *(Confusion / Illusion)* | *"Rahu causes stubbornness and nervousness, leading to mental confusion."*[cite: 1] | *"Current dynamics suggest high mental noise. Grounding techniques can help re-center focus."*[cite: 1] | *"Perform box breathing for two minutes before starting your next work block."*[cite: 1] | From cognitive blockage (*"Rahu makes me nervous"*) to emotional regulation (*"I regulate my physiology"* )[cite: 1]. |
| **Mercury Retrograde** *(Miscommunication)* | *"Mercury contaminates communication lines. Do not engage in business deals."*[cite: 1] | *"There is a heightened need for active listening and clear communication today."*[cite: 1] | *"Pause for 60 seconds before sending critical messages to review for clarity."*[cite: 1] | From external blame (*"Mercury ruined our meeting"*) to internal wisdom (*"I am a clear communicator"* )[cite: 1]. |

---

## Section 3: Sri Lankan Data Privacy (PDPA) & Open-Source Audit

### Compliance with Personal Data Protection Act No. 9 of 2022 in Sri Lanka

The **Personal Data Protection Act No. 9 of 2022 (PDPA)**, as amended by Act No. 22 of 2025, governs personal data processing in Sri Lanka[cite: 1]. Zorya’s onboarding engine collects sensitive personal data—including birth date, birth time, and exact geographic coordinates (latitude/longitude)—to construct digital natal charts[cite: 1]. Under Section 56 of the PDPA, geographic coordinates constitute identifiable personal data[cite: 1].

Furthermore, processing birth data to formulate psychological and behavioral intervention strategies constitutes handling **special categories of personal data** (sensitive data relating to personal psychology and health)[cite: 1]. Under Sections 12 and Schedule II of the PDPA, processing sensitive data requires **explicit, free, and informed written consent**[cite: 1].

#### Guidelines for Onboarding Data Storage
* **Birth Date & Time:** Protected via database-level encryption (AES-256) isolated from standard user profile tables, fulfilling Section 10 confidentiality mandates[cite: 1].
* **GPS Coordinates:** Processed strictly as volatile in-memory variables[cite: 1]. Coordinates are permanently deleted immediately after chart generation, leaving only general time zone and region indicators[cite: 1].
* **State Persistence:** Free-tier behavioral states reside in local client-side SQLite databases[cite: 1]. Premium subscribers engaging with live AI coaching have their chat and behavioral logs stored in an encrypted PostgreSQL database[cite: 1].
* **Data Subject Rights:** Users can access (Section 13), rectify (Section 14), or erase (Section 16 - Right to be Forgotten) their account data and behavioral logs via the in-app interface[cite: 1].
* **Data Protection Officer (DPO):** If Zorya systematically processes sensitive personal data for 25,000 or more individuals in Sri Lanka over 12 months, a qualified DPO (holding a degree in law, computer science, or related fields) must be designated[cite: 1].

#### User Consent Interface Language
The user consent box must be unchecked by default and explicitly accepted prior to data processing[cite: 1]:

> **Consent for Data Processing under Sri Lanka PDPA No. 9 of 2022**  
> *"By ticking the box below, you hereby give your explicit consent for Zorya to collect, retain, and process your exact date of birth, birth hour, and geographic location[cite: 1]. This data is used solely for the creation of your natal chart and formation of cognitive enhancement habit structures[cite: 1].  
> Raw geographic location is permanently deleted immediately following calculations, while onboarding data is stored using AES-256 encryption[cite: 1]. Behavioral logs are stored securely in local or cloud databases based on your tier[cite: 1]. You retain the legal right to withdraw consent, access, modify, or delete your data under Sections 13, 14, and 16 of the PDPA[cite: 1].  
> [ ] I explicitly consent to the processing of my personal and sensitive data for the above purposes."*[cite: 1]

---

### Open-Source Licensing Compliance: pyswisseph and the SaaS Model

Zorya utilizes the `pyswisseph` Python extension, which wraps the C-based Swiss Ephemeris library[cite: 1]. Swiss Ephemeris operates under a dual-license model: GNU Affero General Public License Version 3 (AGPLv3) or a commercial license[cite: 1].

#### GPLv2 Section 2 vs. SaaS Execution Model
Under traditional GPLv2 licenses, copyleft requirements trigger upon distribution of software binaries[cite: 1]. In a Software-as-a-Service (SaaS) model executing code remotely over HTTP/SSE, software is not transferred to the user's machine, avoiding copyleft triggering (the "SaaS Loophole")[cite: 1].

#### The AGPLv3 Network-Service Provision
However, `pyswisseph` and Swiss Ephemeris use **AGPLv3**[cite: 1]. Section 13 of AGPLv3 specifically closes the SaaS loophole by requiring any network-connected service interacting with modified AGPL code to make its complete source code available to all end users[cite: 1]. Because Zorya's agents interact dynamically with the `celestial_server`, running integrated AGPL code could compel open-sourcing Zorya’s proprietary agent orchestration logic[cite: 1].

#### Compliance Mitigation Pathways
To keep Zorya’s core IP proprietary, the team must execute one of two compliance paths[cite: 1]:
1. **Commercial Licensing:** Purchase the Swiss Ephemeris Professional License from Astrodienst AG (CHF 750/year), which waives AGPLv3 copyleft mandates entirely[cite: 1].
2. **Architectural Decoupling:** Isolate `pyswisseph` into an isolated, unmodified container executing the `Celestial FastMCP Server`[cite: 1]. Communication between the container and proprietary LangGraph agents must occur exclusively over network REST/JSON-RPC protocols without linking AGPL C-libraries directly into proprietary codebases[cite: 1].

---

### Terms of Service & Limitation of Liability Drafting

#### Section 8 - Limitation of Liability & Medical Disclaimer

* **8.1 No Clinical Services:** Zorya is an automated online dashboard for personal self-improvement[cite: 1]. Zorya does not provide clinical, psychological, or medical services[cite: 1]. AI agent outputs represent probabilistic habit suggestions based on astronomical telemetry and CBT principles, not medical diagnosis or therapy[cite: 1].
* **8.2 User Responsibility:** The User retains sole responsibility for all decisions and actions regarding their physical and mental health[cite: 1]. All recommended habits are strictly optional prompts[cite: 1].
* **8.3 Medical Consultation Disclaimer:** Users experiencing severe clinical symptoms (e.g., major depressive episodes, severe panic attacks, obsessive conditions) must consult licensed healthcare professionals[cite: 1]. Zorya is not a substitute for clinical psychotherapy[cite: 1].
* **8.4 Limitation of Damage:** Neither Zorya nor its developers (CtrlFreaks) shall be held liable for damages or losses resulting from reliance on AI-generated behavioral prompts, astrological calculations, or helpline referrals, to the fullest extent permitted under Sri Lankan law (including PDPA No. 9 of 2022)[cite: 1].

---

## Section 4: Technical System Prompt Ruleset

The system prompt below enforces these runtime boundaries, translation rules, and crisis intervention triggers across Zorya's LangGraph agent nodes[cite: 1].

```text
SYSTEM PROMPT: Zorya Ethical Guardrail & System Middleware

[ROLE & PURPOSE]
You are the Ethical Guardrail Middleware for Zorya. You inspect and enforce safety boundaries across all multi-agent interactions before outputs reach the end-user dashboard.

[STRICT BOUNDARIES]
1. ZERO DETERMINISM: Never predict future events, financial outcomes, health incidents, or romantic relationships.
2. NO DIAGNOSTICS: Never diagnose medical/psychological conditions or use clinical diagnostic labels.
3. NO MEDICAL ADVICE: Never advise changes to medication, clinical treatments, or physical health regimes.

[CRISIS OVERRIDE PROTOCOL]
If user input expresses self-harm, suicidal ideation, or severe clinical distress:
- IMMEDIATELY bypass astrological habit generation.
- Return the standard Sri Lankan emergency support payload:
  * 1926 National Mental Health Helpline (NIMH Sri Lanka - 24/7)
  * 011 268 2535 / 0707 308 308 (Sri Lanka Sumithrayo)

[REFRAMING INSTRUCTION]
Always translate astrological transits into internal locus-of-control CBT micro-habits under 15 minutes.