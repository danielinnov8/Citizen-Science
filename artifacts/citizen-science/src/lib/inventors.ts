import manuPhoto from "@assets/image_1780677287488.jpeg";

export interface Inventor {
  name: string;
  field: string;
  blurb: string;
  imageUrl: string;
  href: string;
}

// Curated showcase of inventors for the homepage. Manu Rehani is featured in
// the first slot; the rest are widely recognized inventors whose work made
// science and technology more accessible.
export const INVENTORS: Inventor[] = [
  {
    name: "Manu Rehani",
    field: "Behavioral Intelligence & Systems",
    blurb:
      "Austin-based inventor, engineer, and advisor with twelve patents across cloud storage, language models, autonomous systems, and wearable intelligence.",
    imageUrl: manuPhoto,
    href: "https://rehani.co",
  },
  {
    name: "Manu Prakash",
    field: "Frugal Science",
    blurb:
      "Invented the Foldscope, a $1 paper microscope, and the Paperfuge — putting real lab tools into anyone's hands.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/f/f1/Manu_Prakash_at_TED.jpg",
    href: "https://en.wikipedia.org/wiki/Manu_Prakash",
  },
  {
    name: "James Dyson",
    field: "Industrial Design",
    blurb:
      "Built 5,127 prototypes to perfect the bagless cyclonic vacuum, then reinvented fans, dryers, and more.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/6/67/Sir_James_Dyson_CBE_FREng_FRS.jpg",
    href: "https://en.wikipedia.org/wiki/James_Dyson",
  },
  {
    name: "Lonnie Johnson",
    field: "Aerospace Engineering",
    blurb:
      "NASA engineer who invented the Super Soaker and now develops next-generation energy and battery technology.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/eb/Lonnie_Johnson%2C_Office_of_Naval_Research_%28crop%29.jpg",
    href: "https://en.wikipedia.org/wiki/Lonnie_Johnson_(inventor)",
  },
  {
    name: "Radia Perlman",
    field: "Network Engineering",
    blurb:
      "The \"Mother of the Internet\" — invented the Spanning Tree Protocol that makes modern networks possible.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/a/af/Radia_Perlman_2009.jpg",
    href: "https://en.wikipedia.org/wiki/Radia_Perlman",
  },
  {
    name: "Dean Kamen",
    field: "Biomedical Engineering",
    blurb:
      "Inventor of the first wearable insulin pump and the Segway, and founder of the FIRST robotics program.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/7/72/Dean_Kamen_at_MAGNET_in_Cleveland_-_2025_%28cropped%29.jpg",
    href: "https://en.wikipedia.org/wiki/Dean_Kamen",
  },
  {
    name: "Federico Faggin",
    field: "Microelectronics",
    blurb:
      "Led the design of the Intel 4004, the world's first commercial microprocessor, and the silicon-gate technology behind it.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/f/fc/Federico_Faggin_%28cropped%29.jpg",
    href: "https://en.wikipedia.org/wiki/Federico_Faggin",
  },
  {
    name: "Hedy Lamarr",
    field: "Communications",
    blurb:
      "Hollywood star and inventor whose frequency-hopping patent laid the groundwork for Wi-Fi, GPS, and Bluetooth.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/83/Hedy_Lamarr_Publicity_Photo_for_The_Heavenly_Body_1944.jpg",
    href: "https://en.wikipedia.org/wiki/Hedy_Lamarr",
  },
];
