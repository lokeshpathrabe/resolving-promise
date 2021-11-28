# 4 ways to resolve Javascript Promise

Article on medium 
https://lokeshpathrabe.medium.com/4-ways-to-await-array-of-promises-c69d3d9ce644

Before we get to the main stuff, let’s go through some basic ways of resolving promise/s.

```js
// With Promise -> then chain
const fetchData = () => { ...return promise }fetchData.then((result) => ... do something with result ...)

// With async await  
const result = await fetchData();  
... do something with result ...

//And when we get a array of promises
const result = await Promise.all( ... promises )
```

But there is more we can do with array of promises by playing around with array functions. First let’s create a promise array we will resolve in our examples below.
```js
// promiseGenerators.js
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
export const promiseGenerators = names.map((name) => () => fakeFetch(name));
export const resolveAndRejectGenerators = names.map((name, idx) => {

if (idx === 3) {
	return () => fakeFetchError(name);
}
return () => fakeFetch(name);
});
```

# Parallel resolving

Asynchronous parallel resolving of promises can be done with  `Promise.all`  and  `Promise.allSettled`  . We can create an array of all the async functions and use these methods to await until all the promise are resolved.

Now the difference between Promise.all and Promise.allSettled is that the earlier will reject the promise as soon as any of the given promise rejects. Whereas the later will always resolve with array of result  `[{status: 'fulfilled', value: {}}, ...]`  for each of the promise given.

The above methods are good for all the asynchronous requirements. But what when we want to execute promises one-after-another in a synchronous way. Let’s see a few ways of doing it.

```js
// Parallel execution of all promises with array map and promise all

async function WithPromiseAll(promises) {
	return await Promise.all(promises.map((promise) => promise()));
}

WithPromiseAll(resolveAndRejectGenerators)
	.then((r) => console.log("resolved", r))
	.catch((r) => console.log("rejected", r));

// ***** output *****
// Resolving Apple 34
// Resolving Orange 277
// Rejecting Banana 292
// rejected banana
// Resolving Grape 718
// Resolving Mango 1673

// Parallel execution of all promises with array map and promise allsettled

async function WithPromiseAllSettled(promises) {
	return await Promise.allSettled(promises.map((promise) => promise()));
}

WithPromiseAllSettled(resolveAndRejectGenerators)
	.then((r) => console.log("resolved ", r))
	.catch((r) => console.log("rejected", r));

// ***** Output *****
// Resolving Apple 178
// Rejecting Banana 630
// Resolving Mango 693
// Resolving Grape 1157
// Resolving Orange 1168
// resolved [{"status":"fulfilled","value":"APPLE"},{"status":"fulfilled","value":"ORANGE"},{"status":"fulfilled","value":"GRAPE"},{"status":"rejected","reason":"banana"},{"status":"fulfilled","value":"MANGO"}]
```

# Promise Chain

Here we will use Array.reduce to create a Promise chain. On resolving all the promises resolve sequentially.

> Notice the sequence of fruits in output is the same as created above in promiseGenerators.js

```js
// Sequential execution of all promises with array reduce

async function WithArrayReduce(promises) {
	const accPromise = promises.reduce((acc, promise) => {
		return acc.then((arr) => promise().then((response) => [...arr, response]));
	}, Promise.resolve([]));
	const result = await accPromise;
	return result;
}

WithArrayReduce(promiseGenerators).then((r) => console.log("resolved ", r));

// // **** Output ****
// Resolving Apple 694
// Resolving Orange 1392
// Resolving Grape 454
// Resolving Banana 923
// Resolving Mango 1320
// resolved
// (5) ["APPLE", "ORANGE", "GRAPE", "BANANA", "MANGO"]
```

# For-of loop

Loop through each promise, await it and collect results from each one. Though if you use await in a loop you will see warning from eslint. This approach is not very promisy 😄. But it’s ok to suppress the warning and continue with this approach for a sequential execution.

```js
// Sequential execution of promises. Discouraged in eslint rule.
// Disallow await inside of loops (no-await-in-loop)

async function WithForOfLoop(promises) {
	const result = [];
	for (const promise of promises) {
		result.push(await promise());
	}
	return result;
}

WithForOfLoop(promiseGenerators).then((r) => console.log("resolved", r));

// ***** Output *****
// Resolving Apple 747
// Resolving Orange 103
// Resolving Grape 266
// Resolving Banana 1804
// Resolving Mango 1579
// resolved
// (5) ["APPLE", "ORANGE", "GRAPE", "BANANA", "MANGO"]
```

# Nested then() callback

Lastly we can create a recursive function to loop through all the promises and create a nested then() callback to sequentially execute all the promises. Though this is my least preferred way as this looks complicated to understand, I included it here as …….  _hey!! we are exploring_  😄

Feel free to fork and play around with code here

```js
// Sequential resolving promise one after another in nested then() callback like below
// fakeFetch(names[0]).then((result1) =>
	// fakeFetch(names[1]).then((result2) =>
		// fakeFetch(names[3]).then((result3) =>
			// console.log(result1, result2, result3)
		// )
	// )
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

nestedPromiseCallback(promiseGenerators).then((r) =>
console.log("resolved", r)
);

// **** Output *****
// Resolving Apple 215
// Resolving Orange 1404
// Resolving Grape 1073
// Resolving Banana 1623
// Resolving Mango 799
// resolved
// (5) ["APPLE", "ORANGE", "GRAPE", "BANANA", "MANGO"]
```

