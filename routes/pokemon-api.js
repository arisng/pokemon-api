const crypto = require("crypto");
const fs = require("fs");
const express = require("express");
const router = express.Router();

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
        pokemon.type.some(
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
    //find book by id
    // const targetIndex = pokemons.findIndex(
    //   (pokemon) => pokemon.id === pokemonId
    // );
    if (pokemonId <= 0 || pokemonId > 721) {
      const exception = new Error(`pokemon not found`);
      exception.statusCode = 404;
      throw exception;
    }
    console.log("getPokemonbyId");
    console.log("input: ", pokemonId);

    let result = [];
    let prevPokemonId = 0;
    let nextPokemonId = 0;
    if (pokemonId == 1) {
      prevPokemonId = 721;
      nextPokemonId = pokemonId + 1;
    } else if (pokemonId == 721) {
      prevPokemonId = pokemonId - 1;
      nextPokemonId = 1;
    } else {
      prevPokemonId = pokemonId - 1;
      nextPokemonId = pokemonId + 1;
    }
    console.log("cur: ", pokemonId);
    console.log("cur: ", prevPokemonId);
    console.log("cur: ", nextPokemonId);

    result.push(pokemons.filter((pokemon) => pokemon.id === pokemonId));
    result.push(pokemons.filter((pokemon) => pokemon.id === prevPokemonId));
    result.push(pokemons.filter((pokemon) => pokemon.id === nextPokemonId));
    //put send response
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
