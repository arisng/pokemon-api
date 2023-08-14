const crypto = require("crypto");
const fs = require("fs");
const express = require("express");
const router = express.Router();
const DATA_SIZE = require("../config");
const pokemonAllTypes = require("../getPokemonTypes");
const { faker } = require("@faker-js/faker");

const createPokemon = () => {
  const min = 720;
  const max = 800;

  const name = faker.person.firstName();
  const typeLength = Math.floor(Math.random() * 4);
  const allTypes = pokemonAllTypes();
  // Shuffle the 'types' array randomly
  const shuffledTypes = allTypes.sort(() => 0.5 - Math.random());
  // Extract a subarray with the desired length
  const types = shuffledTypes.slice(0, typeLength);
  const randomId = Math.floor(Math.random() * DATA_SIZE) + 1;
  const imageLink = `http://localhost:9000/images/${randomId}.jpg`;
  const id = Math.floor(Math.random() * (max - min + 1)) + min;
  const newPokemon = {
    id,
    name,
    types,
    imageLink,
  };

  // console.log("create new: ", newPokemon);
  return newPokemon;
};

/* GET pokemons listing. */
router.get("/", (req, res, next) => {
  const allowedFilter = ["name", "type", "search", "id"];
  try {
    let { page, limit, ...filterQuery } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const filterKeys = Object.keys(filterQuery);

    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key)) {
        const exception = new Error(`Query ${key} is not allowed`);
        exception.statusCode = 401;
        throw exception;
      }
      if (!filterQuery[key]) delete filterQuery[key];
    });

    let offset = limit * (page - 1);

    //Read data from db.json then parse to JSonbject
    let db = fs.readFileSync("db.json", "utf-8");
    db = JSON.parse(db);
    // const pokemons = db.data;
    const { data } = db;

    // const { pokemons } = db;
    //Filter data by title
    // let result = pokemons;

    if (filterKeys.length) {
      if (filterQuery.type) {
        const searchQuery = filterQuery.type.toLowerCase();
        console.log("Line 87 searchQuery", searchQuery);
        result = data.filter((pokemon) =>
          pokemon.types.some(
            (pokemonType) => pokemonType.toLowerCase() === searchQuery
          )
        );
      }

      if (filterQuery.search) {
        const searchQuery = filterQuery.search.toLowerCase();
        console.log(" Line  95 searchQuery", searchQuery);
        result = data.filter(
          (pokemon) => pokemon.name === searchQuery || pokemon.id == searchQuery
        );
      }
    } else {
      result = data;
    }

    //then select number of result by offset
    result = result.slice(offset, offset + limit);
    const newdb = { data: result };

    //send response

    res.send(newdb);
  } catch (error) {
    next(error);
  }
});

