import type { ModuleTutorial } from "./types";

const tutorial: ModuleTutorial = {
  slug: "microbiology",
  title: "Introduction to Microbiology",
  subtitle: "The hidden world of bacteria, fungi, and other microbes — how they grow, where they live, and how to study them safely.",
  readingTime: "10 min read",
  sections: [
    {
      title: "What this field studies",
      summary: "Microbiology is the study of organisms too small to see — bacteria, fungi, viruses, and single-celled life — and how they grow and interact.",
      body: [
        {
          kind: "text",
          text: "Microbiology is the science of life at the smallest scale: organisms a thousand times thinner than a human hair, most of them invisible without a microscope. A typical bacterium is about 1–2 micrometres across, so millions can fit on a pinhead. Despite their size, microbes are the most abundant and metabolically diverse life on Earth.",
        },
        {
          kind: "text",
          text: "The field covers several distinct groups of organisms, each with its own biology. Microbiologists study how these cells obtain energy, reproduce, form communities, and respond to their surroundings — whether that environment is a hot spring, a slice of bread, or your gut.",
        },
        {
          kind: "list",
          items: [
            "Bacteriology — single-celled prokaryotes that lack a nucleus, like E. coli and Lactobacillus",
            "Mycology — fungi, from single-celled yeasts to branching molds and mushrooms",
            "Virology — viruses, which can only replicate inside a host cell",
            "Microbial ecology — how mixed microbial communities (microbiomes) function together",
          ],
        },
      ],
    },
    {
      title: "Why it matters",
      summary: "Microbes drive disease and health, food production, decay, and the chemical cycles that keep the planet running.",
      body: [
        {
          kind: "text",
          text: "Microbes shape human life far more than their size suggests. They cause infectious disease, but they also produce most of our antibiotics, ferment our bread, cheese, and yoghurt, and decompose waste. The bacteria in your gut — roughly the same number as your own body cells — help digest food and train your immune system.",
        },
        {
          kind: "text",
          text: "On a planetary scale, microbes run the nitrogen and carbon cycles that make soil fertile and the atmosphere breathable. Cyanobacteria were producing oxygen billions of years before plants existed. Understanding microbial growth is also central to public health, from food safety to tracking how resistance to antibiotics spreads.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Real-world impact",
          text: "Volunteer projects that swab everyday surfaces and sequence the DNA — like subway and soil microbiome surveys — have mapped where antibiotic-resistance genes circulate in cities.",
        },
      ],
    },
    {
      title: "Key concepts",
      summary: "Microbial growth follows predictable phases, depends on conditions, and is studied with sterile technique.",
      body: [
        {
          kind: "terms",
          items: [
            { term: "Colony", definition: "A visible mound of millions of identical cells that grew from a single original cell on a solid surface like agar." },
            { term: "Exponential growth", definition: "Each cell divides into two, so a population doubles at a steady interval — some bacteria double every 20 minutes in ideal conditions." },
            { term: "Culture medium", definition: "The nutrient mixture (broth or gel) microbes are grown on; agar is a seaweed-derived gel that stays solid at warm temperatures." },
            { term: "Sterile technique", definition: "The practice of preventing unwanted microbes from contaminating samples, surfaces, or yourself." },
            { term: "Aerobe vs anaerobe", definition: "Aerobes need oxygen to grow; anaerobes grow without it, and some are even poisoned by it." },
          ],
        },
        {
          kind: "text",
          text: "These ideas link together. A single invisible cell, given the right medium, temperature, and oxygen level, undergoes exponential growth until it forms a colony you can see in a day or two. Sterile technique is what lets you be sure the colony you observe came from your sample — and not from a stray microbe in the air.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Counting by colonies",
          text: "Because one cell makes one colony, counting colonies on a plate is a standard way to estimate how many living microbes were in the original sample.",
        },
      ],
    },
    {
      title: "Simple example experiment",
      summary: "Grow visible bacterial and mold colonies from household surfaces on a homemade gelatin plate.",
      body: [
        {
          kind: "text",
          text: "You can culture real microbes at home without lab agar by using unflavoured gelatin and a bouillon cube as nutrients. Swabbing different surfaces lets you compare how many microbes live where — a phone screen, a door handle, or your hands before and after washing.",
        },
        {
          kind: "steps",
          items: [
            "Dissolve 1 bouillon cube and 1 tablespoon of unflavoured gelatin in 250 ml of just-boiled water, then add 1 teaspoon of sugar.",
            "Pour the warm liquid into a few clean lidded containers or jars to a depth of about 1 cm and let them set in the fridge until firm.",
            "Label each container, then gently rub a damp cotton swab from one surface across the surface of the gel in a zig-zag.",
            "Snap the lids on, tape them shut, and leave the containers somewhere warm (around 25–30 °C), gel-side up.",
            "Check daily for 3–5 days and record the number, size, and colour of the colonies that appear — do not open the lids.",
            "When finished, seal the unopened containers in a bag and put them in the trash.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Make it a real experiment",
          text: "Keep everything identical except one variable — for example, swab your hands before washing on one plate and after washing on another. Any difference in colony count can then be traced to handwashing alone.",
        },
      ],
    },
    {
      title: "Safety considerations",
      summary: "Home cultures grow unknown microbes, so seal them, never open them, and dispose of them carefully.",
      body: [
        {
          kind: "list",
          items: [
            "Once a plate is inoculated, keep it sealed (tape the lid) and never reopen it — you cannot know what is growing.",
            "Never sniff, taste, or touch the colonies; some household microbes can cause illness.",
            "Work on a wiped-down surface and wash your hands before and after handling plates.",
            "Dispose of finished cultures unopened — bag them and place in the trash, never down the sink.",
            "Pour boiling water and pour-out steps for an adult; keep cultures away from food-prep areas and out of reach of children and pets.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Do not grow anything you might inhale",
          text: "Never deliberately culture samples from sick people, spoiled meat, or sewage, and never open a mold colony indoors — spores can trigger serious respiratory reactions and some species are genuinely hazardous.",
        },
      ],
    },
    {
      title: "What you can measure at home",
      summary: "Colony counts, growth over time, and how conditions like temperature or cleaning change microbial populations.",
      body: [
        {
          kind: "text",
          text: "Microbiology at home is about careful, repeatable comparison rather than identifying exact species. With consistent plates and good notes, you can quantify how microbial populations differ between places and conditions.",
        },
        {
          kind: "list",
          items: [
            "Colony counts — how many distinct colonies appear from a given surface or sample",
            "Growth rate — how colony size or number increases each day",
            "Diversity — the variety of colony colours, shapes, and textures on a plate",
            "Effect of conditions — how temperature, cleaning, or disinfectant changes what grows",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Log it in your Notebook",
          text: "Photograph each plate at the same time every day next to a ruler, and record the date, temperature, and colony count. A clear daily series shows growth far better than one final photo.",
        },
      ],
    },
  ],
};

export default tutorial;
