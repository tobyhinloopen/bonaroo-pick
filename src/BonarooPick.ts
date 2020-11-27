import { IBonarooPickProp } from "./IBonarooPickProp";

export class BonarooPick {
  public props: Record<string, IBonarooPickProp> = {};

  public add(path: string) {
    const dotIndex = path.indexOf(".");
    const [ head, tail ] = dotIndex === -1 ? [ path ] : [ path.substr(0, dotIndex), path.substr(dotIndex + 1) ];

    if (tail) {
      if (!this.props[head]) {
        this.props[head] = {
          name: head,
          type: "child",
          child: new BonarooPick(),
        };
      }
      this.props[head].child.add(tail);
    } else {
      this.props[head] = {
        name: head,
        type: "any",
      };
    }
  }

  public create(): (obj: any) => any {
    const body = `return ${Pick.objectLiteral(`obj`, this.props)};`;
    try {
      console.log(body);
      return new Function('obj', body) as (obj: any) => any;
    } catch (error) {
      console.warn(`failed to create function:\n${error.message}\n${body}`);
      throw error;
    }
  }
}

export namespace Pick {
  export function objectLiteral(
    objName: string,
    props: Record<string, IBonarooPickProp>,
    checkPresence?: "check-presence",
  ): string {
    const code = [];
    for (const prop of Object.values(props)) {
      const valueRef = valueLiteral(objName, prop);
      code.push(`${prop.name}: ${checkPresence ? `${objName} && ${valueRef}` : valueRef}`);
    }
    return `{ ${code.join(", ")} }`;
  }

  export function valueLiteral(objName: string, prop: IBonarooPickProp) {
    const valueRef = `${objName}.${prop.name}`;
    if (prop.type === "any") {
      return valueRef;
    } else if (prop.type === "child") {
      return objectLiteral(`${objName}.${prop.name}`, prop.child.props, "check-presence");
    }
  }
}
