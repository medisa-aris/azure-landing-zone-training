// Builds docs/course_syllabus_azure-landing-zone-pertamina.docx
// Usage: node scripts/build_syllabus.js
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
  ShadingType, HeadingLevel, AlignmentType, LevelFormat, PageBreak, BorderStyle,
  Footer, PageNumber, TableOfContents, ExternalHyperlink,
} = require("docx");

// ---------- helpers ----------
const FONT = "Arial";
const BRAND = "0F4C81";
const LIGHT = "DCE8F5";
const PAGE_W = 11906, MARGIN = 1134; // A4, 2 cm margins
const CONTENT_W = PAGE_W - 2 * MARGIN; // 9638

// Inline **bold** support
function runs(text, opts = {}) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((p) =>
    p.startsWith("**")
      ? new TextRun({ text: p.slice(2, -2), bold: true, font: FONT, ...opts })
      : new TextRun({ text: p, font: FONT, ...opts })
  );
}
const P = (text, opts = {}) => new Paragraph({ children: runs(text, opts.run), spacing: { after: 100 }, ...opts.para });
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: t })] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: t })] });
const H3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: t })] });
const B = (t, level = 0) => new Paragraph({ numbering: { reference: "bullets", level }, children: runs(t), spacing: { after: 60 } });
const N = (t, ref = "numbers") => new Paragraph({ numbering: { reference: ref, level: 0 }, children: runs(t), spacing: { after: 60 } });
const BREAK = () => new Paragraph({ children: [new PageBreak()] });
const LINK = (label, url) => new Paragraph({
  numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 },
  children: [new ExternalHyperlink({ link: url, children: [new TextRun({ text: label, style: "Hyperlink", font: FONT })] })],
});

const border = { style: BorderStyle.SINGLE, size: 4, color: "A6A6A6" };
const borders = { top: border, bottom: border, left: border, right: border };

// widths: array of relative weights; rows: array of arrays of strings (first row = header)
function table(weights, rows, { header = true } = {}) {
  const total = weights.reduce((a, b) => a + b, 0);
  const widths = weights.map((w) => Math.floor((w / total) * CONTENT_W));
  widths[widths.length - 1] += CONTENT_W - widths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: widths,
    rows: rows.map((r, ri) => new TableRow({
      tableHeader: header && ri === 0,
      cantSplit: true,
      children: r.map((c, ci) => new TableCell({
        borders,
        width: { size: widths[ci], type: WidthType.DXA },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        shading: header && ri === 0 ? { fill: BRAND, type: ShadingType.CLEAR, color: "auto" } : undefined,
        children: String(c).split("\n").map((line) => new Paragraph({
          spacing: { after: 40 },
          children: runs(line, header && ri === 0 ? { bold: true, color: "FFFFFF", size: 19 } : { size: 19 }),
        })),
      })),
    })),
  });
}
const SP = () => new Paragraph({ spacing: { after: 120 }, children: [] });

function callout(title, lines) {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W],
    rows: [new TableRow({ children: [new TableCell({
      width: { size: CONTENT_W, type: WidthType.DXA },
      shading: { fill: LIGHT, type: ShadingType.CLEAR, color: "auto" },
      borders: { top: { style: BorderStyle.SINGLE, size: 12, color: BRAND }, bottom: border, left: border, right: border },
      margins: { top: 100, bottom: 100, left: 160, right: 160 },
      children: [
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: title, bold: true, font: FONT, color: BRAND })] }),
        ...lines.map((l) => new Paragraph({ spacing: { after: 50 }, children: runs(l, { size: 19 }) })),
      ],
    })] })],
  });
}

// ---------- content ----------
const c = [];

// Title page
c.push(
  new Paragraph({ spacing: { before: 2400, after: 200 }, children: [new TextRun({ text: "Azure Landing Zone", font: FONT, size: 56, bold: true, color: BRAND })] }),
  new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Design, Operate and Connect to Your Existing IT Estate", font: FONT, size: 32, color: "404040" })] }),
  new Paragraph({ spacing: { after: 600 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: BRAND, space: 4 } }, children: [new TextRun({ text: "5-Day Course Syllabus and Instructor Guide", font: FONT, size: 26 })] }),
  table([1, 2], [
    ["Item", "Detail"],
    ["Client", "PT Pertamina (Persero) and subsidiaries"],
    ["Duration", "5 days, 09:00–16:00 WIB (about 25 contact hours)"],
    ["Format", "Instructor-led, in person, hands-on labs in a shared Azure tenant"],
    ["Audience", "Mixed: managers and decision-makers, analysts, technical staff"],
    ["Version", "v1.0 draft, November 2026"],
  ]),
  BREAK(),
);

// TOC
c.push(new Paragraph({ children: [new TextRun({ text: "Contents", font: FONT, size: 32, bold: true, color: BRAND })], spacing: { after: 200 } }),
  new TableOfContents("Contents", { hyperlink: true, headingStyleRange: "1-2" }),
  P("Right-click the table above and choose Update Field to refresh page numbers.", { run: { italics: true, size: 18, color: "808080" } }),
  BREAK());

