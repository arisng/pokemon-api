const fs = require("fs");
const csv = require("csvtojson");
const DATA_SIZE = require("./config");
const BASE_URL = "https://pokemon-api2.onrender.com";
// const BASE_URL = "http://localhost:9000";

const createPokemonData = async () => {
  let newData = await csv().fromFile("pokedex.csv");

  let data;
  try {
    data = JSON.parse(fs.readFileSync("db.json"));
  } catch (err) {
    data = { data: [] };
  }

  newData = newData.map((e) => {
    return {
      id: e.pokedex_number.toString(),
      name: e.name,
      types: !e.type_2 ? [e.type_1] : [e.type_1, e.type_2],
      height: e.height_m,
      weight: e.weight_kg,
      abilities: !e.ability_2 ? [e.ability_1] : [e.ability_1, e.ability_2],
      url: `${BASE_URL}/images/${e.pokedex_number}.jpg`,
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

  // fs.writeFileSync("db.json", JSON.stringify(data));

  let pokDescription = await csv().fromFile("PokemonUniteData.csv");

  const dbArray = data.data;
  dbArray.forEach((obj) => {
    const objName = obj.name.toLowerCase();
    const matchingPoke = pokDescription.find(
      (poke) => poke.Name?.toLowerCase() == objName
    );
    if (matchingPoke) {
      obj.description = matchingPoke.Description;
    }
  });

  data.data = dbArray;
  // Write the updated dbData to db.json
  fs.writeFileSync("db.json", JSON.stringify(data, null, 2), "utf-8");
  // console.log(dbArray);
};

createPokemonData();
