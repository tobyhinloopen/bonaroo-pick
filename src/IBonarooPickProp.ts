import { BonarooPick } from "./BonarooPick";

export interface IBonarooPickProp {
  name: string;
  type: "any"|"child";
  child?: BonarooPick;
}
