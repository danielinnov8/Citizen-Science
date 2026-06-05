import type { ModuleTutorial } from "./types";

const tutorial: ModuleTutorial = {
  slug: "food-science",
  title: "Introduction to Food Science",
  subtitle: "The chemistry and biology of cooking, fermentation, and preservation — and how to measure food as it transforms.",
  readingTime: "10 min read",
  sections: [
    {
      title: "What this field studies",
      summary: "Food science applies chemistry, physics, and biology to understand how ingredients change when we cook, ferment, and store them.",
      body: [
        {
          kind: "text",
          text: "Food science treats the kitchen as a laboratory. It asks what is physically and chemically happening when dough rises, a steak browns, milk turns to yoghurt, or jam keeps for a year. The same molecules studied in a chemistry class — proteins, sugars, fats, water, and acids — behave in predictable ways when you change temperature, time, pH, or concentration.",
        },
        {
          kind: "text",
          text: "Because food is made of just a few classes of molecules, learning how each one responds to heat, microbes, and time explains an enormous range of dishes. A custard and a scrambled egg both rely on proteins unfolding; bread and beer both rely on yeast eating sugar.",
        },
        {
          kind: "list",
          items: [
            "Food chemistry — reactions like browning, caramelisation, and protein coagulation",
            "Fermentation science — how microbes transform food into yoghurt, bread, pickles, and cheese",
            "Food preservation — slowing spoilage with salt, acid, sugar, cold, or drying",
            "Food physics — emulsions, foams, gels, and textures",
          ],
        },
      ],
    },
    {
      title: "Why it matters",
      summary: "Food science underpins safe food, less waste, better nutrition, and the flavour of everything we eat.",
      body: [
        {
          kind: "text",
          text: "Understanding food transformations is the difference between food that nourishes and food that makes you ill. Preservation techniques developed by food scientists — pasteurisation, canning, refrigeration, controlled fermentation — let billions of people eat safely far from where food is grown, and dramatically reduce waste.",
        },
        {
          kind: "text",
          text: "Flavour, too, is chemistry you can control. Knowing that browning needs heat and dryness, or that a pinch of acid sets a sauce, turns guesswork into reliable results. Fermentation is having a renaissance precisely because home cooks now understand the microbiology behind sourdough, kimchi, and kombucha.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Real-world impact",
          text: "Roughly a third of food produced worldwide is wasted. Better home preservation and an understanding of date labels versus actual spoilage are among the simplest ways individuals can cut that figure.",
        },
      ],
    },
    {
      title: "Key concepts",
      summary: "A handful of reactions — browning, fermentation, emulsification, and preservation — explain most of what happens to food.",
      body: [
        {
          kind: "terms",
          items: [
            { term: "Maillard reaction", definition: "A reaction between amino acids and sugars above roughly 140 °C that creates the brown colour and savoury flavour of toast, seared meat, and roasted coffee." },
            { term: "Fermentation", definition: "Microbes (yeast or bacteria) converting sugars into acids, alcohol, or gases — the basis of bread, yoghurt, beer, and pickles." },
            { term: "Emulsion", definition: "A stable mixture of two liquids that normally separate, like oil and water in mayonnaise, held together by an emulsifier such as egg yolk." },
            { term: "Denaturation", definition: "When heat, acid, or agitation unfolds proteins so they tangle and set — turning a runny egg solid or curdling milk." },
            { term: "Water activity", definition: "The amount of 'free' water available to microbes; salt, sugar, and drying lower it and so preserve food." },
          ],
        },
        {
          kind: "text",
          text: "These concepts overlap on the plate. Searing bread for toast is the Maillard reaction; the bread itself was leavened by fermentation; spreading it with mayonnaise is an emulsion; and the jam on top is preserved by sugar lowering its water activity.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Browning needs dryness",
          text: "The Maillard reaction stalls while a surface is wet, because the water keeps it near 100 °C. Patting food dry before searing is why it browns faster.",
        },
      ],
    },
    {
      title: "Simple example experiment",
      summary: "Ferment your own quick sauerkraut and track how cabbage and salt turn into a tangy, acidic food.",
      body: [
        {
          kind: "text",
          text: "Lacto-fermentation is one of the oldest preservation methods. Salt draws water out of cabbage and favours Lactobacillus bacteria, which convert the cabbage's sugars into lactic acid. The rising acidity preserves the vegetable and creates the sour tang of sauerkraut — and you can watch and even measure it happen over about a week.",
        },
        {
          kind: "steps",
          items: [
            "Finely shred about 500 g of cabbage and weigh it; add 2% of that weight in salt (about 10 g, roughly 2 teaspoons).",
            "Massage the salted cabbage in a bowl for 5–10 minutes until it releases enough liquid to cover itself.",
            "Pack it tightly into a clean jar, pressing down so the brine rises above the cabbage, leaving a few centimetres of space at the top.",
            "Weigh the cabbage down (a smaller water-filled jar works) so it stays submerged, and rest the lid on loosely so gas can escape.",
            "Keep it at room temperature out of direct sun and taste a little with a clean utensil each day for 5–10 days.",
            "When it tastes pleasantly sour, seal it and move it to the fridge to slow the fermentation.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Make it a real experiment",
          text: "Make two identical jars and change only the salt percentage — say 1.5% versus 2.5% — keeping cabbage, temperature, and timing the same. Measure pH with test strips each day to see how salt level affects the speed of souring.",
        },
      ],
    },
    {
      title: "Safety considerations",
      summary: "Most home food experiments are safe, but fermentation and preservation have real spoilage and contamination risks.",
      body: [
        {
          kind: "list",
          items: [
            "Use clean jars and utensils, and wash your hands — you want the right microbes to win, not contaminants.",
            "Keep fermenting vegetables fully submerged under brine; mould grows on anything exposed to air.",
            "Discard a ferment if it smells putrid or rotten (not just sour), or shows fuzzy or coloured mould.",
            "Be cautious with very hot oil and sugar when testing browning or caramelisation — both cause severe burns.",
            "Never taste anything if you are unsure it is safe, and refrigerate finished ferments to stop them over-acidifying.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Avoid low-acid canning and oil infusions",
          text: "Improper home canning of low-acid foods and homemade garlic-in-oil can grow Clostridium botulinum, which produces a deadly, taste-free toxin. Stick to high-acid ferments and refrigerated projects unless you are trained in tested canning methods.",
        },
      ],
    },
    {
      title: "What you can measure at home",
      summary: "pH, weight loss, gas production, browning, and texture can all be tracked with simple kitchen tools.",
      body: [
        {
          kind: "text",
          text: "Food transformations are quantitative. With a kitchen scale, pH strips, a timer, and a thermometer, you can turn cooking into measurable experiments where the same recipe gives the same result every time.",
        },
        {
          kind: "list",
          items: [
            "Acidity — pH of a ferment falling over days as bacteria produce acid",
            "Mass change — weight lost as food dries, or gained as dough proofs",
            "Browning — time and temperature needed for a Maillard colour to develop",
            "Stability — how long an emulsion or foam holds before it separates",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Log it in your Notebook",
          text: "Record exact amounts, temperatures, and times, and photograph results under the same lighting. Consistent measurements let you compare batches and pin down which variable changed the outcome.",
        },
      ],
    },
  ],
};

export default tutorial;
