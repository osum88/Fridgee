const charMap = new Map([
  ["a", 0],
  ["á", 1],
  ["b", 2],
  ["c", 3],
  ["č", 4],
  ["d", 5],
  ["ď", 6],
  ["e", 7],
  ["é", 8],
  ["ě", 9],
  ["f", 10],
  ["g", 11],
  ["h", 12],
  ["ch", 13],
  ["i", 14],
  ["í", 15],
  ["j", 16],
  ["k", 17],
  ["l", 18],
  ["m", 19],
  ["n", 20],
  ["ň", 21],
  ["o", 22],
  ["ó", 23],
  ["p", 24],
  ["q", 25],
  ["r", 26],
  ["ř", 27],
  ["s", 28],
  ["š", 29],
  ["t", 30],
  ["ť", 31],
  ["u", 32],
  ["ú", 33],
  ["ů", 34],
  ["v", 35],
  ["w", 36],
  ["x", 37],
  ["y", 38],
  ["ý", 39],
  ["z", 40],
  ["ž", 41],
]);

const getCharValue = (str, i) => {
  if (str[i] === "c" && str[i + 1] === "h") {
    return { value: charMap.get("ch"), skip: 2 };
  }
  return { value: charMap.get(str[i]) ?? str.charCodeAt(i) + 1000, skip: 1 };
};

const compareStrings = (a, b) => {
  let i = 0,
    j = 0;
  while (i < a.length && j < b.length) {
    const av = getCharValue(a, i);
    const bv = getCharValue(b, j);
    if (av.value !== bv.value) return av.value - bv.value;
    i += av.skip;
    j += bv.skip;
  }
  return a.length - b.length;
};

const getNestedValue = (obj, key) => {
  return key.split(".").reduce((acc, k) => acc?.[k], obj);
};

//hleda klic v json
export const sortBy = (arr, key, { nullFirst = false } = {}) => {
  const prepared = arr.map((item) => ({
    item,
    lower: (getNestedValue(item, key) ?? "").toLowerCase(),
    isNull: !getNestedValue(item, key),
  }));

  prepared.sort((a, b) => {
    if (nullFirst) {
      if (a.isNull && !b.isNull) return -1;
      if (!a.isNull && b.isNull) return 1;
    }
    return compareStrings(a.lower, b.lower);
  });
  return prepared.map((p) => p.item);
};

// radi konkretni pole
export const sortStrings = (arr) => {
  const prepared = arr.map((str) => ({ str, lower: str.toLowerCase() }));
  prepared.sort((a, b) => compareStrings(a.lower, b.lower));
  return prepared.map((p) => p.str);
};

//princip jako nativni localeCompare
export const compareLocale = (a, b) => compareStrings(a.toLowerCase(), b.toLowerCase());
