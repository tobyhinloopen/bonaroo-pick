# bonaroo-pick

A micro library to generate render functions that behave like an extremely fast lodash's `pick` alternative, but with additional support for nested properties.

This library works by generating functions from dynamically generated code using `new Function`.

```ts
const pick = BonarooPick.create([
  "name",
  "address.coords.lat",
  "address.coords.lon",
]);

const obj = {
  name: "Foo",
  address: {
    city: "Foo",
    coords: {
      lat: 1,
      lon: 2,
    },
  },
};

const result = pick(obj);
/*
{
  name: 'Foo',
  address: {
    coords: { lat: 1, lon: 2 }
  }
}
*/

console.log(pick.toString());
/*
function anonymous(obj) {
  return {
    name: obj.name,
    address: {
      coords: obj.address && {
        lat: obj.address.coords && obj.address.coords.lat,
        lon: obj.address.coords && obj.address.coords.lon,
      },
    },
  };
}
*/
```
