const names = ["Apple", "Orange", "Grape", "Banana", "Mango"];
const randomDelay = () => Math.floor(Math.random() * 2000);

const fakeFetch = (name) =>
  new Promise((resolve) => {
    const delay = randomDelay();
    setTimeout(() => {
      console.log("Resolving ", name, delay);
      resolve(name.toUpperCase());
    }, delay);
  });

const fakeFetchError = (name) =>
  new Promise((_, reject) => {
    const delay = randomDelay();
    setTimeout(() => {
      console.log("Rejecting ", name, delay);
      reject(name.toLowerCase());
    }, delay);
  });

const promiseGenerators = names.map((name) => () => fakeFetch(name));
const resolveAndRejectGenerators = names.map((name, idx) => {
  if (idx === 3) {
    return () => fakeFetchError(name);
  }
  return () => fakeFetch(name);
});

// Parallel execution of all promises with array map and promise all
async function WithPromiseAll(promises) {
  return await Promise.all(promises.map((promise) => promise()));
}
// WithPromiseAll(promiseGenerators).then((r) => console.log("resolved ", r));
// WithPromiseAll(resolveAndRejectGenerators)
//   .then((r) => console.log("resolved", r))
//   .catch((r) => console.log("rejected", r));

// Parallel execution of all promises with array map and promise allsettled
async function WithPromiseAllSettled(promises) {
  return await Promise.allSettled(promises.map((promise) => promise()));
}
// WithPromiseAllSettled(promiseGenerators).then((r) => console.log("resolved ", r));
// WithPromiseAllSettled(resolveAndRejectGenerators)
//   .then((r) => console.log("resolved ", JSON.stringify(r)))
//   .catch((r) => console.log("rejected", JSON.stringify(r)));

// Sequential execution of all promises with array reduce
async function WithArrayReduce(promises) {
  const accPromise = promises.reduce((acc, promise) => {
    return acc.then((arr) => promise().then((response) => [...arr, response]));
  }, Promise.resolve([]));
  const result = await accPromise;
  return result;
}
// WithArrayReduce(promiseGenerators).then((r) => console.log("resolved ", r));

// Synchronous resolving promise one after another in nested then callback like below
// fakeFetch(names[0]).then((result1) =>
//   fakeFetch(names[1]).then((result2) =>
//     fakeFetch(names[3]).then((result3) =>
//       console.log(result1, result2, result3)
//     )
//   )
// );
async function nestedPromiseCallback(promises) {
  const loop = (i, acc) => {
    return promises[i]().then((ret) => {
      if (i < promises.length - 1) {
        acc.push(ret);
        return loop(++i, acc);
      }
      acc.push(ret);
      return acc;
    });
  };
  return await loop(0, []);
}

// nestedPromiseCallback(promiseGenerators).then((r) =>
//   console.log("resolved", r)
// );

// Sequential execution of promises. Discouraged in eslint rule.
//Disallow await inside of loops (no-await-in-loop)
async function WithForOfLoop(promises) {
  const result = [];
  for (const promise of promises) {
    result.push(await promise());
  }
  return result;
}

// WithForOfLoop(promiseGenerators).then((r) => console.log("resolved", r));