/* GET pokemon by Id. */
router.get("/:pokemonID", (req, res, next) => {
  try {
    const { pokemonID } = req.params;

    let pokemonId = parseInt(pokemonID);

    //Read data from db.json then parse to JSobject
    let db = fs.readFileSync("db.json", "utf-8");
    db = JSON.parse(db);
    const pokemons = db.data;
    const size = pokemons.length;

    const targetIndex = pokemons.findIndex(
      (pokemon) => pokemon.id === pokemonId
    );

    if (targetIndex < 0 || targetIndex >= size) {
      const exception = new Error(`pokemon not found`);
      exception.statusCode = 404;
      throw exception;
    }

    let result = [];
    let prevId = 0;
    let nextId = 0;
    if (targetIndex == 0) {
      prevId = size - 1;
      nextId = targetIndex + 1;
    } else if (targetIndex == size - 1) {
      prevId = targetIndex - 1;
      nextId = 0;
    } else {
      prevId = targetIndex - 1;
      nextId = targetIndex + 1;
    }

    result.push(pokemons[targetIndex]);
    result.push(pokemons[prevId]);
    result.push(pokemons[nextId]);
    //put send response
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});

/* CREATE new Pokemon. */

router.post("/", (req, res, next) => {
  let db = fs.readFileSync("db.json", "utf-8");
  db = JSON.parse(db);
  const pokemons = db.data;

  const newPok = createPokemon();
  console.log("newPok: ", newPok);
  const { id, name, types, imageLink } = newPok;

  try {
    if (!name) {
      const exception = new Error(`Missing required data `);
      exception.statusCode = 404;
      throw exception;
    }

    if (types.length < 1 || types.length > 2) {
      const exception = new Error(`Pokémon can only have one or two types. `);
      exception.statusCode = 404;
      throw exception;
    }

    if (pokemons.some((pokemon) => pokemon.name === name)) {
      const exception = new Error(`The Pokémon already exists. `);
      exception.statusCode = 404;
      throw exception;
    }

    if (pokemons.some((pokemon) => pokemon.id === id)) {
      const exception = new Error(`The Pokémon already exists. `);
      exception.statusCode = 404;
      throw exception;
    }

    //Add new book to book JS object
    pokemons.push(newPok);
    //Add new book to db JS object
    db.data = pokemons;
    //db JSobject to JSON string
    db = JSON.stringify(db);
    //write and save to db.json
    fs.writeFileSync("db.json", db);

    //post send response
    res.status(200).send(newPok);
  } catch (error) {
    next(error);
  }
});

/* DELETE new Pokemon. */
router.delete("/:pokemonID", (req, res, next) => {
  try {
    const { pokemonID } = req.params;
    let pokemonId = parseInt(pokemonID);
    //Read data from db.json then parse to JSobject
    let db = fs.readFileSync("db.json", "utf-8");
    db = JSON.parse(db);
    const pokemons = db.data;
    const size = pokemons.length;
    const targetIndex = pokemons.findIndex(
      (pokemon) => pokemon.id === pokemonId
    );
    if (targetIndex < 0 || targetIndex >= size) {
      const exception = new Error(`pokemon not found`);
      exception.statusCode = 404;
      throw exception;
    }
    db.data = pokemons.filter((pokemon) => pokemon.id != pokemonId);
    db = JSON.stringify(db);
    fs.writeFileSync("db.json", db);
    res.status(200).send({});
  } catch (error) {
    next(error);
  }
});

/* UPDATE a Pokemon. */
router.put("/:pokemonID", (req, res, next) => {
  try {
    // verify the id
    const { pokemonID } = req.params;
    let pokemonId = parseInt(pokemonID);

    let db = fs.readFileSync("db.json", "utf-8");
    db = JSON.parse(db);
    const pokemons = db.data;
    const size = pokemons.length;
    const targetIndex = pokemons.findIndex(
      (pokemon) => pokemon.id === pokemonId
    );
    if (targetIndex < 0 || targetIndex >= size) {
      const exception = new Error(`pokemon not found`);
      exception.statusCode = 404;
      throw exception;
    }

    const allowUpdate = ["name", "types", "imageLink"];
    const updates = req.body;

    const updateKeys = Object.keys(updates);

    //find update request that not allow
    const notAllow = updateKeys.filter((el) => !allowUpdate.includes(el));

    if (notAllow.length) {
      const exception = new Error(`Update field not allow`);
      exception.statusCode = 401;
      throw exception;
    }

    if (!updates.name) {
      const exception = new Error(`Missing required data `);
      exception.statusCode = 404;
      throw exception;
    }

    if (updates.types.length < 1 || updates.types.length > 2) {
      const exception = new Error(`Pokémon can only have one or two types. `);
      exception.statusCode = 404;
      throw exception;
    }

    if (pokemons.some((pokemon) => pokemon.name === updates.name)) {
      const exception = new Error(`The Pokémon already exists. `);
      exception.statusCode = 404;
      throw exception;
    }

    const allTypes = pokemonAllTypes();

    if (updates.types.some((type) => !allTypes.includes(type))) {
      console.log("test types");
      const exception = new Error(`Pokémon's type is invalid.`);
      exception.statusCode = 404;
      throw exception;
    }

    const updatedPokemons = { ...db.data[targetIndex], ...updates };

    db.data[targetIndex] = updatedPokemons;
    //db JSobject to JSON string
    db = JSON.stringify(db);
    //write and save to db.json
    fs.writeFileSync("db.json", db);

    //post send response
    res.status(200).send(updatedPokemons);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