// 1. Overview
c.push(H1("1. Program overview"),
  P("This program prepares Pertamina to make good decisions about Azure, and then to run Azure as an extension of its existing IT infrastructure. The course is built around Microsoft's Azure landing zone: the governed foundation of subscriptions, identity, networking, security and operations that every workload lands on."),
  P("The guiding question for every module is: **\"How does this connect to what we already run?\"** Participants leave with a decision record (the Landing Zone Design Pack) that Pertamina can reuse in a real adoption project."),
  H2("1.1 Design principles of this course"),
  table([1, 3], [
    ["Principle", "What it means in practice"],
    ["Built on Microsoft's 8 design areas", "Every day maps to the official Azure landing zone design areas, so the material lines up with Microsoft Learn and stays valid after the course."],
    ["One room, two lab levels", "Managers, analysts and engineers stay together. Each lab has a Build level (engineers deploy and configure) and an Operate level (managers and analysts inspect, decide and report in the portal with read-only access)."],
    ["One continuous case", "Mixed teams build a Landing Zone Design Pack across the week. Each day ends with a design checkpoint where teams record their decisions."],
    ["Hybrid first", "Identity, DNS, routing and monitoring are taught as on-premises plus Azure, never Azure alone."],
    ["Operations, not only build", "The course ends with an incident simulation (game day) and a readiness validation, not just a deployment."],
    ["Start minimal", "Teaches Microsoft's \"minimum viable platform landing zone\" approach: get a secure, governed foundation working for the first workload, then grow it, rather than designing for months."],
  ]),
  SP(),
  H2("1.2 Assumptions (confirm with Pertamina)"),
  B("Most participants know on-premises IT (Active Directory, VMware or Hyper-V, firewalls, WAN/MPLS) but are new to Azure."),
  B("Group size is 20–30, split into 4–5 mixed teams of 5–6 people."),
  B("The trainer provides a shared Azure tenant with a landing zone deployed before Day 1. Participants do not need their own subscriptions."),
  B("Delivery language is English with Bahasa Indonesia discussion; slides can be produced bilingually on request."),
  B("Training runs Monday to Friday, so Day 5 is a Friday and has a longer lunch break for Jumat prayer."),
  B("Regulatory content (UU 27/2022 on personal data protection, PP 71/2019 on electronic systems, state-owned enterprise audit requirements) is covered as a discussion framework. Final interpretation belongs to Pertamina's legal and compliance teams."),
);

// 2. Audience
c.push(H1("2. Target audience and prerequisites"),
  table([1.2, 2, 2], [
    ["Role group", "What they need from the course", "Prerequisites"],
    ["Managers and decision-makers", "Understand the landing zone, make governance, cost and sourcing decisions, own the operating model", "None technical. Familiarity with Pertamina's IT landscape."],
    ["Analysts (business, FinOps, risk/compliance, data)", "Read compliance and cost data, build showback reports, define KPIs, map regulations to controls", "Basic IT literacy. Comfortable with dashboards and spreadsheets."],
    ["Technical staff (infra, network, security, ops)", "Design, deploy, connect and operate the landing zone", "Working knowledge of AD/DNS, IP networking and routing, Windows or Linux servers. AZ-900 level recommended."],
  ]),
  SP(),
  P("**Pre-course preparation (optional, about 4 hours):** Microsoft Learn path \"Azure Fundamentals: Describe cloud concepts\" and \"Describe Azure architecture and services\". Technical staff also complete the Azure Landing Zone Review assessment on their current environment, if one exists."),
);

// 3. Objectives
c.push(H1("3. Learning objectives and competency outcomes"),
  P("By the end of the program, participants will be able to:"),
  table([0.4, 3, 1.4], [
    ["#", "Outcome", "Assessed by"],
    ["1", "Explain what an Azure landing zone is, the difference between platform and workload landing zones, and why the platform comes before any migration", "Pre/post-test, Day 1 checkpoint"],
    ["2", "Describe the Azure resource hierarchy and design a management group, subscription and policy structure for Pertamina", "Day 2 checkpoint, capstone"],
    ["3", "Design hybrid identity between Active Directory and Microsoft Entra ID, including privileged access", "Lab 3A, Day 3 checkpoint"],
    ["4", "Design network topology and hybrid connectivity (VPN, ExpressRoute, DNS) between Azure and existing data centers", "Labs 3B and 4A, Day 4 checkpoint"],
    ["5", "Explain the security, monitoring, backup and cost baseline and who owns each part", "Labs 2, 4B, game day"],
    ["6", "Deploy and change landing zone components through infrastructure as code and a reviewed pipeline", "Lab 5A"],
    ["7", "Validate platform readiness and plan the onboarding of a first workload", "Capstone, post-test"],
  ]),
  SP(),
  P("**Competency levels by role at the end of the course:** managers can make and defend landing zone decisions; analysts can produce compliance and cost reports; technical staff can operate the platform with supervision and are ready to start AZ-104 or AZ-305 preparation."),
);

// 4. Facts
c.push(H1("4. Pertamina-specific Azure facts that shape this course"),
  P("These facts were checked against Microsoft Learn in November 2026. Re-check them before delivery, because Azure changes quickly."),
  table([1.3, 3], [
    ["Topic", "Fact and why it matters for Pertamina"],
    ["Local region", "**Indonesia Central** (Jakarta) has 3 availability zones, so workloads can be made zone-redundant inside Indonesia."],
    ["No paired region", "Indonesia Central is a **non-paired region**. Disaster recovery to another region must be designed explicitly (for example Southeast Asia or Malaysia West), and that conflicts with data residency for some data. This trade-off is a key Day 4 decision exercise."],
    ["ExpressRoute in Jakarta", "Peering locations **Jakarta** (NeutraDC HDC) and **Jakarta2** (NTT GDC Indonesia), local to Indonesia Central, plus **ExpressRoute Metro** in Jakarta. Providers include Telin, XL Axiata, DCI Indonesia, NTT Indonesia, DE-CIX, Equinix and Zenlayer."],
    ["ExpressRoute lead time", "Microsoft advises planning in **weeks or months**, because it depends on the provider and procurement. Run a site-to-site VPN in parallel and keep it as failover afterwards."],
    ["VPN sizing", "The Basic VPN Gateway SKU caps at about 100 Mbps and has no BGP or active-active support, so it is unsuitable for most production use."],
    ["Deployment method", "Microsoft recommends the **Azure Landing Zones IaC Accelerator** (Bicep or Terraform on Azure Verified Modules, with GitHub or Azure DevOps), in four phases: Planning, Prerequisites, Bootstrap, Run. A portal accelerator exists for teams without IaC skills."],
    ["Sovereignty option", "A **Sovereign Landing Zone** variant exists for strict residency and sovereignty needs. Microsoft advises adopting it only after confirming those needs. Discussed on Day 2 as an option for Pertamina."],
    ["Hybrid DNS", "Microsoft's troubleshooting guide lists four usual root causes of hybrid DNS failure (wrong forwarder target, ruleset linked to the wrong VNet, referral answers, MTU drops). Used as a game-day scenario."],
  ]),
);

