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

module.exports = router;
