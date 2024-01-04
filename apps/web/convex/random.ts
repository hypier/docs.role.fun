const genres = [
  "Fantasy",
  "Science Fiction",
  "Horror",
  "Mystery",
  "Thriller",
  "Romance",
  "Historical",
  "Young Adult (YA)",
  "Children’s",
  "Dystopian",
  "Adventure",
  "Crime",
  "Literary",
  "Magical Realism",
  "Realistic",
  "Speculative",
  "Urban",
  "Western",
  "Gothic",
  "Biographical",
];

const modalities = [
  "Novel",
  "Plays",
  "Poetry",
  "Graphic Novel",
  "Epistolary Fiction",
  "Choose-Your-Own-Adventure",
  "Fan Fiction",
  "Anthologies",
  "Audio Drama",
  "Video Game",
  "Visual Novels",
  "Anime",
  "Movie",
  "Alternate Reality Games",
  "Text-Based Role-Playing Games",
];

function getRandomElement(arr: any) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const getRandomGenreAndModality = () => {
  const genre = getRandomElement(genres);
  const modality = getRandomElement(modalities);
  return `${genre} ${modality}`;
};