// 5. Rhythm
c.push(H1("5. Daily rhythm"),
  table([1, 3], [
    ["Time (WIB)", "Activity"],
    ["09:00–09:15", "Recap of the previous day and a 5-question quiz"],
    ["09:15–10:30", "Session 1: concepts and live demo"],
    ["10:30–10:45", "Break"],
    ["10:45–12:00", "Session 2: lab or workshop"],
    ["12:00–13:00", "Lunch and Dzuhur prayer (Friday: 11:30–13:00 for Jumat prayer)"],
    ["13:00–14:00", "Session 3: concepts and live demo"],
    ["14:00–15:00", "Session 4: lab or workshop"],
    ["15:00–15:15", "Break and Ashar prayer"],
    ["15:15–16:00", "Design checkpoint: teams record decisions in the Design Pack, daily wrap-up"],
  ]),
  SP(),
  P("**Team roles (rotate on Day 3):** Platform Owner (manager), FinOps and Compliance Analyst, Identity Engineer, Network Engineer, Operations Engineer."),
  P("**Audience tags used below:** [ALL] everyone, [EXEC] managers and decision-makers, [ANL] analysts, [TECH] technical staff. Lab levels: **Build** (TECH) and **Operate** (EXEC and ANL)."),
);

// Day builder
function day({ title, audience, areas, objectives, sessions, discussion, checkpoint }) {
  const out = [BREAK(), H1(title)];
  out.push(table([1, 3], [
    ["Item", "Detail"],
    ["Audience level", audience],
    ["Design areas", areas],
  ]), SP(), H3("Learning objectives"));
  objectives.forEach((o) => out.push(B(o)));
  out.push(H3("Agenda"));
  out.push(table([0.9, 1.5, 3.2, 1.8], [["Time", "Session", "Content", "Activity / lab"], ...sessions]));
  out.push(H3("Discussion questions"));
  discussion.forEach((d) => out.push(B(d)));
  out.push(SP(), callout("Design checkpoint (15:15–16:00)", checkpoint));
  return out;
}

c.push(...day({
  title: "Day 1 (Monday): Why and what – cloud strategy and the landing zone concept",
  audience: "[ALL] Executive and architect level. No command line.",
  areas: "1 – Azure billing and Microsoft Entra tenant (plus overview of all 8)",
  objectives: [
    "Explain business drivers and constraints for cloud adoption in an energy company.",
    "Describe the conceptual shifts from on-premises to Azure: resources instead of servers, software-defined networking, Zero Trust, SLA-based reliability, scale on demand.",
    "Describe the Azure hierarchy: tenant, management group, subscription, resource group, resource.",
    "Explain the platform vs workload landing zone split and the 8 design areas.",
  ],
  sessions: [
    ["09:00–09:15", "Opening", "Welcome, objectives, logistics. **Pre-test** (20 min, may run into Session 1).", "Pre-test online form"],
    ["09:15–10:30", "S1 Cloud adoption in the energy sector [ALL]", "Business drivers (agility, data and AI, resilience, cost). Constraints: data residency, OT/IT separation, state-owned enterprise audit. Cloud Adoption Framework phases. Shared responsibility model. Conceptual shifts for on-premises experts.", "Instructor talk, short case: an energy company that migrated before building a landing zone"],
    ["10:45–12:00", "S2 Current-state mapping [ALL]", "Teams map Pertamina's estate: AD forests, data centers, WAN, SAP, OT/SCADA boundary, monitoring and ITSM tools. Sort into stays on-premises / moves / must connect.", "Team workshop on a large-format canvas"],
    ["13:00–14:00", "S3 Azure core concepts and landing zones [ALL]", "Regions and availability zones, including Indonesia Central. Tenant and billing models (EA, MCA, CSP). Platform vs workload landing zones. Reference architecture and the corp/online/sandbox archetypes. Minimum viable platform landing zone.", "Live demo of the portal"],
    ["14:00–15:00", "S4 Tour of the pre-built landing zone [ALL]", "Participants explore the management group tree, assigned policies, hub network and Log Analytics workspace.", "Guided portal tour (Reader access)"],
  ],
  discussion: [
    "Which Pertamina systems could never leave on-premises, and why: regulation, latency, or OT safety?",
    "What happens if a business unit starts using Azure before the landing zone exists? Has that already happened (shadow IT)?",
    "Is Pertamina building a new platform, fixing a partial one, or validating a mature one?",
  ],
  checkpoint: [
    "Design Pack section 1: scope, constraints, current-state map, starting point (new / partial / mature).",
    "Design Pack section 2: tenant and billing model decision.",
  ],
}));

