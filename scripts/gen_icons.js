// Generates Tabler-style PNG icons (blue 0078D4 and white) for the slide decks.
// Usage: node scripts/gen_icons.js
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const path = require("path");
const tb = require("react-icons/tb");

const ICONS = {
  cloud: "TbCloud", building: "TbBuildingFactory2", shield: "TbShieldLock", key: "TbKey",
  network: "TbTopologyStar3", users: "TbUsers", id: "TbId", server: "TbServer", world: "TbWorld",
  link: "TbPlugConnected", chart: "TbChartBar", coin: "TbCoin", bulb: "TbBulb", target: "TbTarget",
  check: "TbCircleCheck", help: "TbHelpCircle", flask: "TbFlask", file: "TbFileText", clock: "TbClock",
  arrow: "TbArrowRight", terminal: "TbTerminal2", trophy: "TbTrophy", checklist: "TbListCheck",
  map: "TbMap2", git: "TbGitPullRequest", alert: "TbAlertTriangle", calendar: "TbCalendarEvent",
  play: "TbPlayerPlay", route: "TbRoute", database: "TbDatabase", lock: "TbLock", sitemap: "TbSitemap",
  usercheck: "TbUserCheck", bolt: "TbBolt", eye: "TbEye", dns: "TbWorldWww", firewall: "TbWall",
  monitor: "TbDeviceDesktopAnalytics", rocket: "TbRocket", code: "TbCode", siren: "TbAlarm",
  presentation: "TbPresentation", image: "TbPhoto", wrench: "TbTool", book: "TbBooks", flag: "TbFlag",
  migrate: "TbTransfer", policy: "TbFileCertificate", tag: "TbTag", stack: "TbStack2", compass: "TbCompass",
};
const COLORS = { blue: "#0078D4", white: "#FFFFFF" };
const out = path.join(__dirname, "..", "slides", "template", "icons");

(async () => {
  for (const [name, comp] of Object.entries(ICONS)) {
    if (!tb[comp]) { console.error("missing", comp); continue; }
    for (const [cname, color] of Object.entries(COLORS)) {
      const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(tb[comp], { size: 256, color, strokeWidth: 1.8 }));
      await sharp(Buffer.from(svg)).resize(256, 256).png().toFile(path.join(out, `${name}_${cname}.png`));
    }
  }
  console.log("icons:", Object.keys(ICONS).length);
})();
