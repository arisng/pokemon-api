const fs = require("fs");
const csv = require("csvtojson");

const createPokemonData = async () => {
  let newData = await csv().fromFile("pokemon.csv");
  let data;
  try {
    data = JSON.parse(fs.readFileSync("db.json"));
  } catch (err) {
    data = { data: [] };
  }

  newData = Array.from(newData).slice(0, 721);

  newData = newData.map((e, index) => {
    return {
      id: index + 1,
      name: e.Name,

      type: !e.Type2 ? [e.Type1] : [e.Type1, e.Type2],
      imageLink: `http://localhost:9000/images/${index + 1}.jpg`,
    };
  });

  data = { ...data, data: newData };
  fs.writeFileSync("db.json", JSON.stringify(data));

  console.log(newData);
};
createPokemonData();
