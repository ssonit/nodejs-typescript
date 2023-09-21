export const numberEnumToArray = (numberEnum: { [key: string]: number | string }) => {
  return Object.values(numberEnum).filter((value) => typeof value === 'number') as number[]
}
