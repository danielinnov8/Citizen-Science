import type { ModuleTutorial } from "./types";

const tutorial: ModuleTutorial = {
  slug: "human-health",
  title: "Introduction to Human Health",
  subtitle: "How your body regulates itself — and how to track sleep, heart rate, and habits without diagnosing anything.",
  readingTime: "11 min read",
  sections: [
    {
      title: "What this field studies",
      summary: "Human health studies how the body works, stays balanced, and responds to sleep, food, movement, and stress.",
      body: [
        {
          kind: "text",
          text: "Human health sits at the intersection of physiology — the science of how the body's systems function — and the everyday behaviors that shape wellbeing. It asks how your heart, lungs, muscles, gut, and brain coordinate to keep you alive and functioning, and how sleep, nutrition, activity, and stress nudge those systems toward or away from good health.",
        },
        {
          kind: "text",
          text: "A central theme is balance. Your body constantly works to hold internal conditions steady: blood sugar within a narrow band, core temperature near 37°C, blood pressure within a healthy range. Health is largely the story of how well these regulatory systems cope with the demands you place on them, and how daily habits either support or strain that regulation over years.",
        },
        {
          kind: "list",
          items: [
            "Physiology — how organs and systems function and communicate",
            "Sleep & circadian rhythm — the 24-hour cycles that govern rest and alertness",
            "Nutrition — how food provides energy and the building blocks for tissue",
            "Lifestyle & wellness — movement, stress, and habits that compound over time",
          ],
        },
      ],
    },
    {
      title: "Why it matters",
      summary: "Understanding your own physiology helps you build sustainable habits and make sense of how you feel.",
      body: [
        {
          kind: "text",
          text: "Most of the largest influences on long-term health are behaviors you control daily: how much you sleep, how you eat, how much you move, and how you manage stress. Understanding the biology behind these habits turns vague advice into something you can reason about — why a late, heavy meal disrupts sleep, or why a short walk after eating blunts a blood-sugar spike.",
        },
        {
          kind: "text",
          text: "Self-tracking makes this concrete and personal. Measuring your resting heart rate, sleep duration, or recovery after exertion reveals patterns unique to you and shows whether a change actually helps. The goal is insight and better habits, not diagnosis — these measurements describe trends, not medical conditions.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Real-world impact",
          text: "Resting heart rate, measured first thing in the morning over weeks, tends to fall as cardiovascular fitness improves — one of the clearest signals you can track at home without any special device.",
        },
      ],
    },
    {
      title: "Key concepts",
      summary: "Homeostasis, the circadian rhythm, resting and target heart rate, energy balance, and recovery.",
      body: [
        {
          kind: "terms",
          items: [
            { term: "Homeostasis", definition: "The body's constant adjustment to keep internal conditions — temperature, blood sugar, hydration — within a healthy range." },
            { term: "Circadian rhythm", definition: "The roughly 24-hour internal clock, set largely by light, that controls sleep timing, alertness, and hormone release." },
            { term: "Resting heart rate", definition: "Heartbeats per minute at complete rest, often 60–100 bpm for adults and typically lower in fitter people." },
            { term: "Energy balance", definition: "The relationship between calories taken in as food and calories used by the body for activity and basic functions." },
            { term: "Recovery", definition: "The process by which the body repairs and adapts after stress such as exercise, strongly supported by sleep and nutrition." },
          ],
        },
        {
          kind: "text",
          text: "These ideas interconnect. Your circadian rhythm governs the sleep that drives recovery; recovery and energy balance determine how well your body maintains homeostasis; and heart rate offers a simple, daily window into how all of these systems are coping.",
        },
      ],
    },
    {
      title: "Simple example experiment",
      summary: "Measure your resting and recovery heart rate to see how your cardiovascular system responds to mild exertion.",
      body: [
        {
          kind: "text",
          text: "Your heart rate rises during activity and falls back toward baseline when you rest — and how quickly it recovers reflects your cardiovascular fitness. This activity needs nothing but a clock with a second hand and your own pulse, and it makes an invisible physiological response visible and measurable. It is a fitness observation, not a medical test.",
        },
        {
          kind: "steps",
          items: [
            "Sit quietly for five minutes, then find your pulse at your wrist or neck and count the beats for 30 seconds.",
            "Multiply that count by two to get your resting heart rate in beats per minute, and write it down.",
            "Do a minute of gentle exercise you are comfortable with, such as marching in place or slow step-ups.",
            "Immediately count your pulse for 30 seconds again and double it to record your peak rate.",
            "Sit and rest for exactly one minute, then measure your pulse a final time to find your recovery rate.",
            "Note all three numbers and how much your heart rate dropped during the recovery minute.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Make it a real experiment",
          text: "Hold the exercise and timing identical each day and change just one thing you want to study — for example, measure recovery after a good night's sleep versus a poor one, and watch how a single variable shifts your numbers over a couple of weeks.",
        },
      ],
    },
    {
      title: "Safety considerations",
      summary: "Self-tracking is safe and informative, but it is not a substitute for professional medical care.",
      body: [
        {
          kind: "list",
          items: [
            "Choose exercise that matches your fitness level, and stop immediately if you feel dizzy, faint, or short of breath.",
            "Warm up gently and stay hydrated, especially before any activity that raises your heart rate.",
            "Treat your numbers as trends over time, not single readings to worry over — daily variation is completely normal.",
            "Avoid extreme diets, fasting experiments, or sleep deprivation in the name of data; do not compromise wellbeing for a measurement.",
            "Keep your records private and remember they describe your habits, not a diagnosis.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Not a medical diagnosis",
          text: "Home measurements cannot diagnose any condition. If you have chest pain, a persistently irregular or very high heart rate, fainting, or any worrying symptom, stop and consult a qualified healthcare professional rather than relying on self-tracking.",
        },
      ],
    },
    {
      title: "What you can measure at home",
      summary: "Heart rate, sleep duration, step count, hydration, and how habits track against how you feel.",
      body: [
        {
          kind: "text",
          text: "Useful health data comes from consistent, honest tracking of a few simple measures. The aim is to spot your own patterns over weeks, not to chase perfect daily numbers. Always measure under similar conditions so your comparisons are fair.",
        },
        {
          kind: "list",
          items: [
            "Resting heart rate — taken at the same time each morning before getting up",
            "Sleep — bedtime, wake time, and total hours, plus a simple 1–5 rating of how rested you feel",
            "Activity — daily step count or minutes of movement using a phone or pedometer",
            "Hydration — glasses of water per day alongside how your energy feels",
            "Habits — a tally of a routine you want to build, such as a walk after meals",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Log it in your Notebook",
          text: "Record the measurement and a short note on context — sleep, stress, or what you ate — each day. Over a few weeks the patterns linking your habits to how you feel become far clearer than any single reading.",
        },
      ],
    },
  ],
};

export default tutorial;