c.push(...day({
  title: "Day 2 (Tuesday): Govern before you build – organization, policy, security, cost",
  audience: "[ALL] Executive, architect and analyst level. Portal labs with Reader access.",
  areas: "2 – Resource organization, 3 – Governance, 4 – Security",
  objectives: [
    "Design a management group and subscription structure and a naming and tagging standard.",
    "Explain how Azure Policy and RBAC enforce governance, and map controls to regulations.",
    "Describe the security baseline and how it connects to Pertamina's existing SOC.",
    "Explain FinOps basics and define the platform operating model (RACI).",
  ],
  sessions: [
    ["09:15–10:30", "S1 Resource organization and governance [ALL]", "Management group hierarchy, subscription vending, naming and tagging. Azure Policy (deny vs audit, initiatives, exemptions). Baseline policies: no unmanaged public exposure, diagnostic settings to central logging, allowed locations. RBAC and least privilege. Mapping to ISO 27001, UU 27/2022 and PP 71/2019. Sovereign Landing Zone as an option.", "Demo: assign an allowed-locations policy and watch a deployment fail"],
    ["10:45–12:00", "Lab 2A Governance in practice [ALL]", "Read the policy compliance dashboard, investigate a non-compliant resource, trace effective role assignments.", "Operate-level lab for everyone. Engineers also write a custom policy (Build)."],
    ["13:00–14:00", "S3 Security baseline and cost [ALL]", "Zero Trust, Microsoft Defender for Cloud and secure score, Key Vault and managed identities, Microsoft Sentinel next to the existing SOC/SIEM. FinOps: budgets, alerts, reservations and savings plans, showback/chargeback. Operating model: Cloud Center of Excellence, platform team vs workload teams.", "Demo: Defender recommendations and Cost Management"],
    ["14:00–15:00", "Lab 2B Cost and security posture [ALL]", "Cost analysis by tag, create a budget and alert, review secure score. Workshop: draft the platform RACI.", "Operate-level lab, RACI template"],
  ],
  discussion: [
    "Which data must stay in Indonesia? Should allowed-locations be a hard deny from day one?",
    "Who pays for shared platform services such as the hub firewall and ExpressRoute: central IT or business units?",
    "How will Azure alerts reach Pertamina's existing SOC, and who triages them?",
  ],
  checkpoint: [
    "Design Pack section 3: management group hierarchy and subscription model.",
    "Design Pack section 4: baseline policy set, security baseline, cost model, RACI.",
  ],
}));

c.push(...day({
  title: "Day 3 (Wednesday): Identity and network – connecting to the existing estate",
  audience: "[TECH] engineer level for Build. [EXEC]/[ANL] stay for concepts and do Operate-level labs.",
  areas: "5 – Identity and access management, 6 – Network topology and connectivity (part 1)",
  objectives: [
    "Choose a hybrid identity model (Entra Connect Sync vs Cloud Sync; password hash sync, pass-through or federation).",
    "Configure RBAC, Privileged Identity Management and Conditional Access for platform administrators.",
    "Synchronize users from an on-premises Active Directory to Entra ID with Cloud Sync.",
    "Design a hub-and-spoke network with an IP plan that does not overlap with on-premises.",
    "Explain segmentation, inspection paths and why forced tunneling is usually an antipattern.",
  ],
  sessions: [
    ["09:15–10:30", "S1 Hybrid identity [ALL]", "AD DS to Entra ID: Connect Sync vs Cloud Sync, sign-in methods, MFA, Conditional Access, PIM, emergency (break-glass) accounts. The four identity decisions: admin access, workload identity, legacy AD-dependent workloads, cloud-native workloads.", "Demo: PIM role activation"],
    ["10:45–11:20", "Lab 3A Identity and privileged access", "**Build:** group-based RBAC, PIM eligible role, Conditional Access in report-only mode, then activate the Hybrid Identity Administrator role through PIM (needed for Lab 3C). **Operate:** sign-in logs review, approve the team's PIM request.", "Both levels in parallel"],
    ["11:20–12:00", "Lab 3C Hybrid identity sync (on-prem + Azure)", "**Build:** install the Entra Cloud Sync agent on the team's simulated on-prem domain controller, scope sync to one OU, provision a test user on demand, sign in to the Azure portal with that on-prem account. **Operate:** check agent health and provisioning logs in the Entra admin center.", "Shows that identity sync needs only outbound HTTPS, not the VPN"],
    ["13:00–14:00", "S3 Network topology [ALL]", "Hub-and-spoke vs Virtual WAN. IP address planning against on-premises ranges. Azure Firewall, NSGs, UDRs. Approved ingress (Application Gateway, Front Door, Firewall DNAT, Bastion) and egress patterns. Private Link. OT network isolation. Forced tunneling trade-offs.", "Whiteboard: Pertamina IP plan"],
    ["14:00–15:00", "Lab 3B Hub-and-spoke", "**Build:** peer team spoke to hub, route traffic through Azure Firewall, test with Network Watcher. **Operate:** read the topology view, review firewall logs.", "Both levels"],
  ],
  discussion: [
    "Which applications still need Kerberos, LDAP or Group Policy? Do domain controllers need to run in Azure?",
    "Which on-premises IP ranges are in use, and who owns the Azure address plan?",
    "Should internet traffic from Azure break out locally or return to on-premises for inspection?",
  ],
  checkpoint: [
    "Design Pack section 5: identity model, admin access model, emergency access.",
    "Design Pack section 6: topology choice and IP plan.",
  ],
}));

