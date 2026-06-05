import type { ModuleTutorial } from "./types";

const tutorial: ModuleTutorial = {
  slug: "agriculture",
  title: "Introduction to Agriculture",
  subtitle: "The science of growing food — soil health, plant nutrients, composting, and sustainable cultivation.",
  readingTime: "10 min read",
  sections: [
    {
      title: "What this field studies",
      summary: "Agriculture is the science and practice of cultivating soil, crops, and livestock to produce food, fibre, and other useful products.",
      body: [
        {
          kind: "text",
          text: "Agriculture studies how to grow plants and raise animals reliably and sustainably. At its heart is a deceptively simple question: what does a plant need to thrive? The answer brings together soil chemistry, plant biology, water management, ecology, and climate. A handful of garden soil is a living system containing billions of microbes, fungi, and tiny animals that recycle nutrients for roots.",
        },
        {
          kind: "text",
          text: "Modern agriculture spans backyard vegetable beds to vast farms, but the underlying principles are the same. Plants build themselves mostly from air and water using sunlight, while drawing a small but essential set of mineral nutrients from the soil. Manage those few inputs well and almost anything will grow.",
        },
        {
          kind: "list",
          items: [
            "Soil science — the physical, chemical, and biological health of soil",
            "Plant nutrition — the nutrients crops need and how they take them up",
            "Agronomy & horticulture — growing field crops, vegetables, and fruit",
            "Sustainable systems — composting, crop rotation, and conserving soil and water",
          ],
        },
      ],
    },
    {
      title: "Why it matters",
      summary: "Agriculture feeds the world, shapes ecosystems and climate, and depends on soil that takes centuries to form.",
      body: [
        {
          kind: "text",
          text: "Every meal traces back to agriculture, and the systems behind it use about half of the planet's habitable land and most of its fresh water. How we farm determines not only whether people are fed, but the health of rivers, the carbon stored in soil, and the survival of pollinators and other wildlife.",
        },
        {
          kind: "text",
          text: "Soil itself is the quiet foundation. A few centimetres of fertile topsoil can take hundreds of years to form, yet poor management can erode it in a single season. Practices like composting, cover cropping, and rotation rebuild soil structure and fertility — which is why home growers and farmers alike increasingly focus on feeding the soil, not just the plant.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Real-world impact",
          text: "Healthy soils store more carbon than the atmosphere and all plants combined, so improving soil organic matter on farms and gardens is one of the most accessible tools for slowing climate change.",
        },
      ],
    },
    {
      title: "Key concepts",
      summary: "Soil structure, the NPK nutrients, pH, germination, and composting are the foundations of growing.",
      body: [
        {
          kind: "terms",
          items: [
            { term: "NPK", definition: "The three nutrients plants need in the largest amounts: nitrogen (N) for leaves, phosphorus (P) for roots and flowers, and potassium (K) for overall vigour." },
            { term: "Soil pH", definition: "How acidic or alkaline soil is; most crops prefer pH 6–7, where nutrients are most available to roots." },
            { term: "Soil structure", definition: "How sand, silt, clay, and organic matter clump together, which controls how well soil holds water and air." },
            { term: "Germination", definition: "The process by which a seed absorbs water, activates, and sprouts a root and shoot." },
            { term: "Composting", definition: "Controlled decomposition of organic waste by microbes into a dark, nutrient-rich material that improves soil." },
          ],
        },
        {
          kind: "text",
          text: "These concepts are connected through the soil. Compost feeds soil microbes and improves structure, which helps soil hold the water and NPK nutrients that seeds need; and the right pH ensures those nutrients are actually available once a seed germinates and begins to grow.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Feed the soil, not just the plant",
          text: "Adding organic matter like compost improves structure, nutrients, and microbial life all at once — a more lasting fix than reaching straight for fertiliser.",
        },
      ],
    },
    {
      title: "Simple example experiment",
      summary: "Test how a single variable changes seed germination using nothing but seeds, paper towels, and bags.",
      body: [
        {
          kind: "text",
          text: "Germination is fast, cheap, and easy to observe, which makes it ideal for a controlled experiment. Fast-sprouting seeds like beans, peas, or cress will visibly sprout within a few days, letting you test what conditions help or hinder a seed waking up.",
        },
        {
          kind: "steps",
          items: [
            "Fold a paper towel, place 10 seeds of the same type on it, and slide it into a clear zip-top bag; make several identical bags.",
            "Moisten the towel in each bag with the same measured amount of water (for example, 20 ml), then seal the bags.",
            "Label each bag and place them where you can watch them, keeping conditions identical except the one factor you are testing.",
            "Check daily, adding the same small amount of water if a towel dries out, and record how many seeds have sprouted in each bag.",
            "After 5–7 days, calculate the germination rate (sprouted seeds out of 10) and compare the bags.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Make it a real experiment",
          text: "Change only one variable across the bags — temperature (fridge vs warm windowsill), light vs dark, or plain water vs salty water — and keep seed type, seed count, and moisture identical so any difference in germination is due to that single factor.",
        },
      ],
    },
    {
      title: "Safety considerations",
      summary: "Gardening is low-risk, but soil, fertilisers, and compost still call for basic hygiene and care.",
      body: [
        {
          kind: "list",
          items: [
            "Wear gloves when handling soil and compost, and wash your hands afterward — soil can carry bacteria and fungal spores.",
            "Keep fertilisers, lime, and seeds (some are treated with chemicals) sealed and away from children and pets.",
            "Never eat sprouts grown for an experiment; lab-style germination is not done under food-safe conditions.",
            "Turn compost with a tool rather than bare hands, and avoid composting meat, dairy, or pet waste, which attract pests and pathogens.",
            "Use tools carefully and lift heavy bags of soil with your legs to protect your back.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Avoid breathing dry compost and soil dust",
          text: "Dry potting mix and compost can release fungal spores and bacteria that cause serious lung infections such as Legionnaires' disease. Dampen the mix first, open bags away from your face, and work in a ventilated space.",
        },
      ],
    },
    {
      title: "What you can measure at home",
      summary: "Germination rates, growth, soil pH and drainage, and compost temperature are all easy to track.",
      body: [
        {
          kind: "text",
          text: "Growing things is naturally quantitative, and a notebook plus a few cheap tools turns gardening into real data. The most useful measurements are simple, repeatable, and recorded on the same schedule.",
        },
        {
          kind: "list",
          items: [
            "Germination rate — percentage of seeds that sprout under given conditions",
            "Growth — plant height or leaf count measured every few days",
            "Soil pH and drainage — using test strips and timing how fast water soaks in",
            "Compost activity — internal temperature, which rises as microbes break material down",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Log it in your Notebook",
          text: "Record the date, conditions, and exact measurement at the same time each day, and keep a control group. A consistent series across a week reveals trends a single snapshot never could.",
        },
      ],
    },
  ],
};

export default tutorial;
