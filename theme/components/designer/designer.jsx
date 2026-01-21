// DesignersPage.jsx
import React, { useMemo, useState } from "react";
import styles from "./designer.less";
import SvgWrapper from "../core/svgWrapper/SvgWrapper";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const TABS = [
  { key: "women", label: "WOMEN" },
  { key: "men", label: "MEN" },
  { key: "living", label: "LIVING" },
];

const CATEGORIES = [
  { key: "viewAll", label: "VIEW ALL" },
  { key: "rtw", label: "READY-TO-WEAR" },
  { key: "accessories", label: "ACCESSORIES" },
  { key: "living", label: "LIVING" },
  { key: "foundCollectibles", label: "FOUND & COLLECTIBLES" },
  { key: "exclusiveEditions", label: "EXCLUSIVES EDITIONS" },
];

// Minimal seed data (you can replace with API data)
const DESIGNERS_BY_TAB = {
  women: [
    "ABHICCHO",
    "ARTISAN LAB",
    "ATBW",
    "BEETROOT PRODUCTS",
    "CLAYMEN",
    "CHAARGOUSH",
    "DHORA",
    "DHRUV KAPOOR",
    "GLASS FOREST",
    "GULLY LABS",
    "IKALSAL",
    "ISMAIL PLUMBER",
    "KARTIK RESEARCH",
    "KHANOOM JAIPUR",
    "KUNEL GAUR",
    "LOVEBIRDS STUDIO",
    "MIRCHI BY KIM",
    "NAUSHAD ALI",
    "NO NAME JEWELRY",
    "PRITAM ARTS",
    "SMALL PLUMBER",
    "SOFT GURJEET",
    "TIGER MARRON",
    "THAELY",
    "THEATER",
    "THE TERRA TRIBE",
    "UGRA SHOES",
  ],
  men: ["ABHICCHO", "ARTISAN LAB", "ATBW"],
  living: ["ABHICCHO", "ARTISAN LAB", "ATBW"],
};

function groupByLetter(items) {
  const map = new Map();
  items.forEach((name) => {
    const letter = (name?.[0] || "").toUpperCase();
    if (!map.has(letter)) map.set(letter, []);
    map.get(letter).push(name);
  });

  // Ensure stable order within each letter group
  for (const [k, v] of map.entries()) {
    map.set(
      k,
      [...v].sort((a, b) => a.localeCompare(b))
    );
  }

  // Sort groups by letter
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

export default function DesignersPage() {
  const [activeTab, setActiveTab] = useState("women");
  const [activeCategory, setActiveCategory] = useState("viewAll");
  const [activeLetter, setActiveLetter] = useState(null);
  const [selected, setSelected] = useState(() => new Set());

  const dataColumns = useMemo(() => {
    // In the screenshot, all three columns are visible under WOMEN/MEN/LIVING header.
    // We'll render 3 columns always; the activeTab affects highlight and can drive data selection if you want.
    return [
      { key: "women", title: "WOMEN", items: DESIGNERS_BY_TAB.women },
      { key: "men", title: "MEN", items: DESIGNERS_BY_TAB.men },
      { key: "living", title: "LIVING", items: DESIGNERS_BY_TAB.living },
    ];
  }, []);

  const filteredColumns = useMemo(() => {
    return dataColumns.map((col) => {
      const items = col.items.filter((name) => {
        if (!activeLetter) return true;
        return name?.[0]?.toUpperCase() === activeLetter;
      });
      return { ...col, grouped: groupByLetter(items) };
    });
  }, [dataColumns, activeLetter]);

  const toggleSelected = (name) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const isLetterAvailable = (letter) => {
    // availability based on WOMEN list (largest) so the alphabet feels useful
    return (DESIGNERS_BY_TAB.women || []).some(
      (n) => n?.[0]?.toUpperCase() === letter
    );
  };

  return (
    <div className={styles["designersPage"]}>
      <div className={styles["dpContainer"]}>
        <div className={styles["dpHeaderRow"]}>
          <div className={styles["dpTitle"]}>Designers</div>
        </div>

        <div className={styles["dpBody"]}>
          {/* Left sidebar */}
          <aside className={styles["dpSidebar"]} aria-label="Categories">
            <div className={styles["dpSidebarTitle"]}>CATEGORIES</div>
            <ul className={styles["dpSidebarList"]}>
              {CATEGORIES.map((c) => (
                <li key={c.key} className={styles["dpSidebarItem"]}>
                  <button
                    type="button"
                    className={`dpSidebarBtn ${
                      activeCategory === c.key ? "isActive" : ""
                    }`}
                    onClick={() => setActiveCategory(c.key)}
                  >
                    <span className={styles["dpDot"]} aria-hidden="true" />
                    <span className={styles["dpSidebarLabel"]}>{c.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Main */}
          <main className={styles["dpMain"]}>
            <div className={styles["dpMainHeader"]}>
              <div className={styles["dpMainHeaderLabel"]}>ALL DESIGNERS</div>

              <div
                className={styles["dpAlpha"]}
                role="navigation"
                aria-label="Alphabet filter"
              >
                {ALPHABET.map((ch) => {
                  const available = isLetterAvailable(ch);
                  const active = activeLetter === ch;
                  return (
                    <button
                      key={ch}
                      type="button"
                      className={`dpAlphaBtn ${active ? "isActive" : ""}`}
                      disabled={!available}
                      onClick={() =>
                        setActiveLetter((prev) => (prev === ch ? null : ch))
                      }
                      aria-pressed={active}
                      title={
                        !available
                          ? "No designers for this letter"
                          : `Filter ${ch}`
                      }
                    >
                      {ch}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles["dpColumns"]}>
              {filteredColumns.map((col) => (
                <section
                  key={col.key}
                  className={`dpCol ${activeTab === col.key ? "isHighlighted" : ""}`}
                  aria-label={`${col.title} designers`}
                >
                  <div className={styles["dpColTitle"]}>{col.title}</div>

                  <div className={styles["dpGroups"]}>
                    {col.grouped.length === 0 ? (
                      <div className={styles["dpEmpty"]}>
                        No designers{activeLetter ? ` for ${activeLetter}` : ""}
                        .
                      </div>
                    ) : (
                      col.grouped.map(([letter, names]) => (
                        <div
                          className={styles["dpGroup"]}
                          key={`${col.key}-${letter}`}
                        >
                          <div className={styles["dpGroupLetter"]}>
                            {letter}
                          </div>
                          <ul className={styles["dpList"]}>
                            {names.map((name) => {
                              const checked = selected.has(name);
                              return (
                                <li
                                  key={`${col.key}-${name}`}
                                  className={styles["dpListItem"]}
                                >
                                  <label className={styles["dpCheckRow"]}>
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggleSelected(name)}
                                    />

                                    <SvgWrapper svgSrc={"wishlist-plp"} />
                                    <span className={styles["dpCheckText"]}>
                                      {name}
                                    </span>
                                  </label>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
