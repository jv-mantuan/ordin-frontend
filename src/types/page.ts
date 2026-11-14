/** One page of a cursor-paginated list. `nextCursor` is null on the last page. */
export interface Page<T> {
  items: T[]
  nextCursor: string | null
}

export interface PageParams {
  limit?: number
  cursor?: string
}
