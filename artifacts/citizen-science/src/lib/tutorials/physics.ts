import type { ModuleTutorial } from "./types";

const tutorial: ModuleTutorial = {
  slug: "physics",
  title: "Introduction to Physics",
  subtitle: "The rules behind motion, forces, and energy — and how to measure them with a ruler and a phone.",
  readingTime: "10 min read",
  sections: [
    {
      title: "What this field studies",
      summary: "Physics is the study of matter, motion, and energy — the most fundamental rules that govern how the universe behaves.",
      body: [
        {
          kind: "text",
          text: "Physics seeks the basic rules that everything else obeys. It asks how objects move, what makes them speed up or slow down, how energy flows from one form to another, and how forces like gravity and friction shape the world. Because these rules are so general, the same equations describe a falling apple, an orbiting satellite, and a rolling marble.",
        },
        {
          kind: "text",
          text: "The branch most accessible to a beginner is mechanics — the physics of motion and forces. Mechanics lets you predict where a thrown ball lands, how long a pendulum takes to swing, and how much energy it takes to lift a weight. Once you can describe motion with a few measurements and simple math, much of everyday physics becomes predictable.",
        },
        {
          kind: "list",
          items: [
            "Mechanics — motion, forces, energy, and momentum",
            "Thermodynamics — heat, temperature, and how energy spreads",
            "Electromagnetism — electricity, magnetism, and light",
            "Modern physics — relativity and the quantum behavior of tiny particles",
          ],
        },
      ],
    },
    {
      title: "Why it matters",
      summary: "Physics is the foundation of engineering, technology, and our understanding of the cosmos.",
      body: [
        {
          kind: "text",
          text: "Every bridge, engine, aircraft, and electronic device is built on physics. Understanding forces keeps buildings standing; understanding energy makes power grids and engines efficient; understanding light and electricity underlies the screen you are reading this on. Physics turns the world from a set of surprises into something you can calculate in advance.",
        },
        {
          kind: "text",
          text: "Physics is also ideal for home experimentation because its quantities are easy to measure: distance with a ruler, time with a stopwatch, mass with a kitchen scale. A modern smartphone is a portable physics lab, with sensors that record acceleration, rotation, and sound. Careful timing and measurement can reproduce results that match textbook values to within a few percent.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Real-world impact",
          text: "The pendulum you can build from string and a key was, for centuries, the most accurate timekeeper humans had — its swing depends almost entirely on its length, not its weight.",
        },
      ],
    },
    {
      title: "Key concepts",
      summary: "Velocity, acceleration, force, momentum, and the conservation of energy.",
      body: [
        {
          kind: "terms",
          items: [
            { term: "Velocity", definition: "How fast something moves and in what direction — distance covered divided by time, for example metres per second." },
            { term: "Acceleration", definition: "How quickly velocity changes. A falling object near Earth accelerates at about 9.8 m/s² each second." },
            { term: "Force", definition: "A push or pull that changes an object's motion. Newton's second law states force equals mass times acceleration (F = ma)." },
            { term: "Momentum", definition: "Mass times velocity — a measure of how hard it is to stop a moving object. It is conserved when objects collide." },
            { term: "Energy", definition: "The capacity to do work. Kinetic energy is energy of motion; potential energy is stored, such as a raised weight. Total energy is conserved." },
          ],
        },
        {
          kind: "text",
          text: "These concepts build on each other. A force causes acceleration; sustained acceleration changes velocity; velocity combined with mass gives momentum; and moving that mass over a distance transfers energy. Track any one of them carefully and you can predict the others.",
        },
      ],
    },
    {
      title: "Simple example experiment",
      summary: "Build a pendulum to discover how its swing time depends on length but not on weight.",
      body: [
        {
          kind: "text",
          text: "A pendulum is a weight hanging from a string that swings back and forth at a steady rhythm. The time for one full swing, called the period, depends on the length of the string and almost nothing else. Measuring it lets you confirm a precise physical law with nothing more than string, a weight, and a timer.",
        },
        {
          kind: "steps",
          items: [
            "Tie a small heavy object, such as a metal nut or a set of keys, to one end of a piece of string.",
            "Tape or hold the other end so the weight hangs freely, and measure the string length from the pivot to the centre of the weight.",
            "Pull the weight to one side by a small angle (about 10–15 degrees) and release it without pushing.",
            "Use a stopwatch to time how long 10 complete back-and-forth swings take.",
            "Divide that total by 10 to get the period of one swing, and record the length and period.",
            "Repeat with different string lengths and compare how the period changes.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Make it a real experiment",
          text: "Change only one variable at a time. First vary the string length while keeping the weight the same, then swap in a heavier weight at a fixed length. You will find length strongly affects the period, while weight barely matters at all.",
        },
      ],
    },
    {
      title: "Safety considerations",
      summary: "Mechanics experiments are low-risk, but moving objects and heights still deserve caution.",
      body: [
        {
          kind: "list",
          items: [
            "Keep swinging or falling weights light, and clear the area of people, pets, and breakable objects.",
            "Drop objects only from safe, modest heights and never from windows or balconies into shared spaces.",
            "Secure pivots and supports so a pendulum or pulley cannot fall onto anyone.",
            "Wear closed shoes when working with rolling carts or heavier weights that could land on your feet.",
            "Keep cords and string short enough that they cannot wrap around a neck or limb.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Mind the moving mass",
          text: "Even a small weight on a string carries real momentum and can bruise or break things. Never swing weights near faces or eyes, and stop the pendulum by hand only when it has slowed to a gentle motion.",
        },
      ],
    },
    {
      title: "What you can measure at home",
      summary: "Time, distance, speed, acceleration, and energy transfer with simple tools.",
      body: [
        {
          kind: "text",
          text: "Physics rewards careful measurement of just a few basic quantities. With a ruler, a stopwatch or phone, and a scale, you can derive almost everything else — speed from distance and time, acceleration from changing speed, energy from height and mass.",
        },
        {
          kind: "list",
          items: [
            "Time — the period of a pendulum or how long an object takes to fall a measured height",
            "Speed — distance a rolling ball travels divided by the time it takes",
            "Acceleration — how speed increases down a ramp at different angles",
            "Momentum — comparing how far a marble pushes another in a collision",
            "Energy — how high a bouncing ball returns relative to its drop height",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Log it in your Notebook",
          text: "Record several repeats of each trial and average them. Timing by hand has a margin of error, so multiple measurements give a far more trustworthy result than a single run.",
        },
      ],
    },
  ],
};

export default tutorial;
