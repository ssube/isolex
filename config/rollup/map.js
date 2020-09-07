function chunkMap(map, debug = false) {
  return function (name) {
    for (const def of map) {
      const chunk = def.name;

      for (const include of def.includes) {
        if (name.includes(include)) {
          if (debug) {
            console.info('chunk includes name', chunk, name);
          }

          return chunk;
        }
      }

      for (const match of def.match) {
        if (name.match(match)) {
          if (debug) {
            console.info('chunk matches name', chunk, name);
          }

          return chunk;
        }
      }
    }

    if (name.length === 30 && name.match(/^[a-f0-9]+$/)) {
      if (debug) {
        console.info('generated chunk name', chunk, name);
      }

      return 'vendor';
    }

    if (debug) {
      console.info('name does not match any chunk', chunk, name);
    }

    return 'unknown';
  }
}

module.exports = {
  chunkMap,
};
