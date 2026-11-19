// ============================================================
// Skills Radar Chart (D3.js)
// ============================================================
(function () {
  const LEVELS = [
    { name: "No experience", desc: "No practical exposure" },
    { name: "Beginner", desc: "Familiar with the concepts; requires guidance" },
    { name: "Intermediate", desc: "Can complete typical tasks independently" },
    { name: "Advanced", desc: "Has substantial production experience and can solve complex problems" },
    { name: "Expert", desc: "Can design systems, establish best practices, and mentor others" }
  ];

  const SKILLS = [
    { id: "01", topic: "Software Engineering", short: "SWE", level: 2, keywords: "Python, SQL, Git, OOP, APIs, Data Structures" },
    { id: "02", topic: "Mathematics & Statistics", short: "Math/Stat", level: 3, keywords: "Linear Algebra, Calculus, Probability, Statistics, Hypothesis Testing" },
    { id: "03", topic: "Data Analytics & Visualization", short: "BI/Viz", level: 3, keywords: "Pandas, NumPy, Matplotlib, Seaborn, Tableau, Power BI, EDA" },
    { id: "04", topic: "Machine Learning", short: "ML", level: 3, keywords: "Supervised Learning, Unsupervised Learning, Feature Engineering, Model Evaluation" },
    { id: "05", topic: "Deep Learning", short: "DL", level: 1, keywords: "PyTorch, Neural Networks, Backpropagation, CNNs, Transformers, Optimization" },
    { id: "06", topic: "Big Data & Data Engineering", short: "DE", level: 2, keywords: "Apache Spark, Hadoop, SQL, ETL/ELT, Data Pipelines, Data Warehousing" },
    { id: "07", topic: "Recommendation & Ranking Systems", short: "RecSys", level: 2, keywords: "Collaborative Filtering, Content-Based Filtering, Learning to Rank, Retrieval, Ranking Metrics" },
    { id: "08", topic: "Experimentation & Evaluation", short: "A/B Test", level: 2, keywords: "Offline Metrics, A/B Testing, Statistical Significance, Causal Inference, Experiment Design" },
    { id: "09", topic: "Generative AI & LLMs", short: "LLMs", level: 1, keywords: "LLM Architecture, RAG, Fine-tuning, Prompt Engineering, Embeddings, Vector Databases" }
  ];

  const host = d3.select("#skills-radar");
  if (host.empty()) return;

  const W = 500, H = 440, cx = W / 2, cy = H / 2 + 4;
  const R = 150, maxLevel = 4, n = SKILLS.length;
  const ACCENT = "#e9b730ff";
  const HOVER = "#ff5c33ff"; // hover highlight

  const angle = i => (Math.PI * 2 * i) / n - Math.PI / 2;
  const rScale = d3.scaleLinear().domain([0, maxLevel]).range([0, R]);
  const pt = (i, v, extra = 0) => [
    cx + (rScale(v) + extra) * Math.cos(angle(i)),
    cy + (rScale(v) + extra) * Math.sin(angle(i))
  ];

  const svg = host.append("svg")
    .attr("viewBox", `0 52 ${W} 344`) // visible area y: 68 → 384 (whole chart + labels)
    .attr("width", "100%")
    .attr("role", "img")
    .attr("aria-label", "Radar chart of skill levels across nine topics");

  // Grid rings
  const ringPath = v => d3.line().curve(d3.curveLinearClosed)(d3.range(n).map(i => pt(i, v)));
  const grid = svg.append("g");
  d3.range(1, maxLevel + 1).forEach(v => {
    grid.append("path").attr("d", ringPath(v))
      .attr("fill", v % 2 ? "rgba(255,255,255,0.35)" : "none")
      .attr("stroke", "#dfce93ff").attr("stroke-width", 1);
  });

  // Ring level labels
  const ringLabels = svg.append("g");
  d3.range(1, maxLevel + 1).forEach(v => {
    ringLabels.append("text")
      .attr("x", cx + 3).attr("y", cy - rScale(v) + 10)
      .attr("font-size", 12).attr("fill", "#636363ff").text(v);
  });

  // Axes
  svg.append("g").selectAll("line").data(SKILLS).join("line")
    .attr("x1", cx).attr("y1", cy)
    .attr("x2", (d, i) => pt(i, maxLevel)[0])
    .attr("y2", (d, i) => pt(i, maxLevel)[1])
    .attr("stroke", "#dfce93ff");

  // Data polygon (animated from center)
  const polyPoints = (scale = 1) =>
    d3.line().curve(d3.curveLinearClosed)(SKILLS.map((d, i) => pt(i, d.level * scale)));

  const poly = svg.append("path")
    .attr("d", polyPoints(0))
    .attr("fill", ACCENT).attr("fill-opacity", 0.25)
    .attr("stroke", ACCENT).attr("stroke-width", 2)
    .attr("stroke-linejoin", "round");

  // Points
  const dots = svg.append("g").selectAll("circle").data(SKILLS).join("circle")
    .attr("cx", cx).attr("cy", cy).attr("r", 4)
    .attr("fill", "#fff").attr("stroke", ACCENT).attr("stroke-width", 2)
    .style("cursor", "pointer");

  // Wrapped labels
  function wrap(text, max = 16) {
    const words = text.split(" "), lines = [];
    let line = "";
    words.forEach(w => {
      if ((line + " " + w).trim().length > max && line) { lines.push(line); line = w; }
      else line = (line + " " + w).trim();
    });
    if (line) lines.push(line);
    return lines;
  }

  const labels = svg.append("g").selectAll("text").data(SKILLS).join("text")
    .attr("font-size", 17).attr("font-weight", 600).attr("fill", "#555")
    .style("cursor", "pointer")
    .each(function (d, i) {
      const [x, y] = pt(i, maxLevel, 14);
      const cosA = Math.cos(angle(i));
      const anchor = Math.abs(cosA) < 0.2 ? "middle" : cosA > 0 ? "start" : "end";
      const lines = wrap(d.short, 10);
      const t = d3.select(this).attr("text-anchor", anchor).attr("x", x);
      const startY = y - ((lines.length - 1) * 17) / 2 + 5;
      lines.forEach((l, k) => t.append("tspan").attr("x", x).attr("y", startY + k * 17).text(l));
    });

  // Level text: shown top-left (in its own reserved space above the chart)
  const KEY = [
    "Lvl 0: No practical exposure",
    "Lvl 1: Beginner: familiar with the concepts; requires guidance",
    "Lvl 2: Intermediate: can complete typical tasks independently",
    "Lvl 3: Advanced: production experience & can solve complex problems",
    "Lvl 4: Expert: can design systems, establish best practices, and mentor others"
  ];
  const key = host.insert("div", "svg").attr("class", "radar-key");

  // Hover highlight (dot + label) and the matching level text
  function show(i) {
    key.text(KEY[SKILLS[i].level]).classed("visible", true);
    dots.attr("r", (_, k) => (k === i ? 6.5 : 4))
      .attr("fill", (_, k) => (k === i ? HOVER : "#fff"))
      .attr("stroke", (_, k) => (k === i ? HOVER : ACCENT));
    labels.attr("fill", (_, k) => (k === i ? HOVER : "#555"));
  }
  function hide() {
    // Return to the pinned skill (if any), otherwise clear the highlight
    if (pinned !== null) { show(pinned); return; }
    key.classed("visible", false);
    dots.attr("r", 4).attr("fill", "#fff").attr("stroke", ACCENT);
    labels.attr("fill", "#555");
  }

  // Click a dot or label to pin its hover state; click it again (or empty space) to unpin
  let pinned = null;
  [dots, labels].forEach(sel =>
    sel.on("mouseenter focus", (e, d) => show(SKILLS.indexOf(d)))
      .on("mouseleave blur", hide)
      .on("click", (e, d) => {
        e.stopPropagation();
        const i = SKILLS.indexOf(d);
        pinned = pinned === i ? null : i;
        if (pinned === null) hide(); else show(pinned);
      }));
  svg.on("click", () => { pinned = null; hide(); });

  // Animate in once visible
  function animateIn() {
    poly.transition().duration(900).ease(d3.easeCubicOut).attr("d", polyPoints(1));
    dots.transition().duration(900).ease(d3.easeCubicOut)
      .attr("cx", (d, i) => pt(i, d.level)[0])
      .attr("cy", (d, i) => pt(i, d.level)[1]);
  }
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { animateIn(); io.disconnect(); }
    }, { threshold: 0.3 });
    io.observe(host.node());
  } else animateIn();
})();