c.push(...day({
  title: "Day 4 (Thursday): Hybrid connectivity and operations – running both worlds",
  audience: "[TECH] engineer level for Build. [EXEC]/[ANL] Operate-level labs and decision exercises.",
  areas: "6 – Network topology and connectivity (part 2), 7 – Management",
  objectives: [
    "Compare site-to-site VPN and ExpressRoute, including Jakarta peering options, redundancy and lead time.",
    "Design hybrid DNS with Private Endpoints, Private DNS zones and Azure DNS Private Resolver.",
    "Onboard on-premises servers with Azure Arc and apply policy, monitoring and updates to them.",
    "Design monitoring, alert routing to ITSM, backup and disaster recovery for a non-paired region.",
  ],
  sessions: [
    ["09:15–10:30", "S1 Connecting to on-premises [ALL]", "VPN Gateway SKUs and active-active. ExpressRoute: circuits, Jakarta/Jakarta2 peering, ExpressRoute Metro, providers, lead time. ExpressRoute with VPN failover. BGP and route ownership. Hybrid DNS: conditional forwarders to the Private Resolver inbound endpoint, forwarding rulesets for outbound.", "Demo: DNS resolution path end to end"],
    ["10:45–12:00", "Lab 4A Site-to-site VPN and hybrid DNS", "**Build:** connect the simulated on-premises network by VPN, configure conditional forwarding, resolve a Private Endpoint from on-premises. **Operate:** check tunnel health, build a VPN vs ExpressRoute cost and risk comparison.", "Both levels"],
    ["13:00–14:00", "S3 Operating across both worlds [ALL]", "Azure Monitor and Log Analytics, diagnostic settings by policy, alerts to ITSM (for example ServiceNow). Azure Arc for on-premises servers. Update Manager. Backup and Site Recovery. Running SCOM and Azure Monitor side by side during transition. DR without a paired region: in-region zone redundancy vs cross-border DR vs data residency.", "Demo: Arc-enabled server in the portal"],
    ["14:00–15:00", "Lab 4B Arc and monitoring", "**Build:** onboard an on-premises VM to Azure Arc, apply a policy and monitoring agent, create an alert. **Operate:** build a workbook dashboard and define operational KPIs.", "Both levels"],
  ],
  discussion: [
    "What bandwidth and latency do Pertamina's workloads need between the data centers and Azure? Which providers already serve Pertamina?",
    "For a critical workload in Indonesia Central, is zone redundancy enough, or is cross-region DR needed? What data can legally leave Indonesia?",
    "Which on-premises monitoring tools will retire, and when?",
  ],
  checkpoint: [
    "Design Pack section 7: connectivity choice, redundancy, DNS design and owners.",
    "Design Pack section 8: monitoring, alert routing, backup and DR approach.",
  ],
}));

c.push(...day({
  title: "Day 5 (Friday): Automate, onboard, operate",
  audience: "[ALL] Mixed. Short Build lab, then team exercises.",
  areas: "8 – Platform automation and DevOps, plus integration of all areas",
  objectives: [
    "Explain how the landing zone is deployed and changed through IaC and pull-request review.",
    "Plan onboarding of a workload, including subscription vending and migration approach.",
    "Diagnose and escalate common platform incidents.",
    "Validate platform readiness against Microsoft's checklist and present a design.",
  ],
  sessions: [
    ["09:15–10:30", "S1 + Lab 5A Platform automation", "ALZ IaC Accelerator phases, Bicep or Terraform with Azure Verified Modules, GitHub or Azure DevOps pipelines, subscription vending as code, policy as code. **Build:** deploy a new workload spoke through a pipeline. **Operate:** review and approve a policy change pull request.", "Demo plus short lab"],
    ["10:45–11:30", "S2 Workload onboarding [ALL]", "Azure Migrate discovery and assessment, migration strategies, workload landing zone checklist, SAP on Azure considerations, AI-ready workloads (Microsoft Foundry) in the conceptual architecture. Platform readiness validation checklist.", "Instructor talk"],
    ["11:30–13:00", "Lunch and Jumat prayer", "", ""],
    ["13:00–14:00", "Game day [ALL]", "Teams respond to four incident injects (see section 7). Each team logs diagnosis, owner and escalation.", "Timed simulation"],
    ["14:15–15:30", "Capstone [ALL]", "15 min preparation, then each team presents its Design Pack (10 min + 5 min Q&A) to a steering committee panel.", "Rubric-scored"],
    ["15:30–16:00", "Close", "**Post-test**, course feedback, 30-60-90-day adoption roadmap, certification paths.", "Post-test online form"],
  ],
  discussion: [
    "Who in Pertamina will own the platform pipeline and approve changes?",
    "Which workload should be first? What makes a good first workload?",
  ],
  checkpoint: [
    "Design Pack section 9: automation approach, onboarding process and first-workload choice.",
    "Final Design Pack presented in the capstone (this replaces the usual 15:15 checkpoint).",
  ],
}));

// 6. Labs
c.push(BREAK(), H1("6. Lab catalogue"),
  table([0.6, 1.6, 2.2, 2.2, 0.7], [
    ["Lab", "Title", "Build level (TECH)", "Operate level (EXEC/ANL)", "Time"],
    ["1", "Landing zone tour", "–", "Explore management groups, policies, hub network", "60 min"],
    ["2A", "Governance in practice", "Write and assign a custom policy", "Compliance dashboard, role tracing", "75 min"],
    ["2B", "Cost and security posture", "Tag remediation task", "Cost analysis, budget, secure score, RACI", "60 min"],
    ["3A", "Identity and privileged access", "RBAC, PIM, Conditional Access (report-only)", "Sign-in logs, PIM approval", "35 min"],
    ["3C", "Hybrid identity sync [on-prem + Azure]", "Cloud Sync agent on on-prem DC, OU-scoped sync, on-demand provisioning, sign-in test", "Agent health, provisioning logs", "40 min"],
    ["3B", "Hub-and-spoke", "Peering, UDR, Azure Firewall, Network Watcher", "Topology view, firewall logs", "60 min"],
    ["4A", "Site-to-site VPN and hybrid DNS [on-prem + Azure]", "Local network gateway and connection in Azure, strongSwan on the on-prem router, conditional forwarders, Private Endpoint resolution", "Tunnel health, VPN vs ExpressRoute comparison", "75 min"],
    ["4B", "Arc and monitoring [on-prem + Azure]", "Arc onboarding of the on-prem app server, policy, alert", "Workbook dashboard, KPIs", "60 min"],
    ["5A", "Platform automation", "Deploy a spoke through a pipeline", "Approve a policy-change pull request", "45 min"],
  ]),
  SP(),
  P("Each lab guide (separate .docx file) contains: objective, environment and prerequisites, step-by-step instructions with exact commands, expected results, troubleshooting, validation and cleanup."),
);

