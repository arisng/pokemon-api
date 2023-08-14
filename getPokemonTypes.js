const fs = require("fs");

const pokemonAllTypes = () => {
  let pokemonTypes = [];
  let db = fs.readFileSync("db.json", "utf-8");
  db = JSON.parse(db);
  const pokemons = db.data;
  pokemons.forEach((pokemon) => {
    pokemon.types.forEach((type) => {
      if (!pokemonTypes.includes(type)) {
        pokemonTypes.push(type);
      }
    });
  });

  // console.log("pokemontype; ", pokemonTypes);
};

module.exports = pokemonAllTypes();
