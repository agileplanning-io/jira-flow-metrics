import { format } from "date-fns";

export class SearchParamsBuilder {
  constructor(private readonly params: URLSearchParams) {}

  set(name: string, value?: string | boolean | Date | number) {
    if (value) {
      if (typeof value === "string") {
        this.params.set(name, value);
      } else if (typeof value === "boolean") {
        this.params.set(name, value === true ? "true" : "false");
      } else if (typeof value === "number") {
        this.params.set(name, value.toString());
      } else {
        this.params.set(name, format(value, "yyyy-MM-dd"));
      }
    } else {
      this.params.delete(name);
    }
    return this;
  }

  setAll(name: string, value?: string[]) {
    this.params.delete(name);
    if (value && value.length) {
      value.forEach((v) => this.params.append(name, v));
    }
    return this;
  }

  getParams() {
    return this.params;
  }
}
