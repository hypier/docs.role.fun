const genres = [
  "Fantasy",
  "Science Fiction",
  "Horror",
  "Mystery",
  "Thriller",
  "Romance",
  "Historical Fiction",
  "Young Adult (YA)",
  "Children’s Fiction",
  "Dystopian",
  "Adventure",
  "Crime",
  "Literary Fiction",
  "Magical Realism",
  "Realistic Fiction",
  "Speculative Fiction",
  "Urban Fiction",
  "Western",
  "Gothic",
  "Biographical Fiction",
];

const modalities = [
  "Novels",
  "Short Stories",
  "Novellas",
  "Plays",
  "Poetry",
  "Graphic Novels",
  "Flash Fiction",
  "Epistolary Fiction",
  "Serial Fiction",
  "Choose-Your-Own-Adventure",
  "Fan Fiction",
  "Historical Fiction",
  "Anthologies",
  "Audio Drama",
  "Interactive Fiction (Video Games)",
  "Visual Novels",
  "Hyperfiction",
  "Anime",
  "Movie",
  "Alternate Reality Games (ARGs)",
  "Text-Based Role-Playing Games (RPGs)",
];

function getRandomElement(arr: any) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const getRandomGenreAndModality = () => {
  const genre = getRandomElement(genres);
  const modality = getRandomElement(modalities);
  return `${genre} ${modality}`;
};