// 7. Game day
c.push(H1("7. Game day: incident injects"),
  table([0.4, 1.6, 2.4, 2], [
    ["#", "Inject", "Symptoms given to teams", "Expected learning"],
    ["1", "VPN tunnel down", "Users in a branch cannot reach an Azure app. Alert from the VPN gateway.", "Use connection diagnostics, check the on-premises device, know the escalation path to the telco and network team."],
    ["2", "Private Endpoint not resolving from on-premises", "An on-premises app gets a public IP for a storage account and is blocked.", "Hybrid DNS root causes: forwarder target, ruleset link, zone link. Know who owns private DNS."],
    ["3", "Deployment blocked by policy", "A project team says \"Azure is broken\": deployment fails in Southeast Asia.", "Read the policy denial, explain allowed locations, follow the exemption process."],
    ["4", "Cost spike and security alert", "Budget alert at 150% and a Defender alert on a VM with a public IP.", "Cost analysis by tag, find the owner, contain the exposure, route the alert to the SOC."],
  ]),
);

// 8. Capstone
c.push(H1("8. Capstone and rubric"),
  P("Each team presents its Landing Zone Design Pack for a sample Pertamina workload (the instructor assigns one: an SAP non-production system, an operations dashboard, or a data platform)."),
  table([2, 3, 0.7], [
    ["Criterion", "What good looks like", "Weight"],
    ["Completeness", "All 8 design areas have a decision, an owner and a rationale", "25%"],
    ["Hybrid connectivity", "Identity, routing and DNS paths to on-premises are explicit and tested in the plan", "20%"],
    ["Governance and compliance", "Policies match data residency and audit needs; exceptions have owners", "20%"],
    ["Operations and cost", "Monitoring, alert routing, backup/DR and budget model are defined", "20%"],
    ["Communication", "Clear for both executives and engineers; risks and next steps stated", "15%"],
  ]),
);

// 9. Assessment
c.push(BREAK(), H1("9. Assessment strategy"),
  table([1.3, 2.5, 1.2], [
    ["Instrument", "Purpose", "When"],
    ["Pre-test (20 questions)", "Baseline knowledge per participant and per role group", "Day 1, 09:00"],
    ["Daily quiz (5 questions)", "Check retention, adjust pace", "Days 2–5, 09:00"],
    ["Design checkpoints", "Applied decision-making, formative feedback", "Days 1–4, 15:15"],
    ["Game-day scorecard", "Diagnosis, ownership and escalation under time pressure", "Day 5"],
    ["Capstone rubric", "Integrated design ability", "Day 5"],
    ["Post-test (same 20 topics)", "Measurable improvement, reported to Pertamina", "Day 5, 15:30"],
  ]),
  SP(),
  H2("9.1 Sample pre-test and post-test questions (with answer key)"),
  P("The full 20-question bank is delivered as a separate file. The post-test uses the same topics with reworded questions."),
);
const qs = [
  ["Which Azure scope is used to apply policy and RBAC across many subscriptions at once?", "A) Resource group  B) Management group  C) Tenant root only  D) Availability zone", "B"],
  ["What is the main difference between a platform landing zone and a workload landing zone?", "A) Region  B) Platform is shared services owned by central IT; workload hosts one application owned by its team  C) Cost  D) No difference", "B"],
  ["Indonesia Central has no paired region. What does that mean for DR?", "A) DR is automatic  B) Cross-region DR must be designed explicitly  C) DR is impossible  D) Use availability sets only", "B"],
  ["Which service lets on-premises DNS servers resolve Azure Private DNS zones without custom DNS VMs?", "A) Azure Front Door  B) Azure DNS Private Resolver (inbound endpoint)  C) Traffic Manager  D) NAT Gateway", "B"],
  ["Which Azure Policy effect blocks a non-compliant deployment?", "A) Audit  B) Deny  C) Append  D) Disabled", "B"],
  ["Which service brings on-premises servers under Azure policy, monitoring and update management?", "A) Azure Arc  B) Azure Migrate only  C) Azure Bastion  D) Azure Lighthouse", "A"],
  ["Why run a site-to-site VPN while ExpressRoute is being ordered?", "A) ExpressRoute is free  B) ExpressRoute provisioning can take weeks or months and VPN gives early connectivity and later failover  C) VPN is always faster  D) It is required by Azure", "B"],
  ["What is the Microsoft-recommended way to deploy a platform landing zone?", "A) Manual portal clicks  B) Azure Landing Zones IaC Accelerator with Bicep or Terraform  C) PowerShell scripts on a laptop  D) ARM templates copied from a blog", "B"],
  ["Which Entra ID feature grants admin rights just in time with approval?", "A) Conditional Access  B) Privileged Identity Management  C) B2B  D) Entra Connect", "B"],
  ["In the shared responsibility model for IaaS VMs, who patches the guest operating system?", "A) Microsoft  B) The customer  C) The ISP  D) Nobody", "B"],
];
c.push(table([0.3, 2.6, 2.6, 0.5], [["#", "Question", "Options", "Answer"], ...qs.map((q, i) => [String(i + 1), ...q])]));

