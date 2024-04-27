import { qsParse } from "@agileplanning-io/flow-lib";
import {
  ExecutionContext,
  PipeTransform,
  Type,
  createParamDecorator,
} from "@nestjs/common";

export const ParsedQuery = (
  property: string,
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator =>
  createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
    const queryString = getQueryString(ctx);
    const queryObject = queryString ? qsParse(queryString) : undefined;
    return queryObject?.[property];
  })(...pipes);

const getQueryString = (ctx: ExecutionContext): string | undefined => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const [, queryString] = request.url.split("?");
  return queryString;
};
