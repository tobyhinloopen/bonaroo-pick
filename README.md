# bonaroo-pick

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
// { name: 'Foo', address: { coords: { lat: 1, lon: 2 } } }
```
