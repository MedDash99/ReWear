export function getPageRange(currentPage: number, pageSize: number) {
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}
