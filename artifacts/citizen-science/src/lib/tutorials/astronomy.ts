import type { ModuleTutorial } from "./types";

const tutorial: ModuleTutorial = {
  slug: "astronomy",
  title: "Introduction to Astronomy",
  subtitle: "Reading the sky — from the Moon's phases to distant stars — and keeping a record of what you see.",
  readingTime: "10 min read",
  sections: [
    {
      title: "What this field studies",
      summary: "Astronomy studies everything beyond Earth — planets, stars, galaxies — and how the universe behaves over time.",
      body: [
        {
          kind: "text",
          text: "Astronomy is the study of objects and phenomena beyond Earth's atmosphere: the Moon, the Sun and planets, comets and asteroids, stars, galaxies, and the structure of the universe as a whole. It is one of the oldest sciences, because anyone with clear eyes and a dark sky already has the basic instrument.",
        },
        {
          kind: "text",
          text: "What makes astronomy unusual is that almost everything we know comes from light. We cannot visit a star, so astronomers decode its temperature, motion, and composition from the light it sends us. Distances are staggering: sunlight takes about 8 minutes to reach us, while light from the nearest star beyond the Sun takes over 4 years.",
        },
        {
          kind: "list",
          items: [
            "Planetary science — the Sun's planets, moons, asteroids, and comets",
            "Stellar astronomy — how stars form, shine, and die",
            "Galactic & extragalactic astronomy — the Milky Way and the billions of galaxies beyond it",
            "Cosmology — the origin, expansion, and large-scale structure of the universe",
          ],
        },
      ],
    },
    {
      title: "Why it matters",
      summary: "Astronomy drives fundamental physics, navigation and timekeeping, technology, and our sense of place.",
      body: [
        {
          kind: "text",
          text: "Astronomy has repeatedly reshaped physics: gravity, the nature of light, and the expansion of the universe were all forced on us by what we saw in the sky. It also has practical reach — GPS depends on precise timekeeping and relativity, and many imaging and detector technologies were first developed to study faint celestial light.",
        },
        {
          kind: "text",
          text: "It is also one of the most welcoming sciences for volunteers. The sky is enormous and professional telescopes cannot watch all of it at once, so amateurs still discover comets, track variable stars, and time eclipses. A pair of binoculars, a clear night, and careful notes are enough to contribute real observations.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Real-world impact",
          text: "Amateur astronomers regularly catch supernovae and report exploding stars before professional surveys, and networks of volunteers time asteroid occultations to map the shapes of distant rocks.",
        },
      ],
    },
    {
      title: "Key concepts",
      summary: "Orbits, the light-year, magnitude, the celestial sphere, and the phases of the Moon.",
      body: [
        {
          kind: "terms",
          items: [
            { term: "Orbit", definition: "The curved path one body follows around another under gravity, such as the Moon around Earth or Earth around the Sun." },
            { term: "Light-year", definition: "The distance light travels in one year — about 9.5 trillion kilometers. It is a unit of distance, not time." },
            { term: "Apparent magnitude", definition: "A measure of how bright an object looks from Earth. Confusingly, smaller numbers mean brighter; the faintest stars the eye can see are about magnitude 6." },
            { term: "Celestial sphere", definition: "The imaginary dome of sky on which stars appear fixed. We locate objects on it much like latitude and longitude on Earth." },
            { term: "Lunar phase", definition: "The changing fraction of the Moon's lit face we see — new, crescent, quarter, gibbous, full — caused by the Moon's position relative to Earth and Sun." },
          ],
        },
        {
          kind: "text",
          text: "These ideas connect what you see to what is happening. The Moon's orbit produces its phases; the celestial sphere lets you find and re-find an object night after night; magnitude tells you what is realistic to spot; and the light-year reminds you that you are always looking into the past.",
        },
      ],
    },
    {
      title: "Simple example experiment",
      summary: "Track the Moon for a month to map its phases and watch how its rise time shifts each day.",
      body: [
        {
          kind: "text",
          text: "The Moon completes its cycle of phases every 29.5 days, and it rises roughly 50 minutes later each night. By sketching it on a schedule, you can rediscover the geometry of the Earth–Moon–Sun system yourself — no equipment beyond your eyes and a notebook is required.",
        },
        {
          kind: "steps",
          items: [
            "Each clear evening, find the Moon and note the date and the time you observe it.",
            "Sketch the shape of the lit portion and label which side is illuminated (left or right).",
            "Record the Moon's approximate position — how high above the horizon and in which direction.",
            "Note the time it appears, and watch how that time drifts later from night to night.",
            "After about four weeks, lay your sketches in order to reveal the full new-to-full cycle.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Make it a real experiment",
          text: "Add one controlled variable: compare the Moon's apparent size near the horizon versus high overhead by photographing it with the same camera and zoom. Keep the device and settings identical to test the 'Moon illusion' for yourself.",
        },
      ],
    },
    {
      title: "Safety considerations",
      summary: "Night observing is safe with planning, but the Sun and dark surroundings demand real caution.",
      body: [
        {
          kind: "list",
          items: [
            "Never look at the Sun directly, and never point binoculars or a telescope at it without a proper solar filter — permanent eye damage happens instantly.",
            "Observe from a safe, familiar location; tell someone where you are and keep a charged phone.",
            "Use a dim red flashlight to protect night vision and avoid tripping on cables, tripods, and uneven ground.",
            "Dress warmly — standing still outdoors at night gets cold faster than you expect.",
            "If observing in remote areas, watch for wildlife, traffic, and changing weather.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Solar viewing",
          text: "Sunglasses, exposed film, and 'looking quickly' are not safe ways to view the Sun or a solar eclipse. Use only certified solar-viewing glasses or filters made for the purpose.",
        },
      ],
    },
    {
      title: "What you can measure at home",
      summary: "Moon phases, planet positions, star brightness, meteor counts, and the timing of sky events.",
      body: [
        {
          kind: "text",
          text: "Useful astronomical observation is about consistency and good records. Note the date, the time (ideally in a standard zone such as UTC), your location, and the sky conditions every session, because those details are what make your observations comparable and shareable.",
        },
        {
          kind: "list",
          items: [
            "Moon — phase, rise time, and position night to night",
            "Planets — track Venus, Mars, Jupiter, and Saturn shifting against the stars over weeks",
            "Variable stars — estimate brightness by comparing to steady neighbor stars",
            "Meteors — count how many you see per hour during a known shower",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Log it in your Notebook",
          text: "Always record date, time, location, and sky clarity. A consistent observing log lets you spot patterns — and lets others verify and build on what you saw.",
        },
      ],
    },
  ],
};

export default tutorial;