// 10. Lab env
c.push(H1("10. Lab environment and logistics"),
  table([1.3, 3], [
    ["Component", "Specification"],
    ["Trainer tenant", "Dedicated Entra ID tenant. Platform landing zone deployed with the ALZ IaC Accelerator before Day 1 (management groups, policies, hub network with Azure Firewall, Log Analytics)."],
    ["Team access", "One workload spoke subscription (or resource group) per team with Contributor. Reader at management-group scope for all participants. Separate read-only accounts for Operate-level labs."],
    ["Simulated on-premises", "One isolated \"data center\" per team in a separate subscription and region (see section 10.1)."],
    ["Region", "Indonesia Central for the landing zone; simulated on-premises in Southeast Asia or the same region."],
    ["Cost control", "Deploy Firewall and VPN gateways once and share them. Delete everything after Day 5. Budget alert on the trainer subscription. Plan a few hundred USD for the week; confirm with the Azure Pricing Calculator. ExpressRoute is taught by demo and whiteboard only."],
    ["Participant devices", "Laptop with a modern browser. Technical staff also need VS Code, Azure CLI, Bicep or Terraform, and Git, or use Azure Cloud Shell."],
    ["Room", "Projector, whiteboard, stable internet (outbound HTTPS to Azure), team tables for 5–6 people."],
    ["Backup plan", "Recorded demos of every lab in case of tenant or network problems."],
  ]),
  SP(),
  H2("10.1 Hybrid lab design (Labs 3C, 4A, 4B)"),
  P("Labs 3C, 4A and 4B need an on-premises side. Each team gets its own simulated data center, built as Azure VMs in a separate subscription and region with **no peering** to the landing zone. The only way between the two sides is the path the team builds, exactly as in a real data center."),
  table([1.2, 3], [
    ["Option", "Assessment"],
    ["**A. Simulated data center in Azure (recommended)**", "Cheapest and most reliable. Fully scripted with Bicep, rebuilt identically for every class. Each team has its own isolated site."],
    ["B. Nested Hyper-V (Arc Jumpstart ArcBox)", "Very realistic for Azure Arc (real Hyper-V guests), but needs a large VM per team and covers Arc only. Use for an extra Arc deep-dive."],
    ["C. Real on-premises (Pertamina test lab or trainer hardware)", "Most realistic, but needs a public IP, firewall and IPsec approval from Pertamina security, and one failure stops every team. Use only as an instructor demo."],
  ]),
  SP(),
  table([1, 1.4, 2.6], [
    ["Component (per team N)", "Specification", "Purpose"],
    ["VNet onprem-teamN", "172.16.N.0/24, Southeast Asia region, separate subscription", "The \"data center\". Range must not overlap the Azure landing zone (10.0.0.0/16)."],
    ["DC01", "Windows Server 2022, AD DS + DNS, domain teamN.corp.local, OU \"Sync-Users\" with test users", "Lab 3C (Cloud Sync agent) and Lab 4A (DNS conditional forwarder)"],
    ["RTR01", "Ubuntu with strongSwan, public IP, IP forwarding on; route table sends 10.0.0.0/16 to RTR01", "The on-prem VPN device in Lab 4A. Teams fill in the Azure gateway IP and pre-shared key."],
    ["APP01", "Windows Server 2022 prepared for Arc evaluation (extensions removed, Azure guest agent off, IMDS blocked, MSFT_ARC_TEST set)", "Lab 4B. The prep is scripted by the trainer; teams only run the Arc onboarding script."],
    ["Access", "Azure Bastion in the on-prem subscription, or RDP from DC01", "APP01 cannot use Azure VM extensions after Arc prep"],
  ]),
  SP(),
  table([1, 3], [
    ["Shared (landing zone side)", "Specification"],
    ["Hub VPN gateway", "VpnGw1AZ in the hub, one site-to-site connection per team. Pre-deployed, because creation takes 45 minutes or more."],
    ["DNS Private Resolver", "Inbound endpoint (target for on-prem conditional forwarders) and outbound endpoint with a forwarding ruleset (teamN.corp.local to each DC01)."],
    ["Private endpoints", "One storage account per team spoke with a blob private endpoint and the privatelink.blob.core.windows.net zone linked to the hub."],
    ["Lab permissions", "Network Contributor on the connectivity resource group, eligible through PIM for lab hours only. Hybrid Identity Administrator eligible through PIM for team leads (used in Lab 3C)."],
  ]),
  SP(),
  H3("Build timeline"),
  table([1, 3], [
    ["When", "Task"],
    ["T-14 days", "Create training tenant and subscriptions. Deploy the platform landing zone with the ALZ IaC Accelerator. Request VM quota in both regions."],
    ["T-7 days", "Deploy one team environment with the Bicep templates and run every lab end to end (dry run). Record demo videos as backup."],
    ["T-1 day", "Deploy all team environments (about 1 hour, run in parallel). Run the smoke-test script: DC01 healthy, RTR01 reachable, APP01 Arc prep done, resolver endpoints up."],
    ["During course", "VMs auto-shut down at 16:30 WIB and start at 08:00. Remove PIM eligibility after each lab."],
    ["After Day 5", "Delete team resource groups, Cloud Sync configurations, synced users and Arc resources. Check the budget report."],
  ]),
);

