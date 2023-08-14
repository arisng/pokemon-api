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

  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  const name = faker.person.firstName();
  const typeLength = Math.floor(Math.random() * 4);
  // Shuffle the 'types' array randomly
  const shuffledTypes = pokemonAllTypes.sort(() => 0.5 - Math.random());

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
  return newPokemon;
};

/* GET pokemons listing. */
router.get("/", (req, res, next) => {
  const allowedFilter = ["name", "type", "page", "limit"];
  try {
    let { name, type, page, limit, ...filterQuery } = req.query;
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
    const pokemons = db.data;
    //Filter data by title
    let result = pokemons;
    if (name) {
      const searchRegex = new RegExp(name, "i");
      result = result.filter((pokemon) => searchRegex.test(pokemon.name));
    }

    if (type) {
      result = result.filter((pokemon) =>
        pokemon.types.some(
          (pokemonType) => pokemonType.toLowerCase() === type.toLowerCase()
        )
      );
    }
    // addition filter
    if (filterKeys.length) {
      filterKeys.forEach((condition) => {
        result = result.filter(
          (pokemon) => pokemon[condition] === filterQuery[condition]
        );
      });
    }
    //then select number of result by offset
    result = result.slice(offset, offset + limit);

    //send response

    res.send(result);
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

    if (pokemonId <= 0 || DATA_SIZE > 721) {
      const exception = new Error(`pokemon not found`);
      exception.statusCode = 404;
      throw exception;
    }
    // console.log("getPokemonbyId");
    // console.log("input: ", pokemonId);

    let result = [];
    let prevPokemonId = 0;
    let nextPokemonId = 0;
    if (pokemonId == 1) {
      prevPokemonId = DATA_SIZE;
      nextPokemonId = pokemonId + 1;
    } else if (pokemonId == DATA_SIZE) {
      prevPokemonId = pokemonId - 1;
      nextPokemonId = 1;
    } else {
      prevPokemonId = pokemonId - 1;
      nextPokemonId = pokemonId + 1;
    }
    // console.log("cur: ", pokemonId);
    // console.log("cur: ", prevPokemonId);
    // console.log("cur: ", nextPokemonId);

    result.push(pokemons.filter((pokemon) => pokemon.id === pokemonId));
    result.push(pokemons.filter((pokemon) => pokemon.id === prevPokemonId));
    result.push(pokemons.filter((pokemon) => pokemon.id === nextPokemonId));
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
  console.log("test post;");
  const { name, types, imageLink } = req.body;
  console.log("test post 2;");

  // const newPokemon = createPokemon();
  // const newPokemon = {
  //   id: "750",
  //   name: "pokemonA",
  //   types: ["Water"],
  //   imageLink: "http://localhost:9000/images/7.jpg",
  // };

  try {
    if (!name) {
      console.log("test post name;");
      const exception = new Error(`Missing required data `);
      exception.statusCode = 404;
      throw exception;
    }

    if (types.length < 1 || types.length > 2) {
      console.log("test post types;");
      const exception = new Error(`Pokémon can only have one or two types. `);
      exception.statusCode = 404;
      throw exception;
    }

    if (pokemons.some((pokemon) => pokemon.name === name)) {
      console.log("test post name;");
      const exception = new Error(`The Pokémon already exists. `);
      exception.statusCode = 404;
      throw exception;
    }

    // if (pokemons.some((pokemon) => pokemon.id === id)) {
    //   const exception = new Error(`The Pokémon already exists. `);
    //   exception.statusCode = 404;
    //   throw exception;
    // }
    const min = 720;
    const max = 800;
    console.log("test post 2;");
    const newPokemon = {
      id: Math.floor(Math.random() * (max - min + 1)) + min,
      name,
      types,
      imageLink,
    };

    console.log("newPokemon: ", newPokemon);

    //Add new book to book JS object
    pokemons.push(newPokemon);
    //Add new book to db JS object
    db.data = pokemons;
    //db JSobject to JSON string
    db = JSON.stringify(db);
    //write and save to db.json
    fs.writeFileSync("db.json", db);

    //post send response
    res.status(200).send(newPokemon);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
