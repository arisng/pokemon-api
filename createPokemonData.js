const fs = require("fs");
const csv = require("csvtojson");
const DATA_SIZE = require("./config");

/*
const createPokemonData = async () => {
  let newData = await csv().fromFile("pokemon.csv");
  let data;
  try {
    data = JSON.parse(fs.readFileSync("db.json"));
  } catch (err) {
    data = { data: [] };
  }

  newData = Array.from(newData).slice(0, DATA_SIZE);

  newData = newData.map((e, index) => {
    return {
      id: (index + 1).toString(),
      name: e.Name,
      types: !e.Type2 ? [e.Type1] : [e.Type1, e.Type2],
      url: `http://localhost:9000/images/${index + 1}.jpg`,
    };
  });

  data = { ...data, data: newData };
  fs.writeFileSync("db.json", JSON.stringify(data));

  console.log(newData);
};
*/

const createPokemonData = async () => {
  let newData = await csv().fromFile("pokedex.csv");
  let data;
  try {
    data = JSON.parse(fs.readFileSync("db.json"));
  } catch (err) {
    data = { data: [] };
  }

  // newData = Array.from(newData).slice(0, DATA_SIZE);

  newData = newData.map((e) => {
    return {
      id: e.pokedex_number.toString(),
      name: e.name,
      types: !e.type_2 ? [e.type_1] : [e.type_1, e.type_2],
      height: e.height_m,
      weight: e.weight_kg,
      abilities: !e.ability_2 ? [e.ability_1] : [e.ability_1, e.ability_2],
      url: `http://localhost:9000/images/${e.pokedex_number}.jpg`,
    };
  });

  const idMap = new Map();

  newData.forEach((e) => {
    idMap.set(e.id, e);
  });

  // Convert the Map values back to an array
  const uniqueData = Array.from(idMap.values());

  // Update newData with the uniqueData array
  newData = uniqueData.slice(0, DATA_SIZE);

  data = { ...data, data: newData };
  fs.writeFileSync("db.json", JSON.stringify(data));

  console.log(newData);
};

createPokemonData();
