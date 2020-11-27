export class BonarooPick {
  public props: Record<string, BonarooPick.IProp> = {};

  public add(path: string) {
    const dotIndex = path.indexOf(".");
    const [ head, tail ] = dotIndex === -1 ? [ path ] : [ path.substr(0, dotIndex), path.substr(dotIndex + 1) ];

    if (tail) {
      if (!this.props[head]) {
        this.props[head] = { name: head, child: new BonarooPick() };
      }
      this.props[head].child.add(tail);
    } else {
      this.props[head] = { name: head };
    }
  }

  public create(): (obj: any) => any {
    const body = `return ${BonarooPick.objectLiteral(`obj`, this.props)};`;
    try {
      return new Function('obj', body) as (obj: any) => any;
    } catch (error) {
      console.warn(`failed to create function:\n${error.message}\n${body}`);
      throw error;
    }
  }
}

export namespace BonarooPick {
  export function create(props: string[]) {
    const pick = new BonarooPick();
    props.forEach((prop) => pick.add(prop));
    return pick.create();
  }

  export function objectLiteral(
    objName: string,
    props: Record<string, BonarooPick.IProp>,
    checkPresence?: "check-presence",
  ): string {
    const code = [];
    for (const prop of Object.values(props)) {
      const valueRef = valueLiteral(objName, prop);
      code.push(`${prop.name}: ${checkPresence ? `${objName} && ${valueRef}` : valueRef}`);
    }
    return `{ ${code.join(", ")} }`;
  }

  export function valueLiteral(objName: string, prop: BonarooPick.IProp) {
    const valueRef = `${objName}.${prop.name}`;
    if (prop.child) {
      return objectLiteral(`${objName}.${prop.name}`, prop.child.props, "check-presence");
    } else {
      return valueRef;
    }
  }

  export interface IProp {
    name: string;
    child?: BonarooPick;
  }
}
