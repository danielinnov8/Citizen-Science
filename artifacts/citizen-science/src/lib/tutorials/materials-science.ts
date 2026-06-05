import type { ModuleTutorial } from "./types";

const tutorial: ModuleTutorial = {
  slug: "materials-science",
  title: "Introduction to Materials Science",
  subtitle: "Why some things bend, some shatter, and some carry enormous loads — and how to test them yourself.",
  readingTime: "10 min read",
  sections: [
    {
      title: "What this field studies",
      summary: "Materials science studies how the structure of a material gives it properties like strength, stiffness, and toughness.",
      body: [
        {
          kind: "text",
          text: "Materials science is the study of why materials behave the way they do — why steel is strong, glass is brittle, rubber stretches, and aluminum is light. Its core idea is that a material's internal structure, from its atoms up to its visible grain, determines the properties you can feel and use.",
        },
        {
          kind: "text",
          text: "The field connects four things in a loop: structure, properties, processing, and performance. How you process a material (heating, hammering, cooling) sets its structure; the structure sets its properties; and the properties decide how it performs in a real part. Change one and the others follow — the same iron can become a soft nail or a hard blade depending on how it is treated.",
        },
        {
          kind: "list",
          items: [
            "Metals — strong and ductile, they bend before they break",
            "Ceramics — hard and heat-resistant, but brittle",
            "Polymers — lightweight plastics and rubbers, often flexible",
            "Composites — combinations like fiberglass or carbon fiber that beat any single material",
          ],
        },
      ],
    },
    {
      title: "Why it matters",
      summary: "Every structure, device, and tool depends on choosing materials that are strong, safe, and affordable enough.",
      body: [
        {
          kind: "text",
          text: "Almost every technology is limited by its materials. Faster aircraft need alloys that stay strong when hot; longer-lasting batteries need better electrodes; safer bridges and buildings depend on knowing exactly how much load steel and concrete can take before they fail. Choosing the wrong material, or misjudging its limits, causes real disasters.",
        },
        {
          kind: "text",
          text: "Materials science is also remarkably hands-on for citizen scientists, because its central questions — how stiff is this, how much can it hold, where does it break — can be explored with household objects and simple loads. You can feel the difference between elastic and permanent deformation with nothing more than a paperclip.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Real-world impact",
          text: "Many catastrophic failures, from collapsed walkways to cracked aircraft fuselages, were later traced to materials reaching fatigue or stress limits — limits that controlled testing is designed to find before a part is trusted with lives.",
        },
      ],
    },
    {
      title: "Key concepts",
      summary: "Stress, strain, elasticity, plasticity, and the difference between strong and tough.",
      body: [
        {
          kind: "terms",
          items: [
            { term: "Stress", definition: "The force applied to a material divided by the area carrying it. It tells you how hard the material is being pushed or pulled, regardless of part size." },
            { term: "Strain", definition: "How much a material deforms relative to its original length — a stretch of 1 mm in a 100 mm bar is 1% strain." },
            { term: "Elastic deformation", definition: "Temporary stretching: release the load and the material springs back to its original shape, like a rubber band." },
            { term: "Plastic deformation", definition: "Permanent change: past a certain stress (the yield point) the material stays bent even after the load is removed, like a folded paperclip." },
            { term: "Toughness vs. strength", definition: "Strength is how much stress a material resists; toughness is how much energy it absorbs before fracturing. Glass is strong but not tough; it shatters without bending." },
          ],
        },
        {
          kind: "text",
          text: "These ideas describe a material's whole life under load. Apply stress and you get strain; small loads cause elastic strain that recovers; larger loads cross the yield point into plastic strain; push further and the material fails. How much energy it soaks up along the way is its toughness.",
        },
      ],
    },
    {
      title: "Simple example experiment",
      summary: "Build and load paper bridges to find how shape, not just material, controls how much weight a structure carries.",
      body: [
        {
          kind: "text",
          text: "A flat sheet of paper sags under its own weight, yet the same paper folded into a beam can hold a surprising load. This experiment shows that structure determines strength: by changing only the cross-section, you change how stress is distributed and how much the bridge can carry before it buckles.",
        },
        {
          kind: "steps",
          items: [
            "Stand two stacks of books about 15 cm apart to act as supports for a bridge span.",
            "Lay a single flat sheet of paper across the gap and gently add coins one at a time until it collapses; record the count.",
            "Take an identical sheet and fold it lengthwise into a corrugated, accordion shape, then lay it across the same gap.",
            "Add coins one at a time to the folded bridge until it fails, recording the number it held.",
            "Compare the two coin counts to see how much the fold increased the load capacity.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Make it a real experiment",
          text: "Change only one variable at a time — the number of folds, the span width, or the paper type — while keeping everything else identical. Plotting coins held against the number of folds turns a demo into real data.",
        },
      ],
    },
    {
      title: "Safety considerations",
      summary: "Breaking things on purpose is informative but creates flying pieces, sharp edges, and pinch hazards.",
      body: [
        {
          kind: "list",
          items: [
            "Wear safety glasses whenever you load something to failure — brittle materials can launch fragments without warning.",
            "Never test glass, ceramics, or hardened metal at home; they fail suddenly and can cut or shatter dangerously.",
            "Keep hands, fingers, and faces clear of anything that might snap back or collapse under load.",
            "Add weight gradually and stand to the side, not directly over or under the load path.",
            "Use modest loads — coins, washers, water bottles — not heavy weights that could fall and injure feet.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Stored energy",
          text: "A bent or stretched material holds energy and can spring or shatter the instant it fails. Treat anything under tension or about to break as if it will release all at once — because it can.",
        },
      ],
    },
    {
      title: "What you can measure at home",
      summary: "Load capacity, stiffness, elastic limits, and how shape and treatment change a material's behavior.",
      body: [
        {
          kind: "text",
          text: "Materials testing at home is about applying a known, repeatable load and recording what happens. The number you record — coins held, millimeters of bend, bends before breaking — only means something if you apply the load the same way every time.",
        },
        {
          kind: "list",
          items: [
            "Load capacity — how much weight a beam, bridge, or column holds before failing",
            "Stiffness — how far something deflects under a fixed weight (less deflection means stiffer)",
            "Elastic limit — the most you can stretch a rubber band or wire and still have it return",
            "Fatigue — how many bends a paperclip survives before it snaps",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Log it in your Notebook",
          text: "Record the material, dimensions, exact load, and how it failed every time. Repeat each test several times and average — single specimens vary, so patterns only emerge across trials.",
        },
      ],
    },
  ],
};

export default tutorial;
