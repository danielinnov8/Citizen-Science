import type { ModuleTutorial } from "./types";

const tutorial: ModuleTutorial = {
  slug: "neuroscience",
  title: "Introduction to Neuroscience",
  subtitle: "How billions of electrically active cells produce movement, perception, attention, and thought.",
  readingTime: "10 min read",
  sections: [
    {
      title: "What this field studies",
      summary: "Neuroscience studies the nervous system — how neurons signal, connect, and give rise to behavior and mind.",
      body: [
        {
          kind: "text",
          text: "Neuroscience is the study of the nervous system: the brain, the spinal cord, and the network of nerves that reaches every part of the body. Its central question is how electrical and chemical activity in cells called neurons turns into sensation, movement, memory, emotion, and decision-making.",
        },
        {
          kind: "text",
          text: "The field works across many scales at once. At the smallest scale it studies single neurons and the molecules that let them fire. At the largest it studies whole brain systems and behavior. A typical human brain holds roughly 86 billion neurons, each connected to thousands of others, forming trillions of junctions called synapses.",
        },
        {
          kind: "list",
          items: [
            "Cellular & molecular neuroscience — how individual neurons generate and pass signals",
            "Systems neuroscience — how circuits handle vision, movement, and memory",
            "Cognitive neuroscience — how the brain produces attention, language, and decisions",
            "Behavioral neuroscience — how brain activity links to what an organism actually does",
          ],
        },
      ],
    },
    {
      title: "Why it matters",
      summary: "Understanding the brain shapes medicine, mental health, learning, and the design of technology.",
      body: [
        {
          kind: "text",
          text: "Disorders of the nervous system — stroke, epilepsy, Parkinson's, depression, chronic pain — are among the most common and costly health problems worldwide. Progress against them depends directly on understanding how neurons and circuits work, and how they fail.",
        },
        {
          kind: "text",
          text: "Neuroscience also reaches far beyond the clinic. It informs how we teach and learn, how interfaces and warning signals should be designed, and how courts think about responsibility. And it is approachable for citizen scientists: many findings about reaction time, attention, and perception come from simple timed tasks that need nothing more than a screen, a stopwatch, or a ruler.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Real-world impact",
          text: "Large online experiments run by volunteers have mapped how reaction time changes with age, time of day, and sleep — patterns first found in small lab studies and now confirmed at the scale of millions of trials.",
        },
      ],
    },
    {
      title: "Key concepts",
      summary: "Neurons, action potentials, synapses, neurotransmitters, and plasticity.",
      body: [
        {
          kind: "terms",
          items: [
            { term: "Neuron", definition: "A cell specialized to receive and transmit signals. It has branches (dendrites) that collect input and a long fiber (axon) that sends output." },
            { term: "Action potential", definition: "A brief electrical spike that travels down an axon. Neurons communicate in these all-or-nothing pulses, often firing dozens of times per second." },
            { term: "Synapse", definition: "The tiny gap where one neuron passes a signal to the next, usually by releasing chemical messengers." },
            { term: "Neurotransmitter", definition: "A chemical such as dopamine, serotonin, or glutamate that carries the signal across a synapse and excites or inhibits the next neuron." },
            { term: "Neuroplasticity", definition: "The brain's ability to rewire itself — strengthening or weakening connections — as you learn, practice, or recover from injury." },
          ],
        },
        {
          kind: "text",
          text: "These ideas chain together. Sensory input triggers action potentials; those signals cross synapses using neurotransmitters; repeated patterns of firing reshape the connections through plasticity. Learning a skill, in physical terms, is plasticity tuning the circuits that produce it.",
        },
      ],
    },
    {
      title: "Simple example experiment",
      summary: "Measure your reaction time with the classic 'falling ruler' test and see how it changes with conditions.",
      body: [
        {
          kind: "text",
          text: "Reaction time is the delay between a stimulus and your response, and it reflects how long it takes signals to travel from your eyes to your brain to your hand — usually around 150 to 250 milliseconds. The dropped-ruler test turns a distance into a time using a simple physics relationship, so all you need is a ruler and a partner.",
        },
        {
          kind: "steps",
          items: [
            "Have a partner hold a 30 cm ruler vertically so the 0 cm mark hangs just between your open thumb and forefinger.",
            "Without warning, your partner releases the ruler; you catch it as fast as you can.",
            "Read the centimeter mark at the top of your fingers — the distance the ruler fell before you caught it.",
            "Convert distance to time with t = square root of (2 x distance / 9.8); for example, 18 cm falls in about 0.19 seconds.",
            "Repeat 10 times and average your results to smooth out lucky and unlucky catches.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Make it a real experiment",
          text: "Change only one variable between two sets of 10 trials — for instance, your dominant vs. non-dominant hand, or before vs. after caffeine. Keep posture, partner, and ruler identical so any difference in catch distance reflects that one factor.",
        },
      ],
    },
    {
      title: "Safety considerations",
      summary: "Cognitive experiments are very low-risk, but protect comfort, privacy, and honest expectations.",
      body: [
        {
          kind: "list",
          items: [
            "Take breaks during repetitive timed tasks to avoid eye strain and wrist fatigue.",
            "Never test reaction time while driving, on stairs, or in any situation where a lapse could cause injury.",
            "If you test other people, explain what you are doing and get their agreement before you record anything.",
            "Keep personal data (names, ages, results) private and stored only with the person's permission.",
            "Treat home results as a fun estimate, not a medical or diagnostic measurement.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Not a diagnosis",
          text: "A slow reaction time on a home test does not diagnose any condition. If you have genuine concerns about memory, attention, or coordination, talk to a qualified clinician.",
        },
      ],
    },
    {
      title: "What you can measure at home",
      summary: "Reaction time, attention, perception, short-term memory, and how they shift with conditions.",
      body: [
        {
          kind: "text",
          text: "The brain's behavior is surprisingly measurable without instruments. The key is a fixed procedure and many repetitions, because human responses are noisy — a single trial tells you little, but an average of twenty tells you a lot.",
        },
        {
          kind: "list",
          items: [
            "Reaction time — ruler-drop or on-screen 'click when it changes color' tasks",
            "Attention — count how often you miss a target in a stream of distractors",
            "Perception — find the smallest brightness or color difference you can reliably detect",
            "Memory — how many digits or words you can recall after a short delay",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Log it in your Notebook",
          text: "Record the time of day, sleep the night before, and caffeine intake alongside each score. Over a couple of weeks these notes reveal patterns no single session could show.",
        },
      ],
    },
  ],
};

export default tutorial;
