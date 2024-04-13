import { format } from "date-fns";
import { isNil } from "remeda";

export class SearchParamsBuilder {
  private changed = false;

  constructor(private readonly params: URLSearchParams) {}

  set(
    name: string,
    value?: string | boolean | Date | number,
  ): SearchParamsBuilder {
    if (!isNil(value)) {
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
    this.changed = true;
    return this;
  }

  setAll(name: string, value?: string[]): SearchParamsBuilder {
    const isNilArray = !value || value.length === 0;
    if (!this.params.has(name) && isNilArray) {
      return this;
    }

    this.params.delete(name);
    if (value && value.length) {
      value.forEach((v) => this.params.append(name, v));
    }
    this.changed = true;
    return this;
  }

  get(name: string): string | null {
    return this.params.get(name);
  }

  getAll(name: string): string[] | null {
    return this.params.has(name) ? this.params.getAll(name) ?? [] : null;
  }

  getParams(): URLSearchParams {
    return this.params;
  }

  getChanged(): boolean {
    return this.changed;
  }
}
