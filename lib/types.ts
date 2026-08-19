export type PokemonType = {
  slot: number;
  type: { name: string; url: string };
};

export type Pokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string | null;
  };
  types: PokemonType[];
};

export type Comment = {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
};

export type Album = {
  userId: number;
  id: number;
  title: string;
};
