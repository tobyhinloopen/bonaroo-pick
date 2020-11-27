import { pick, sample, set } from "lodash";
import { BonarooPick } from "../src";

test("README test case", () => {
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

  console.log(result);
})

test("new BonarooPick() with 2 props", () => {
  const pick = new BonarooPick();
  pick.add("foo");
  pick.add("bar");
  const fn = pick.create();
  const obj = { foo: "1", bar: "2", baz: "3" };
  expect(fn(obj)).toEqual({ foo: "1", bar: "2" });
});

test("new BonarooPick() with nesting props", () => {
  const pick = new BonarooPick();
  pick.add("name");
  pick.add("address.lat");
  pick.add("address.lon");
  const fn = pick.create();
  const obj = { address: { lat: 1, lon: 2, foo: "a", bar: "2" }, name: "foo", other: "bar" };
  expect(fn(obj)).toEqual({ address: { lat: 1, lon: 2 }, name: "foo" });
});

test("new BonarooPick() with nesting props (3)", () => {
  const pick = new BonarooPick();
  pick.add("name");
  pick.add("address.coords.lat");
  pick.add("address.coords.lon");
  const fn = pick.create();
  const obj = { address: { coords: { lat: 1, lon: 2 }, foo: "bar" }, name: "foo", other: "bar" };
  expect(fn(obj)).toEqual({ address: { coords: { lat: 1, lon: 2 } }, name: "foo" });
});

test("new BonarooPick() with nesting props for empty object returns empty object", () => {
  const pick = new BonarooPick();
  pick.add("name");
  pick.add("address.lat");
  pick.add("address.lon");
  const fn = pick.create();
  const obj = {};
  expect(fn(obj)).toEqual({ name: undefined, address: { lat: undefined, lon: undefined } });
});

test("measure performance for a lot of objects", () => {
  const [ props, objects ] = createPerformanceTestData({
    amountOfPossibleProps: 20,
    amountOfNestedKeys: 4,
    amountOfNestedValues: 20,
    amountOfObjectProps: 20,
    amountOfObjects: 20000,
  });

  const pick = new BonarooPick();
  for (const prop of props) {
    pick.add(prop);
  }

  const fn = pick.create();

  // warm-up
  objects.map(fn);

  console.time("map using fn (nested props)");
  const newObjects = objects.map(fn);
  console.timeEnd("map using fn (nested props)");

  console.log(newObjects.length);
});


test("measure performance for a lot of objects (no nesting, vs pick)", () => {
  const [ props, objects ] = createPerformanceTestData({
    amountOfPossibleProps: 200,
    amountOfNestedKeys: 0,
    amountOfNestedValues: 0,
    amountOfObjectProps: 40,
    amountOfObjects: 10000,
  });

  const bonarooPick = new BonarooPick();
  for (const prop of props) {
    bonarooPick.add(prop);
  }

  const fn1 = bonarooPick.create();
  const fn2 = (obj: any) => pick(obj, props);

  // warm-up
  objects.slice(0, 100).map(fn1);
  objects.slice(0, 100).map(fn2);

  console.time("map using bonaroo-pick (no nesting)");
  const result1 = objects.map(fn1);
  console.timeEnd("map using bonaroo-pick (no nesting)");

  console.time("map using lodash pick (no nesting)");
  const result2 = objects.map(fn2);
  console.timeEnd("map using lodash pick (no nesting)");

  console.log(result1.length);
  console.log(result2.length);
});

function createPerformanceTestData({
  amountOfPossibleProps,
  amountOfNestedKeys,
  amountOfNestedValues,
  amountOfObjectProps,
  amountOfObjects,
}: {
  amountOfPossibleProps: number,
  amountOfNestedKeys: number,
  amountOfNestedValues: number,
  amountOfObjects: number,
  amountOfObjectProps: number,
}) {
  const possibleProps = [];
  for (let i = 0; i < amountOfPossibleProps; i++) {
    possibleProps.push(`a${i}`);
  }
  for (let i = 0; i < amountOfNestedKeys; i++) {
    const key = `b${i}`;
    for (let j = 0; j < amountOfNestedValues; j++) {
      possibleProps.push(`${key}.c${j}`);
    }
  }
  const objects = [];
  for (let i = 0; i < amountOfObjects; i++) {
    const obj = {};
    for (let j = 0; j < amountOfObjectProps; j++) {
      set(obj, sample(possibleProps), Math.random() > 0.5 ? Math.random() : `${Math.random()}`);
    }
    objects.push(obj);
  }

  return [ possibleProps, objects ];
}