// 11. Deliverables
c.push(H1("11. Course deliverables"),
  table([2.6, 2], [
    ["File", "Content"],
    ["course_syllabus_azure-landing-zone-pertamina.docx", "This document"],
    ["slide_day01_part01_cloud-strategy-and-caf.pptx", "Day 1, sessions 1–2"],
    ["slide_day01_part02_azure-core-and-landing-zones.pptx", "Day 1, sessions 3–4"],
    ["slide_day02_part01_governance-and-organization.pptx", "Day 2, sessions 1–2"],
    ["slide_day02_part02_security-cost-operating-model.pptx", "Day 2, sessions 3–4"],
    ["slide_day03_part01_hybrid-identity.pptx", "Day 3, sessions 1–2"],
    ["slide_day03_part02_network-topology.pptx", "Day 3, sessions 3–4"],
    ["slide_day04_part01_hybrid-connectivity-and-dns.pptx", "Day 4, sessions 1–2"],
    ["slide_day04_part02_operations-arc-monitoring-dr.pptx", "Day 4, sessions 3–4"],
    ["slide_day05_part01_automation-and-onboarding.pptx", "Day 5, sessions 1–2"],
    ["slide_day05_part02_game-day-and-capstone.pptx", "Day 5, game day and capstone"],
    ["lab_day01_part02_landing-zone-tour.docx … lab_day05_part01_platform-automation.docx", "9 lab guides (see section 6)"],
    ["labs/infra/ (Bicep and scripts)", "Simulated data center per team, smoke test, teardown"],
    ["assessment_pre-test_post-test.docx", "Question bank with answer key"],
    ["template_landing-zone-design-pack.docx", "Team workbook for checkpoints and capstone"],
    ["template_platform-raci.docx", "RACI template"],
  ]),
);

// 12. References
c.push(H1("12. References"),
  LINK("Azure landing zone design areas and conceptual architecture", "https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/design-areas"),
  LINK("What is an Azure landing zone?", "https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/"),
  LINK("Azure landing zones for on-premises experts", "https://learn.microsoft.com/azure/migration/migrate-from-on-premises-platform-landing-zone"),
  LINK("Platform landing zone implementation options (IaC Accelerator)", "https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/implementation-options"),
  LINK("Deploy Azure landing zones and subscription vending", "https://learn.microsoft.com/azure/architecture/landing-zones/landing-zone-deploy"),
  LINK("Azure regions list (Indonesia Central)", "https://learn.microsoft.com/azure/reliability/regions-list"),
  LINK("Azure region pairs and nonpaired regions", "https://learn.microsoft.com/azure/reliability/regions-paired"),
  LINK("ExpressRoute peering locations and connectivity partners", "https://learn.microsoft.com/azure/expressroute/expressroute-locations-providers"),
  LINK("Azure Private Endpoint DNS integration scenarios", "https://learn.microsoft.com/azure/private-link/private-endpoint-dns-integration"),
  LINK("Troubleshoot hybrid DNS resolution with Azure DNS Private Resolver", "https://learn.microsoft.com/troubleshoot/azure/dns/troubleshoot-azure-dns-private-resolver-hybrid-resolution-failure"),
  LINK("Sovereign Landing Zone overview", "https://learn.microsoft.com/azure/azure-sovereign-clouds/public/overview-sovereign-landing-zone"),
  LINK("Azure Landing Zones accelerator documentation", "https://azure.github.io/Azure-Landing-Zones/accelerator/"),
  LINK("Evaluate Azure Arc-enabled servers on an Azure VM (lab prep for APP01)", "https://learn.microsoft.com/azure/azure-arc/servers/plan-evaluate-on-azure-virtual-machine"),
  LINK("Microsoft Entra Cloud Sync prerequisites", "https://learn.microsoft.com/entra/identity/hybrid/cloud-sync/how-to-prerequisites"),
  LINK("Tutorial: Create a site-to-site VPN connection in the Azure portal", "https://learn.microsoft.com/azure/vpn-gateway/tutorial-site-to-site-portal"),
  LINK("Resolve Azure and on-premises domains with DNS Private Resolver", "https://learn.microsoft.com/azure/dns/private-resolver-hybrid-dns"),
  P("**Certification paths:** AZ-900 (all), SC-900 (managers and analysts), AZ-104 (administrators), AZ-700 (network engineers), AZ-305 (architects)."),
);

// 13. Open questions
c.push(H1("13. Open questions for Pertamina"),
  N("Can the trainer provide the lab tenant, or does Pertamina prefer to supply a sandbox subscription?", "q"),
  N("Does Pertamina already have Entra ID (Microsoft 365), an Azure footprint, or ExpressRoute?", "q"),
  N("What is the expected group size and the split between managers, analysts and technical staff?", "q"),
  N("Preferred delivery language: English, Bahasa Indonesia, or bilingual slides?", "q"),
  N("Is there a real first workload Pertamina would like to use as the capstone case?", "q"),
);

// ---------- document ----------
const doc = new Document({
  creator: "Azure Landing Zone Training",
  title: "Azure Landing Zone – 5-Day Course Syllabus",
  features: { updateFields: true },
  styles: {
    default: { document: { run: { font: FONT, size: 21 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT, size: 32, bold: true, color: BRAND }, paragraph: { spacing: { before: 240, after: 160 }, keepNext: true, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT, size: 26, bold: true, color: "1F1F1F" }, paragraph: { spacing: { before: 200, after: 100 }, keepNext: true, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT, size: 22, bold: true, color: BRAND }, paragraph: { spacing: { before: 180, after: 80 }, keepNext: true, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 270 } } } },
      ] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 300 } } } }] },
      { reference: "q", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 300 } } } }] },
    ],
  },
  sections: [{
    properties: { page: { size: { width: PAGE_W, height: 16838 }, margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: "Azure Landing Zone Training – Pertamina  |  Page ", font: FONT, size: 16, color: "808080" }),
      new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: "808080" }),
    ] })] }) },
    children: c,
  }],
});

const out = path.join(__dirname, "..", "docs", "course_syllabus_azure-landing-zone-pertamina.docx");
Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(out, buf); console.log("Wrote", out); });
