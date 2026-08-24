function assign (state, clauLocalStorage) {
  var objLocalSto = JSON.parse(localStorage.getItem(clauLocalStorage));
  if (objLocalSto) {
    for (var prop in state) {
      if (Date.parse(objLocalSto[prop])) {
        state[prop] = new Date(objLocalSto[prop]);
      } else {
        state[prop] = objLocalSto[prop];
      }
    }
  }
}

function equals(a, b) {
  if (a === b) return true;

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (typeof a !== 'object' || typeof b !== 'object' || a == null || b == null) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every(key => equals(a[key], b[key]));
}

export { assign, equals }