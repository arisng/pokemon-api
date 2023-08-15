const fs = require("fs");

const pokemonAllTypes = () => {
  let pokemonTypes = [];
  let db = fs.readFileSync("db.json", "utf-8");
  db = JSON.parse(db);
  const pokemons = db.data;
  pokemons.forEach((pokemon) => {
    pokemon.types.forEach((type) => {
      const lowerCaseType = type.toLowerCase();
      if (!pokemonTypes.includes(lowerCaseType)) {
        pokemonTypes.push(lowerCaseType);
      }
    });
  });

  return pokemonTypes;
};

module.exports = pokemonAllTypes;
