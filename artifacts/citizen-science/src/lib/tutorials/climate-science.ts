import type { ModuleTutorial } from "./types";

const tutorial: ModuleTutorial = {
  slug: "climate-science",
  title: "Introduction to Climate Science",
  subtitle: "How energy, gases, and oceans set the long-term patterns we call climate — and how to record them.",
  readingTime: "10 min read",
  sections: [
    {
      title: "What this field studies",
      summary: "Climate science studies the long-term behavior of Earth's atmosphere, oceans, ice, and land as one connected system.",
      body: [
        {
          kind: "text",
          text: "Climate science studies how energy from the Sun moves through Earth's atmosphere, oceans, ice, and land, and what determines the planet's long-term average conditions. Where a meteorologist asks what the weather will do tomorrow, a climate scientist asks what conditions are typical over decades and why they are changing.",
        },
        {
          kind: "text",
          text: "The key distinction is timescale. Weather is the state of the atmosphere right now — today's temperature, rain, and wind. Climate is the statistics of weather over 30 years or more: the averages, the extremes, and how often each occurs. A cold week does not contradict a warming climate any more than one tall person changes a country's average height.",
        },
        {
          kind: "list",
          items: [
            "Atmospheric science — gases, clouds, and how heat and moisture move through the air",
            "Oceanography — how oceans store and transport vast amounts of heat and carbon",
            "Cryosphere science — how ice sheets, glaciers, and sea ice respond to warming",
            "Paleoclimatology — reading past climates from ice cores, tree rings, and sediments",
          ],
        },
      ],
    },
    {
      title: "Why it matters",
      summary: "Climate shapes water, food, sea level, health, and the stability of the places people live.",
      body: [
        {
          kind: "text",
          text: "Climate sets the boundaries of daily life: which crops grow where, how much fresh water is available, how high the sea sits against the coast, and how often heatwaves, droughts, and floods strike. Since the Industrial Revolution, atmospheric carbon dioxide has risen from about 280 parts per million to over 420, and global average temperature has warmed by roughly 1.2 degrees Celsius — small-sounding numbers with large consequences.",
        },
        {
          kind: "text",
          text: "Climate science depends heavily on data gathered widely and consistently, which makes it ideal for citizen scientists. Volunteer rain gauges, backyard weather stations, and phenology logs (when trees leaf out, when ponds freeze) fill gaps between official stations and stretch records back further than any single agency could.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Real-world impact",
          text: "Volunteer rainfall networks such as CoCoRaHS feed daily measurements from tens of thousands of backyard gauges into flood forecasting and drought monitoring used by national weather services.",
        },
      ],
    },
    {
      title: "Key concepts",
      summary: "The greenhouse effect, the carbon cycle, albedo, feedbacks, and the weather–climate distinction.",
      body: [
        {
          kind: "terms",
          items: [
            { term: "Greenhouse effect", definition: "Gases like CO2, methane, and water vapor let sunlight in but absorb outgoing heat, keeping Earth's surface about 33 degrees Celsius warmer than it would otherwise be." },
            { term: "Carbon cycle", definition: "The continuous movement of carbon among the atmosphere, oceans, soils, rocks, and living things. Burning fossil fuels adds carbon faster than natural sinks remove it." },
            { term: "Albedo", definition: "How reflective a surface is. Bright ice and clouds reflect sunlight away; dark oceans and forests absorb it, warming the planet." },
            { term: "Feedback", definition: "A response that amplifies or dampens a change. Melting ice exposes dark water, which absorbs more heat and melts more ice — a reinforcing loop." },
            { term: "Forcing", definition: "Anything that pushes the climate's energy balance, such as added greenhouse gases, volcanic dust, or changes in the Sun's output." },
          ],
        },
        {
          kind: "text",
          text: "These pieces interlock. Burning fossil fuels shifts the carbon cycle, strengthening the greenhouse effect — a forcing. Warming then lowers albedo as ice melts, a feedback that adds even more heat. Climate change is the sum of forcings and feedbacks playing out over decades.",
        },
      ],
    },
    {
      title: "Simple example experiment",
      summary: "Demonstrate the greenhouse effect using two jars, two thermometers, and a covered lid.",
      body: [
        {
          kind: "text",
          text: "You can model how trapped air warms under sunlight with a pair of jars. Covering one jar limits how fast warmed air escapes, much as greenhouse gases slow the loss of heat from the planet. It is a simplified analogy — real greenhouse warming is about infrared radiation, not just trapped air — but it shows how a barrier to heat loss raises temperature.",
        },
        {
          kind: "steps",
          items: [
            "Place an identical thermometer inside each of two clear glass jars.",
            "Seal one jar tightly with a clear lid or plastic wrap; leave the other jar open.",
            "Set both jars side by side in direct sunlight (or under a desk lamp) on the same surface.",
            "Record both temperatures at the start, then every 5 minutes for 30 minutes.",
            "Plot the two temperature curves and compare how high each jar climbs.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Make it a real experiment",
          text: "Change only one variable between trials — for example, add a spoon of soil or a dark cloth to both jars to test albedo, or compare a sealed jar with and without a splash of water for humidity. Keep light, jar size, and placement identical.",
        },
      ],
    },
    {
      title: "Safety considerations",
      summary: "Outdoor and sunlight-based observations are low-risk but call for sun, heat, and weather awareness.",
      body: [
        {
          kind: "list",
          items: [
            "Glass jars in strong sun get hot — handle them with a cloth and let them cool before moving.",
            "If you use older thermometers, never use mercury types; choose alcohol or digital thermometers, and clean up broken glass carefully.",
            "When observing outdoors, wear sun protection and stay hydrated, especially during heat events.",
            "Never take weather readings outdoors during lightning, high winds, or flooding.",
            "Mount any rooftop or pole-mounted gauge from a safe, stable position — do not climb in wet or icy conditions.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Severe weather",
          text: "Curiosity is not worth your safety. During thunderstorms, flash floods, or extreme heat, stay indoors and read your instruments later — no data point is worth the risk.",
        },
      ],
    },
    {
      title: "What you can measure at home",
      summary: "Temperature, rainfall, humidity, pressure, and seasonal timing — recorded consistently over time.",
      body: [
        {
          kind: "text",
          text: "Climate data is built from steady, repeated observations at a fixed location. A reading is only useful if it is comparable to your earlier ones, so the rule is to measure the same way, at the same place, ideally at the same time each day.",
        },
        {
          kind: "list",
          items: [
            "Temperature — daily high and low from a shaded, ventilated thermometer",
            "Rainfall — depth in millimeters from a straight-sided gauge emptied each day",
            "Humidity & pressure — from an inexpensive home weather station",
            "Phenology — dates of first frost, first bloom, leaf fall, or pond freeze each year",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Log it in your Notebook",
          text: "Record the date, exact time, and instrument placement every entry. A multi-year record from one backyard reveals trends that a scattered handful of readings never could.",
        },
      ],
    },
  ],
};

export default tutorial;
