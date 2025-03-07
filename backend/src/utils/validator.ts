import { BadRequestError } from "./errors";

export const validateId = (input: string): number => {
  const id = Number(input);
  if (isNaN(id) || !Number.isInteger(id) || id < 1)
    throw new BadRequestError(`Invalid ID ${input}`);
  return id;
};
